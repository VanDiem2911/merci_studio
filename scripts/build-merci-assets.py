"""Build MERCI studio web assets from the raw photo downloads.

Reads  docs/research/merci/drive-originals/*.jpg           (full-size originals, 1366 x 2048 and 2000 x 2000 sheets)
       docs/research/merci/originals-map.json              (which original replaces which thumbnail, see match-originals.py)
       docs/research/merci/facebook-photos/NNN_photo.jpg   (206 px thumbnails, NNN = Facebook Photos tab position, newest first)
       docs/research/merci/drive-source/NN_*.jpg           (only the Drive photos that are not on Facebook)
Writes public/sites/merci/concepts/<slug>/<slug>-NN.jpg
       public/sites/merci/logo.png, src/app/icon.png
       src/data/concept-images.generated.json
       docs/research/merci/photo-classification.md

Grouping has two levels. A *set* (bo anh) is one shoot: same outfit, backdrop and person. A *concept* is the
theme the site shows on one page; it holds one or more sets. Both are written down in CONCEPTS below.

Collage sheets (3 x 2 tiles with a caption strip) are split into six tiles: about 68 x 97 px from a thumbnail,
about 660 x 940 px from an original. Thumbnail tiles are far too small for the AI upscaler to be trustworthy, so a
concept uses tiles only when no single photos exist for it.

Resolution: a frame with a full-size original uses the original (long edge capped at MAX_LONG_EDGE). The rest are
small (206 px) and, with SHARP_ONLY on (default), are not shown at all: photo-classification.md lists what still needs
an original. With SHARP_ONLY off they are enlarged instead: when tools/realesrgan/ holds Real-ESRGAN (ncnn-vulkan, see
tools/README.md) every frame below TARGET_LONG_EDGE goes through it and is blended back with a plain Lanczos resize,
otherwise it falls back to Lanczos + unsharp mask. More originals: download them, run match-originals.py, re-run.

Usage: python scripts/build-merci-assets.py
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
DRIVE = ROOT / "docs" / "research" / "merci" / "drive-source"
FB = ROOT / "docs" / "research" / "merci" / "facebook-photos"
ORIGINALS = ROOT / "docs" / "research" / "merci" / "drive-originals"
ORIGINALS_MAP = ROOT / "docs" / "research" / "merci" / "originals-map.json"
OUT = ROOT / "public" / "sites" / "merci"
MANIFEST = ROOT / "src" / "data" / "concept-images.generated.json"
REPORT = ROOT / "docs" / "research" / "merci" / "photo-classification.md"
CACHE = ROOT / "temp" / "upscale-cache"
ESRGAN_DIR = ROOT / "tools" / "realesrgan"

TARGET_LONG_EDGE = 900
MAX_LONG_EDGE = 1600  # originals are shrunk to this; the site never shows a photo larger than a retina screen needs
MAX_UPSCALE = 4
# The site only shows sharp photos: a frame that has no full-size original (only a 206 px thumbnail, even AI-upscaled)
# is left out until its original arrives. Set SHARP_ONLY = False to show those upscaled instead.
SHARP_ONLY = True
MIN_PHOTOS = 4  # a concept with fewer sharp photos stays hidden
ESRGAN_MIX = 0.7  # share of the AI result in the final pixel; the rest is a plain Lanczos resize
JPEG_QUALITY = 84

# A source is ("fb", first, last) = singles first..last of the Facebook folder,
#             ("fbc", n)          = collage sheet n of the Facebook folder (6 tiles),
#             ("dr", "NN")        = one Drive photo,
#             ("or", "prefix")    = an original in drive-originals/ that has no thumbnail (file name starts with prefix_).
Ref = tuple
Sets = list[tuple[str, list[Ref]]]

# Exact or near duplicates found by comparing every pair (value = the copy that is kept).
DUPLICATES = {
    "fb:422": "fb:418", "fb:088": "fb:081",
    "fbc:391": "fbc:079", "fbc:392": "fbc:070", "fbc:393": "fbc:078", "fbc:394": "fbc:075",
    "fbc:397": "fbc:076", "fbc:399": "fbc:072", "fbc:401": "fbc:064", "fbc:402": "fbc:063",
    "fbc:404": "fbc:065", "fbc:405": "fbc:066", "fbc:406": "fbc:067", "fbc:407": "fbc:069",
    "fbc:408": "fbc:068",
    "dr:33": "dr:32",
}
# Collage sheets whose shoot also has single photos: tiles are left out, the concept shows the singles.
# Matched by eye (same outfit, props and backdrop), so treat as a good guess.
FOLDED_SHEETS = {
    66: "hong-phan-bong-bay", 67: "sinh-nhat-bong-so", 72: "lily-hong-quan-jeans", 75: "gau-bong-net-ve",
    76: "non-coi-vintage", 78: "lily-voan-trang", 79: "vay-do-be-thuy-tinh", 390: "street-den",
    395: "no-ruy-bang", 396: "lily-vay-trang",
}

# Order here is the order of the home grid: light and dark shoots alternate.
CONCEPTS: dict[str, Sets] = {
    "lily-voan-trang": [
        ("Voan ren, corset, ngọc trai", [("fb", 11, 20), ("fb", 30, 39)]),
        ("Lily, jeans, găng ren, rèm trắng", [("fb", 21, 29)]),
    ],
    "dem-tuyet-hoc-duong": [("Áo thủy thủ, blazer, đèn lồng (2 ảnh ghép)", [("fbc", 8), ("fbc", 9)])],
    "nang-kem-mu-moc": [("Mũ móc, váy lanh, phông vàng kem (Drive)", [("dr", "26"), ("dr", "30"), ("dr", "34"), ("dr", "36")])],
    "thien-than-canh-den": [("Cánh đen, váy dây, giày cao gót", [("fb", 410, 423)])],
    "cuc-vang-nen-xanh": [
        ("Khăn caro, tóc ngắn, nền xanh", [("fb", 89, 99)]),
        ("Khăn caro, tóc xoăn, nền xanh", [("fb", 243, 252)]),
    ],
    "blazer-den": [
        ("Blazer đen, tóc nâu dài, nền trắng xám", [("fb", 123, 132)]),
        ("Blazer đen, nơ voan, ghế kim loại", [("fb", 143, 152)]),
    ],
    "hong-phan-bong-bay": [("Bóng hồng, tai nai, bóng nắng cửa sổ", [("fb", 133, 142)])],
    "do-nen-do": [("Nền đỏ, váy đen, hoa hồng đỏ", [("fb", 221, 228)])],
    "nen-hong-non-coi": [("Phông hồng, nón cói, váy tulle xanh mint", [("or", "782018454"), ("or", "785365100"), ("or", "786071279"), ("or", "786166952"), ("or", "786467918"), ("or", "786564723"), ("or", "787308226")])],
    "xuan-sac-hoa-dao": [("Áo voan, hoa cài tóc, nền olive (Drive)", [("dr", "27"), ("dr", "28"), ("dr", "29"), ("dr", "37"), ("dr", "46")])],
    "bong-den-ca-tinh": [("Váy đen, chùm bóng đen (2 ảnh ghép)", [("fbc", 62), ("fbc", 65)])],
    "thien-than-canh-trang": [
        ("Cánh trắng, nền xám, nghiêng mặt", [("fb", 50, 59)]),
        ("Cánh trắng, váy ngắn, nền xám", [("fb", 351, 360)]),
        ("Cánh trắng, nền đen", [("fb", 435, 448)]),
    ],
    "ao-long-nau": [("Áo khoác lông nâu, đồ đen, nền xám", [("fb", 100, 122)])],
    "sinh-nhat-bong-so": [("Bóng số 25, mũ lưỡi trai xanh", [("fb", 173, 180)])],
    "non-coi-vintage": [
        ("Nón cói, váy trắng, ghế gỗ, mèo", [("fb", 263, 274)]),
        ("Nón cói, váy mini, chó poodle", [("fb", 295, 302)]),
    ],
    "vuong-mien-bong-den": [("Vương miện, bóng đen (4 ảnh ghép)", [("fbc", 63), ("fbc", 69), ("fbc", 403), ("fbc", 409)])],
    "sage-bang-do-hoa": [("Băng đô hoa, nền xanh sage, bể kính", [("fb", 163, 172)])],
    "street-den": [("Streetwear đen, mũ lưỡi trai, nền trắng", [("fb", 331, 340)])],
    "lily-vay-trang": [
        ("Váy dây trắng, lily, tường xám", [("fb", 80, 87)]),
        ("Váy kem, lily, nền xám", [("fb", 361, 371)]),
    ],
    "vay-do-be-thuy-tinh": [("Váy voan đỏ, nền kem, bể thủy tinh", [("fb", 40, 49)])],
    "hoa-trang-nang-be": [("Hoa trắng, áo hai dây kem, nắng tường be", [("fb", 287, 294)])],
    "cap-doi-ao-den": [("Vest đen, váy đen, hoa baby", [("fb", 253, 262)])],
    "no-ruy-bang": [
        ("Nơ ruy băng xanh cobalt", [("fb", 181, 188)]),
        ("Ruy băng kem, bánh nhỏ", [("fb", 229, 236)]),
    ],
    "so-28-hoc-duong": [("Bóng số 28, đồng phục (ảnh ghép)", [("fbc", 68)])],
    "len-kem-tre-vai": [
        ("Áo len trễ vai, tóc búi, nền be", [("fb", 189, 200)]),
        ("Áo len trễ vai, mái thưa, hoa đồng tiền hồng", [("fb", 211, 220)]),
    ],
    "mu-long-dem-dong": [("Mũ lông nâu, tuyết bokeh (ảnh ghép)", [("fbc", 5)])],
    "vang-chanh": [("Váy vàng, chanh, bể kính", [("fb", 341, 350)])],
    "tat-luoi-ao-khoac": [("Blazer, tất lưới, nơ đỏ (2 ảnh ghép)", [("fbc", 70), ("fbc", 398)])],
    "cap-doi-so-mi-trang": [("Sơ mi trắng, bé cún, bóng nắng cửa sổ", [("fb", 275, 286)])],
    "doi-bong-den": [("Blazer, cà vạt, bóng đen", [("fb", 372, 381)])],
    "mong-mo-bong-trang": [("Bóng trắng, váy xếp tầng, hạt sao (2 ảnh ghép)", [("fbc", 60), ("fbc", 64)])],
    "toc-thang-ao-den": [("Áo đen, tóc thẳng dài, nền trắng", [("fb", 424, 434)])],
    "gau-bong-net-ve": [("Gấu bông, mèo xám, nét vẽ màu", [("fb", 153, 162)])],
    "giang-sinh": [("Đỏ len, áo khoác nâu cây thông, đen bạc (3 ảnh ghép)", [("fbc", 1), ("fbc", 2), ("fbc", 6)])],
    "long-trang-tuyet": [("Mũ lông trắng, khăn len, tuyết (2 ảnh ghép)", [("fbc", 3), ("fbc", 10)])],
    "ao-len-do-bob": [("Áo len đỏ, tóc bob (ảnh ghép)", [("fbc", 400)])],
    "cuc-hoa-mi": [("Khăn họa tiết hoa nhí, cúc họa mi (Drive)", [("dr", "42"), ("dr", "44"), ("dr", "45"), ("dr", "48")])],
    "vay-den-banh-trang": [("Váy đen, ngọc trai, bánh kem trắng", [("fb", 382, 389)])],
    "hai-nguoi": [
        ("Hai người, blazer đen và nâu", [("fb", 201, 210)]),
        ("Hai người, áo trắng quần đen", [("fb", 237, 242)]),
    ],
    "khan-len-sac-mau": [("Khăn xanh cobalt; mũ khăn đỏ, ô đỏ (2 ảnh ghép)", [("fbc", 4), ("fbc", 7)])],
    "lily-hong-quan-jeans": [("Crop top trắng, jeans, lily hồng", [("fb", 321, 330)])],
    "bau-xinh": [
        ("Bướm cam, phông xanh rêu đậm", [("fb", 303, 312)]),
        ("Crop top xám nhạt, jeans", [("fb", 313, 320)]),
    ],
    "tiem-an-vat-xanh": [("Sơ mi sọc xanh, snack, bánh sừng bò (ảnh ghép)", [("fbc", 74)])],
    "thu-vang-doi-ta": [("Lá khô, áo len kem, bịt tai lông (Drive)", [("dr", "32"), ("dr", "35"), ("dr", "47")])],
    "tao-do-ao-trang": [("Áo phồng tay trắng, táo đỏ (ảnh ghép)", [("fbc", 71)])],
    "sinh-nhat-am-ap": [("Áo len trễ vai, mũ sinh nhật, bánh nến (ảnh ghép)", [("fbc", 61)])],
    "cong-chua-du-hoa": [("Váy tulle kem, dù cài hoa, lily hồng (2 ảnh ghép)", [("fbc", 73), ("fbc", 77)])],
    "nang-som-can-mat": [("Cận mặt, ánh sáng ấm (Drive)", [("dr", "24"), ("dr", "25"), ("dr", "31"), ("dr", "39")])],
}

# Sheet geometry as fractions of the 206 px square sheet (measured on all sheets).
COL_EDGES = [(0.0, 68 / 206), (69 / 206, 137 / 206), (138 / 206, 1.0)]
ROW_EDGES = [(0.0, 97 / 206), (109 / 206, 1.0)]


def fb_path(n: int) -> Path:
    hits = sorted(FB.glob(f"{n:03d}_*.jpg"))
    if not hits:
        sys.exit(f"missing Facebook photo {n:03d}_*.jpg in {FB}")
    return hits[0]


def drive_path(nn: str) -> Path:
    hits = sorted(DRIVE.glob(f"{nn}_*.jpg"))
    if not hits:
        sys.exit(f"missing Drive photo {nn}_*.jpg in {DRIVE}")
    return hits[0]


def trim_white(im: Image.Image, thr: int = 246, max_frac: float = 0.03) -> Image.Image:
    """Cut the white gutter slivers off a tile. Never more than max_frac per side: a white studio backdrop is
    part of the photo, trimming it would change the framing."""
    a = np.asarray(im.convert("RGB"))
    keep = a.min(axis=2) < thr
    rows = np.where(keep.mean(axis=1) > 0.04)[0]
    cols = np.where(keep.mean(axis=0) > 0.04)[0]
    if len(rows) == 0 or len(cols) == 0:
        return im
    h, w = keep.shape
    top, bottom = min(rows[0], round(h * max_frac)), max(rows[-1] + 1, h - round(h * max_frac))
    left, right = min(cols[0], round(w * max_frac)), max(cols[-1] + 1, w - round(w * max_frac))
    return im.crop((left, top, right, bottom))


def split_collage(im: Image.Image) -> list[Image.Image]:
    w, h = im.size
    # the fractions were measured on 206 px sheets (+-0.5 px); on a 2000 px sheet widen each box a little,
    # the gutters (about 10 px) and trim_white take care of the overlap
    m = round(w * 0.0015) if w > 400 else 0
    tiles = []
    for y0, y1 in ROW_EDGES:
        for x0, x1 in COL_EDGES:
            box = (max(0, round(x0 * w) - m), max(0, round(y0 * h) - m), min(w, round(x1 * w) + m), min(h, round(y1 * h) + m))
            tiles.append(trim_white(im.crop(box)))
    return tiles


try:
    ORIGINAL_OF: dict[str, str] = json.loads(ORIGINALS_MAP.read_text(encoding="utf-8"))
except FileNotFoundError:
    ORIGINAL_OF = {}


def original_path(key: str) -> Path | None:
    name = ORIGINAL_OF.get(key)
    path = ORIGINALS / name if name else None
    return path if path and path.exists() else None


def expand(ref: Ref) -> list[tuple[str, Image.Image, bool]]:
    """One source reference -> [(label, RGB frame, is a full-size original)], skipping known duplicates."""
    kind = ref[0]
    if kind == "fb":
        out = []
        for n in range(ref[1], ref[2] + 1):
            key = f"fb:{n:03d}"
            if key in DUPLICATES:
                continue
            big = original_path(key)
            out.append((key, Image.open(big or fb_path(n)).convert("RGB"), big is not None))
        return out
    if kind == "fbc":
        n = ref[1]
        big = original_path(f"fbc:{n:03d}")
        tiles = split_collage(Image.open(big or fb_path(n)).convert("RGB"))
        return [(f"fbc:{n:03d}.{i + 1}", t, big is not None) for i, t in enumerate(tiles)]
    if kind == "dr":
        return [(f"dr:{ref[1]}", Image.open(drive_path(ref[1])).convert("RGB"), False)]
    if kind == "or":
        hits = sorted(ORIGINALS.glob(f"{ref[1]}_*.jpg"))
        if not hits:
            sys.exit(f"missing original {ref[1]}_*.jpg in {ORIGINALS}")
        return [(f"or:{ref[1]}", Image.open(hits[0]).convert("RGB"), True)]
    raise ValueError(ref)


def cap_long_edge(im: Image.Image) -> Image.Image:
    long_edge = max(im.size)
    if long_edge <= MAX_LONG_EDGE:
        return im
    s = MAX_LONG_EDGE / long_edge
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


# ---------------------------------------------------------------- upscaling

def esrgan_exe() -> Path | None:
    exe = ESRGAN_DIR / "realesrgan-ncnn-vulkan.exe"
    if not exe.exists():
        exe = ESRGAN_DIR / "realesrgan-ncnn-vulkan"
    return exe if exe.exists() else None


def nvidia_icd() -> str | None:
    """Laptops with an AMD iGPU + NVIDIA card often make ncnn fail with 'vkEnumeratePhysicalDevices failed 5'.
    Pointing the Vulkan loader at the NVIDIA driver only fixes it."""
    repo = Path(os.environ.get("WINDIR", r"C:\Windows")) / "System32" / "DriverStore" / "FileRepository"
    hits = sorted(repo.glob("*/nv-vk64.json")) if repo.exists() else []
    return str(hits[0]) if hits else None


def run_esrgan(exe: Path, src_dir: Path, dst_dir: Path) -> bool:
    cmd = [
        str(exe), "-i", str(src_dir), "-o", str(dst_dir), "-n", "realesrgan-x4plus", "-s", "4",
        "-t", "128", "-j", "1:2:2", "-m", str(ESRGAN_DIR / "models"), "-f", "png",
    ]
    env = dict(os.environ)
    for attempt in range(2):
        proc = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)
        if proc.returncode == 0:
            return True
        if attempt == 0 and "vkEnumeratePhysicalDevices" in (proc.stdout + proc.stderr) and "VK_DRIVER_FILES" not in env:
            icd = nvidia_icd()
            if icd:
                env["VK_DRIVER_FILES"] = icd
                print(f"  Vulkan could not list GPUs, retrying with the NVIDIA driver only ({icd})")
                continue
        print("  Real-ESRGAN failed:", (proc.stdout + proc.stderr).strip()[-400:])
        return False
    return False


def plain_resize(im: Image.Image, factor: int) -> Image.Image:
    return im.resize((im.width * factor, im.height * factor), Image.LANCZOS)


def fallback_upscale(im: Image.Image, factor: int) -> Image.Image:
    return plain_resize(im, factor).filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))


def factor_for(im: Image.Image) -> int:
    return min(MAX_UPSCALE, max(1, math.ceil(TARGET_LONG_EDGE / max(im.size))))


def frame_key(im: Image.Image, factor: int) -> str:
    h = hashlib.sha1(im.tobytes())
    h.update(f"{im.size}|x{factor}|mix{ESRGAN_MIX}|x4plus".encode())
    return h.hexdigest()[:20]


def upscale_all(frames: list[Image.Image]) -> list[Image.Image]:
    """Upscale every frame that needs it; results are cached by content so re-runs are quick."""
    results: list[Image.Image | None] = [None] * len(frames)
    todo: dict[str, tuple[Image.Image, int]] = {}
    pending: list[tuple[int, str, int]] = []
    CACHE.mkdir(parents=True, exist_ok=True)
    for i, im in enumerate(frames):
        factor = factor_for(im)
        if factor == 1:
            results[i] = im
            continue
        key = frame_key(im, factor)
        cached = CACHE / f"{key}.jpg"
        if cached.exists():
            results[i] = Image.open(cached).convert("RGB")
            continue
        todo[key] = (im, factor)
        pending.append((i, key, factor))

    exe = esrgan_exe()
    if todo and exe is None:
        print("tools/realesrgan not found: falling back to Lanczos + unsharp (see tools/README.md)")
    if todo and exe is not None:
        print(f"Real-ESRGAN: {len(todo)} frames to upscale ({len(frames) - len(pending)} already cached or full size)")
        work = ROOT / "temp" / "esrgan-work"
        src_dir, dst_dir = work / "in", work / "out"
        shutil.rmtree(work, ignore_errors=True)
        src_dir.mkdir(parents=True)
        dst_dir.mkdir(parents=True)
        for key, (im, _) in todo.items():
            im.save(src_dir / f"{key}.png")
        ok = run_esrgan(exe, src_dir, dst_dir)
        for key, (im, factor) in todo.items():
            out_png = dst_dir / f"{key}.png"
            if ok and out_png.exists():
                ai = Image.open(out_png).convert("RGB")
                target = (im.width * factor, im.height * factor)
                if ai.size != target:
                    ai = ai.resize(target, Image.LANCZOS)
                final = Image.blend(plain_resize(im, factor), ai, ESRGAN_MIX)
            else:
                final = fallback_upscale(im, factor)
            final.save(CACHE / f"{key}.jpg", "JPEG", quality=95, subsampling=0)
        shutil.rmtree(work, ignore_errors=True)
    for i, key, factor in pending:
        cached = CACHE / f"{key}.jpg"
        if cached.exists():
            results[i] = Image.open(cached).convert("RGB")
        else:
            results[i] = fallback_upscale(todo[key][0], factor)
    return [r for r in results if r is not None]


# ---------------------------------------------------------------- logo

def build_logo() -> None:
    logo = DRIVE / "logo.jpg"
    if not logo.exists():
        print("no logo.jpg, skipping logo")
        return
    im = Image.open(logo).convert("L")
    a = np.asarray(im)
    ys, xs = np.where(a < 235)
    pad = 12
    box = (xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad)
    cropped = im.crop(box)
    alpha = Image.eval(cropped, lambda v: 255 - v)
    rgba = Image.new("RGBA", cropped.size, (20, 17, 14, 0))
    rgba.putalpha(alpha)
    OUT.mkdir(parents=True, exist_ok=True)
    rgba.save(OUT / "logo.png", optimize=True)
    # square icon: the camera glyph on cream (left part of the lockup, up to the divider)
    cam = im.crop((box[0], box[1], box[0] + int((box[2] - box[0]) * 0.195), box[3]))
    side = max(cam.size) + 40
    icon = Image.new("RGB", (side, side), (245, 239, 228))
    mask = Image.eval(cam, lambda v: 255 - v)
    ink = Image.new("RGB", cam.size, (20, 17, 14))
    icon.paste(ink, ((side - cam.width) // 2, (side - cam.height) // 2), mask)
    icon.resize((256, 256), Image.LANCZOS).save(ROOT / "src" / "app" / "icon.png", optimize=True)
    print("logo.png + icon.png written", rgba.size)


# ---------------------------------------------------------------- report

def short_ref(ref: Ref) -> str:
    if ref[0] == "fb":
        return f"FB {ref[1]:03d}–{ref[2]:03d}" if ref[1] != ref[2] else f"FB {ref[1]:03d}"
    if ref[0] == "fbc":
        return f"ảnh ghép FB {ref[1]:03d}"
    if ref[0] == "or":
        return f"ảnh gốc {ref[1]}"
    return f"Drive {ref[1]}"


def compress_labels(labels: list[str]) -> str:
    """['fb:011', 'fb:012', 'fb:014', 'fbc:008.1', ...] -> 'FB 011–012, 014; ảnh ghép FB 008 (1 tile); ...'"""
    nums = sorted(int(x[3:]) for x in labels if x.startswith("fb:"))
    parts: list[str] = []
    i = 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
            j += 1
        parts.append(f"{nums[i]:03d}" if i == j else f"{nums[i]:03d}–{nums[j]:03d}")
        i = j + 1
    out = [("FB " + ", ".join(parts))] if parts else []
    sheets: dict[str, int] = {}
    for x in labels:
        if x.startswith("fbc:"):
            sheets[x[4:7]] = sheets.get(x[4:7], 0) + 1
    out += [f"ảnh ghép FB {n} ({k} tile)" for n, k in sorted(sheets.items())]
    drive = [x[3:] for x in labels if x.startswith("dr:")]
    if drive:
        out.append("Drive " + ", ".join(drive))
    return "; ".join(out)


def write_report(counts: dict[str, list[tuple[int, int]]], hidden_labels: dict[str, list[str]], hidden_concepts: list[str]) -> None:
    lines = [
        "# Phân loại ảnh MERCI studio",
        "",
        "Tạo tự động bởi `scripts/build-merci-assets.py`, đừng sửa tay: sửa `CONCEPTS` trong script rồi chạy lại.",
        "",
        "- **Bộ ảnh** = một buổi chụp (cùng trang phục, phông nền, người mẫu).",
        "- **Concept** = chủ đề hiển thị trên một trang của web, gồm một hoặc nhiều bộ ảnh.",
        "- `FB nnn` là số thứ tự ảnh trong `facebook-photos/` (001 = ảnh mới nhất), `Drive nn` là ảnh trong `drive-source/`.",
        "- **Có bản gốc** = có ảnh lớn trong `drive-originals/` (1366 × 2048, ảnh ghép 2000 × 2000): hiện trên web, không phóng.",
        "- **Chờ bản gốc** = chỉ có bản 206 px (hoặc tile ~68 × 97 px): "
        + ("đang ẨN khỏi web cho đến khi có ảnh lớn." if SHARP_ONLY else "hiện trên web sau khi phóng bằng AI."),
        "",
        "| Concept (slug) | Bộ ảnh | Nguồn | Có bản gốc | Chờ bản gốc |",
        "| --- | --- | --- | ---: | ---: |",
    ]
    total = sharp = 0
    for slug, sets in CONCEPTS.items():
        for (label, refs), (n, n_orig) in zip(sets, counts[slug]):
            lines.append(f"| `{slug}` | {label} | {', '.join(short_ref(r) for r in refs)} | {n_orig} | {n - n_orig} |")
            total += n
            sharp += n_orig
    shown = [s for s in CONCEPTS if s not in hidden_concepts] if SHARP_ONLY else list(CONCEPTS)
    lines += [
        "",
        f"Tổng {total} ảnh trong {len(CONCEPTS)} concept: {sharp} ảnh có bản gốc, {total - sharp} ảnh chờ bản gốc.",
        f"Trên web: {len(shown)} concept." + (f" Ẩn {len(hidden_concepts)} concept vì có dưới {MIN_PHOTOS} ảnh nét." if hidden_concepts else ""),
        "",
        "## Cần thêm ảnh gốc (xếp theo concept)",
        "",
        "Bỏ ảnh lớn vào thư mục Drive `AnhFB`, rồi chạy `download-drive-folder.py`, `match-originals.py`, `build-merci-assets.py`.",
        "",
    ]
    for slug, labels in hidden_labels.items():
        if labels:
            tag = " (concept đang ẩn)" if slug in hidden_concepts else ""
            lines.append(f"- `{slug}`{tag}: {len(labels)} ảnh, {compress_labels(labels)}")
    lines += ["", "## Bản trùng, đã loại", ""]
    for dup, kept in DUPLICATES.items():
        lines.append(f"- `{dup}` giống hệt `{kept}`")
    lines += ["", "## Ảnh ghép không dùng (concept đã có ảnh đơn của cùng buổi chụp)", ""]
    for sheet, slug in FOLDED_SHEETS.items():
        lines.append(f"- ảnh ghép FB {sheet:03d} → `{slug}` (ghép theo mắt thường: cùng trang phục, đạo cụ, phông)")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- main

Frame = tuple[str, int, str, Image.Image, bool]  # slug, set number, source label, image, is a full-size original


def main() -> None:
    shutil.rmtree(OUT / "concepts", ignore_errors=True)
    manifest: dict[str, list[dict[str, object]]] = {}
    counts: dict[str, list[tuple[int, int]]] = {}
    hidden_labels: dict[str, list[str]] = {}
    hidden_concepts: list[str] = []
    plan: list[Frame] = []
    # load every frame first so the upscaler (only used when SHARP_ONLY is off) runs once over the whole batch
    for slug, sets in CONCEPTS.items():
        frames: list[Frame] = []
        counts[slug] = []
        hidden_labels[slug] = []
        for set_no, (_, refs) in enumerate(sets, start=1):
            n = n_sharp = 0
            for ref in refs:
                for label, im, original in expand(ref):
                    n += 1
                    n_sharp += original
                    if SHARP_ONLY and not original:
                        hidden_labels[slug].append(label)
                        continue
                    frames.append((slug, set_no, label, im, original))
            counts[slug].append((n, n_sharp))
        if SHARP_ONLY and len(frames) < MIN_PHOTOS:
            hidden_concepts.append(slug)
            frames = []
        # the cover (first photo) should be a sharp one: bring the first original of the first set to the front
        if frames and not frames[0][4]:
            first_set = frames[0][1]
            pick = next((i for i, f in enumerate(frames) if f[1] == first_set and f[4]), None)
            if pick is not None:
                frames.insert(0, frames.pop(pick))
        plan.extend(frames)
    # sharp-only mode never enlarges anything: every frame here is a native crop of a full-size original
    finished = [f[3] for f in plan] if SHARP_ONLY else upscale_all([f[3] for f in plan])
    index: dict[str, int] = {}
    for (slug, set_no, _label, _im, _orig), fr in zip(plan, finished):
        fr = cap_long_edge(fr)
        folder = OUT / "concepts" / slug
        folder.mkdir(parents=True, exist_ok=True)
        index[slug] = index.get(slug, 0) + 1
        # the content hash is part of the name: Next's image cache and the browser key on the URL, so a reused name
        # would keep serving an older, softer version of the photo
        tmp = folder / f"{slug}-{index[slug]:02d}.tmp.jpg"
        fr.save(tmp, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        name = f"{slug}-{index[slug]:02d}-{hashlib.sha1(tmp.read_bytes()).hexdigest()[:8]}.jpg"
        tmp.replace(folder / name)
        r, g, b = np.asarray(fr.resize((1, 1), Image.BOX))[0, 0]
        manifest.setdefault(slug, []).append({
            "src": f"/sites/merci/concepts/{slug}/{name}",
            "width": fr.width,
            "height": fr.height,
            "tone": f"#{r:02x}{g:02x}{b:02x}",
            "set": set_no,
        })
    for slug in CONCEPTS:
        shown = len(manifest.get(slug, []))
        waiting = len(hidden_labels[slug])
        note = "  HIDDEN (too few sharp photos)" if slug in hidden_concepts else ""
        print(f"{slug:24s} {shown:3d} shown, {waiting:3d} waiting for originals{note}")
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    write_report(counts, hidden_labels, hidden_concepts)
    build_logo()
    print(f"done: {len(manifest)} concepts shown, {sum(len(v) for v in manifest.values())} photos")


if __name__ == "__main__":
    main()
