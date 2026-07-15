/**
 * 地理欧洲国家（主权国家；图表竞速另含苏联合计 SUN）
 * 与 scripts/europe_countries.py 保持同步
 */
export const EUROPE_COUNTRY_CODES_LIST = [
  'ALB', 'AND', 'AUT', 'BEL', 'BGR', 'BIH', 'BLR', 'CHE',
  'CYP', 'CZE', 'DEU', 'DNK', 'ESP', 'EST', 'FIN', 'FRA',
  'GBR', 'GRC', 'HRV', 'HUN', 'IRL', 'ISL', 'ITA', 'LIE',
  'LTU', 'LUX', 'LVA', 'MCO', 'MDA', 'MKD', 'MLT', 'MNE',
  'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'RUS', 'SMR', 'SRB',
  'SVK', 'SVN', 'SWE', 'UKR', 'XKX'
]

/** 国家列表页排除：苏联历史实体 + 属地/离岸 */
export const EXCLUDED_EUROPE_COUNTRY_CODES = new Set([
  'SUN', 'CHI', 'FRO', 'GIB', 'IMN'
])

export const EUROPE_COUNTRY_CODES = new Set(EUROPE_COUNTRY_CODES_LIST)

/** Top15 竞速候选：主权国家 + 苏联 */
export const EUROPE_GDP_CODES = new Set([
  ...EUROPE_COUNTRY_CODES_LIST,
  'SUN'
])
