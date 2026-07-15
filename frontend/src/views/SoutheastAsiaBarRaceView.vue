<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchSoutheastAsiaGdp } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchSoutheastAsiaGdp()
    chartData.value = {
      ...data,
      title: 'Southeast Asia GDP Race'
    }
  } catch (e) {
    error.value = 'Failed to load Southeast Asia GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
