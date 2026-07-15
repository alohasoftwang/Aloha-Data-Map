<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'
import {
  CJK_ENTITIES,
  filterBarRaceChartData
} from '../utils/filterBarRaceChartData'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = filterBarRaceChartData(data, CJK_ENTITIES, {
      title: 'China vs Japan vs Korea'
    })
  } catch (e) {
    error.value = 'Failed to load GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
