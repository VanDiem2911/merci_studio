#!/usr/bin/env node
/**
 * Download the most recent photos of a Facebook page into a folder.
 *
 *   npm run fb:photos                      # 1000 newest photos -> docs/research/merci/facebook-photos
 *   npm run fb:photos -- --count-only      # just count how many photos the page lists
 *   npm run fb:photos -- --limit 200       # fewer photos
 *   npm run fb:photos -- --quality grid    # faster, but only the grid thumbnail size (small)
 *
 * How it works
 *   Facebook only lists about 80 photos to visitors who are not logged in, so the script opens a
 *   real Chrome window with its own saved profile (scripts/.fb-profile). The first time, log in
 *   yourself in that window and press Enter in this terminal. The script never sees or stores your
 *   password; only Chrome keeps the session in that profile folder. Keep the folder private.
 *
 *   It scrolls the page's Photos tab (newest first), collects photo ids, then opens each photo and
 *   saves the largest image Facebook serves. Files are named  0001_<photoId>.jpg  where 0001 is the
 *   newest. It resumes: re-running skips photos already in the folder.
 *
 * Be gentle: it waits 2-3 s between photos. 1000 photos take roughly an hour. If Facebook shows a
 * checkpoint or starts failing, the script stops after 5 failures in a row; wait and re-run later.
 * If you are an admin of the page, Facebook's own "Download your information" export is the
 * official way to get every original.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const PAGE_NAME = String(args.page ?? "mercistudio.official");
const LIMIT = Number(args.limit ?? 1000);
const OUT = path.resolve(String(args.out ?? path.join(ROOT, "docs", "research", "merci", "facebook-photos")));
const PROFILE = path.resolve(String(args.profile ?? path.join(ROOT, "scripts", ".fb-profile")));
const QUALITY = String(args.quality ?? "full"); // full | grid
const DELAY = Number(args.delay ?? 2500);
const HEADLESS = Boolean(args.headless);
const COUNT_ONLY = Boolean(args["count-only"]);
const ALLOW_LOGGED_OUT = Boolean(args["allow-logged-out"]);
const MAX_FAILS_IN_A_ROW = 5;

if (!Number.isFinite(LIMIT) || LIMIT < 1) {
  console.error("--limit must be a positive number");
  process.exit(1);
}
if (!["full", "grid"].includes(QUALITY)) {
  console.error("--quality must be full or grid");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms) => Math.round(ms * (0.6 + Math.random() * 0.8));
const pad = (n) => String(n).padStart(4, "0");
const log = (...m) => console.log(...m);

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    await rl.question(question);
  } finally {
    rl.close();
  }
}

async function loggedOut(page) {
  return page
    .locator('input[name="pass"], input[type="password"]')
    .first()
    .isVisible()
    .catch(() => false);
}

/**
 * Scroll the Photos tab and collect photo ids in grid order (newest first).
 * The page cover and profile picture sit above the grid with other links (set=a....) and are old photos,
 * so only the grid links (set=pb....) are kept when the grid is present.
 */
async function collectPhotos(page, limit) {
  const found = new Map();
  const grab = async () => {
    const items = await page.evaluate(() =>
      [...document.querySelectorAll('a[href*="fbid="], a[href*="/photos/"]')].map((a) => ({
        href: a.href,
        thumb: a.querySelector("img")?.src ?? null,
        grid: /[?&]set=pb\./.test(a.href),
      })),
    );
    for (const it of items) {
      const m = it.href.match(/[?&]fbid=(\d+)/) ?? it.href.match(/\/photos\/[^/]*\/(\d{8,})/);
      if (m && !found.has(m[1])) found.set(m[1], { thumb: it.thumb, grid: it.grid });
    }
  };
  let still = 0;
  let last = 0;
  while (found.size < limit && still < 12) {
    await grab();
    if (found.size === last) still++;
    else {
      still = 0;
      last = found.size;
      process.stdout.write(`Found ${found.size} photos...`);
    }
    await page.mouse.wheel(0, 2400);
    await sleep(1500);
  }
  await grab();
  const all = [...found.entries()].map(([id, v]) => ({ id, ...v }));
  const grid = all.filter((p) => p.grid);
  const chosen = grid.length ? grid : all;
  if (!grid.length) log("Warning: grid links (set=pb.) not found, using every photo link. Check that 0001 is the newest photo.");
  process.stdout.write(`Found ${chosen.length} photos in the grid.      
`);
  return chosen.slice(0, limit).map(({ id, thumb }) => ({ id, thumb }));
}

function extensionFor(contentType) {
  if (/webp/i.test(contentType)) return "webp";
  if (/png/i.test(contentType)) return "png";
  return "jpg";
}

async function fetchImage(ctx, url) {
  const res = await ctx.request.get(url, { headers: { referer: "https://www.facebook.com/" } });
  if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
  const type = res.headers()["content-type"] ?? "";
  if (!type.startsWith("image/")) throw new Error(`not an image (${type || "no content-type"})`);
  return { body: await res.body(), type };
}

