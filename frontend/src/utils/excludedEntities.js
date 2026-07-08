/** 系统内不展示的实体（避免政治敏感） */
export const EXCLUDED_ENTITY_NAMES = new Set([
  'HONG KONG (※)',
  'MACAO (※)',
  'TAIWAN (※)',
  'HONG KONG',
  'MACAO',
  'TAIWAN'
])

export const EXCLUDED_ISO2_CODES = new Set(['hk', 'mo', 'tw'])

export const EXCLUDED_COUNTRY_CODES = new Set(['HKG', 'MAC', 'TWN'])

function pickEntityMeta(meta, allowedNames) {
  return Object.fromEntries(
    Object.entries(meta ?? {}).filter(([name]) => allowedNames.has(name))
  )
}

function collectExcludedNames(chartData) {
  const excluded = new Set()
  const entityCodes = chartData.entityCodes ?? chartData.countryCodes ?? {}

  for (const [name, code] of Object.entries(entityCodes)) {
    if (EXCLUDED_ENTITY_NAMES.has(name) || EXCLUDED_ISO2_CODES.has(code)) {
      excluded.add(name)
    }
  }

  return excluded
}

/** 从图表 JSON 中移除被排除的实体 */
export function filterExcludedChartEntities(chartData) {
  if (!chartData?.dataset?.length) {
    return chartData
  }

  const excluded = collectExcludedNames(chartData)
  if (!excluded.size) {
    return chartData
  }

  const allowed = new Set(
    Object.keys(chartData.entityCodes ?? chartData.countryCodes ?? {}).filter(
      (name) => !excluded.has(name)
    )
  )

  const [header, ...rows] = chartData.dataset

  return {
    ...chartData,
    entityColors: pickEntityMeta(
      chartData.entityColors ?? chartData.countryColors,
      allowed
    ),
    entityCodes: pickEntityMeta(
      chartData.entityCodes ?? chartData.countryCodes,
      allowed
    ),
    entityFlagImages: pickEntityMeta(
      chartData.entityFlagImages ?? chartData.countryFlagImages,
      allowed
    ),
    dataset: [header, ...rows.filter((row) => allowed.has(row[1]))]
  }
}

export function isExcludedIso2(code) {
  return EXCLUDED_ISO2_CODES.has(code)
}
