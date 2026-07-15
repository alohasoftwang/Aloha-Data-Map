/**
 * 地理亚洲国家（与世行 region 无关）
 * 与 scripts/asia_countries.py 保持同步
 */
export const ASIA_SUBREGIONS = {
  'East Asia': ['CHN', 'JPN', 'KOR', 'PRK', 'MNG'],
  'Southeast Asia': [
    'IDN', 'THA', 'MYS', 'SGP', 'VNM', 'PHL', 'MMR', 'KHM', 'LAO', 'BRN', 'TLS'
  ],
  'South Asia': [
    'IND', 'PAK', 'BGD', 'LKA', 'NPL', 'BTN', 'MDV', 'AFG'
  ],
  'West Asia': [
    'SAU', 'ARE', 'QAT', 'KWT', 'OMN', 'BHR', 'ISR', 'JOR', 'LBN', 'IRQ', 'IRN',
    'SYR', 'YEM', 'TUR', 'CYP'
  ],
  'Central Asia': ['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK']
}

export const EXCLUDED_ASIA_COUNTRY_CODES = new Set(['HKG', 'MAC', 'TWN'])

export const SOUTHEAST_ASIA_COUNTRY_CODES = ASIA_SUBREGIONS['Southeast Asia']

export const SOUTH_ASIA_COUNTRY_CODES = ASIA_SUBREGIONS['South Asia']

/** 中东（与西亚列表一致） */
export const MIDDLE_EAST_COUNTRY_CODES = ASIA_SUBREGIONS['West Asia']

export const ASIA_COUNTRY_CODES = new Set(
  Object.values(ASIA_SUBREGIONS)
    .flat()
    .filter((code) => !EXCLUDED_ASIA_COUNTRY_CODES.has(code))
)
