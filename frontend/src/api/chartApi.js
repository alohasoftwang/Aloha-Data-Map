/** 从数据库导出的 Asia GDP TOP 15 JSON（1960 年起） */
import { filterExcludedChartEntities } from '../utils/excludedEntities.js'

export async function fetchAsiaGdp() {
  const response = await fetch('/data/asia-gdp-top15.json')
  if (!response.ok) {
    throw new Error('Failed to load asia-gdp-top15.json')
  }
  const data = await response.json()
  const { _meta, ...chartData } = data
  return filterExcludedChartEntities(chartData)
}

/** 从数据库导出的 World GDP TOP 15 JSON（1960 年起） */
export async function fetchWorldGdpTop10() {
  const response = await fetch('/data/world-gdp-top10.json')
  if (!response.ok) {
    throw new Error('Failed to load world-gdp-top10.json')
  }
  const data = await response.json()
  const { _meta, ...chartData } = data
  return filterExcludedChartEntities(chartData)
}

/** 南亚 8 国 GDP JSON（1960 年起） */
export async function fetchSouthAsiaGdp() {
  const response = await fetch('/data/south-asia-gdp.json')
  if (!response.ok) {
    throw new Error('Failed to load south-asia-gdp.json')
  }
  const data = await response.json()
  const { _meta, ...chartData } = data
  return filterExcludedChartEntities(chartData)
}
