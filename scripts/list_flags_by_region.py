#!/usr/bin/env python3
"""List available flags grouped by World Bank region."""

import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "data" / "schema" / "import_data.sql"
FLAGS = ROOT / "frontend" / "public" / "flags"

ISO3_TO_ISO2 = {
    "AFG": "af", "ARG": "ar", "AUS": "au", "BGD": "bd", "BRN": "bn", "BRA": "br",
    "BTN": "bt", "CAN": "ca", "CHE": "ch", "CHN": "cn", "DEU": "de", "ESP": "es",
    "FJI": "fj", "FRA": "fr", "GBR": "gb", "HKG": "hk", "IDN": "id", "IND": "in",
    "IRN": "ir", "ISR": "il", "ITA": "it", "JPN": "jp", "KHM": "kh", "KOR": "kr",
    "LKA": "lk", "MAC": "mo", "MDV": "mv", "MEX": "mx", "MMR": "mm", "MNG": "mn",
    "MYS": "my", "NLD": "nl", "NPL": "np", "PAK": "pk", "PHL": "ph", "PNG": "pg",
    "PYF": "pf", "RUS": "ru", "SAU": "sa", "SGP": "sg", "SUN": "su", "SWE": "se",
    "THA": "th", "TUR": "tr", "TWN": "tw", "USA": "us", "VNM": "vn",
}

DISPLAY = {
    "USA": "United States",
    "GBR": "United Kingdom",
    "KOR": "South Korea",
    "RUS": "Russia",
    "IRN": "Iran",
    "TUR": "Turkey",
    "NLD": "Netherlands",
    "CHE": "Switzerland",
    "IDN": "Indonesia",
    "SAU": "Saudi Arabia",
    "SWE": "Sweden",
    "ARG": "Argentina",
    "ISR": "Israel",
    "THA": "Thailand",
    "PAK": "Pakistan",
    "BGD": "Bangladesh",
    "VNM": "Vietnam",
    "MYS": "Malaysia",
    "SGP": "Singapore",
    "HKG": "Hong Kong",
    "MAC": "Macao",
    "TWN": "Taiwan",
    "SUN": "Soviet Union",
    "BRN": "Brunei",
    "PHL": "Philippines",
    "PNG": "Papua New Guinea",
    "PYF": "French Polynesia",
}

REGION_ORDER = [
    "East Asia & Pacific",
    "South Asia",
    "Europe & Central Asia",
    "Middle East & North Africa",
    "North America",
    "Latin America & Caribbean",
    "Sub-Saharan Africa",
]

available = {p.stem for p in FLAGS.glob("*.png")}
text = SQL.read_text(encoding="utf-8")
pattern = re.compile(
    r"\('[\d]+', '([A-Z]{3})', '((?:[^']|'')*)', '([^']*)',"
)
iso3_region: dict[str, str] = {}
iso3_name: dict[str, str] = {}
for m in pattern.finditer(text):
    code, name, region = m.group(1), m.group(2).replace("''", "'"), m.group(3)
    if region:
        iso3_region[code] = region
        iso3_name[code] = name

by_region: dict[str, list] = defaultdict(list)
for iso3, iso2 in ISO3_TO_ISO2.items():
    if iso2 not in available:
        continue
    region = iso3_region.get(iso3)
    if not region:
        continue
    by_region[region].append({
        "iso3": iso3,
        "iso2": iso2,
        "name": DISPLAY.get(iso3, iso3_name.get(iso3, iso3)),
        "flag": f"/flags/{iso2}.png",
    })

for items in by_region.values():
    items.sort(key=lambda x: x["name"])

for region in REGION_ORDER:
    items = by_region.get(region, [])
    print(f"\n{region} ({len(items)})")
    for item in items:
        print(f"  {item['iso2']:4} {item['name']}")
