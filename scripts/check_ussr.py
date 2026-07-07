import pymysql

conn = pymysql.connect(
    host="localhost", user="alohawang", password="Aa112700",
    database="aloha_datamap", charset="utf8mb4",
)
cur = conn.cursor()
cur.execute(
    "SELECT country_code, country_name FROM wb_country "
    "WHERE country_name LIKE %s OR country_code IN ('SUN', 'RUS', 'SU')",
    ("%Soviet%",),
)
print("Soviet/Russia countries:", cur.fetchall())

cur.execute(
    """
    SELECT g.gdp_year, g.value_usd FROM wb_gdp_value g
    JOIN wb_country c ON c.id = g.country_id
    WHERE c.country_code = 'RUS' AND g.gdp_year BETWEEN 1985 AND 1995
    ORDER BY g.gdp_year
    """
)
print("RUS 1985-1995:", cur.fetchall())

cur.execute(
    """
    SELECT MIN(g.gdp_year), MAX(g.gdp_year), COUNT(*)
    FROM wb_gdp_value g JOIN wb_country c ON c.id = g.country_id
    WHERE c.country_code = 'RUS'
    """
)
print("RUS year range:", cur.fetchone())
conn.close()
