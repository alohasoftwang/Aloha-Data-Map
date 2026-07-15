function resolveEntityMeta(chartData) {
  return {
    entityColors: chartData.entityColors ?? chartData.countryColors ?? {},
    entityCodes: chartData.entityCodes ?? chartData.countryCodes ?? {},
    entityFlagImages: chartData.entityFlagImages ?? chartData.countryFlagImages ?? {},
    years: chartData.years ?? [],
    startYear: chartData.startYear,
    endYear: chartData.endYear,
    updateFrequency: chartData.updateFrequency ?? 2250
  }
}

/** dataset -> Map<entityName, Array<{ year, gdp }>> */
export function indexDatasetByEntity(dataset) {
  const byEntity = new Map()
  if (!dataset?.length) {
    return byEntity
  }

  const [, ...rows] = dataset
  for (const row of rows) {
    const [gdp, entity, year] = row
    if (!byEntity.has(entity)) {
      byEntity.set(entity, [])
    }
    byEntity.get(entity).push({ year: Number(year), gdp: Number(gdp) })
  }

  for (const points of byEntity.values()) {
    points.sort((a, b) => a.year - b.year)
  }

  return byEntity
}

/**
 * 对尚未有数据的年份用 0 补齐到 startYear，
 * 让后加入的国家从一开始就能显示国旗/折线端点。
 */
export function padEntitySeriesFromStart(indexed, entities, startYear) {
  if (startYear == null || !entities?.length) {
    return indexed
  }

  for (const name of entities) {
    const points = indexed.get(name) ?? []
    if (!points.length) {
      indexed.set(name, [{ year: startYear, gdp: 0 }])
      continue
    }

    const firstYear = points[0].year
    if (firstYear <= startYear) {
      continue
    }

    const padded = []
    for (let year = startYear; year < firstYear; year += 1) {
      padded.push({ year, gdp: 0 })
    }
    indexed.set(name, [...padded, ...points])
  }

  return indexed
}

export function listEntities(chartData) {
  const indexed = indexDatasetByEntity(chartData?.dataset)
  const { entityColors } = resolveEntityMeta(chartData)
  const endYear = chartData?.endYear

  return [...indexed.keys()].sort((a, b) => {
    const gdpA = indexed.get(a)?.find((p) => p.year === endYear)?.gdp ?? 0
    const gdpB = indexed.get(b)?.find((p) => p.year === endYear)?.gdp ?? 0
    return gdpB - gdpA
  }).map((name) => ({
    name,
    color: entityColors[name] ?? '#5470c6'
  }))
}

export function sliceEntitySeries(indexed, entityName, endYear) {
  const points = indexed.get(entityName) ?? []
  return points
    .filter((p) => p.year <= endYear)
    .map((p) => [p.year, p.gdp])
}

/** 在 fromYear -> toYear 之间按 progress(0-1) 插值，让曲线逐帧延伸 */
export function sliceEntitySeriesProgress(
  indexed,
  entityName,
  fromYear,
  toYear,
  progress
) {
  const points = indexed.get(entityName) ?? []
  const p0 = points.find((p) => p.year === fromYear)
  const p1 = points.find((p) => p.year === toYear)
  const base = points
    .filter((p) => p.year < fromYear)
    .map((p) => [p.year, p.gdp])

  if (!p0) {
    return base
  }

  const t = Math.min(1, Math.max(0, progress))

  if (!p1 || t <= 0) {
    return [...base, [p0.year, p0.gdp]]
  }

  if (t >= 1) {
    return [...base, [p0.year, p0.gdp], [p1.year, p1.gdp]]
  }

  const tipYear = p0.year + t * (p1.year - p0.year)
  const tipGdp = p0.gdp + t * (p1.gdp - p0.gdp)
  return [...base, [p0.year, p0.gdp], [tipYear, tipGdp]]
}

export function interpolateDisplayYear(fromYear, toYear, progress) {
  return Math.round(fromYear + progress * (toYear - fromYear))
}

export function getEntityMeta(chartData, entityName) {
  const meta = resolveEntityMeta(chartData)
  return {
    color: meta.entityColors[entityName] ?? '#5470c6',
    code: meta.entityCodes[entityName] ?? '',
    flag: meta.entityFlagImages[entityName] ?? ''
  }
}

export { resolveEntityMeta }
