<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="southAmericaTop15Entities"
    featured-entity="BRAZIL"
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
import { fetchSouthAmericaGdp } from '../api/chartApi'
import { useChartJsonRefresh } from '../composables/useChartJsonRefresh'
import { listEntities } from '../utils/gdpDualCurveData'

const SOUTH_AMERICA_TOP15_COUNT = 15

const chartData = ref(null)
const southAmericaTop15Entities = ref([])
const loading = ref(true)
const error = ref('')

async function loadData({ cacheBust = false } = {}) {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchSouthAmericaGdp({ cacheBust })
    southAmericaTop15Entities.value = listEntities(data)
      .slice(0, SOUTH_AMERICA_TOP15_COUNT)
      .map((item) => item.name)
    chartData.value = {
      ...data,
      title: 'SOUTH AMERICA GDP',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load South America GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const { refreshing, handleRefresh } = useChartJsonRefresh('south-america-gdp', loadData)

onMounted(() => loadData())
</script>
