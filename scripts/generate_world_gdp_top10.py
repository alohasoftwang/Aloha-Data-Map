#!/usr/bin/env python3
"""从 MySQL 生成 World GDP TOP 15 图表 JSON（1960 年起）。"""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "world-gdp-top10.json"
PUBLIC_OUTPUT_PATH = ROOT / "frontend" / "public" / "data" / "world-gdp-top10.json"

START_YEAR = 1960
MAX_BARS = 15
INDICATOR_CODE = "NY.GDP.MKTP.CD"

# ISO3 -> ISO2（国旗文件名）
ISO3_TO_ISO2: dict[str, str] = {
    "ABW": "aw", "AFG": "af", "AGO": "ao", "ALB": "al", "AND": "ad", "ARE": "ae",
    "ARG": "ar", "ARM": "am", "ASM": "as", "ATG": "ag", "AUS": "au", "AUT": "at",
    "AZE": "az", "BDI": "bi", "BEL": "be", "BEN": "bj", "BFA": "bf", "BGD": "bd",
    "BGR": "bg", "BHR": "bh", "BHS": "bs", "BIH": "ba", "BLR": "by", "BLZ": "bz",
    "BOL": "bo", "BRA": "br", "BRB": "bb", "BRN": "bn", "BTN": "bt", "BWA": "bw",
    "CAF": "cf", "CAN": "ca", "CHE": "ch", "CHL": "cl", "CHN": "cn", "CIV": "ci",
    "CMR": "cm", "COD": "cd", "COG": "cg", "COL": "co", "COM": "km", "CPV": "cv",
    "CRI": "cr", "CUB": "cu", "CYP": "cy", "CZE": "cz", "DEU": "de", "DJI": "dj",
    "DMA": "dm", "DNK": "dk", "DOM": "do", "DZA": "dz", "ECU": "ec", "EGY": "eg",
    "ERI": "er", "ESP": "es", "EST": "ee", "ETH": "et", "FIN": "fi", "FJI": "fj",
    "FRA": "fr", "FSM": "fm", "GAB": "ga", "GBR": "gb", "GEO": "ge", "GHA": "gh",
    "GIN": "gn", "GMB": "gm", "GNB": "gw", "GNQ": "gq", "GRC": "gr", "GRD": "gd",
    "GTM": "gt", "GUY": "gy", "HKG": "hk", "HND": "hn", "HRV": "hr", "HTI": "ht", "HUN": "hu",
    "IDN": "id", "IND": "in", "IRL": "ie", "IRN": "ir", "IRQ": "iq", "ISL": "is",
    "ISR": "il", "ITA": "it", "JAM": "jm", "JOR": "jo", "JPN": "jp", "KAZ": "kz",
    "KEN": "ke", "KGZ": "kg", "KHM": "kh", "KIR": "ki", "KNA": "kn", "KOR": "kr",
    "KWT": "kw", "LAO": "la", "LBN": "lb", "LBR": "lr", "LBY": "ly", "LCA": "lc",
    "LKA": "lk", "LSO": "ls", "LTU": "lt", "LUX": "lu", "LVA": "lv", "MAC": "mo", "MAR": "ma",
    "MDA": "md", "MDG": "mg", "MDV": "mv", "MEX": "mx", "MHL": "mh", "MKD": "mk",
    "MLI": "ml", "MLT": "mt", "MMR": "mm", "MNE": "me", "MNG": "mn", "MOZ": "mz",
    "MRT": "mr", "MUS": "mu", "MWI": "mw", "MYS": "my", "NAM": "na", "NER": "ne",
    "NGA": "ng", "NIC": "ni", "NLD": "nl", "NOR": "no", "NPL": "np", "NRU": "nr",
    "NZL": "nz", "OMN": "om", "PAK": "pk", "PAN": "pa", "PER": "pe", "PHL": "ph",
    "PNG": "pg", "POL": "pl", "PRI": "pr", "PRT": "pt", "PRK": "kp", "PRY": "py", "PSE": "ps", "PYF": "pf",
    "QAT": "qa", "ROU": "ro", "RUS": "ru", "RWA": "rw", "SAU": "sa", "SDN": "sd",
    "SEN": "sn", "SGP": "sg", "SLB": "sb", "SLE": "sl", "SLV": "sv", "SMR": "sm",
    "SOM": "so", "SRB": "rs", "SSD": "ss", "STP": "st", "SUR": "sr", "SVK": "sk",
    "SVN": "si", "SWE": "se", "SWZ": "sz", "SYC": "sc", "SYR": "sy", "TCD": "td",
    "TGO": "tg", "THA": "th", "TJK": "tj", "TKM": "tm", "TLS": "tl", "TON": "to",
    "TTO": "tt", "TUN": "tn", "TUR": "tr", "TUV": "tv", "TWN": "tw", "TZA": "tz", "UGA": "ug",
    "UKR": "ua", "URY": "uy", "USA": "us", "UZB": "uz", "VCT": "vc", "VEN": "ve",
    "VNM": "vn", "VUT": "vu", "WSM": "ws", "XKX": "xk", "YEM": "ye", "ZAF": "za",
    "ZMB": "zm", "ZWE": "zw", "SUN": "su",
}

