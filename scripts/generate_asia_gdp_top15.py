#!/usr/bin/env python3
"""从 MySQL 生成 Asia GDP TOP 15 图表 JSON（1960 年起，地理亚洲口径）。"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from asia_countries import ASIA_COUNTRY_CODES, ASIA_SUBREGIONS  # noqa: E402
from generate_world_gdp_top10 import (  # noqa: E402
    ISO3_TO_ISO2,
    INDICATOR_CODE,
    display_name,
    pick_color,
)

OUTPUT_PATH = ROOT / "data" / "asia-gdp-top15.json"
PUBLIC_OUTPUT_PATH = ROOT / "frontend" / "public" / "data" / "asia-gdp-top15.json"

START_YEAR = 1960
MAX_BARS = 15


def parse_args():
    parser = argparse.ArgumentParser(description="Generate asia-gdp-top15.json from MySQL")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="alohawang")
    parser.add_argument("--password", default="Aa112700")
    parser.add_argument("--database", default="aloha_datamap")
    parser.add_argument("--start-year", type=int, default=START_YEAR)
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    return parser.parse_args()


def fetch_rows(cursor, start_year: int):
    allowed = sorted(ASIA_COUNTRY_CODES)
    placeholders = ", ".join(["%s"] * len(allowed))
    sql = f"""
        SELECT
            c.country_code,
            c.country_name,
            g.gdp_year,
            g.value_usd
        FROM wb_gdp_value g
        JOIN wb_country c ON c.id = g.country_id
        JOIN wb_indicator i ON i.id = g.indicator_id
        WHERE i.indicator_code = %s
          AND g.gdp_year >= %s
          AND g.value_usd IS NOT NULL
          AND c.income_group IS NOT NULL
          AND c.country_code IN ({placeholders})
        ORDER BY g.gdp_year, g.value_usd DESC
    """
    params = (INDICATOR_CODE, start_year, *allowed)
    cursor.execute(sql, params)
    return cursor.fetchall()


def build_chart(rows: list[tuple], start_year: int) -> dict:
    by_country: dict[str, dict] = {}
    for country_code, country_name, year, value_usd in rows:
        info = by_country.setdefault(
            country_code,
            {"name": display_name(country_code, country_name), "years": {}},
        )
        info["years"][int(year)] = float(value_usd)

    if not by_country:
        raise ValueError("No Asia GDP data found in database")

    all_years = sorted(
        {year for info in by_country.values() for year in info["years"]}
    )
    end_year = all_years[-1]
    years = list(range(max(start_year, all_years[0]), end_year + 1))

    top_country_codes: set[str] = set()
    for year in years:
        ranked = sorted(
            (
                (code, info["years"].get(year))
                for code, info in by_country.items()
                if info["years"].get(year) is not None
            ),
            key=lambda item: item[1],
            reverse=True,
        )
        for code, _ in ranked[:MAX_BARS]:
            top_country_codes.add(code)

    selected = sorted(
        top_country_codes,
        key=lambda code: by_country[code]["years"].get(end_year, 0),
        reverse=True,
    )

    dataset: list = [["GDP", "Entity", "Year"]]
    entity_colors: dict[str, str] = {}
    entity_codes: dict[str, str] = {}
    entity_flag_images: dict[str, str] = {}

    for idx, code in enumerate(selected):
        name = by_country[code]["name"]
        iso2 = ISO3_TO_ISO2.get(code, code.lower()[:2])
        entity_colors[name] = pick_color(name, idx)
        entity_codes[name] = iso2
        entity_flag_images[name] = f"/flags/{iso2}.png"

        for year in years:
            value = by_country[code]["years"].get(year)
            if value is None:
                continue
            million_usd = round(value / 1_000_000)
            dataset.append([million_usd, name, year])

    return {
        "id": "asia-gdp-top15",
        "title": "TOP 15 ASIA GDP",
        "unit": "(IN MILLION $)",
        "chartType": "bar-race",
        "updateFrequency": 2250,
        "maxBars": MAX_BARS,
        "startYear": years[0],
        "endYear": end_year,
        "years": years,
        "entityColors": entity_colors,
        "entityCodes": entity_codes,
        "entityFlagImages": entity_flag_images,
        "dataset": dataset,
        "_meta": {
            "source": "mysql:aloha_datamap",
            "indicator": INDICATOR_CODE,
            "scope": "geographic_asia",
            "subregions": {k: list(v) for k, v in ASIA_SUBREGIONS.items()},
            "countryCount": len(ASIA_COUNTRY_CODES),
            "entityCount": len(selected),
            "rowCount": len(dataset) - 1,
            "note": "Top 15 by GDP among geographic Asia (East/SE/South/West/Central), excl. HK/MO/TW",
        },
    }


def main() -> None:
    args = parse_args()
    try:
        import pymysql
    except ImportError:
        raise SystemExit("请先安装: pip install pymysql")

    conn = pymysql.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        database=args.database,
        charset="utf8mb4",
    )
    try:
        with conn.cursor() as cursor:
            rows = fetch_rows(cursor, args.start_year)
    finally:
        conn.close()

    chart = build_chart(rows, args.start_year)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(chart, ensure_ascii=False, indent=2)
    output.write_text(content, encoding="utf-8")

    PUBLIC_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT_PATH.write_text(content, encoding="utf-8")

    meta = chart["_meta"]
    print(f"Generated: {output}")
    print(f"Generated: {PUBLIC_OUTPUT_PATH}")
    print(f"Years: {chart['startYear']}-{chart['endYear']}")
    print(f"Entities: {meta['entityCount']}, Rows: {meta['rowCount']}")
    print("Entities:", ", ".join(chart["entityCodes"].keys()))


if __name__ == "__main__":
    main()
