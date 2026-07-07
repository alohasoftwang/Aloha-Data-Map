#!/usr/bin/env python3
"""从 world-bank.xls 生成 MySQL 数据导入 SQL（主键使用雪花算法）。"""

from __future__ import annotations

import sys
import xlrd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from snowflake import DeterministicSnowflakeIdGenerator

EXCEL_PATH = ROOT / "data" / "world-bank.xls"
FALLBACK_EXCEL = ROOT / "data" / "世界银行.xls"
SCHEMA_DIR = ROOT / "data" / "schema"

HEADER_ROW = 3
DATA_START_ROW = 4
BATCH_SIZE = 200


def sql_str(value: str | None) -> str:
    if value is None or value == "":
        return "NULL"
    escaped = (
        str(value)
        .replace("\\", "\\\\")
        .replace("'", "''")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
        .replace("\r", "\\n")
    )
    return f"'{escaped}'"


def sql_num_text(raw: str) -> str:
    """直接使用 Excel 单元格原文，与 Java DataFormatter 一致。"""
    if raw is None or raw == "":
        return "NULL"
    return raw


def cell_text(sheet, row, col) -> str:
    if row >= sheet.nrows or col >= sheet.ncols:
        return ""
    return str(sheet.cell_value(row, col)).strip()


def resolve_excel() -> Path:
    if EXCEL_PATH.exists():
        return EXCEL_PATH
    if FALLBACK_EXCEL.exists():
        return FALLBACK_EXCEL
    raise FileNotFoundError("找不到 world-bank.xls 或 世界银行.xls")


def parse_year(text: str):
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def sql_id(value: str) -> str:
    return sql_str(value)


def append_gdp_batch(
    lines: list[str],
    batch: list[tuple[str, str, str, int, str]],
) -> None:
    lines.append(
        "INSERT INTO wb_gdp_value (id, country_id, indicator_id, gdp_year, value_usd) VALUES"
    )
    rows = [
        f"  ({sql_id(gdp_id)}, {sql_id(country_id)}, {sql_id(indicator_id)}, {year}, {value})"
        for gdp_id, country_id, indicator_id, year, value in batch
    ]
    lines.append(",\n".join(rows) + ";")
    lines.append("")


def build_insert_lines(
    countries_sheet,
    indicators_sheet,
    data_sheet,
) -> tuple[list[str], int, int, int]:
    id_gen = DeterministicSnowflakeIdGenerator(worker_id=1, datacenter_id=1)
    lines: list[str] = [
        "-- 主键 id 为 VARCHAR 雪花 ID（worker=1, datacenter=1，约 18 位）",
        "",
    ]

    indicator_ids: dict[str, str] = {}
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 1. 指标数据 wb_indicator")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("")
    lines.append(
        "INSERT INTO wb_indicator (id, indicator_code, indicator_name, source_note, source_organization) VALUES"
    )
    indicator_count = 0
    indicator_rows = []
    for r in range(1, indicators_sheet.nrows):
        code = cell_text(indicators_sheet, r, 0)
        if not code:
            continue
        name = cell_text(indicators_sheet, r, 1)
        note = cell_text(indicators_sheet, r, 2)
        org = cell_text(indicators_sheet, r, 3)
        indicator_id = id_gen.next_id()
        indicator_ids[code] = indicator_id
        indicator_rows.append(
            f"  ({sql_id(indicator_id)}, {sql_str(code)}, {sql_str(name)}, "
            f"{sql_str(note) if note else 'NULL'}, {sql_str(org) if org else 'NULL'})"
        )
        indicator_count += 1
    lines.append(",\n".join(indicator_rows) + ";")
    lines.append("")

    country_meta: dict[str, dict] = {}
    for r in range(1, countries_sheet.nrows):
        code = cell_text(countries_sheet, r, 0)
        if not code:
            continue
        country_meta[code] = {
            "region": cell_text(countries_sheet, r, 1),
            "income_group": cell_text(countries_sheet, r, 2),
            "table_name": cell_text(countries_sheet, r, 4),
        }

    country_names: dict[str, str] = {}
    for r in range(DATA_START_ROW, data_sheet.nrows):
        name = cell_text(data_sheet, r, 0)
        code = cell_text(data_sheet, r, 1)
        if code and name:
            country_names[code] = name

    country_ids: dict[str, str] = {}
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 2. 国家数据 wb_country")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("")
    lines.append(
        "INSERT INTO wb_country (id, country_code, country_name, region, income_group, table_name) VALUES"
    )
    country_rows = []
    for code in sorted(country_names.keys()):
        country_id = id_gen.next_id()
        country_ids[code] = country_id
        meta = country_meta.get(code, {})
        name = country_names[code] or meta.get("table_name") or code
        region = meta.get("region", "")
        income = meta.get("income_group", "")
        table_name = meta.get("table_name", "")
        country_rows.append(
            f"  ({sql_id(country_id)}, {sql_str(code)}, {sql_str(name)}, "
            f"{sql_str(region) if region else 'NULL'}, "
            f"{sql_str(income) if income else 'NULL'}, "
            f"{sql_str(table_name) if table_name else 'NULL'})"
        )
    lines.append(",\n".join(country_rows) + ";")
    lines.append("")

    year_columns: list[tuple[int, int]] = []
    for c in range(4, data_sheet.ncols):
        year = parse_year(cell_text(data_sheet, HEADER_ROW, c))
        if year is not None:
            year_columns.append((c, year))

    gdp_rows: list[tuple[str, str, str, int, str]] = []
    for r in range(DATA_START_ROW, data_sheet.nrows):
        country_code = cell_text(data_sheet, r, 1)
        indicator_code = cell_text(data_sheet, r, 3)
        if not country_code or not indicator_code:
            continue
        country_id = country_ids.get(country_code)
        indicator_id = indicator_ids.get(indicator_code)
        if country_id is None or indicator_id is None:
            continue
        for col, year in year_columns:
            raw = cell_text(data_sheet, r, col)
            if raw == "":
                continue
            gdp_rows.append(
                (
                    id_gen.next_id(),
                    country_id,
                    indicator_id,
                    year,
                    sql_num_text(raw),
                )
            )

    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 3. GDP 数据 wb_gdp_value")
    lines.append(f"--    共 {len(gdp_rows)} 条记录")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("")

    for i in range(0, len(gdp_rows), BATCH_SIZE):
        append_gdp_batch(lines, gdp_rows[i : i + BATCH_SIZE])

    lines.extend([
        "-- -----------------------------------------------------------------------------",
        "-- 导入完成",
        "-- -----------------------------------------------------------------------------",
        f"-- 国家数：{len(country_names)}",
        f"-- 指标数：{indicator_count}",
        f"-- GDP 记录数：{len(gdp_rows)}",
        "-- =============================================================================",
    ])

    return lines, len(country_names), indicator_count, len(gdp_rows)


