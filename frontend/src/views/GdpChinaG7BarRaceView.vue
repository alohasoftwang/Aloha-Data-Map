<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'
import {
  CHINA_G7_ENTITIES,
  filterBarRaceChartData
} from '../utils/filterBarRaceChartData'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = filterBarRaceChartData(data, CHINA_G7_ENTITIES, {
      title: 'CHINA vs G7 GDP RACE'
    })
  } catch (e) {
    error.value = 'Failed to load GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
