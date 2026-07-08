<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="SOUTH_ASIA_GDP_ENTITIES"
    featured-entity="INDIA"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchSouthAsiaGdp } from '../api/chartApi'
import { SOUTH_ASIA_GDP_ENTITIES } from '../utils/southAsiaGdpEntities'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchSouthAsiaGdp()
    chartData.value = {
      ...data,
      title: 'SOUTH ASIA GDP',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load South Asia GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
