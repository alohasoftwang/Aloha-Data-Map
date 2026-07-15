<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" :grid-left="250" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchMiddleEastGdp } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchMiddleEastGdp()
    chartData.value = {
      ...data,
      title: 'Middle East GDP Race'
    }
  } catch (e) {
    error.value = 'Failed to load Middle East GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
