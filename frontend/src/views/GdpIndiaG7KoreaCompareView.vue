<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="indiaG7KoreaEntities"
    featured-entity="INDIA"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'

const indiaG7KoreaEntities = [
  'INDIA',
  'CANADA',
  'FRANCE',
  'GERMANY',
  'ITALY',
  'JAPAN',
  'UNITED KINGDOM',
  'SOUTH KOREA'
]

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    chartData.value = {
      ...data,
      title: 'INDIA vs G7 (ex-US) · KOREA GDP RACE',
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
