<template>
  <div
    ref="stageRef"
    class="mobile-record-stage"
    :class="{ 'mobile-record-stage--fullscreen': isFullscreen }"
  >
    <div
      v-if="!isFullscreen"
      class="mobile-record-toolbar"
    >
      <FullscreenButton
        :is-fullscreen="isFullscreen"
        @toggle="handleFullscreenToggle"
      />
    </div>
    <div
      class="mobile-record-frame"
      :style="frameStyle"
    >
      <MobileBarRaceChart
        :chart-data="chartData"
        :loading="loading"
        :error="error"
        :is-fullscreen="isFullscreen"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import MobileBarRaceChart from '../../components/MobileBarRaceChart.vue'
import FullscreenButton from '../../components/FullscreenButton.vue'
import { useFullscreen } from '../../composables/useFullscreen'
import { fetchWorldGdpTop10 } from '../../api/chartApi'

const FRAME_W = 1080
const FRAME_H = 1920

const chartData = ref(null)
const loading = ref(true)
const error = ref('')
const stageRef = ref(null)
const scale = ref(1)

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(stageRef, () => {
  nextTick(() => {
    updateScale()
    window.dispatchEvent(new Event('resize'))
  })
})

const frameStyle = computed(() => ({
  width: `${FRAME_W}px`,
  height: `${FRAME_H}px`,
  transform: `scale(${scale.value})`
}))

function updateScale() {
  const el = stageRef.value
  if (!el) return
  const { clientWidth: w, clientHeight: h } = el
  if (!w || !h) return
  // 全屏 / 预览：内容始终落在 1080×1920 逻辑画布内，等比缩放到可视区域
  scale.value = Math.min(w / FRAME_W, h / FRAME_H)
}

async function handleFullscreenToggle() {
  await toggleFullscreen()
  await nextTick()
  updateScale()
  window.dispatchEvent(new Event('resize'))
}

let resizeObserver = null

onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)
  if (stageRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(stageRef.value)
  }

  try {
    chartData.value = await fetchWorldGdpTop10()
  } catch (e) {
    error.value = 'Failed to load World GDP data'
    console.error(e)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
