<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="asiaTop15Entities"
    featured-entity="CHINA"
  >
    <template #actions>
      <ChartRefreshButton :loading="refreshing" @click="handleRefresh" />
    </template>
  </GdpCurveRaceChart>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import ChartRefreshButton from '../components/ChartRefreshButton.vue'
import { fetchAsiaGdp } from '../api/chartApi'
import { useChartJsonRefresh } from '../composables/useChartJsonRefresh'
import { listEntities } from '../utils/gdpDualCurveData'

const ASIA_TOP15_COUNT = 15

const chartData = ref(null)
const asiaTop15Entities = ref([])
const loading = ref(true)
const error = ref('')

async function loadData({ cacheBust = false } = {}) {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAsiaGdp({ cacheBust })
    asiaTop15Entities.value = listEntities(data)
      .slice(0, ASIA_TOP15_COUNT)
      .map((item) => item.name)
    chartData.value = {
      ...data,
      title: 'TOP 15 ASIA GDP',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load Asia GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const { refreshing, handleRefresh } = useChartJsonRefresh('asia-gdp-top15', loadData)

onMounted(() => loadData())
</script>
