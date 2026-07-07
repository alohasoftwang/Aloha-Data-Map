#!/usr/bin/env python3
import pymysql

conn = pymysql.connect(
    host="localhost",
    user="alohawang",
    password="Aa112700",
    database="aloha_datamap",
    charset="utf8mb4",
)
cur = conn.cursor()

codes = ["CHN", "HKG", "MAC", "TWN"]
print("=== Country coverage (NY.GDP.MKTP.CD) ===")
for code in codes:
    cur.execute(
        """
        SELECT c.country_code, c.country_name, COUNT(g.id), MIN(g.gdp_year), MAX(g.gdp_year)
        FROM wb_country c
        LEFT JOIN wb_gdp_value g ON g.country_id = c.id
        LEFT JOIN wb_indicator i ON i.id = g.indicator_id AND i.indicator_code = 'NY.GDP.MKTP.CD'
        WHERE c.country_code = %s
        GROUP BY c.country_code, c.country_name
        """,
        (code,),
    )
    print(cur.fetchone())

print("\n=== 2024 GDP (million USD) ===")
cur.execute(
    """
    SELECT c.country_code, c.country_name, ROUND(g.value_usd/1e6) AS gdp_m
    FROM wb_gdp_value g
    JOIN wb_country c ON c.id = g.country_id
    JOIN wb_indicator i ON i.id = g.indicator_id
    WHERE i.indicator_code = 'NY.GDP.MKTP.CD' AND g.gdp_year = 2024
      AND c.country_code IN ('CHN','HKG','MAC','TWN')
    ORDER BY c.country_code
    """
)
for row in cur.fetchall():
    print(row)

cur.execute(
    "SELECT country_code, country_name FROM wb_country WHERE country_name LIKE %s",
    ("%Taiwan%",),
)
print("\n=== Taiwan in wb_country ===", cur.fetchall())

conn.close()
