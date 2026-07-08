#!/usr/bin/env python3
"""从图表 JSON 中移除港澳台实体。"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXCLUDED_NAMES = {
    "HONG KONG",
    "MACAO",
    "TAIWAN",
    "HONG KONG (※)",
    "MACAO (※)",
    "TAIWAN (※)",
}
EXCLUDED_ISO = {"hk", "mo", "tw"}

PATHS = (
    ROOT / "data" / "asia-gdp-top15.json",
    ROOT / "frontend" / "public" / "data" / "asia-gdp-top15.json",
)


def filter_chart(chart: dict) -> tuple[dict, int]:
    codes = chart.get("entityCodes") or {}
    excluded = {
        name
        for name, code in codes.items()
        if name in EXCLUDED_NAMES or code in EXCLUDED_ISO
    }
    if not excluded:
        return chart, 0

    allowed = {name for name in codes if name not in excluded}
    header, *rows = chart["dataset"]
    out = dict(chart)
    for key in ("entityColors", "entityCodes", "entityFlagImages"):
        if key in out:
            out[key] = {k: v for k, v in out[key].items() if k in allowed}
    out["dataset"] = [header, *[r for r in rows if r[1] in allowed]]
    if "_meta" in out:
        out["_meta"] = dict(out["_meta"])
        out["_meta"]["entityCount"] = len(allowed)
        out["_meta"]["rowCount"] = len(out["dataset"]) - 1
    return out, len(excluded)


def main() -> None:
    for path in PATHS:
        if not path.exists():
            print(f"skip missing: {path}")
            continue
        chart = json.loads(path.read_text(encoding="utf-8"))
        filtered, removed = filter_chart(chart)
        path.write_text(
            json.dumps(filtered, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        remaining = len(filtered.get("entityCodes", {}))
        print(f"{path}: removed {removed}, remaining {remaining}")


if __name__ == "__main__":
    main()
