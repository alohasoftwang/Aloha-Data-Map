<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchSouthAsiaGdp } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    chartData.value = await fetchSouthAsiaGdp()
  } catch (e) {
    error.value = 'Failed to load South Asia GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
