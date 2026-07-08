import { getEntityMeta, indexDatasetByEntity } from './gdpDualCurveData.js'

/** 指定年份按 GDP 降序取前 N 名 */
export function getTopEntitiesByYear(chartData, year, topN = 10) {
  const indexed = indexDatasetByEntity(chartData?.dataset)
  const rows = []

  for (const [name, points] of indexed) {
    const point = points.find((p) => p.year === year)
    if (!point) {
      continue
    }
    const meta = getEntityMeta(chartData, name)
    rows.push({
      name,
      gdp: point.gdp,
      color: meta.color,
      code: meta.code,
      flag: meta.flag
    })
  }

  return rows.sort((a, b) => b.gdp - a.gdp).slice(0, topN)
}

export function formatGdpMillion(value) {
  return `${Number(value).toLocaleString('en-US')} million $`
}

export function formatGdpAxis(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`
  }
  return String(value)
}
