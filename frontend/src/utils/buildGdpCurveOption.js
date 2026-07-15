import {
  getEntityMeta,
  indexDatasetByEntity,
  padEntitySeriesFromStart,
  sliceEntitySeries,
  sliceEntitySeriesProgress
} from './gdpDualCurveData.js'
import {
  FLAG_DISPLAY_HEIGHT_LINE,
  FLAG_DISPLAY_HEIGHT_LINE_FEATURED,
  getFlagDisplaySize
} from './flagAspectRatios.js'

const LATEST_SYMBOL_SIZE = 18
const END_FLAG_HEIGHT = FLAG_DISPLAY_HEIGHT_LINE

function buildFlagRichKey(entityName, code) {
  const slug = entityName.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()
  return `ef_${code}_${slug}`
}

function buildNameRichKey(entityName, code) {
  const slug = entityName.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()
  return `en_${code}_${slug}`
}

function calcGridRight(entities) {
  const longestName = entities.reduce(
    (max, name) => Math.max(max, name.length),
    0
  )
  // 宽国旗（如东帝汶 2:1）+ 国家名，避免末端标签被裁切
  return Math.max(210, 88 + Math.round(longestName * 8))
}

function formatEndLabelName(entityName) {
  // ECharts rich text 对内容中的部分符号敏感，统一成可安全显示的文本
  return String(entityName).replace(/-/g, ' ')
}

function buildEndLabelRich(entityName, code, flagUrl, { featured = false } = {}) {
  if (!code || !flagUrl) {
    return { rich: {}, label: '' }
  }

  const flagHeight = featured ? FLAG_DISPLAY_HEIGHT_LINE_FEATURED : END_FLAG_HEIGHT
  const { width: flagWidth, height: flagBlockHeight } = getFlagDisplaySize(
    code,
    flagHeight
  )
  const flagKey = buildFlagRichKey(entityName, code)
  const nameKey = buildNameRichKey(entityName, code)
  const displayName = formatEndLabelName(entityName)

  return {
    rich: {
      [flagKey]: {
        height: flagBlockHeight,
        width: flagWidth,
        align: 'left',
        verticalAlign: 'middle',
        padding: [2, 4],
        borderRadius: 3,
        shadowColor: 'rgba(0, 0, 0, 0.55)',
        shadowBlur: featured ? 12 : 8,
        shadowOffsetY: 2,
        backgroundColor: { image: flagUrl }
      },
      [nameKey]: {
        color: '#eef3fa',
        fontSize: featured ? 15 : 14,
        fontWeight: 600,
        padding: [0, 0, 0, 8],
        verticalAlign: 'middle'
      }
    },
    label: `{${flagKey}| }{${nameKey}|${displayName}}`
  }
}

function buildFeaturedEndGraphic(entityName, meta, pixel) {
  const baseHeight = FLAG_DISPLAY_HEIGHT_LINE_FEATURED
  const { width: flagWidth, height: flagHeight } = getFlagDisplaySize(
    meta.code,
    baseHeight
  )
  const x = pixel[0] + 14
  const y = pixel[1] - flagHeight / 2

  return {
    type: 'group',
    z: 1000,
    zlevel: 20,
    x,
    y,
    children: [
      {
        type: 'image',
        style: {
          image: meta.flag,
          x: 0,
          y: 0,
          width: flagWidth,
          height: flagHeight,
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.55)',
          shadowOffsetY: 2
        }
      },
      {
        type: 'text',
        style: {
          text: formatEndLabelName(entityName),
          x: flagWidth + 8,
          y: flagHeight / 2,
          fill: '#eef3fa',
          font: '600 15px sans-serif',
          textVerticalAlign: 'middle'
        }
      }
    ]
  }
}

