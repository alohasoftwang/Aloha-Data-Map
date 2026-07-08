export const CHINA_G7_ENTITIES = [
  'CHINA',
  'CANADA',
  'FRANCE',
  'GERMANY',
  'ITALY',
  'JAPAN',
  'UNITED KINGDOM',
  'UNITED STATES'
]

function pickEntityMeta(meta, entitySet) {
  return Object.fromEntries(
    Object.entries(meta ?? {}).filter(([name]) => entitySet.has(name))
  )
}

/** 从完整 bar-race JSON 中筛出固定实体列表 */
export function filterBarRaceChartData(
  chartData,
  entities,
  { title, maxBars } = {}
) {
  const entitySet = new Set(entities)
  const [header, ...rows] = chartData.dataset

  return {
    ...chartData,
    id: chartData.id ? `${chartData.id}-filtered` : undefined,
    title: title ?? chartData.title,
    maxBars: maxBars ?? entities.length,
    entityColors: pickEntityMeta(
      chartData.entityColors ?? chartData.countryColors,
      entitySet
    ),
    entityCodes: pickEntityMeta(
      chartData.entityCodes ?? chartData.countryCodes,
      entitySet
    ),
    entityFlagImages: pickEntityMeta(
      chartData.entityFlagImages ?? chartData.countryFlagImages,
      entitySet
    ),
    dataset: [header, ...rows.filter((row) => entitySet.has(row[1]))]
  }
}
