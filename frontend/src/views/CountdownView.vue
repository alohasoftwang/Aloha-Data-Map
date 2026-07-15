<template>
  <div
    ref="panelRef"
    class="countdown-page"
    :class="[
      `countdown-page--${theme}`,
      { 'countdown-page--fullscreen': isFullscreen }
    ]"
  >
    <header v-if="!isFullscreen" class="countdown-header oswald-chart">
      <h1 class="countdown-title">{{ title }}</h1>
      <p v-if="subtitle" class="countdown-subtitle">{{ subtitle }}</p>
    </header>

    <section
      v-if="interactive && !isFullscreen"
      class="countdown-setup"
      :class="`countdown-setup--${theme}`"
    >
      <div class="countdown-setup-fields">
        <label class="countdown-setup-field">
          <span class="countdown-setup-label">时</span>
          <input
            v-model.number="inputHours"
            class="countdown-setup-input countdown-setup-input--num"
            type="number"
            min="0"
            max="999"
            step="1"
          />
        </label>
        <label class="countdown-setup-field">
          <span class="countdown-setup-label">分</span>
          <input
            v-model.number="inputMinutes"
            class="countdown-setup-input countdown-setup-input--num"
            type="number"
            min="0"
            max="59"
            step="1"
          />
        </label>
        <label class="countdown-setup-field">
          <span class="countdown-setup-label">秒</span>
          <input
            v-model.number="inputSeconds"
            class="countdown-setup-input countdown-setup-input--num"
            type="number"
            min="0"
            max="59"
            step="1"
          />
        </label>
      </div>
      <div class="countdown-setup-actions">
        <button
          type="button"
          class="countdown-setup-btn"
          @click="startCountdown"
        >
          开始倒数
        </button>
        <FullscreenButton
          class="countdown-fullscreen-btn"
          :is-fullscreen="isFullscreen"
          @toggle="toggleFullscreen"
        />
      </div>
      <p v-if="setupError" class="countdown-setup-error">{{ setupError }}</p>

      <div class="countdown-font-picker">
        <span class="countdown-setup-label">字体</span>
        <div class="countdown-font-options">
          <button
            v-for="font in COUNTDOWN_FONTS"
            :key="font.id"
            type="button"
            class="countdown-font-option"
            :class="{ 'countdown-font-option--active': selectedFontId === font.id }"
            :style="{ fontFamily: font.family }"
            @click="selectedFontId = font.id"
          >
            <span class="countdown-font-name">{{ font.label }}</span>
            <span class="countdown-font-preview">00:00</span>
          </button>
        </div>
      </div>
    </section>

    <ul
      v-if="interactive"
      class="countdown-list countdown-list--interactive"
      :class="{ 'countdown-list--fullscreen': isFullscreen }"
    >
      <li class="countdown-card countdown-card--interactive">
        <CountdownCard
          :event="activeEvent ?? placeholderEvent"
          :theme="theme"
          :minimal="true"
          :font-family="selectedFontFamily"
          :preview-parts="activeEvent ? null : previewParts"
        />
      </li>
    </ul>

    <ul
      v-else
      class="countdown-list"
    >
      <li
        v-for="event in displayEvents"
        :key="event.id"
        class="countdown-card"
      >
        <CountdownCard :event="event" :theme="theme" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { COUNTDOWN_EVENTS } from '../data/countdownEvents.js'
import {
  COUNTDOWN_FONTS,
  DEFAULT_COUNTDOWN_FONT_ID,
  getCountdownFontById
} from '../data/countdownFonts.js'
import CountdownCard from '../components/CountdownCard.vue'
import FullscreenButton from '../components/FullscreenButton.vue'
import { durationToMs, formatDuration, getPreviewClockParts } from '../composables/useCountdown.js'
import { useFullscreen } from '../composables/useFullscreen.js'
import '../styles/countdown-fonts.css'

const FULLSCREEN_START_DELAY_MS = 30_000

const props = defineProps({
  theme: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'black-white', 'white-black'].includes(v)
  },
  interactive: {
    type: Boolean,
    default: false
  }
})

const panelRef = ref(null)
const inputHours = ref(0)
const inputMinutes = ref(5)
const inputSeconds = ref(0)
const activeEvent = ref(null)
const setupError = ref('')
const selectedFontId = ref(DEFAULT_COUNTDOWN_FONT_ID)

let fullscreenDelayTimerId = null

function clearFullscreenDelay() {
  if (fullscreenDelayTimerId !== null) {
    clearTimeout(fullscreenDelayTimerId)
    fullscreenDelayTimerId = null
  }
}

function onFullscreenChange() {
  if (isFullscreen.value) {
    clearFullscreenDelay()
    activeEvent.value = null
    fullscreenDelayTimerId = setTimeout(() => {
      fullscreenDelayTimerId = null
      if (document.fullscreenElement === panelRef.value) {
        startCountdown()
      }
    }, FULLSCREEN_START_DELAY_MS)
  } else {
    clearFullscreenDelay()
  }
}

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef, onFullscreenChange)

onBeforeUnmount(clearFullscreenDelay)

const selectedFontFamily = computed(
  () => getCountdownFontById(selectedFontId.value).family
)

const previewParts = computed(() =>
  getPreviewClockParts(inputHours.value, inputMinutes.value, inputSeconds.value)
)

const placeholderEvent = { id: 'preview', label: '', target: '' }

const title = computed(() => {
  if (props.theme === 'black-white') return '黑底白字'
  if (props.theme === 'white-black') return '白底黑字'
  return 'COUNTDOWN'
})

