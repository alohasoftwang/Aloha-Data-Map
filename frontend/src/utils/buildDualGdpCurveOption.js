import { buildGdpCurveOption, updateGdpCurveFrame } from './buildGdpCurveOption.js'

export function buildDualGdpCurveOption(
  chartData,
  entityA,
  entityB,
  year,
  options = {}
) {
  return buildGdpCurveOption(chartData, [entityA, entityB], year, options)
}

export function updateDualGdpCurveFrame(
  chart,
  chartData,
  entityA,
  entityB,
  options = {}
) {
  return updateGdpCurveFrame(chart, chartData, [entityA, entityB], options)
}

/** @deprecated use updateGdpCurveFrame */
export function updateDualGdpCurveYear(
  chart,
  chartData,
  entityA,
  entityB,
  year,
  options = {}
) {
  updateDualGdpCurveFrame(chart, chartData, entityA, entityB, {
    displayYear: year,
    toYear: year,
    progress: 1,
    ...options
  })
}
