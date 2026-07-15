<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="africaTop15Entities"
    featured-entity="NIGERIA"
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
import { fetchAfricaGdp } from '../api/chartApi'
import { useChartJsonRefresh } from '../composables/useChartJsonRefresh'
import { listEntities } from '../utils/gdpDualCurveData'

const AFRICA_TOP15_COUNT = 15

const chartData = ref(null)
const africaTop15Entities = ref([])
const loading = ref(true)
const error = ref('')

async function loadData({ cacheBust = false } = {}) {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAfricaGdp({ cacheBust })
    africaTop15Entities.value = listEntities(data)
      .slice(0, AFRICA_TOP15_COUNT)
      .map((item) => item.name)
    chartData.value = {
      ...data,
      title: 'TOP 15 AFRICA GDP',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load Africa GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const { refreshing, handleRefresh } = useChartJsonRefresh('africa-gdp-top15', loadData)

onMounted(() => loadData())
</script>
