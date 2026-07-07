import { asiaGdpMock } from '../mock/asia-gdp'

/** 暂时使用模拟数据，后续可改回调用后端 API */
export async function fetchAsiaGdp() {
  return asiaGdpMock
}

/** 从数据库导出的 World GDP TOP 15 JSON（1960 年起） */
export async function fetchWorldGdpTop10() {
  const response = await fetch('/data/world-gdp-top10.json')
  if (!response.ok) {
    throw new Error('Failed to load world-gdp-top10.json')
  }
  const data = await response.json()
  const { _meta, ...chartData } = data
  return chartData
}
