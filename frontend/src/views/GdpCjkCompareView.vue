<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="cjkiEntities"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'

const cjkiEntities = ['CHINA', 'JAPAN', 'SOUTH KOREA', 'INDIA']

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = {
      ...data,
      title: 'CHINA · JAPAN · KOREA · INDIA GDP RACE',
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
