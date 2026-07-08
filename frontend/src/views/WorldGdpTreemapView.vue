<template>
  <WorldGdpTreemapChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :top-n="10"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import WorldGdpTreemapChart from '../components/WorldGdpTreemapChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = {
      ...data,
      title: 'TOP 10 WORLD GDP',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load World GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