def write_sql(path: Path, header: list[str], body: list[str]) -> None:
    path.write_text("\n".join(header + body), encoding="utf-8")


def main() -> None:
    excel_path = resolve_excel()
    book = xlrd.open_workbook(str(excel_path))

    countries_sheet = book.sheet_by_name("Metadata - Countries")
    indicators_sheet = book.sheet_by_name("Metadata - Indicators")
    data_sheet = book.sheet_by_name("Data")

    body, country_count, indicator_count, gdp_count = build_insert_lines(
        countries_sheet, indicators_sheet, data_sheet
    )

    data_only_header = [
        "-- =============================================================================",
        "-- Aloha Data Map — 仅导入数据（表已建好时使用，主键为雪花 ID）",
        "-- =============================================================================",
        "--",
        f"-- 数据来源：{excel_path.name}",
        "--",
        "-- 执行方式：",
        "--   mysql -u root -p aloha_datamap < data/schema/import_data_only.sql",
        "--",
        "-- 说明：开头会先清空三张表再导入，可重复执行",
        "-- =============================================================================",
        "",
        "USE aloha_datamap;",
        "",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "",
        "TRUNCATE TABLE wb_gdp_value;",
        "TRUNCATE TABLE wb_country;",
        "TRUNCATE TABLE wb_indicator;",
        "",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "",
    ]

    full_header = [
        "-- =============================================================================",
        "-- Aloha Data Map — 清空后重新导入（含 TRUNCATE，主键为雪花 ID）",
        "-- =============================================================================",
        "--",
        f"-- 数据来源：{excel_path.name}",
        "--",
        "-- 执行顺序：",
        "--   1) init_mysql.sql      建库建表",
        "--   2) import_data.sql       清空并导入",
        "--",
        "-- 执行方式：",
        "--   mysql -u root -p < data/schema/import_data.sql",
        "--",
        "-- =============================================================================",
        "",
        "USE aloha_datamap;",
        "",
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "",
        "TRUNCATE TABLE wb_gdp_value;",
        "TRUNCATE TABLE wb_country;",
        "TRUNCATE TABLE wb_indicator;",
        "",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "",
    ]

    data_only_path = SCHEMA_DIR / "import_data_only.sql"
    full_path = SCHEMA_DIR / "import_data.sql"

    write_sql(data_only_path, data_only_header, body)
    write_sql(full_path, full_header, body)

    print(f"Generated: {data_only_path}")
    print(f"Generated: {full_path}")
    print(f"Countries: {country_count}, Indicators: {indicator_count}, GDP rows: {gdp_count}")


if __name__ == "__main__":
    main()
