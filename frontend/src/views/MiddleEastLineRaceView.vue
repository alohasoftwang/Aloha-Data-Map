<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="MIDDLE_EAST_GDP_ENTITIES"
    featured-entity="SAUDI ARABIA"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchMiddleEastGdp } from '../api/chartApi'
import { MIDDLE_EAST_GDP_ENTITIES } from '../utils/middleEastGdpEntities'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchMiddleEastGdp()
    chartData.value = {
      ...data,
      title: 'Middle East GDP Race',
      unit: data.unit ?? '(IN MILLION $)'
    }
  } catch (e) {
    error.value = 'Failed to load Middle East GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
