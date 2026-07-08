function formatGdpValue(value) {
  return Number(value).toLocaleString('en-US')
}

function formatGdp(value) {
  return `${formatGdpValue(value)} million $`
}

function formatAxisValue(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`
  }
  return String(value)
}

import {
  FLAG_DISPLAY_HEIGHT_BAR,
  getFlagDisplaySize
} from './flagAspectRatios.js'

const FLAG_HEIGHT = FLAG_DISPLAY_HEIGHT_BAR
const FLAG_PADDING_V = 3
const FLAG_PADDING_H = 5
const FLAG_BAR_HEIGHT = FLAG_HEIGHT + FLAG_PADDING_V * 2

function flagRichKey(code) {
  return `flag_${code}`
}

function resolveEntityChartData(chartData) {
  return {
    entityColors: chartData.entityColors ?? chartData.countryColors ?? {},
    entityCodes: chartData.entityCodes ?? chartData.countryCodes ?? {},
    entityFlagImages: chartData.entityFlagImages ?? chartData.countryFlagImages ?? {},
    updateFrequency: chartData.updateFrequency,
    maxBars: chartData.maxBars
  }
}

function buildFlagRichStyles(entityCodes, entityFlagImages) {
  const rich = {
    gdp: {
      color: '#ff3b3b',
      fontWeight: 'bold',
      fontSize: 20,
      fontFamily: 'Consolas, Monaco, monospace',
      padding: [0, 8, 0, 12],
      verticalAlign: 'middle'
    },
    gdpTop: {
      color: '#ff3b3b',
      fontWeight: 'bold',
      fontSize: 26,
      fontFamily: 'Consolas, Monaco, monospace',
      padding: [0, 8, 0, 12],
      verticalAlign: 'middle'
    }
  }

  for (const [entityName, code] of Object.entries(entityCodes)) {
    const { width, height } = getFlagDisplaySize(code, FLAG_HEIGHT)
    rich[flagRichKey(code)] = {
      height,
      width,
      align: 'left',
      verticalAlign: 'middle',
      padding: [FLAG_PADDING_V, FLAG_PADDING_H],
      borderRadius: 4,
      shadowColor: 'rgba(0, 0, 0, 0.55)',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      backgroundColor: {
        image: entityFlagImages[entityName]
      }
    }
  }

  return rich
}

function getMaxGdp(source) {
  const body = source.slice(1)
  return body.length ? Math.max(...body.map((row) => row[0])) : 0
}

function createLabelFormatter(entityCodes, maxGdp) {
  return function labelFormatter(param) {
    const gdp = Array.isArray(param.value) ? param.value[0] : param.value
    const entityName = Array.isArray(param.value) ? param.value[1] : param.name
    const code = entityCodes?.[entityName]
    if (!code) return ''
    const gdpStyle = gdp === maxGdp ? 'gdpTop' : 'gdp'
    return `{${flagRichKey(code)}| }{${gdpStyle}|${formatGdpValue(gdp)}}`
  }
}

export function getYearData(dataset, year) {
  const [header, ...rows] = dataset
  return [header, ...rows.filter((row) => row[2] === year)]
}

export function buildBarRaceOption(chartData, year, { showYear = false, gridLeft = 175 } = {}) {
  const source = getYearData(chartData.dataset, year)
  const { entityColors, entityCodes, entityFlagImages, updateFrequency, maxBars } =
    resolveEntityChartData(chartData)
  const flagRich = buildFlagRichStyles(entityCodes, entityFlagImages)
  const maxGdp = getMaxGdp(source)

  return {
    backgroundColor: 'transparent',
    grid: {
      top: 12,
      bottom: 48,
      left: gridLeft,
      right: 320,
      containLabel: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(42, 53, 76, 0.92)',
      borderColor: 'rgba(217, 192, 138, 0.35)',
      textStyle: { color: '#e8eef7' },
      formatter(params) {
        const item = params[0]
        if (!item) return ''
        const gdp = Array.isArray(item.value) ? item.value[0] : item.value
        return `${item.name}<br/>${formatGdp(gdp)}`
      }
    },
    xAxis: {
      max: 'dataMax',
      axisLabel: {
        color: '#9aafc9',
        formatter: formatAxisValue
      },
      axisLine: {
        lineStyle: { color: 'rgba(154, 175, 201, 0.28)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(154, 175, 201, 0.12)' }
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      max: maxBars - 1,
      axisLabel: {
        show: true,
        fontSize: 17,
        color: '#dde5f0',
        fontWeight: 600,
        letterSpacing: 1
      },
      axisLine: { show: false },
      axisTick: { show: false },
      animationDuration: 300,
      animationDurationUpdate: 300
    },
    dataset: { source },
    series: [
      {
        type: 'bar',
        realtimeSort: true,
        seriesLayoutBy: 'column',
        clip: false,
        barWidth: FLAG_BAR_HEIGHT,
        barMaxWidth: FLAG_BAR_HEIGHT,
        barCategoryGap: maxBars > 12 ? '14%' : '28%',
        encode: { x: 0, y: 1 },
        itemStyle: {
          color(param) {
            return entityColors[param.value[1]] || '#5470c6'
          },
          borderRadius: 4,
          shadowColor: 'rgba(0, 0, 0, 0.35)',
          shadowBlur: 8,
          shadowOffsetY: 2
        },
        label: {
          show: true,
          position: 'right',
          distance: 10,
          verticalAlign: 'middle',
          overflow: 'none',
          valueAnimation: true,
          rich: flagRich,
          formatter: createLabelFormatter(entityCodes, maxGdp)
        }
      }
    ],
    animationDuration: 0,
    animationDurationUpdate: updateFrequency,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear',
    graphic: {
      elements: [
        {
          type: 'text',
          right: 100,
          bottom: 40,
          style: {
            text: showYear ? String(year) : '',
            font: 'bolder 80px monospace',
            fill: 'rgba(217, 192, 138, 0.16)'
          },
          z: 100
        }
      ]
    }
  }
}

export function updateBarRaceYear(chart, chartData, year, { showYear = true } = {}) {
  const source = getYearData(chartData.dataset, year)
  const maxGdp = getMaxGdp(source)
  const { entityCodes } = resolveEntityChartData(chartData)

  chart.setOption({
    dataset: { source },
    series: [{
      label: {
        formatter: createLabelFormatter(entityCodes, maxGdp)
      }
    }],
    graphic: {
      elements: [
        {
          style: { text: showYear ? String(year) : '' }
        }
      ]
    }
  })
}
