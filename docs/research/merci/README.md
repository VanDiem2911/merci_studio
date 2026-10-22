# MERCI studio: research and decisions

Website for MERCI studio (tiệm chụp ảnh, TP. Hồ Chí Minh). Structure and motion follow the portfolio
https://www.markclennon.com/ as a **reference only**. Code, copy, photos and logo are MERCI's own: nothing
(photos, text, logo, fonts, scripts) was copied from the reference.

## Source to local route map

| Reference page | Local route | What it became |
| --- | --- | --- |
| `/` (draggable photo grid) | `/` | Endless pan grid of concept covers: wheel, drag, touch, arrows; columns parallax, photos lean into motion |
| `/still-category/*` (grid / list switch) | `/concept`, `/danh-muc/[slug]` | Ruled list with floating preview, or the same pan grid; 5 categories = the 5 services |
| `/still/[slug]` | `/concept/[slug]` | Title + cover, staggered photos on a 9-column grid with wipe and parallax, previous / next cards |
| `/motion` (3D reel) | `/bo-suu-tap` | Page-fold reel: portrait cards hinged on the inside of a drum, the centred card lies flat and its neighbours fold towards the viewer; one wheel notch or swipe = one card (`src/lib/wheel.ts`), drag, arrows, centred card opens the collection |
| `/motion/[slug]` (player) | `/bo-suu-tap/[slug]` | Full-screen photo viewer, tick-mark timeline with previews, info drawer, wheel (one notch = one photo), swipe + arrow keys |
| `/diary/diary` (grid / globe) | `/nhat-ky` | Grid: every photo fitted in its own cell, whole columns drift at their own speed, nothing overlaps. Globe: the viewer stands inside a sphere tiled with ~900 small photos (150 photos, repeated far apart), tiny at the centre and larger towards the screen edge, only the ones in view are drawn |
| `/info` | `/gioi-thieu` | About, contact, services list |
| (MERCI-specific) | `/bang-gia`, `/chon-concept`, `/dat-lich`, `/lien-he` | Pricing, concept picker, booking, contact |
| `/press/*`, `/subscribe`, `/studio-hq-0817` | not built | No press coverage or newsletter exists for MERCI; nothing was invented |

Shared: wipe page transition, preloader, Lenis smooth scroll on scrolling pages,
Zalo / Messenger floating buttons (no border). The nav is transparent: its text and logo carry a soft cream halo, and the reel fades its photos out under it. The reference draws its photos in WebGL; this build uses DOM + GSAP + CSS 3D.

## Photos

Three raw sources (all git-ignored except the small Drive set):

- `docs/research/merci/drive-originals/` holds **177 full-size originals** from the studio's public Drive folder `AnhFB`
  (`https://drive.google.com/drive/folders/11FiViBg5GPieszpcubGY39NRvvzRrOFZ`): 163 portraits at 1366 x 2048 and 14
  collage sheets at 2000 x 2000. `python scripts/download-drive-folder.py <folder> docs/research/merci/drive-originals`
  fetches them (no login needed while the folder is shared with "anyone with the link").
- `docs/research/merci/facebook-photos/` holds 448 photos from the page's Photos tab, **206 x 206 px thumbnails**
  (`NNN_photo.jpg`, 001 = newest). 50 of them are collage sheets (3 x 2 tiles with a caption strip), the rest singles.
- `docs/research/merci/drive-source/` holds the older Drive download (49 JPG + logo, also 206 px). Most of it is
  identical to Facebook photos; only Drive 24-37, 39, 42, 44-48 exist nowhere else.

`python scripts/match-originals.py` pairs each original with its thumbnail (a thumbnail is a square cut one third of the way
down a portrait, so true pairs differ by ~0.001 and everything else by 0.15+) and writes `originals-map.json`.
It found 154 singles + 14 sheets; 7 originals have no thumbnail (a new pink-backdrop shoot, now the concept
`nen-hong-non-coi`). Only 169 of the 448 thumbnails have an original.

`python scripts/build-merci-assets.py` regenerates `public/sites/merci/`, `src/data/concept-images.generated.json` and
`photo-classification.md` (concept -> set -> source numbers, plus the list of photos that still need an original).

**The site shows only sharp photos** (`SHARP_ONLY` in the build script): a photo that has no original, only a 206 px
thumbnail (even AI-upscaled), is left out; a concept with fewer than 4 sharp photos stays hidden (`MIN_PHOTOS`). Result:
27 of 49 concepts, 226 photos. The 22 hidden concepts keep their copy in `src/data/concepts.ts` (`CONCEPTS` filters out
concepts without photos) and come back by themselves when their originals arrive: add them to the Drive folder, then run
`download-drive-folder.py`, `match-originals.py`, `build-merci-assets.py`. The category "Chụp ảnh cổ trang" is empty for
now and shows an "ảnh đang được cập nhật" message (`concept-browser.tsx`).

**Grouping has two levels.** A *set* (bộ ảnh) is one shoot (same outfit, backdrop, person). A *concept* is the theme shown
on one site page and holds one or more sets (the manifest keeps a `set` number per photo).
Duplicates found by pairwise comparison are dropped (13 collage sheets re-posted at 390-409, 418/422, 081/088, Drive 33).
A concept uses collage tiles only when it has no single photos; ten sheets whose shoot has singles were matched by eye
and left out (listed in `photo-classification.md`). Originals are shrunk to 1600 px on the long edge.

**Upscaling is off by default.** With `SHARP_ONLY = False` thumbnails go through Real-ESRGAN x4plus (`tools/README.md`),
blended 70/30 with a Lanczos resize: 206 -> 824 px. It removes JPEG blocks but cannot restore detail that is not in the
file, and on collage tiles it invents some, which is why the studio asked for sharp photos only.

## Content that is a draft

- `src/data/concepts.ts`: concept names, taglines, stories, category and mood / occasion tags are written from what the
  photos show. Edit freely.
- `src/data/packages.ts`: **sample** packages and prices. `CONTENT_IS_DRAFT` in `src/data/site.ts` shows a visible
  "bảng giá minh hoạ" notice; set it to `false` once real prices are in.
- About copy (`src/app/gioi-thieu/page.tsx`) is generic: no founding year, awards or claims were made up.

## Not provided yet

Contact person, USP, street address and opening hours, website domain (`SITE.url` is a placeholder), real pricing.

## Booking and admin

`/dat-lich` validates the form and builds a ready-made message that is copied and opened in Zalo or Messenger.
**Nothing is stored on the site.** "Quản lý yêu cầu đặt lịch" (admin inbox) was deferred by the studio; it needs a
storage choice (SQLite on a VPS / Supabase / Google Sheets) and admin login.

## Checks run

`npm run check` (lint, typecheck, production build: 58 static pages) and a headless-Chrome pass over navigation and
transition, dropdown, form validation and message, picker to booking prefill, grid pan and click-through, reel and
viewer keyboard, mobile menu and horizontal overflow at 390 px.

## Known gaps

- 359 of the 585 photos (collage tiles counted one by one) still wait for originals and are hidden, which hides 22 concepts
  entirely; the full list is in `photo-classification.md`.
- Concept names, taglines and stories for the concepts added from the Facebook photos are drafts from what the photos show.
- The booking form lists every shown concept as a chip (27); it may deserve grouping by category.
- The diary page shows at most 6 photos per concept (`PHOTOS_PER_CONCEPT`) to keep the canvas and sphere light.
- Google Maps embed on `/lien-he` loads from Google; it could not be confirmed in headless Chrome.
- No Vietnamese copy review by a native editor, no real-device (iOS Safari) test, no Lighthouse run.
