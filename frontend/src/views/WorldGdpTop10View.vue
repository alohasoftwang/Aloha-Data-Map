<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    chartData.value = await fetchWorldGdpTop10()
  } catch (e) {
    error.value = 'Failed to load World GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
