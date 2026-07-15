<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" :grid-left="220">
    <template #actions>
      <ChartRefreshButton :loading="refreshing" @click="handleRefresh" />
    </template>
  </BarRaceChart>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import ChartRefreshButton from '../components/ChartRefreshButton.vue'
import { fetchEuropeGdp } from '../api/chartApi'
import { useChartJsonRefresh } from '../composables/useChartJsonRefresh'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

async function loadData({ cacheBust = false } = {}) {
  loading.value = true
  error.value = ''
  try {
    chartData.value = await fetchEuropeGdp({ cacheBust })
  } catch (e) {
    error.value = 'Failed to load Europe GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const { refreshing, handleRefresh } = useChartJsonRefresh('europe-gdp-top15', loadData)

onMounted(() => loadData())
</script>
