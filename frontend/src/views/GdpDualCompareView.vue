<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    editable
    initial-entity-a="CHINA"
    initial-entity-b="UNITED STATES"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = {
      ...data,
      title: 'TWO-ENTITY GDP CURVE RACE',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
