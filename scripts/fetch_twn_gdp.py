#!/usr/bin/env python3
"""拉取台湾名义 GDP（现价美元）并写入 data/twn_gdp_usd.json。

- 1980+：IMF World Economic Outlook (NGDPD, billions USD)
  https://www.imf.org/external/datamapper/api/v1/NGDPD/TWN
- 1960-1979：data/twn_gdp_supplement_1960_1979.json（世行 Excel 无 TWN 时的补充）
"""

from __future__ import annotations

import argparse
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUPPLEMENT_PATH = ROOT / "data" / "twn_gdp_supplement_1960_1979.json"
OUTPUT_PATH = ROOT / "data" / "twn_gdp_usd.json"

IMF_TWN_URL = "https://www.imf.org/external/datamapper/api/v1/NGDPD/TWN"
INDICATOR_CODE = "NY.GDP.MKTP.CD"
DEFAULT_END_YEAR = 2025


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch Taiwan GDP into twn_gdp_usd.json")
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    parser.add_argument("--end-year", type=int, default=DEFAULT_END_YEAR)
    parser.add_argument("--supplement", default=str(SUPPLEMENT_PATH))
    return parser.parse_args()


def fetch_imf_ngdpd() -> dict[int, float]:
    with urllib.request.urlopen(IMF_TWN_URL, timeout=60) as resp:
        payload = json.load(resp)
    series = payload["values"]["NGDPD"]["TWN"]
    out: dict[int, float] = {}
    for year_str, billions in series.items():
        if not year_str.isdigit():
            continue
        year = int(year_str)
        if billions is None:
            continue
        out[year] = float(billions) * 1_000_000_000
    return out


def load_supplement(path: Path) -> dict[int, float]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {int(year): float(amount) for year, amount in payload["values"].items()}


def build_payload(imf_values: dict[int, float], supplement: dict[int, float], end_year: int) -> dict:
    values: dict[str, float] = {}

    for year, amount in supplement.items():
        if year <= 1979:
            values[str(year)] = amount

    for year, amount in sorted(imf_values.items()):
        if year >= 1980 and year <= end_year:
            values[str(year)] = amount

    imf_years = [y for y in imf_values if 1980 <= y <= end_year]
    supplement_years = sorted(supplement)
    source = (
        "Supplemental Taiwan GDP (NY.GDP.MKTP.CD equivalent, current US$). "
        f"1960-1979: {SUPPLEMENT_PATH.name}; "
        f"1980-{max(imf_years) if imf_years else end_year}: IMF WEO NGDPD via datamapper API."
    )

    return {
        "entity_code": "TWN",
        "entity_name": "Taiwan, China",
        "indicator_code": INDICATOR_CODE,
        "source": source,
        "unit": "USD",
        "values": values,
        "_meta": {
            "imf_url": IMF_TWN_URL,
            "supplement_years": f"{min(supplement_years)}-{max(supplement_years)}",
            "imf_years": f"{min(imf_years)}-{max(imf_years)}" if imf_years else "",
            "row_count": len(values),
        },
    }


def main() -> None:
    args = parse_args()
    supplement = load_supplement(Path(args.supplement))
    imf_values = fetch_imf_ngdpd()
    payload = build_payload(imf_values, supplement, args.end_year)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    years = sorted(int(y) for y in payload["values"])
    print(f"Written: {output}")
    print(f"Years: {years[0]}-{years[-1]}, rows: {len(years)}")
    print(f"2024 USD: {payload['values'].get('2024', 'n/a')}")


if __name__ == "__main__":
    main()