function formatGdpAxis(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`
  }
  return String(value)
}

function formatGdpTooltip(value) {
  return `${Number(value).toLocaleString('en-US')} million $`
}

function buildSeriesData(data, color, { featured = false } = {}) {
  const lastIndex = data.length - 1
  const latestSymbolSize = featured ? 22 : LATEST_SYMBOL_SIZE

  return data.map((point, index) => {
    const isLatest = index === lastIndex

    return {
      value: point,
      symbol: 'circle',
      symbolSize: isLatest ? latestSymbolSize : 0,
      itemStyle: {
        color,
        borderColor: '#fff',
        borderWidth: isLatest ? (featured ? 4 : 3) : 0,
        opacity: isLatest ? 1 : 0,
        shadowBlur: isLatest ? (featured ? 18 : 14) : 0,
        shadowColor: isLatest ? 'rgba(0, 0, 0, 0.35)' : 'transparent'
      }
    }
  })
}

function orderEntitiesForRender(entities, featuredEntity) {
  if (!featuredEntity || !entities.includes(featuredEntity)) {
    return [...entities]
  }
  return [...entities.filter((entity) => entity !== featuredEntity), featuredEntity]
}

function buildSeries(entityName, data, meta, animationDuration, { featured = false } = {}) {
  const { color, code, flag } = meta
  const seriesData = buildSeriesData(data, color, { featured })
  const endLabel = buildEndLabelRich(entityName, code, flag, { featured })

  return {
    name: entityName,
    type: 'line',
    smooth: 0.38,
    showSymbol: true,
    symbol: 'circle',
    symbolSize: 0,
    data: seriesData,
    clip: false,
    zlevel: featured ? 10 : 0,
    z: featured ? 100 : 1,
    lineStyle: {
      width: featured ? 5 : 4,
      color,
      shadowColor: 'rgba(0, 0, 0, 0.28)',
      shadowBlur: 8,
      shadowOffsetY: 3
    },
    endLabel: {
      show: data.length > 0 && !!endLabel.label && !featured,
      formatter: () => endLabel.label,
      rich: endLabel.rich,
      distance: 14,
      verticalAlign: 'middle'
    },
    emphasis: {
      focus: 'series',
      scale: false
    },
    animationDuration: animationDuration,
    animationDurationUpdate: animationDuration,
    animationEasing: 'cubicInOut',
    animationEasingUpdate: 'cubicInOut'
  }
}

function calcYMax(...seriesDataList) {
  const allY = seriesDataList.flat().map(([, gdp]) => gdp)
  const yMax = allY.length ? Math.max(...allY) : 0
  return yMax > 0 ? Math.ceil(yMax * 1.08) : undefined
}

function sliceEntityData(indexed, entityName, { fromYear, toYear, progress, displayYear }) {
  if (fromYear != null && toYear != null && progress < 1) {
    return sliceEntitySeriesProgress(indexed, entityName, fromYear, toYear, progress)
  }
  return sliceEntitySeries(indexed, entityName, displayYear ?? toYear ?? fromYear)
}

export function buildGdpCurveOption(
  chartData,
  entities,
  year,
  { showYear = false, animationDuration = 2250, featuredEntity = null } = {}
) {
  const renderEntities = orderEntitiesForRender(entities, featuredEntity)
  const indexed = padEntitySeriesFromStart(
    indexDatasetByEntity(chartData.dataset),
    renderEntities,
    chartData.startYear
  )
  const seriesDataList = renderEntities.map((entity) =>
    sliceEntitySeries(indexed, entity, year)
  )
  const metas = renderEntities.map((entity) => getEntityMeta(chartData, entity))

  return {
    backgroundColor: 'transparent',
    grid: {
      top: 48,
      bottom: 72,
      left: 72,
      right: calcGridRight(entities),
      containLabel: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(42, 53, 76, 0.92)',
      borderColor: 'rgba(217, 192, 138, 0.35)',
      textStyle: { color: '#e8eef7' },
      formatter(params) {
        if (!params?.length) return ''
        const yearLabel = params[0]?.value?.[0] ?? params[0]?.axisValue
        const lines = params.map(
          (item) => `${item.marker}${item.seriesName}<br/>${formatGdpTooltip(item.value[1])}`
        )
        return `${yearLabel}<br/>${lines.join('<br/>')}`
      }
    },
    xAxis: {
      type: 'value',
      min: chartData.startYear,
      max: chartData.endYear,
      axisLabel: {
        color: '#9aafc9',
        formatter: (value) => String(Math.round(value))
      },
      axisLine: {
        lineStyle: { color: 'rgba(154, 175, 201, 0.28)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(154, 175, 201, 0.1)' }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: calcYMax(...seriesDataList),
      axisLabel: {
        color: '#9aafc9',
        formatter: formatGdpAxis
      },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { color: 'rgba(154, 175, 201, 0.12)' }
      },
      animationDurationUpdate: animationDuration,
      animationEasingUpdate: 'cubicInOut'
    },
    series: renderEntities.map((entity, index) =>
      buildSeries(entity, seriesDataList[index], metas[index], animationDuration, {
        featured: entity === featuredEntity
      })
    ),
    graphic: {
      elements: [
        {
          type: 'text',
          right: 48,
          bottom: 36,
          style: {
            text: showYear ? String(year) : '',
            font: 'bolder 72px monospace',
            fill: 'rgba(217, 192, 138, 0.16)'
          },
          z: 100
        }
      ]
    }
  }
}

export function updateGdpCurveFrame(
  chart,
  chartData,
  entities,
  {
    fromYear,
    toYear,
    progress = 1,
    displayYear,
    showYear = true,
    animationDuration = 2250,
    animationEasing = 'linear',
    featuredEntity = null
  } = {}
) {
  const renderEntities = orderEntitiesForRender(entities, featuredEntity)
  const indexed = padEntitySeriesFromStart(
    indexDatasetByEntity(chartData.dataset),
    renderEntities,
    chartData.startYear
  )
  const frameContext = { fromYear, toYear, progress, displayYear }
  const seriesDataList = renderEntities.map((entity) =>
    sliceEntityData(indexed, entity, frameContext)
  )
  const metas = renderEntities.map((entity) => getEntityMeta(chartData, entity))
  const yearLabel = displayYear ?? toYear ?? fromYear
  const featuredIndex = featuredEntity
    ? renderEntities.indexOf(featuredEntity)
    : -1

  const seriesUpdate = renderEntities.map((entity, index) => {
    const isFeatured = entity === featuredEntity
    const meta = metas[index]
    const seriesData = seriesDataList[index]
    const endLabel = buildEndLabelRich(entity, meta.code, meta.flag, {
      featured: isFeatured
    })

    return {
      name: entity,
      data: buildSeriesData(seriesData, meta.color, {
        featured: isFeatured
      }),
      clip: false,
      zlevel: isFeatured ? 10 : 0,
      z: isFeatured ? 100 : index + 1,
      animationDurationUpdate: animationDuration,
      animationEasingUpdate: animationEasing,
      endLabel: {
        show: seriesData.length > 0 && !!endLabel.label && !isFeatured,
        formatter: () => endLabel.label,
        rich: endLabel.rich,
        distance: 14,
        verticalAlign: 'middle'
      }
    }
  })

  const graphicElements = [
    {
      style: { text: showYear ? String(yearLabel) : '' }
    }
  ]

  if (featuredIndex >= 0) {
    const featuredData = seriesDataList[featuredIndex]
    const lastPoint = featuredData[featuredData.length - 1]
    const featuredMeta = metas[featuredIndex]

    if (lastPoint) {
      const pixel = chart.convertToPixel({ seriesIndex: featuredIndex }, lastPoint)
      if (pixel) {
        graphicElements.push(
          buildFeaturedEndGraphic(featuredEntity, featuredMeta, pixel)
        )
      }
    }

    if (seriesUpdate[featuredIndex]) {
      seriesUpdate[featuredIndex].endLabel = { show: false }
    }
  }

  chart.setOption({
    yAxis: {
      max: calcYMax(...seriesDataList),
      animationDurationUpdate: animationDuration,
      animationEasingUpdate: animationEasing
    },
    series: seriesUpdate,
    graphic: {
      elements: graphicElements
    }
  })
}
