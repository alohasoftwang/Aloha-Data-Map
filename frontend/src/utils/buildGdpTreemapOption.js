import {
  formatGdpMillion,
  getTopEntitiesByYear
} from './gdpTreemapData.js'
import {
  FLAG_DISPLAY_HEIGHT_TREEMAP,
  getFlagDisplaySize
} from './flagAspectRatios.js'

const FLAG_NAME_GAP = 4
const NAME_LINE_HEIGHT = 16
const FLAG_MIN_WIDTH = 88
const FLAG_MIN_HEIGHT = 46
const NAME_MIN_WIDTH = 40
const NAME_MIN_HEIGHT = 28

function shouldShowFlag(rect) {
  return rect.width >= FLAG_MIN_WIDTH && rect.height >= FLAG_MIN_HEIGHT
}

function shouldShowName(rect) {
  return rect.width >= NAME_MIN_WIDTH && rect.height >= NAME_MIN_HEIGHT
}

function buildTreemapNodes(items) {
  return items.map((item) => ({
    name: item.name,
    value: item.gdp,
    code: item.code,
    flag: item.flag,
    itemStyle: {
      color: item.color,
      borderColor: 'rgba(26, 34, 52, 0.9)',
      borderWidth: 2
    }
  }))
}

/**
 * 按官方 labelLayout 居中算法，在色块内水平垂直居中绘制国旗+国名：
 * x = rect.x + rect.width / 2 - contentWidth / 2
 * y = rect.y + rect.height / 2 - contentHeight / 2
 * @see https://echarts.apache.org/en/option.html#series-treemap.labelLayout
 */
export function syncTreemapCellGraphics(chart, items) {
  if (!chart) {
    return
  }

  const model = chart.getModel()
  const series = model?.getSeriesByIndex(0)
  if (!series || series.subType !== 'treemap') {
    return
  }

  const data = series.getData()
  const metaByName = new Map(items.map((item) => [item.name, item]))
  const elements = []

  data.each((idx) => {
    const layout = data.getItemLayout(idx)
    const name = data.getName(idx)
    const item = metaByName.get(name)

    if (!layout || !item || !shouldShowName(layout)) {
      return
    }

    const showFlag = shouldShowFlag(layout) && item.code && item.flag
    const flagSize = showFlag
      ? getFlagDisplaySize(item.code, FLAG_DISPLAY_HEIGHT_TREEMAP)
      : { width: 0, height: 0 }

    const contentWidth = Math.max(0, layout.width - 12)
    const contentHeight = showFlag
      ? flagSize.height + FLAG_NAME_GAP + NAME_LINE_HEIGHT
      : NAME_LINE_HEIGHT

    const originX = layout.x + (layout.width - contentWidth) / 2
    const originY = layout.y + (layout.height - contentHeight) / 2
    const children = []

    if (showFlag) {
      children.push({
        type: 'image',
        style: {
          image: item.flag,
          x: (contentWidth - flagSize.width) / 2,
          y: 0,
          width: flagSize.width,
          height: flagSize.height,
          shadowBlur: 4,
          shadowColor: 'rgba(0, 0, 0, 0.45)',
          shadowOffsetY: 1
        }
      })
    }

    children.push({
      type: 'text',
      style: {
        text: item.name,
        x: contentWidth / 2,
        y: showFlag ? flagSize.height + FLAG_NAME_GAP : 0,
        fill: '#eef3fa',
        font: 'bold 11px sans-serif',
        textAlign: 'center',
        width: contentWidth,
        overflow: 'truncate',
        lineOverflow: 'truncate'
      }
    })

    elements.push({
      type: 'group',
      silent: true,
      z: 100,
      x: originX,
      y: originY,
      children
    })
  })

  chart.setOption(
    {
      graphic: { elements }
    },
    { replaceMerge: ['graphic'] }
  )
}

export function refreshTreemapOverlays(chart, chartData, year, topN = 10) {
  const items = getTopEntitiesByYear(chartData, year, topN)
  syncTreemapCellGraphics(chart, items)
  return items
}

export function buildGdpTreemapOption(chartData, year, { topN = 10 } = {}) {
  const items = getTopEntitiesByYear(chartData, year, topN)
  const total = items.reduce((sum, item) => sum + item.gdp, 0)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(42, 53, 76, 0.92)',
      borderColor: 'rgba(217, 192, 138, 0.35)',
      textStyle: { color: '#e8eef7' },
      formatter(info) {
        if (!info?.name) {
          return ''
        }
        const pct = total > 0 ? ((info.value / total) * 100).toFixed(1) : '0.0'
        const flag = info.data?.flag
        const lines = [
          formatGdpMillion(info.value),
          `${pct}% of TOP ${topN}`
        ]
        if (flag) {
          return [
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">`,
            `<img src="${flag}" style="height:18px;width:auto;border-radius:2px" alt="" />`,
            `<strong>${info.name}</strong>`,
            `</div>`,
            lines.join('<br/>')
          ].join('')
        }
        return [info.name, ...lines].join('<br/>')
      }
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: false,
        left: '2%',
        right: '2%',
        top: '2%',
        bottom: '2%',
        breadcrumb: { show: false },
        label: { show: false },
        upperLabel: { show: false },
        itemStyle: {
          borderColor: 'rgba(26, 34, 52, 0.9)',
          borderWidth: 2,
          gapWidth: 2
        },
        levels: [
          {
            itemStyle: {
              borderColor: 'rgba(26, 34, 52, 0.9)',
              borderWidth: 2,
              gapWidth: 2
            }
          }
        ],
        data: buildTreemapNodes(items)
      }
    ]
  }
}
