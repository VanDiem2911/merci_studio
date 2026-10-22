"""Find which full-size original belongs to which 206 px Facebook thumbnail.

The thumbnails in facebook-photos/ are squares cut from the originals (portraits are cut one third of the way down,
collage sheets are only resized). Every original in drive-originals/ is compared with every thumbnail at 32 px; true
pairs differ by about 0.001 (mean squared error on normalised grey), everything else by 0.15 or more.

Writes docs/research/merci/originals-map.json ({"fb:011": "<file in drive-originals>", "fbc:060": "...", ...}) which
scripts/build-merci-assets.py reads. Re-run after adding originals:
    python scripts/download-drive-folder.py <folder> docs/research/merci/drive-originals
    python scripts/match-originals.py
    python scripts/build-merci-assets.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / "docs" / "research" / "merci" / "drive-originals"
THUMBS = ROOT / "docs" / "research" / "merci" / "facebook-photos"
OUT = ROOT / "docs" / "research" / "merci" / "originals-map.json"

N = 32
ACCEPT = 0.05
CROP_STEPS = 25  # vertical positions tried for a portrait original


def norm(a: np.ndarray) -> np.ndarray:
    a = a - a.mean()
    return a / (a.std() + 1e-6)


def grey(im: Image.Image) -> np.ndarray:
    return norm(np.asarray(im.convert("L").resize((N, N), Image.BOX), dtype=np.float32))


def is_sheet(path: Path) -> bool:
    """Collage sheet = 3 x 2 tiles with a caption strip: bright strip rows and bright gutters."""
    a = np.asarray(Image.open(path).convert("L"), dtype=np.float32)
    if a.shape != (206, 206):
        return False
    return 226.5 < a[100:106, 5:200].mean() < 230 and a[:, 66:71].mean(axis=0).max() > 247


def main() -> None:
    thumbs = sorted(THUMBS.glob("*_photo.jpg"))
    if not thumbs or not ORIGINALS.exists():
        raise SystemExit("need facebook-photos/ and drive-originals/")
    keys, mats = [], []
    for p in thumbs:
        n = int(p.name.split("_")[0])
        keys.append(f"fbc:{n:03d}" if is_sheet(p) else f"fb:{n:03d}")
        mats.append(grey(Image.open(p)))
    mats_a = np.stack(mats)
    sheet_idx = [i for i, k in enumerate(keys) if k.startswith("fbc:")]
    single_idx = [i for i, k in enumerate(keys) if k.startswith("fb:")]

    best_for: dict[str, tuple[float, str, int]] = {}
    unmatched: list[tuple[str, float]] = []
    files = sorted(p for p in ORIGINALS.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png"))
    for p in files:
        with Image.open(p) as im:
            im = im.convert("RGB")
            w, h = im.size
            if abs(w - h) <= 0.02 * max(w, h):
                views, pool = [im], sheet_idx + single_idx
            elif h > w:
                views = [im.crop((0, y, w, y + w)) for y in (round((h - w) * t) for t in np.linspace(0, 1, CROP_STEPS))]
                pool = single_idx
            else:
                views, pool = [im.crop(((w - h) // 2, 0, (w - h) // 2 + h, h))], single_idx
            best = (1e9, -1)
            for v in views:
                d = ((mats_a[pool] - grey(v)) ** 2).mean(axis=(1, 2))
                j = int(d.argmin())
                if d[j] < best[0]:
                    best = (float(d[j]), pool[j])
        if best[0] < ACCEPT:
            key = keys[best[1]]
            score = best[0]
            # two originals for one thumbnail: keep the larger file
            if key not in best_for or Image.open(ORIGINALS / best_for[key][1]).size[0] < w:
                best_for[key] = (score, p.name, max(w, h))
        else:
            unmatched.append((p.name, round(best[0], 3)))

    mapping = {k: v[1] for k, v in sorted(best_for.items())}
    OUT.write_text(json.dumps(mapping, indent=1) + "\n", encoding="utf-8")
    singles = sum(1 for k in mapping if k.startswith("fb:"))
    print(f"{len(files)} originals: {singles} singles + {len(mapping) - singles} collage sheets matched, {len(unmatched)} unmatched")
    for name, mse in unmatched:
        print(f"  unmatched: {name} (best mse {mse})")


if __name__ == "__main__":
    main()
