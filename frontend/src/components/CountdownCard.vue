<template>
  <article
    class="countdown-card-inner"
    :class="[
      `countdown-card-inner--${theme}`,
      { 'countdown-card-inner--minimal': minimal }
    ]"
  >
    <CountdownTimeDisplay
      v-if="minimal"
      :key="fontFamily"
      :parts="displayParts"
      :theme="theme"
      :font-family="fontFamily"
    />
    <template v-else>
      <header class="countdown-card-header">
        <h2 class="countdown-card-title">{{ event.label }}</h2>
        <p v-if="subtitleText" class="countdown-card-target">{{ subtitleText }}</p>
      </header>

      <div v-if="remaining.expired" class="countdown-expired">已到达</div>
      <div v-else class="countdown-digits oswald-chart">
        <div class="countdown-unit">
          <span class="countdown-value">{{ remaining.days }}</span>
          <span class="countdown-label">天</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-value">{{ pad2(remaining.hours) }}</span>
          <span class="countdown-label">时</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-value">{{ pad2(remaining.minutes) }}</span>
          <span class="countdown-label">分</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-unit">
          <span class="countdown-value">{{ pad2(remaining.seconds) }}</span>
          <span class="countdown-label">秒</span>
        </div>
      </div>
    </template>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import CountdownTimeDisplay from './CountdownTimeDisplay.vue'
import {
  formatTargetDate,
  getRemainingClockParts,
  pad2,
  useCountdown
} from '../composables/useCountdown.js'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  theme: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'black-white', 'white-black'].includes(v)
  },
  minimal: {
    type: Boolean,
    default: false
  },
  fontFamily: {
    type: String,
    default: "'Roboto Mono', monospace"
  },
  previewParts: {
    type: Object,
    default: null
  }
})

const target = computed(() => props.event.target)
const { remaining } = useCountdown(target)

const displayParts = computed(() => {
  if (props.previewParts) {
    return props.previewParts
  }
  return getRemainingClockParts(remaining.value)
})

const subtitleText = computed(() => {
  if (props.event.subtitle) {
    return props.event.subtitle
  }
  return formatTargetDate(props.event.target)
})
</script>

<style scoped>
.countdown-card-inner {
  padding: 28px 32px;
  border-radius: 12px;
}

.countdown-card-inner--minimal {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 0;
}

.countdown-card-inner--default {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  backdrop-filter: blur(20px) saturate(1.15);
}

.countdown-card-inner--black-white:not(.countdown-card-inner--minimal) {
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.countdown-card-inner--white-black:not(.countdown-card-inner--minimal) {
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.countdown-card-header {
  margin-bottom: 24px;
}

.countdown-card-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.countdown-card-inner--default .countdown-card-title {
  color: var(--pearl);
}

.countdown-card-inner--black-white .countdown-card-title {
  color: #fff;
}

.countdown-card-inner--white-black .countdown-card-title {
  color: #000;
}

.countdown-card-target {
  margin-top: 6px;
  font-size: 13px;
}

.countdown-card-inner--default .countdown-card-target {
  color: var(--mist);
}

.countdown-card-inner--black-white .countdown-card-target {
  color: rgba(255, 255, 255, 0.65);
}

.countdown-card-inner--white-black .countdown-card-target {
  color: rgba(0, 0, 0, 0.55);
}

.countdown-digits {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
}

.countdown-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.countdown-card-inner--default .countdown-value {
  color: var(--gold);
  text-shadow: 0 0 24px rgba(217, 192, 138, 0.25);
}

.countdown-card-inner--black-white .countdown-value {
  color: #fff;
}

.countdown-card-inner--white-black .countdown-value {
  color: #000;
}

.countdown-label {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.countdown-card-inner--default .countdown-label {
  color: var(--mist);
}

.countdown-card-inner--black-white .countdown-label {
  color: rgba(255, 255, 255, 0.72);
}

.countdown-card-inner--white-black .countdown-label {
  color: rgba(0, 0, 0, 0.55);
}

.countdown-sep {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  padding-bottom: 18px;
}

.countdown-card-inner--default .countdown-sep {
  color: rgba(217, 192, 138, 0.45);
}

.countdown-card-inner--black-white .countdown-sep {
  color: rgba(255, 255, 255, 0.45);
}

.countdown-card-inner--white-black .countdown-sep {
  color: rgba(0, 0, 0, 0.35);
}

.countdown-expired {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.countdown-card-inner--default .countdown-expired {
  color: var(--gold);
}

.countdown-card-inner--black-white .countdown-expired {
  color: #fff;
}

.countdown-card-inner--white-black .countdown-expired {
  color: #000;
}
</style>