const subtitle = computed(() => {
  if (props.interactive) return '设置小时、分、秒后开始倒数'
  return '时间倒数 · 本地时区'
})

const displayEvents = computed(() => {
  if (props.interactive) {
    return activeEvent.value ? [activeEvent.value] : []
  }
  return COUNTDOWN_EVENTS
})

function startCountdown() {
  setupError.value = ''

  const hours = Math.max(0, Math.floor(Number(inputHours.value) || 0))
  const minutes = Math.max(0, Math.min(59, Math.floor(Number(inputMinutes.value) || 0)))
  const seconds = Math.max(0, Math.min(59, Math.floor(Number(inputSeconds.value) || 0)))
  const totalMs = durationToMs(hours, minutes, seconds)

  if (totalMs <= 0) {
    setupError.value = '请设置大于 0 的倒数时长'
    return
  }

  const durationText = formatDuration(hours, minutes, seconds)
  activeEvent.value = {
    id: `custom-${Date.now()}`,
    label: '倒数中',
    subtitle: `设定时长 ${durationText}`,
    target: new Date(Date.now() + totalMs).toISOString()
  }
}
</script>

<style scoped>
.countdown-page {
  height: 100%;
  min-height: 100%;
  overflow: auto;
  padding: 28px 32px 48px;
  display: flex;
  flex-direction: column;
}

.countdown-page--default {
  background: transparent;
}

.countdown-page--black-white {
  background: #000;
  color: #fff;
}

.countdown-page--white-black {
  background: #fff;
  color: #000;
}

.countdown-header {
  margin-bottom: 36px;
}

.countdown-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.countdown-page--default .countdown-title {
  color: var(--pearl);
}

.countdown-page--black-white .countdown-title,
.countdown-page--black-white .countdown-subtitle {
  color: #fff;
}

.countdown-page--white-black .countdown-title,
.countdown-page--white-black .countdown-subtitle {
  color: #000;
}

.countdown-subtitle {
  margin-top: 8px;
  font-size: 14px;
}

.countdown-page--default .countdown-subtitle {
  color: var(--mist);
}

.countdown-page--black-white .countdown-subtitle {
  color: rgba(255, 255, 255, 0.72);
}

.countdown-page--white-black .countdown-subtitle {
  color: rgba(0, 0, 0, 0.62);
}

.countdown-setup {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  max-width: 720px;
  margin-bottom: 32px;
  padding: 24px 28px;
  border-radius: 12px;
}

.countdown-setup--black-white {
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.countdown-setup--white-black {
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.countdown-setup-fields {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.countdown-setup-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 72px;
  max-width: 120px;
}

.countdown-setup-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.countdown-setup--black-white .countdown-setup-label {
  color: rgba(255, 255, 255, 0.85);
}

.countdown-setup--white-black .countdown-setup-label {
  color: rgba(0, 0, 0, 0.75);
}

.countdown-setup-input {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
}

.countdown-setup-input--num {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.countdown-setup--black-white .countdown-setup-input {
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  color-scheme: dark;
}

.countdown-setup--white-black .countdown-setup-input {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: #000;
  color-scheme: light;
}

.countdown-setup-input:focus {
  outline: none;
}

.countdown-setup--black-white .countdown-setup-input:focus {
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
}

.countdown-setup--white-black .countdown-setup-input:focus {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.countdown-setup-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.countdown-setup-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.countdown-setup-btn:hover {
  opacity: 0.88;
}

.countdown-setup--black-white .countdown-setup-btn {
  background: #fff;
  color: #000;
}

.countdown-setup--white-black .countdown-setup-btn {
  background: #000;
  color: #fff;
}

.countdown-setup--black-white :deep(.countdown-fullscreen-btn.fullscreen-btn) {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.countdown-setup--black-white :deep(.countdown-fullscreen-btn.fullscreen-btn:hover) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.countdown-setup--white-black :deep(.countdown-fullscreen-btn.fullscreen-btn) {
  border-color: rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.85);
}

.countdown-setup--white-black :deep(.countdown-fullscreen-btn.fullscreen-btn:hover) {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.35);
  color: #000;
}

.countdown-setup-error {
  width: 100%;
  margin: 0;
  font-size: 13px;
  color: #ff6b6b;
}

.countdown-font-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.countdown-font-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.countdown-font-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 96px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.countdown-setup--black-white .countdown-font-option {
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
}

.countdown-setup--white-black .countdown-font-option {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.16);
  color: #000;
}

.countdown-setup--black-white .countdown-font-option--active {
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.countdown-setup--white-black .countdown-font-option--active {
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
}

.countdown-font-name {
  font-size: 11px;
  font-weight: 600;
  font-family: 'Segoe UI', sans-serif;
  letter-spacing: 0.02em;
}

.countdown-font-preview {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.countdown-list {
  list-style: none;
  display: grid;
  gap: 24px;
  max-width: 720px;
}

.countdown-list--interactive {
  position: relative;
  flex: 1;
  display: block;
  max-width: none;
  width: 100%;
  min-height: 280px;
  margin: 0;
  padding: 0;
}

.countdown-card {
  margin: 0;
}

.countdown-card--interactive {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.countdown-page--fullscreen {
  padding: 0;
  overflow: hidden;
  min-height: 100%;
  height: 100%;
}

.countdown-list--fullscreen {
  flex: 1;
  min-height: 100%;
  height: 100%;
}

.countdown-page--fullscreen :deep(.countdown-time-only) {
  font-size: clamp(96px, 22vw, 220px);
}
</style>