/** Open the photo page and return the URL of the largest image on it. */
async function largestImageUrl(viewer, id) {
  await viewer.goto(`https://www.facebook.com/photo/?fbid=${id}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await viewer.waitForSelector('img[src*="scontent"], img[src*="fbcdn"]', { timeout: 20000 });
  await sleep(900);
  return viewer.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].filter((i) => /scontent|fbcdn/.test(i.currentSrc || i.src));
    imgs.sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);
    const best = imgs[0];
    return best ? { src: best.currentSrc || best.src, width: best.naturalWidth, height: best.naturalHeight } : null;
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(PROFILE, { recursive: true });

  let ctx;
  try {
    ctx = await chromium.launchPersistentContext(PROFILE, {
      channel: "chrome",
      headless: HEADLESS,
      viewport: { width: 1920, height: 1080 },
      locale: "vi-VN",
    });
  } catch (e) {
    console.error("Could not start Google Chrome. Install Chrome, or close any Chrome window that uses this profile.");
    console.error(String(e.message ?? e).split("\n")[0]);
    process.exit(1);
  }
  process.on("SIGINT", async () => {
    log("\nStopped. Run again to resume.");
    await ctx.close().catch(() => {});
    process.exit(130);
  });

  const page = ctx.pages()[0] ?? (await ctx.newPage());
  const photosUrl = `https://www.facebook.com/${PAGE_NAME}/photos`;
  await page.goto(photosUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(4000);

  if (await loggedOut(page)) {
    if (HEADLESS && !ALLOW_LOGGED_OUT) {
      console.error("Not logged in. Run once without --headless, log in, then re-run.");
      await ctx.close();
      process.exit(1);
    }
    if (!HEADLESS) {
      log("\nFacebook is not logged in on this profile.");
      log("1. In the Chrome window that just opened, log in to Facebook.");
      log("2. Come back here and press Enter.");
      await ask("Press Enter when you are logged in (or Enter to continue logged out, ~80 photos max)... ");
      await page.goto(photosUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(4000);
      if (await loggedOut(page)) log("Still logged out: Facebook will only list about 80 photos.");
    } else {
      log("Running logged out: Facebook will only list about 80 photos.");
    }
  }

  const photos = await collectPhotos(page, LIMIT);
  fs.writeFileSync(path.join(OUT, "photo-ids.txt"), photos.map((p, i) => `${pad(i + 1)} ${p.id}`).join("\n") + "\n");
  log(`Photos listed by the page: ${photos.length}${photos.length >= LIMIT ? ` (stopped at --limit ${LIMIT})` : ""}`);
  if (COUNT_ONLY) {
    await ctx.close();
    return;
  }

  const have = new Set();
  for (const f of fs.readdirSync(OUT)) {
    const m = f.match(/^\d{4}_(\d+)\.(jpg|webp|png)$/);
    if (m) have.add(m[1]);
  }
  const manifestPath = path.join(OUT, "manifest.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
  const saveManifest = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  const viewer = await ctx.newPage();
  let done = 0;
  let skipped = 0;
  let failedInARow = 0;
  const failures = [];

  for (let i = 0; i < photos.length; i++) {
    const { id, thumb } = photos[i];
    const rank = i + 1;
    if (have.has(id)) {
      skipped++;
      continue;
    }
    let saved = null;
    let lastError = "";
    for (let attempt = 1; attempt <= 2 && !saved; attempt++) {
      try {
        let source = null;
        let quality = "full";
        if (QUALITY === "full") source = await largestImageUrl(viewer, id);
        if (!source) {
          if (!thumb) throw new Error("no image found");
          source = { src: thumb, width: 0, height: 0 };
          quality = "grid";
        }
        const { body, type } = await fetchImage(ctx, source.src);
        const file = `${pad(rank)}_${id}.${extensionFor(type)}`;
        fs.writeFileSync(path.join(OUT, file), body);
        manifest[id] = { rank, file, quality, width: source.width, height: source.height, bytes: body.length };
        saved = file;
      } catch (e) {
        lastError = String(e.message ?? e).split("\n")[0];
        await sleep(jitter(1500));
      }
    }
    if (saved) {
      done++;
      failedInARow = 0;
      saveManifest();
      log(`[${rank}/${photos.length}] ${saved}`);
    } else {
      failures.push({ rank, id, error: lastError });
      failedInARow++;
      log(`[${rank}/${photos.length}] FAILED ${id}: ${lastError}`);
      if (failedInARow >= MAX_FAILS_IN_A_ROW) {
        log(`\n${MAX_FAILS_IN_A_ROW} failures in a row: Facebook is probably limiting this session. Wait a while and re-run; it resumes.`);
        break;
      }
    }
    await sleep(jitter(DELAY));
  }

  saveManifest();
  await ctx.close();
  log(`\nDone. Downloaded ${done}, already present ${skipped}, failed ${failures.length}. Folder: ${OUT}`);
  if (failures.length) log("Failed ids: " + failures.map((f) => f.id).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
