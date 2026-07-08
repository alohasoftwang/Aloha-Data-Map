<template>
  <GdpCurveRaceChart
    :chart-data="chartData"
    :loading="loading"
    :error="error"
    :entities="worldTop15Entities"
    featured-entity="UNITED STATES"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import GdpCurveRaceChart from '../components/GdpCurveRaceChart.vue'
import { fetchWorldGdpTop10 } from '../api/chartApi'
import { listEntities } from '../utils/gdpDualCurveData'

const WORLD_TOP15_COUNT = 15

const chartData = ref(null)
const worldTop15Entities = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await fetchWorldGdpTop10()
    worldTop15Entities.value = listEntities(data)
      .slice(0, WORLD_TOP15_COUNT)
      .map((item) => item.name)
    chartData.value = {
      ...data,
      title: 'TOP 15 WORLD GDP',
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
