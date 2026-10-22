"""Download every file of a *public* Google Drive folder (no login, no API key).

Reads the folder through its embeddedfolderview page, then fetches each file from drive.usercontent.google.com.
Files that already exist are skipped, so a failed run can simply be started again.

Usage: python scripts/download-drive-folder.py <folder-id or folder URL> <output dir>
Example: python scripts/download-drive-folder.py 11FiViBg5GPieszpcubGY39NRvvzRrOFZ docs/research/merci/drive-originals
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (merci-studio asset download)"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def list_folder(folder_id: str) -> list[dict[str, str]]:
    page = get(f"https://drive.google.com/embeddedfolderview?id={folder_id}").decode("utf-8", "replace")
    found = re.findall(r'<a href="https://drive\.google\.com/file/d/([A-Za-z0-9_-]+)/view[^"]*"[^>]*>.*?flip-entry-title">([^<]*)<', page, re.S)
    seen: dict[str, str] = {}
    for fid, name in found:
        seen.setdefault(fid, html.unescape(name))
    return [{"id": i, "name": n} for i, n in seen.items()]


def local_names(files: list[dict[str, str]]) -> dict[str, str]:
    """File name on disk; a name used twice in the folder gets the Drive id appended."""
    count: dict[str, int] = {}
    for f in files:
        count[f["name"]] = count.get(f["name"], 0) + 1
    out = {}
    for f in files:
        stem, dot, ext = f["name"].rpartition(".")
        out[f["id"]] = f["name"] if count[f["name"]] == 1 else f"{stem}__{f['id'][:8]}.{ext}"
    return out


def fetch(file: dict[str, str], dest: Path) -> tuple[str, str]:
    if dest.exists() and dest.stat().st_size > 0:
        return file["name"], "skipped"
    url = f"https://drive.usercontent.google.com/download?id={file['id']}&export=download&confirm=t"
    for attempt in range(4):
        try:
            data = get(url)
            if data[:2] != b"\xff\xd8" and data[:4] != b"\x89PNG":
                raise ValueError("not an image (quota page or login wall?)")
            dest.write_bytes(data)
            return file["name"], "ok"
        except (urllib.error.URLError, ValueError, TimeoutError) as e:
            err = str(e)
            time.sleep(2 + attempt * 3)
    return file["name"], f"FAILED: {err}"


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    m = re.search(r"folders/([A-Za-z0-9_-]+)", sys.argv[1])
    folder_id = m.group(1) if m else sys.argv[1]
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    files = list_folder(folder_id)
    if not files:
        sys.exit("no files found: is the folder shared with 'anyone with the link'?")
    names = local_names(files)
    print(f"{len(files)} files in folder {folder_id}")
    (out / "files.json").write_text(
        json.dumps([{**f, "file": names[f["id"]]} for f in files], ensure_ascii=False, indent=1), encoding="utf-8"
    )
    failed = 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i, (name, status) in enumerate(pool.map(lambda f: fetch(f, out / names[f["id"]]), files), start=1):
            if status.startswith("FAILED"):
                failed += 1
                print(f"[{i}/{len(files)}] {name}: {status}")
            elif i % 25 == 0 or i == len(files):
                print(f"[{i}/{len(files)}] ...")
    print(f"done, {failed} failed")


if __name__ == "__main__":
    main()
