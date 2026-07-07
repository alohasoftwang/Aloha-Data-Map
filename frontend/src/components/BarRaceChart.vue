<template>
  <div ref="panelRef" class="chart-panel">
    <header v-if="title" class="chart-header">
      <div class="chart-header-text oswald-chart">
        <h2 class="chart-title">
          {{ title }}<span v-if="unit" class="chart-unit">{{ unit }}</span>
        </h2>
        <p v-if="currentYear" class="chart-subtitle">{{ currentYear }}</p>
      </div>
      <div v-if="!isFullscreen" class="chart-header-actions">
        <FullscreenButton
          :is-fullscreen="isFullscreen"
          @toggle="handleFullscreenToggle"
        />
      </div>
    </header>

    <div v-if="loading" class="chart-state">加载中...</div>
    <div v-else-if="error" class="chart-state error">{{ error }}</div>
    <div v-show="!loading && !error" ref="chartRef" class="chart-container bar-race-container"></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import {
  buildBarRaceOption,
  updateBarRaceYear
} from '../utils/buildBarRaceOption'
import { useFullscreen } from '../composables/useFullscreen'
import FullscreenButton from './FullscreenButton.vue'

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
  }
})

const chartRef = ref(null)
const panelRef = ref(null)
const title = ref('')
const unit = ref('')
const currentYear = ref(null)

let chartInstance = null
let raceTimerIds = []
let raceDelayTimerId = null
let raceSessionId = 0
let chartResizeObserver = null

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef, () => {
  nextTick(() => chartInstance?.resize())
})

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

function resetToStartYear() {
  if (!chartInstance || !props.chartData) {
    return
  }

  currentYear.value = props.chartData.startYear
  chartInstance.clear()
  chartInstance.setOption(
    buildBarRaceOption(props.chartData, props.chartData.startYear, { showYear: false }),
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

  for (let i = startIndex; i < years.length - 1; i++) {
    const delay = (i - startIndex) * updateFrequency
    const nextYear = years[i + 1]
    const timerId = setTimeout(() => {
      if (sessionId !== raceSessionId) {
        return
      }
      updateBarRaceYear(chartInstance, props.chartData, nextYear, { showYear: true })
      currentYear.value = nextYear
    }, delay)
    raceTimerIds.push(timerId)
  }
}

function scheduleRaceAfterFullscreen() {
  clearAllTimers()
  resetToStartYear()

  const sessionId = raceSessionId
  raceDelayTimerId = setTimeout(() => {
    raceDelayTimerId = null
    if (sessionId !== raceSessionId) {
      return
    }
    startRace(sessionId)
  }, RACE_START_DELAY_MS)
}

async function handleFullscreenToggle() {
  const entering = !isFullscreen.value
  await toggleFullscreen()
  await nextTick()
  chartInstance?.resize()

  if (entering) {
    scheduleRaceAfterFullscreen()
  }
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

watch(isFullscreen, (fullscreen) => {
  if (!chartInstance || !props.chartData) {
    return
  }

  if (!fullscreen) {
    clearAllTimers()
    resetToStartYear()
  }
})

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
