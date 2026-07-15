/** 从数据库导出的 Asia GDP TOP 15 JSON（1960 年起） */
import http from './http'
import { filterExcludedChartEntities } from '../utils/excludedEntities.js'

function withCacheBust(url, cacheBust) {
  if (!cacheBust) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}t=${Date.now()}`
}

async function loadChartJson(path, cacheBust = false) {
  const response = await fetch(withCacheBust(path, cacheBust))
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`)
  }
  const data = await response.json()
  const { _meta, ...chartData } = data
  return filterExcludedChartEntities(chartData)
}

export async function fetchAsiaGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/asia-gdp-top15.json', cacheBust)
}

/** 欧洲 GDP TOP 15 JSON（1960 年起） */
export async function fetchEuropeGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/europe-gdp-top15.json', cacheBust)
}

/** 非洲 GDP TOP 15 JSON（1960 年起） */
export async function fetchAfricaGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/africa-gdp-top15.json', cacheBust)
}

/** 南美洲 GDP JSON（12 国，1960 年起） */
export async function fetchSouthAmericaGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/south-america-gdp.json', cacheBust)
}

/** 从数据库导出的 World GDP TOP 15 JSON（1960 年起） */
export async function fetchWorldGdpTop10({ cacheBust = false } = {}) {
  return loadChartJson('/data/world-gdp-top10.json', cacheBust)
}

/** 南亚 8 国 GDP JSON（1960 年起） */
export async function fetchSouthAsiaGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/south-asia-gdp.json', cacheBust)
}

/** 东南亚 11 国 GDP JSON（1960 年起） */
export async function fetchSoutheastAsiaGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/southeast-asia-gdp.json', cacheBust)
}

/** 中东 GDP JSON（1960 年起） */
export async function fetchMiddleEastGdp({ cacheBust = false } = {}) {
  return loadChartJson('/data/middle-east-gdp.json', cacheBust)
}

/** 从数据库重新生成图表 JSON；不传 chartId 则全部刷新 */
export async function refreshChartJson(chartId) {
  const url = chartId ? `/charts/refresh/${chartId}` : '/charts/refresh'
  const { data } = await http.post(url)
  return data
}