# 显示名覆盖（与前端 mock 一致）
DISPLAY_NAME_OVERRIDES: dict[str, str] = {
    "USA": "UNITED STATES",
    "GBR": "UNITED KINGDOM",
    "KOR": "SOUTH KOREA",
    "PRK": "NORTH KOREA",
    "RUS": "RUSSIA",
    "IRN": "IRAN",
    "VEN": "VENEZUELA",
    "TUR": "TURKIYE",
    "NLD": "NETHERLANDS",
    "CHE": "SWITZERLAND",
    "IDN": "INDONESIA",
    "SAU": "SAUDI ARABIA",
    "POL": "POLAND",
    "SWE": "SWEDEN",
    "BEL": "BELGIUM",
    "ARG": "ARGENTINA",
    "AUT": "AUSTRIA",
    "NOR": "NORWAY",
    "ISR": "ISRAEL",
    "ARE": "UNITED ARAB EMIRATES",
    "THA": "THAILAND",
    "NGA": "NIGERIA",
    "EGY": "EGYPT",
    "PHL": "PHILIPPINES",
    "PAK": "PAKISTAN",
    "BGD": "BANGLADESH",
    "VNM": "VIETNAM",
    "MYS": "MALAYSIA",
    "SGP": "SINGAPORE",
    "HKG": "HONG KONG (※)",
    "MAC": "MACAO (※)",
    "TWN": "TAIWAN (※)",
    "SUN": "SOVIET UNION",
}

# 柱条颜色（优先使用 mock 配色，其余自动分配）
COUNTRY_COLORS: dict[str, str] = {
    "UNITED STATES": "#5b9fd4",
    "CHINA": "#e85d6a",
    "JAPAN": "#c77dba",
    "GERMANY": "#7aabde",
    "INDIA": "#f0a070",
    "UNITED KINGDOM": "#6888d8",
    "FRANCE": "#6ed4c8",
    "ITALY": "#8ed482",
    "BRAZIL": "#7ec87a",
    "CANADA": "#d48ec4",
    "RUSSIA": "#e89868",
    "SOUTH KOREA": "#5ec9d8",
    "AUSTRALIA": "#f0d060",
    "MEXICO": "#62c4de",
    "SPAIN": "#e8c868",
    "SOVIET UNION": "#cc2b2b",
    "INDONESIA": "#d4a574",
    "NETHERLANDS": "#f08080",
    "SAUDI ARABIA": "#98d8a0",
    "TURKIYE": "#c9a0dc",
    "SWITZERLAND": "#ffb347",
}

FALLBACK_COLORS = [
    "#5b9fd4", "#e85d6a", "#c77dba", "#7aabde", "#f0a070", "#6888d8",
    "#6ed4c8", "#8ed482", "#7ec87a", "#d48ec4", "#e89868", "#5ec9d8",
    "#f0d060", "#62c4de", "#e8c868", "#d4a574", "#f08080", "#98d8a0",
]


def display_name(country_code: str, country_name: str) -> str:
    if country_code in DISPLAY_NAME_OVERRIDES:
        return DISPLAY_NAME_OVERRIDES[country_code]
    return re.sub(r"\s+", " ", country_name).strip().upper()


def pick_color(name: str, index: int) -> str:
    if name in COUNTRY_COLORS:
        return COUNTRY_COLORS[name]
    return FALLBACK_COLORS[index % len(FALLBACK_COLORS)]


def parse_args():
    parser = argparse.ArgumentParser(description="Generate world-gdp-top10.json from MySQL")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="alohawang")
    parser.add_argument("--password", default="Aa112700")
    parser.add_argument("--database", default="aloha_datamap")
    parser.add_argument("--start-year", type=int, default=START_YEAR)
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    return parser.parse_args()


def fetch_rows(cursor, start_year: int):
    sql = """
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
          AND c.region IS NOT NULL
        ORDER BY g.gdp_year, g.value_usd DESC
    """
    cursor.execute(sql, (INDICATOR_CODE, start_year))
    return cursor.fetchall()


def build_chart(rows: list[tuple], start_year: int) -> dict:
    # country_code -> { year -> value_usd }
    by_country: dict[str, dict] = {}
    for country_code, country_name, year, value_usd in rows:
        info = by_country.setdefault(
            country_code,
            {"name": display_name(country_code, country_name), "years": {}},
        )
        info["years"][int(year)] = float(value_usd)

    if not by_country:
        raise ValueError("No GDP data found in database")

    all_years = sorted(
        {year for info in by_country.values() for year in info["years"]}
    )
    end_year = all_years[-1]
    years = list(range(max(start_year, all_years[0]), end_year + 1))

    # 曾进入全球 TOP 15 的国家
    top_country_codes: set[str] = set()
    for year in years:
        ranked = sorted(
            (
                (code, info["years"].get(year))
                for code, info in by_country.items()
                if info["years"].get(year) is not None
                and not (code == "RUS" and year <= 1991 and "SUN" in by_country)
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
            if code == "RUS" and year <= 1991 and "SUN" in by_country:
                continue
            million_usd = round(value / 1_000_000)
            dataset.append([million_usd, name, year])

    return {
        "id": "world-gdp-top15",
        "title": "TOP 15 WORLD GDP",
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
            "entityCount": len(selected),
            "rowCount": len(dataset) - 1,
            "note": "Entities that appeared in global GDP top 15 at least once",
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
