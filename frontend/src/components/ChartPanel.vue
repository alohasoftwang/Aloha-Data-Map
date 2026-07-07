<template>
  <div class="chart-panel">
    <header v-if="title" class="chart-header">
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </header>
    <div v-if="loading" class="chart-state">加载中...</div>
    <div v-else-if="error" class="chart-state error">{{ error }}</div>
    <div v-else ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { buildChartOption } from '../utils/buildChartOption'

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
let chartInstance = null

const title = ref('')
const subtitle = ref('')

function renderChart() {
  if (!chartRef.value || !props.chartData) {
    return
  }

  title.value = props.chartData.title
  subtitle.value = props.chartData.subtitle

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(buildChartOption(props.chartData), true)
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  () => props.chartData,
  () => {
    if (!props.loading && !props.error) {
      renderChart()
    }
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
