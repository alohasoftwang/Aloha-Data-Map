<template>
  <BarRaceChart :chart-data="chartData" :loading="loading" :error="error" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BarRaceChart from '../components/BarRaceChart.vue'
import { fetchAsiaGdp } from '../api/chartApi'

const chartData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    chartData.value = await fetchAsiaGdp()
  } catch (e) {
    error.value = '无法加载亚洲GDP数据'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
