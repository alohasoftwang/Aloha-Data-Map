<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="SOUTHEAST_ASIA_GDP_ENTITIES"
    featured-entity="INDONESIA"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchSoutheastAsiaGdp } from '../api/chartApi'
import { SOUTHEAST_ASIA_GDP_ENTITIES } from '../utils/southeastAsiaGdpEntities'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchSoutheastAsiaGdp()
    chartData.value = {
      ...data,
      title: 'Southeast Asia GDP Race',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load Southeast Asia GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
