#!/usr/bin/env python3
"""Scale flag PNGs to a uniform height while preserving legal aspect ratio."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FLAGS_DIR = ROOT / "frontend" / "public" / "flags"

TARGET_H = 107
DEFAULT_ASPECT = 3 / 2
# 与 frontend/src/utils/flagAspectRatios.js 保持同步
ASPECT_BY_CODE = {
    "af": 2.0,
    "ar": 14 / 9,
    "au": 2.0,
    "bd": 5 / 3,
    "bn": 2.0,
    "br": 10 / 7,
    "bt": 3 / 2,
    "ca": 2.0,
    "ch": 1.0,
    "ir": 3 / 2,
    "se": 8 / 5,
    "cn": 3 / 2,
    "de": 5 / 3,
    "es": 3 / 2,
    "fr": 3 / 2,
    "gb": 2.0,
    "hk": 3 / 2,
    "id": 3 / 2,
    "il": 11 / 8,
    "in": 3 / 2,
    "it": 3 / 2,
    "jp": 3 / 2,
    "kh": 25 / 16,
    "kr": 3 / 2,
    "la": 3 / 2,
    "lk": 3 / 2,
    "mv": 3 / 2,
    "mx": 7 / 4,
    "mm": 3 / 2,
    "mn": 2.0,
    "mo": 2.0,
    "my": 2.0,
    "nl": 3 / 2,
    "np": 3 / 4,
    "ph": 2.0,
    "pg": 4 / 3,
    "pk": 3 / 2,
    "ru": 3 / 2,
    "sa": 3 / 2,
    "sg": 3 / 2,
    "su": 2.0,
    "th": 3 / 2,
    "tr": 3 / 2,
    "tw": 3 / 2,
    "us": 19 / 10,
    "vn": 3 / 2,
    "tl": 2.0,
}

SOVIET_URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Flag_of_the_Soviet_Union.svg?width=1200"
)
SWEDEN_URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Flag_of_Sweden.svg?width=800"
)
# モンゴルの国旗 — ja.wikipedia.org → Commons:Flag_of_Mongolia.svg
# 法定は幅:長 = 1:2（横長 2:1）
MONGOLIA_URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Flag_of_Mongolia.svg?width=800"
)
# ミャンマーの国旗 — Commons:Flag_of_Myanmar.svg（横長 3:2）
MYANMAR_URL = (
    "https://commons.wikimedia.org/wiki/Special:FilePath/"
    "Flag_of_Myanmar.svg?width=800"
)
WIKIMEDIA_FALLBACK = {
    "lv": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Latvia.svg?width=800",
    "mc": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Monaco.svg?width=800",
    "pl": "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Poland.svg?width=800",
}


def download_wikimedia(url: str, dest: Path) -> None:
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", url, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {url}")


def scale_flag(im: Image.Image, aspect_ratio: float, target_h: int = TARGET_H) -> Image.Image:
    im = im.convert("RGBA")
    target_w = max(1, round(target_h * aspect_ratio))
    return im.resize((target_w, target_h), Image.Resampling.LANCZOS)


def download_flagcdn(code: str, dest: Path) -> None:
    url = f"https://flagcdn.com/w640/{code}.png"
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", url, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {url}")


def download_soviet(dest: Path) -> None:
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", SOVIET_URL, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {SOVIET_URL}")


def download_sweden(dest: Path) -> None:
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", SWEDEN_URL, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {SWEDEN_URL}")


def download_mongolia(dest: Path) -> None:
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", MONGOLIA_URL, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {MONGOLIA_URL}")


def download_myanmar(dest: Path) -> None:
    result = subprocess.run(
        ["curl.exe", "-sL", "-A", "Mozilla/5.0", MYANMAR_URL, "-o", str(dest)],
        check=False,
    )
    if result.returncode != 0 or not dest.exists() or dest.stat().st_size < 200:
        raise RuntimeError(f"download failed: {MYANMAR_URL}")


def normalize_file(path: Path, aspect_ratio: float | None = None, refresh: bool = False) -> None:
    code = path.stem
    ratio = aspect_ratio if aspect_ratio is not None else ASPECT_BY_CODE.get(code, DEFAULT_ASPECT)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp) / f"{code}_src.png"
        source = path

        if refresh:
            if code == "su":
                download_soviet(tmp_path)
            elif code == "se":
                download_sweden(tmp_path)
            elif code == "mn":
                download_mongolia(tmp_path)
            elif code == "mm":
                download_myanmar(tmp_path)
            elif code in WIKIMEDIA_FALLBACK:
                download_wikimedia(WIKIMEDIA_FALLBACK[code], tmp_path)
            else:
                download_flagcdn(code, tmp_path)
            source = tmp_path

        im = Image.open(source).convert("RGBA")
        out = scale_flag(im, ratio)
        out.save(path, format="PNG", optimize=True)
        print(f"{path.name}: {out.size[0]}x{out.size[1]} (ratio {ratio:.4f})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Scale flags to uniform height, native aspect ratio.")
    parser.add_argument("files", nargs="*", help="Flag PNG paths or codes (e.g. su)")
    parser.add_argument("--all", action="store_true", help="Process every PNG in flags/")
    parser.add_argument("--refresh", action="store_true", help="Re-download source images before scaling")
    parser.add_argument("--aspect", type=float, help="Override aspect ratio (width/height)")
    args = parser.parse_args()

    targets: list[Path] = []
    if args.all:
        targets = sorted(FLAGS_DIR.glob("*.png"))
    else:
        for item in args.files:
            p = Path(item)
            if not p.suffix:
                p = FLAGS_DIR / f"{item}.png"
            elif not p.is_absolute():
                p = FLAGS_DIR / p.name
            targets.append(p)

    if not targets:
        parser.error("Provide flag codes/files or use --all")

    for path in targets:
        if not path.exists() and not args.refresh:
            print(f"skip missing: {path}")
            continue
        try:
            normalize_file(path, args.aspect, refresh=args.refresh)
        except Exception as exc:
            print(f"skip {path.name}: {exc}")


if __name__ == "__main__":
    main()
