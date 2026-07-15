/**
 * 地理南美洲国家
 * 与 scripts/south_america_countries.py 保持同步
 */
export const SOUTH_AMERICA_COUNTRY_CODES_LIST = [
  'ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU',
  'GUY', 'PER', 'PRY', 'SUR', 'URY', 'VEN'
]

export const SOUTH_AMERICA_COUNTRY_CODES = new Set(SOUTH_AMERICA_COUNTRY_CODES_LIST)

/** Top 竞速候选（南美主权国共 12 个） */
export const SOUTH_AMERICA_GDP_CODES = new Set(SOUTH_AMERICA_COUNTRY_CODES_LIST)
