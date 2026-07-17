<template>
  <div ref="panelRef" class="chart-panel chart-panel--mobile">
    <header v-if="title" class="chart-header chart-header--mobile-title">
      <div class="chart-header-text oswald-chart">
        <h2 class="chart-title">{{ title }}</h2>
        <p v-if="unit" class="chart-unit">{{ unit }}</p>
      </div>
    </header>

    <div v-if="loading" class="chart-state">加载中...</div>
    <div v-else-if="error" class="chart-state error">{{ error }}</div>
    <div
      v-show="!loading && !error"
      ref="chartRef"
      class="chart-container bar-race-container"
    ></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import {
  buildBarRaceOption,
  updateBarRaceYear
} from '../utils/buildBarRaceOption'

/** 进入全屏后等待再开跑（与桌面柱状竞赛一致） */
const RACE_START_DELAY_MS = 30_000

const props = defineProps({
  chartData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref(null)
const panelRef = ref(null)
const title = ref('')
const unit = ref('')

let chartInstance = null
let raceTimerIds = []
let raceDelayTimerId = null
let raceSessionId = 0
let chartResizeObserver = null

const layoutOptions = { layout: 'mobile' }

function clearRaceTimers() {
  raceTimerIds.forEach((id) => clearTimeout(id))
  raceTimerIds = []
}

function clearAllTimers() {
  raceSessionId += 1
  clearRaceTimers()
  if (raceDelayTimerId !== null) {
    clearTimeout(raceDelayTimerId)
    raceDelayTimerId = null
  }
}

function resetToStartYear({ showYear = false } = {}) {
  if (!chartInstance || !props.chartData) {
    return
  }

  chartInstance.clear()
  chartInstance.setOption(
    buildBarRaceOption(props.chartData, props.chartData.startYear, {
      showYear,
      ...layoutOptions
    }),
    true
  )
}

function startRace(sessionId) {
  if (!chartInstance || !props.chartData || sessionId !== raceSessionId) {
    return
  }

  clearRaceTimers()

  const { years, startYear, updateFrequency } = props.chartData
  const startIndex = years.indexOf(startYear)
  if (startIndex < 0) {
    return
  }

  // 开跑瞬间先显示起始年
  updateBarRaceYear(chartInstance, props.chartData, startYear, {
    showYear: true,
    ...layoutOptions
  })

  for (let i = startIndex; i < years.length - 1; i++) {
    const delay = (i - startIndex) * updateFrequency
    const nextYear = years[i + 1]
    const timerId = setTimeout(() => {
      if (sessionId !== raceSessionId) {
        return
      }
      updateBarRaceYear(chartInstance, props.chartData, nextYear, {
        showYear: true,
        ...layoutOptions
      })
    }, delay)
    raceTimerIds.push(timerId)
  }
}

function scheduleRaceAfterFullscreen() {
  clearAllTimers()
  // 等待期间也显示起始年份
  resetToStartYear({ showYear: true })

  const sessionId = raceSessionId
  raceDelayTimerId = setTimeout(() => {
    raceDelayTimerId = null
    if (sessionId !== raceSessionId) {
      return
    }
    startRace(sessionId)
  }, RACE_START_DELAY_MS)
}

async function renderChart() {
  if (props.loading || props.error || !props.chartData) {
    return
  }

  await nextTick()

  if (!chartRef.value) {
    return
  }

  title.value = props.chartData.title
  unit.value = props.chartData.unit || ''

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  clearAllTimers()
  resetToStartYear()
  nextTick(() => chartInstance?.resize())
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  () => props.isFullscreen,
  (fullscreen, wasFullscreen) => {
    if (!chartInstance || !props.chartData) {
      return
    }

    if (fullscreen && !wasFullscreen) {
      scheduleRaceAfterFullscreen()
      nextTick(() => chartInstance?.resize())
      return
    }

    if (!fullscreen && wasFullscreen) {
      clearAllTimers()
      resetToStartYear()
      nextTick(() => chartInstance?.resize())
    }
  }
)

watch(
  () => [props.chartData, props.loading, props.error],
  () => {
    renderChart()
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)

  if (chartRef.value && typeof ResizeObserver !== 'undefined') {
    chartResizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    chartResizeObserver.observe(chartRef.value)
  }

  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartResizeObserver?.disconnect()
  chartResizeObserver = null
  clearAllTimers()
  chartInstance?.dispose()
  chartInstance = null
})
</script>
