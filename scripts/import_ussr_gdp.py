#!/usr/bin/env python3
"""将苏联 GDP 历史数据写入 MySQL（wb_country + wb_gdp_value）。"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from snowflake import SnowflakeIdGenerator

DATA_PATH = ROOT / "data" / "ussr_gdp_usd.json"
INDICATOR_CODE = "NY.GDP.MKTP.CD"
COUNTRY_CODE = "SUN"
RUS_OVERLAP_END_YEAR = 1991


def parse_args():
    parser = argparse.ArgumentParser(description="Import Soviet Union GDP into MySQL")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="alohawang")
    parser.add_argument("--password", default="Aa112700")
    parser.add_argument("--database", default="aloha_datamap")
    parser.add_argument("--data", default=str(DATA_PATH))
    return parser.parse_args()


def load_payload(path: Path) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    values = {int(year): float(amount) for year, amount in payload["values"].items()}
    entity_code = payload.get("entity_code") or payload.get("country_code")
    entity_name = payload.get("entity_name") or payload.get("country_name")
    return {
        "entity_code": entity_code,
        "entity_name": entity_name,
        "indicator_code": payload.get("indicator_code", INDICATOR_CODE),
        "source": payload.get("source", ""),
        "values": values,
    }


def main() -> None:
    args = parse_args()
    payload = load_payload(Path(args.data))

    try:
        import pymysql
    except ImportError:
        raise SystemExit("请先安装: pip install pymysql")

    id_gen = SnowflakeIdGenerator(worker_id=1, datacenter_id=1)
    conn = pymysql.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        database=args.database,
        charset="utf8mb4",
    )

    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM wb_indicator WHERE indicator_code = %s",
                (payload["indicator_code"],),
            )
            row = cur.fetchone()
            if not row:
                raise SystemExit(f"指标不存在: {payload['indicator_code']}")
            indicator_id = row[0]

            cur.execute(
                "SELECT id FROM wb_country WHERE country_code = %s",
                (payload["entity_code"],),
            )
            row = cur.fetchone()
            if row:
                country_id = row[0]
                print(f"Entity {COUNTRY_CODE} already exists: {country_id}")
            else:
                country_id = id_gen.next_id()
                cur.execute(
                    """
                    INSERT INTO wb_country
                        (id, country_code, country_name, region, income_group, table_name)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        country_id,
                        payload["entity_code"],
                        payload["entity_name"],
                        "Europe & Central Asia",
                        "Upper middle income",
                        payload["entity_name"],
                    ),
                )
                print(f"Inserted entity {COUNTRY_CODE}: {country_id}")

            cur.execute(
                """
                DELETE g FROM wb_gdp_value g
                JOIN wb_country c ON c.id = g.country_id
                WHERE c.country_code = %s
                """,
                (payload["entity_code"],),
            )
            deleted_ussr = cur.rowcount

            cur.execute(
                """
                DELETE g FROM wb_gdp_value g
                JOIN wb_country c ON c.id = g.country_id
                WHERE c.country_code = 'RUS' AND g.gdp_year <= %s
                """,
                (RUS_OVERLAP_END_YEAR,),
            )
            deleted_rus = cur.rowcount

            inserted = 0
            for year, value_usd in sorted(payload["values"].items()):
                gdp_id = id_gen.next_id()
                cur.execute(
                    """
                    INSERT INTO wb_gdp_value
                        (id, country_id, indicator_id, gdp_year, value_usd)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (gdp_id, country_id, indicator_id, year, value_usd),
                )
                inserted += 1

        conn.commit()
        print(f"Removed old USSR GDP rows: {deleted_ussr}")
        print(f"Removed overlapping RUS rows (<= {RUS_OVERLAP_END_YEAR}): {deleted_rus}")
        print(f"Inserted USSR GDP rows: {inserted}")
        print(f"Years: {min(payload['values'])}-{max(payload['values'])}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
