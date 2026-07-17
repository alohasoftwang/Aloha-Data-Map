import {
  FLAG_DISPLAY_HEIGHT_BAR,
  FLAG_DISPLAY_HEIGHT_BAR_MOBILE,
  getFlagDisplaySize
} from './flagAspectRatios.js'

function formatGdpValue(value) {
  return Number(value).toLocaleString('en-US')
}

/** 手机端缩短数值，避免挤占柱条 */
function formatGdpValueCompact(value) {
  const n = Number(value)
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}k`
  }
  return String(n)
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

const MOBILE_Y_LABELS = {
  'UNITED STATES': 'USA',
  'UNITED KINGDOM': 'UK',
  'SOUTH KOREA': 'S.KOREA',
  'SAUDI ARABIA': 'SAUDI',
  'SOVIET UNION': 'USSR',
  NETHERLANDS: 'NETH.',
  AUSTRALIA: 'AUS.',
  SWITZERLAND: 'SWISS',
  ARGENTINA: 'ARG.'
}

const LAYOUT_PRESETS = {
  desktop: {
    gridLeft: 175,
    gridRight: 320,
    gridTop: null,
    gridBottom: null,
    flagHeight: FLAG_DISPLAY_HEIGHT_BAR,
    flagPaddingV: 3,
    flagPaddingH: 5,
    gdpFontSize: 20,
    gdpTopFontSize: 26,
    gdpPadding: [0, 8, 0, 12],
    yAxisFontSize: 17,
    yAxisLetterSpacing: 1,
    labelDistance: 10,
    yearRight: 100,
    yearBottom: 40,
    yearFont: 'bolder 80px monospace',
    yearFill: 'rgba(217, 192, 138, 0.16)',
    abbreviateGdp: false,
    shortYLabels: false
  },
  mobile: {
    gridLeft: 196,
    gridRight: 400,
    gridTop: 56,
    gridBottom: 120,
    flagHeight: FLAG_DISPLAY_HEIGHT_BAR_MOBILE,
    flagPaddingV: 5,
    flagPaddingH: 5,
    gdpFontSize: 22,
    gdpTopFontSize: 26,
    gdpPadding: [0, 8, 0, 12],
    yAxisFontSize: 22,
    yAxisLetterSpacing: 0.5,
    labelDistance: 10,
    yearRight: 240,
    yearBottom: 160,
    yearFont: 'bolder 120px monospace',
    yearFill: 'rgba(217, 192, 138, 0.42)',
    abbreviateGdp: false,
    shortYLabels: true
  }
}

function resolveLayout(options = {}) {
  const presetName = options.layout === 'mobile' ? 'mobile' : 'desktop'
  const preset = LAYOUT_PRESETS[presetName]
  return {
    ...preset,
    gridLeft: options.gridLeft ?? preset.gridLeft,
    layout: presetName
  }
}

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

function buildFlagRichStyles(entityCodes, entityFlagImages, layout) {
  const rich = {
    gdp: {
      color: '#ff3b3b',
      fontWeight: 'bold',
      fontSize: layout.gdpFontSize,
      fontFamily: 'Consolas, Monaco, monospace',
      padding: layout.gdpPadding,
      verticalAlign: 'middle'
    },
    gdpTop: {
      color: '#ff3b3b',
      fontWeight: 'bold',
      fontSize: layout.gdpTopFontSize,
      fontFamily: 'Consolas, Monaco, monospace',
      padding: layout.gdpPadding,
      verticalAlign: 'middle'
    }
  }

  for (const [entityName, code] of Object.entries(entityCodes)) {
    const { width, height } = getFlagDisplaySize(code, layout.flagHeight)
    rich[flagRichKey(code)] = {
      height,
      width,
      align: 'left',
      verticalAlign: 'middle',
      padding: [layout.flagPaddingV, layout.flagPaddingH],
      borderRadius: 3,
      shadowColor: 'rgba(0, 0, 0, 0.55)',
      shadowBlur: layout.layout === 'mobile' ? 6 : 12,
      shadowOffsetX: 0,
      shadowOffsetY: layout.layout === 'mobile' ? 1 : 3,
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

function createLabelFormatter(entityCodes, maxGdp, layout) {
  const formatValue = layout.abbreviateGdp ? formatGdpValueCompact : formatGdpValue
  return function labelFormatter(param) {
    const gdp = Array.isArray(param.value) ? param.value[0] : param.value
    const entityName = Array.isArray(param.value) ? param.value[1] : param.name
    const code = entityCodes?.[entityName]
    if (!code) return ''
    // 无数据占位为 0：只显示国旗，不显示数字
    if (!gdp) {
      return `{${flagRichKey(code)}| }`
    }
    const gdpStyle = gdp === maxGdp ? 'gdpTop' : 'gdp'
    return `{${flagRichKey(code)}| }{${gdpStyle}|${formatValue(gdp)}}`
  }
}

function formatYAxisLabel(value, layout) {
  if (!layout.shortYLabels) {
    return value
  }
  return MOBILE_Y_LABELS[value] ?? value
}

function buildYearGraphic(layout, year, showYear, {
  barCount = 15,
  barThickness = 0,
  rowGap = 14
} = {}) {
  const yearText = showYear ? String(year) : ''

  if (layout.layout !== 'mobile') {
    return {
      type: 'text',
      right: layout.yearRight,
      bottom: layout.yearBottom,
      style: {
        text: yearText,
        font: layout.yearFont,
        fill: layout.yearFill
      },
      z: 100
    }
  }

  // 手机页：年份对齐第 12 名附近（Top10 偏下一些）
  const gridTop = layout.gridTop ?? 56
  const rowPitch = barThickness + rowGap
  const rankIndex = Math.min(11, Math.max(0, barCount - 1)) // 第 12 位（0-based = 11）
  const rankCenterY = gridTop + (rankIndex + 0.5) * rowPitch
  const yearTop = Math.round(rankCenterY - 60)

  return {
    type: 'text',
    right: layout.yearRight,
    top: yearTop,
    style: {
      text: yearText,
      font: layout.yearFont,
      fill: layout.yearFill
    },
    z: 100
  }
}

export function getYearData(dataset, year, allEntities = null) {
  const [header, ...rows] = dataset
  const yearRows = rows.filter((row) => row[2] === year)

  if (!allEntities?.length) {
    return [header, ...yearRows]
  }

  // 尚无该年数据的实体先用 0 占位，保证国旗/名额从一开始就齐全
  const byName = new Map(yearRows.map((row) => [row[1], row]))
  return [
    header,
    ...allEntities.map((name) => byName.get(name) ?? [0, name, year])
  ]
}

export function buildBarRaceOption(chartData, year, options = {}) {
  const layout = resolveLayout(options)
  const { showYear = false } = options
  const { entityColors, entityCodes, entityFlagImages, updateFrequency, maxBars } =
    resolveEntityChartData(chartData)
  const allEntities = Object.keys(entityCodes)
  const source = getYearData(chartData.dataset, year, allEntities)
  const flagRich = buildFlagRichStyles(entityCodes, entityFlagImages, layout)
  const maxGdp = getMaxGdp(source)
  const barCount = Math.max(maxBars || allEntities.length || 1, 1)
  // 条数少时压缩上下留白，避免柱条被拉得过散
  const compact = barCount <= 5
  const gridTop =
    layout.gridTop ?? (compact ? `${Math.max(12, 34 - barCount * 4)}%` : 12)
  const gridBottom =
    layout.gridBottom ?? (compact ? `${Math.max(16, 38 - barCount * 4)}%` : 48)
  const flagBarHeight = layout.flagHeight + layout.flagPaddingV * 2
  // 柱条厚度对齐国旗（含上下 padding）视觉高度
  const barThickness = flagBarHeight
  const barCategoryGap =
    layout.layout === 'mobile'
      ? '0%'
      : barCount <= 5
        ? '18%'
        : barCount > 12
          ? '14%'
          : '28%'
  // 手机页：按「条高 × 条数」锁死绘图区高度，避免行被纵向拉散
  const mobileRowGap = 14
  const mobileGrid =
    layout.layout === 'mobile'
      ? {
          top: layout.gridTop ?? 56,
          height: barCount * (barThickness + mobileRowGap),
          left: layout.gridLeft,
          right: layout.gridRight,
          containLabel: false
        }
      : {
          top: gridTop,
          bottom: gridBottom,
          left: layout.gridLeft,
          right: layout.gridRight,
          containLabel: false
        }

  return {
    backgroundColor: 'transparent',
    grid: mobileGrid,
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
        if (!gdp) return item.name
        return `${item.name}<br/>${formatGdp(gdp)}`
      }
    },
    xAxis: {
      max: 'dataMax',
      axisLabel: {
        color: '#9aafc9',
        fontSize: layout.layout === 'mobile' ? 10 : 12,
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
        fontSize: layout.yAxisFontSize,
        color: '#dde5f0',
        fontWeight: 600,
        letterSpacing: layout.yAxisLetterSpacing,
        formatter: (value) => formatYAxisLabel(value, layout)
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
        barWidth: barThickness,
        barMaxWidth: barThickness,
        barCategoryGap,
        encode: { x: 0, y: 1 },
        itemStyle: {
          color(param) {
            return entityColors[param.value[1]] || '#5470c6'
          },
          borderRadius: layout.layout === 'mobile' ? 2 : 4,
          shadowColor: 'rgba(0, 0, 0, 0.35)',
          shadowBlur: layout.layout === 'mobile' ? 4 : 8,
          shadowOffsetY: layout.layout === 'mobile' ? 1 : 2
        },
        label: {
          show: true,
          position: 'right',
          distance: layout.labelDistance,
          verticalAlign: 'middle',
          overflow: 'none',
          valueAnimation: true,
          rich: flagRich,
          formatter: createLabelFormatter(entityCodes, maxGdp, layout)
        }
      }
    ],
    animationDuration: 0,
    animationDurationUpdate: updateFrequency,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear',
    graphic: {
      elements: [
        buildYearGraphic(layout, year, showYear, {
          barCount,
          barThickness,
          rowGap: mobileRowGap
        })
      ]
    }
  }
}

export function updateBarRaceYear(chart, chartData, year, options = {}) {
  const layout = resolveLayout(options)
  const { showYear = true } = options
  const { entityCodes, maxBars } = resolveEntityChartData(chartData)
  const allEntities = Object.keys(entityCodes)
  const source = getYearData(chartData.dataset, year, allEntities)
  const maxGdp = getMaxGdp(source)
  const barCount = Math.max(maxBars || allEntities.length || 1, 1)
  const barThickness = layout.flagHeight + layout.flagPaddingV * 2
  const mobileRowGap = 14

  chart.setOption({
    dataset: { source },
    series: [{
      label: {
        formatter: createLabelFormatter(entityCodes, maxGdp, layout)
      }
    }],
    graphic: {
      elements: [
        buildYearGraphic(layout, year, showYear, {
          barCount,
          barThickness,
          rowGap: mobileRowGap
        })
      ]
    }
  })
}
