#!/usr/bin/env python3
"""校验 import_data_only.sql 与 Excel 源数据是否一致。"""

from __future__ import annotations

import re
import xlrd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = ROOT / "data" / "world-bank.xls"
FALLBACK_EXCEL = ROOT / "data" / "世界银行.xls"
SQL_PATH = ROOT / "data" / "schema" / "import_data_only.sql"

HEADER_ROW = 3
DATA_START_ROW = 4


def resolve_excel() -> Path:
    if EXCEL_PATH.exists():
        return EXCEL_PATH
    if FALLBACK_EXCEL.exists():
        return FALLBACK_EXCEL
    raise FileNotFoundError("找不到 Excel 文件")


def cell_text(sheet, row, col) -> str:
    if row >= sheet.nrows or col >= sheet.ncols:
        return ""
    return str(sheet.cell_value(row, col)).strip()


def parse_year(text: str):
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def read_excel_gdp() -> dict[tuple[str, str, int], float]:
    book = xlrd.open_workbook(str(resolve_excel()))
    sheet = book.sheet_by_name("Data")

    year_columns: list[tuple[int, int]] = []
    for c in range(4, sheet.ncols):
        year = parse_year(cell_text(sheet, HEADER_ROW, c))
        if year is not None:
            year_columns.append((c, year))

    data: dict[tuple[str, str, int], float] = {}
    for r in range(DATA_START_ROW, sheet.nrows):
        country_code = cell_text(sheet, r, 1)
        indicator_code = cell_text(sheet, r, 3)
        if not country_code or not indicator_code:
            continue
        for col, year in year_columns:
            raw = cell_text(sheet, r, col)
            if raw == "":
                continue
            data[(country_code, indicator_code, year)] = float(raw)
    return data


def read_sql_gdp() -> dict[tuple[str, str, int], float]:
    text = SQL_PATH.read_text(encoding="utf-8")

    country_id_to_code = {
        country_id: code
        for country_id, code in re.findall(
            r"\('(\d+)',\s*'([A-Z]{3})',", text.split("-- 3. GDP")[0]
        )
    }
    indicator_id_to_code = {
        indicator_id: code
        for indicator_id, code in re.findall(
            r"\('(\d+)',\s*'([A-Z][A-Z0-9.]+)',", text.split("-- 2. 国家")[0]
        )
    }

    gdp_pattern = re.compile(
        r"\(\s*'(\d+)'\s*,\s*'(\d+)'\s*,\s*'(\d+)'\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)"
    )
    data: dict[tuple[str, str, int], float] = {}
    for _, country_id, indicator_id, year, value in gdp_pattern.findall(
        text.split("-- 3. GDP")[1]
    ):
        country_code = country_id_to_code.get(country_id)
        indicator_code = indicator_id_to_code.get(indicator_id)
        if not country_code or not indicator_code:
            continue
        data[(country_code, indicator_code, int(year))] = float(value)
    return data


def main() -> None:
    excel = read_excel_gdp()
    sql = read_sql_gdp()

    print("=== record count ===")
    print(f"Excel GDP rows: {len(excel)}")
    print(f"SQL   GDP rows: {len(sql)}")

    only_excel = set(excel) - set(sql)
    only_sql = set(sql) - set(excel)
    print(f"only in Excel: {len(only_excel)}")
    print(f"only in SQL:   {len(only_sql)}")

    mismatches = []
    for key in sorted(set(excel) & set(sql)):
        ev = excel[key]
        sv = sql[key]
        if abs(ev - sv) > max(1e-4, abs(ev) * 1e-12):
            mismatches.append((key, ev, sv, ev - sv))

    print(f"value mismatches: {len(mismatches)}")

    samples = [
        ("CHN", "NY.GDP.MKTP.CD", 1985),
        ("CHN", "NY.GDP.MKTP.CD", 2024),
        ("USA", "NY.GDP.MKTP.CD", 2024),
    ]
    print("\n=== sample values (USD) ===")
    for key in samples:
        ev = excel.get(key)
        sv = sql.get(key)
        ok = ev is not None and sv is not None and abs(ev - sv) <= max(1e-4, abs(ev) * 1e-12)
        print(f"  {key[0]} {key[2]}: OK={ok}")

    text = SQL_PATH.read_text(encoding="utf-8")
    sample_id = re.search(r"\('(\d{15,})',\s*'CHN'", text)
    if sample_id:
        print(f"\nCHN snowflake id length: {len(sample_id.group(1))} ({sample_id.group(1)})")

    if not only_excel and not only_sql and not mismatches:
        print("\nPASS: SQL matches Excel exactly")
    else:
        print("\nFAIL: see differences above")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
