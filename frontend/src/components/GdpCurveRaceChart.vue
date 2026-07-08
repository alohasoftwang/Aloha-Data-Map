<template>
  <div ref="panelRef" class="chart-panel">
    <header v-if="title" class="chart-header">
      <div class="chart-header-text oswald-chart">
        <h2 class="chart-title">
          {{ title }}<span v-if="unit" class="chart-unit">{{ unit }}</span>
        </h2>
        <p v-if="currentYear" class="chart-subtitle">{{ currentYear }}</p>
      </div>
      <div v-if="!isFullscreen" class="chart-header-actions">
        <FullscreenButton
          :is-fullscreen="isFullscreen"
          @toggle="handleFullscreenToggle"
        />
      </div>
    </header>

    <div v-if="editable && entityOptions.length" class="dual-curve-toolbar">
      <label class="dual-curve-picker">
        <span>Entity A</span>
        <select :value="entityA" class="dual-curve-select" @change="onEntityAChange">
          <option v-for="item in entityOptions" :key="`a-${item.name}`" :value="item.name">
            {{ item.name }}
          </option>
        </select>
      </label>
      <span class="dual-curve-vs">VS</span>
      <label class="dual-curve-picker">
        <span>Entity B</span>
        <select :value="entityB" class="dual-curve-select" @change="onEntityBChange">
          <option v-for="item in entityOptions" :key="`b-${item.name}`" :value="item.name">
            {{ item.name }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="chart-state">Loading...</div>
    <div v-else-if="error" class="chart-state error">{{ error }}</div>
    <div v-show="!loading && !error" ref="chartRef" class="chart-container dual-curve-container"></div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { buildGdpCurveOption, updateGdpCurveFrame } from '../utils/buildGdpCurveOption'
import {
  interpolateDisplayYear,
  listEntities,
  resolveEntityMeta
} from '../utils/gdpDualCurveData'
import { useFullscreen } from '../composables/useFullscreen'
import FullscreenButton from './FullscreenButton.vue'

const RACE_START_DELAY_MS = 30_000
const INITIAL_RACE_DELAY_MS = 800
const RACE_SPEED = 1.65
const FRAMES_PER_YEAR = 28

const props = defineProps({
  chartData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  entities: {
    type: Array,
    default: null
  },
  editable: {
    type: Boolean,
    default: false
  },
  initialEntityA: {
    type: String,
    default: 'CHINA'
  },
  initialEntityB: {
    type: String,
    default: 'UNITED STATES'
  },
  featuredEntity: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:entityA', 'update:entityB'])

const chartRef = ref(null)
const panelRef = ref(null)
const title = ref('')
const unit = ref('')
const currentYear = ref(null)
const entityA = ref(props.initialEntityA)
const entityB = ref(props.initialEntityB)

let chartInstance = null
let raceTimerIds = []
let raceDelayTimerId = null
let raceSessionId = 0
let chartResizeObserver = null
let hasStartedInitialRace = false

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef, () => {
  nextTick(() => chartInstance?.resize())
})

const entityOptions = computed(() => {
  if (!props.chartData) {
    return []
  }
  return listEntities(props.chartData)
})

const activeEntities = computed(() => {
  if (props.entities?.length) {
    return [...props.entities]
  }
  return [entityA.value, entityB.value]
})

const yearDurationMs = computed(() => {
  const base = props.chartData
    ? resolveEntityMeta(props.chartData).updateFrequency
    : 2250
  return Math.max(900, Math.round(base / RACE_SPEED))
})

function clearRaceTimers() {
  raceTimerIds.forEach((id) => clearTimeout(id))
  raceTimerIds = []
}

function clearAllTimers() {
  raceSessionId += 1
  clearRaceTimers()
  if (raceDelayTimerId !== null) {
    clearTimeout(raceDelayTimerId)
    raceDelayTimerId = null
  }
}

function resetToStartYear() {
  if (!chartInstance || !props.chartData) {
    return
  }

  currentYear.value = props.chartData.startYear
  chartInstance.clear()
  const curveOptions = {
    showYear: false,
    animationDuration: yearDurationMs.value,
    featuredEntity: props.featuredEntity || null
  }
  chartInstance.setOption(
    buildGdpCurveOption(
      props.chartData,
      activeEntities.value,
      props.chartData.startYear,
      curveOptions
    ),
    true
  )
  if (props.featuredEntity) {
    nextTick(() => {
      updateGdpCurveFrame(chartInstance, props.chartData, activeEntities.value, {
        ...curveOptions,
        displayYear: props.chartData.startYear,
        progress: 1
      })
    })
  }
}

function startRace(sessionId) {
  if (!chartInstance || !props.chartData || sessionId !== raceSessionId) {
    return
  }

  clearRaceTimers()

  const { years, startYear } = props.chartData
  const startIndex = years.indexOf(startYear)
  if (startIndex < 0) {
    return
  }

  const entities = activeEntities.value
  const yearDuration = yearDurationMs.value
  const frameDuration = Math.max(12, Math.round(yearDuration / FRAMES_PER_YEAR))
  let elapsed = 0

  for (let i = startIndex; i < years.length - 1; i++) {
    const fromYear = years[i]
    const toYear = years[i + 1]

    for (let frame = 1; frame <= FRAMES_PER_YEAR; frame++) {
      const progress = frame / FRAMES_PER_YEAR
      const delay = elapsed + frame * frameDuration
      const timerId = setTimeout(() => {
        if (sessionId !== raceSessionId) {
          return
        }

        const displayYear = interpolateDisplayYear(fromYear, toYear, progress)
        updateGdpCurveFrame(chartInstance, props.chartData, entities, {
          fromYear,
          toYear,
          progress,
          displayYear,
          showYear: true,
          animationDuration: frameDuration,
          animationEasing: 'linear',
          featuredEntity: props.featuredEntity || null
        })
        currentYear.value = displayYear
      }, delay)
      raceTimerIds.push(timerId)
    }

    elapsed += yearDuration
  }
}

function scheduleRace(delayMs) {
  clearAllTimers()
  resetToStartYear()

  const sessionId = raceSessionId
  raceDelayTimerId = setTimeout(() => {
    raceDelayTimerId = null
    if (sessionId !== raceSessionId) {
      return
    }
    startRace(sessionId)
  }, delayMs)
}

function ensureDistinctEntities() {
  if (props.entities?.length || !props.editable) {
    return
  }

  const options = entityOptions.value
  if (!options.length) {
    return
  }

  const names = new Set(options.map((item) => item.name))
  if (!names.has(entityA.value)) {
    entityA.value = options[0].name
  }
  if (!names.has(entityB.value) || entityB.value === entityA.value) {
    const fallback = options.find((item) => item.name !== entityA.value)
    if (fallback) {
      entityB.value = fallback.name
    }
  }
}

function onEntityAChange(event) {
  entityA.value = event.target.value
  emit('update:entityA', entityA.value)
  if (entityA.value === entityB.value) {
    const fallback = entityOptions.value.find((item) => item.name !== entityA.value)
    if (fallback) {
      entityB.value = fallback.name
      emit('update:entityB', entityB.value)
    }
  }
  scheduleRace(INITIAL_RACE_DELAY_MS)
}

function onEntityBChange(event) {
  entityB.value = event.target.value
  emit('update:entityB', entityB.value)
  if (entityB.value === entityA.value) {
    const fallback = entityOptions.value.find((item) => item.name !== entityB.value)
    if (fallback) {
      entityA.value = fallback.name
      emit('update:entityA', entityA.value)
    }
  }
  scheduleRace(INITIAL_RACE_DELAY_MS)
}

async function handleFullscreenToggle() {
  const entering = !isFullscreen.value
  await toggleFullscreen()
  await nextTick()
  chartInstance?.resize()

  if (entering) {
    scheduleRace(RACE_START_DELAY_MS)
  }
}

async function renderChart() {
  if (props.loading || props.error || !props.chartData) {
    return
  }

  await nextTick()

  if (!chartRef.value) {
    return
  }

  title.value = props.chartData.title ?? 'GDP CURVE RACE'
  unit.value = props.chartData.unit || ''
  ensureDistinctEntities()

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  clearAllTimers()
  resetToStartYear()

  if (!hasStartedInitialRace) {
    hasStartedInitialRace = true
    scheduleRace(INITIAL_RACE_DELAY_MS)
  }

  nextTick(() => chartInstance?.resize())
}

function handleResize() {
  chartInstance?.resize()
}

watch(isFullscreen, (fullscreen) => {
  if (!chartInstance || !props.chartData) {
    return
  }

  if (!fullscreen) {
    clearAllTimers()
    resetToStartYear()
  }
})

watch(
  () => [props.chartData, props.loading, props.error, props.entities],
  () => {
    renderChart()
  },
  { deep: true }
)

watch([entityA, entityB], () => {
  if (!props.editable || props.entities?.length) {
    return
  }
  scheduleRace(INITIAL_RACE_DELAY_MS)
})

onMounted(() => {
  window.addEventListener('resize', handleResize)

  if (chartRef.value && typeof ResizeObserver !== 'undefined') {
    chartResizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    chartResizeObserver.observe(chartRef.value)
  }

  renderChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartResizeObserver?.disconnect()
  chartResizeObserver = null
  clearAllTimers()
  chartInstance?.dispose()
  chartInstance = null
})
</script>
