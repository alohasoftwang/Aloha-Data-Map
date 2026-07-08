<template>
  <div ref="panelRef" class="chart-panel chart-panel--treemap">
    <header v-if="title" class="chart-header">
      <div class="chart-header-text oswald-chart">
        <h2 class="chart-title">
          {{ title }}<span v-if="unit" class="chart-unit">{{ unit }}</span>
        </h2>
      </div>
      <div v-if="!isFullscreen" class="chart-header-actions">
        <FullscreenButton
          :is-fullscreen="isFullscreen"
          @toggle="handleFullscreenToggle"
        />
      </div>
    </header>

    <div v-if="!loading && !error && yearRange" class="treemap-toolbar">
      <label class="treemap-year-picker">
        <span>Year</span>
        <input
          v-model.number="selectedYear"
          class="treemap-year-slider"
          type="range"
          :min="yearRange.min"
          :max="yearRange.max"
          step="1"
        />
        <input
          v-model.number="selectedYear"
          class="treemap-year-input"
          type="number"
          :min="yearRange.min"
          :max="yearRange.max"
        />
      </label>
      <p v-if="selectedYear" class="treemap-year-display">{{ selectedYear }}</p>
    </div>

    <div v-if="loading" class="chart-state">Loading...</div>
    <div v-else-if="error" class="chart-state error">{{ error }}</div>
    <div v-show="!loading && !error" class="treemap-body">
      <div ref="chartRef" class="chart-container treemap-container"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { buildGdpTreemapOption, refreshTreemapOverlays } from '../utils/buildGdpTreemapOption'
import { useFullscreen } from '../composables/useFullscreen'
import FullscreenButton from './FullscreenButton.vue'

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
  topN: {
    type: Number,
    default: 10
  }
})

const chartRef = ref(null)
const panelRef = ref(null)
const title = ref('')
const unit = ref('')
const selectedYear = ref(null)

let chartInstance = null
let chartResizeObserver = null
let chartFinishedHandler = null

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef, () => {
  nextTick(() => {
    chartInstance?.resize()
    scheduleOverlayRefresh()
  })
})

const yearRange = computed(() => {
  if (!props.chartData) {
    return null
  }
  return {
    min: props.chartData.startYear,
    max: props.chartData.endYear
  }
})

function clampYear(year) {
  if (!yearRange.value) {
    return year
  }
  return Math.min(yearRange.value.max, Math.max(yearRange.value.min, year))
}

function scheduleOverlayRefresh() {
  if (!chartInstance || !props.chartData || selectedYear.value == null) {
    return
  }
  requestAnimationFrame(() => {
    refreshTreemapOverlays(
      chartInstance,
      props.chartData,
      selectedYear.value,
      props.topN
    )
  })
}

function bindChartFinished() {
  if (!chartInstance) {
    return
  }
  if (chartFinishedHandler) {
    chartInstance.off('finished', chartFinishedHandler)
  }
  chartFinishedHandler = () => scheduleOverlayRefresh()
  chartInstance.on('finished', chartFinishedHandler)
}

function renderChart() {
  if (props.loading || props.error || !props.chartData || !chartRef.value) {
    return
  }

  title.value = props.chartData.title ?? 'GDP TREEMAP'
  unit.value = props.chartData.unit || ''

  if (selectedYear.value == null) {
    selectedYear.value = props.chartData.endYear
  } else {
    selectedYear.value = clampYear(selectedYear.value)
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(
    buildGdpTreemapOption(props.chartData, selectedYear.value, {
      topN: props.topN
    }),
    true
  )
  bindChartFinished()
  nextTick(() => {
    chartInstance?.resize()
    scheduleOverlayRefresh()
  })
}

async function handleFullscreenToggle() {
  await toggleFullscreen()
  await nextTick()
  requestAnimationFrame(() => {
    chartInstance?.resize()
    scheduleOverlayRefresh()
  })
}

function handleResize() {
  chartInstance?.resize()
  scheduleOverlayRefresh()
}

watch(selectedYear, (year) => {
  if (year == null || !chartInstance || !props.chartData) {
    return
  }
  const clamped = clampYear(year)
  if (clamped !== year) {
    selectedYear.value = clamped
    return
  }
  chartInstance.setOption(
    buildGdpTreemapOption(props.chartData, clamped, { topN: props.topN }),
    true
  )
  scheduleOverlayRefresh()
})

watch(
  () => [props.chartData, props.loading, props.error, props.topN],
  () => {
    nextTick(() => renderChart())
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)

  if (chartRef.value && typeof ResizeObserver !== 'undefined') {
    chartResizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
      scheduleOverlayRefresh()
    })
    chartResizeObserver.observe(chartRef.value)
    if (panelRef.value) {
      chartResizeObserver.observe(panelRef.value)
    }
  }

  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance && chartFinishedHandler) {
    chartInstance.off('finished', chartFinishedHandler)
  }
  chartFinishedHandler = null
  chartResizeObserver?.disconnect()
  chartResizeObserver = null
  chartInstance?.dispose()
  chartInstance = null
})
</script>
