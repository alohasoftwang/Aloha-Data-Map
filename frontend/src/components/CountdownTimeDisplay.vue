<template>
  <div
    class="countdown-time-only"
    :class="`countdown-time-only--${theme}`"
    :style="timeStyle"
    aria-live="polite"
  >
    <span class="countdown-time-seg countdown-time-seg--hours">{{ parts.hours }}</span>
    <span class="countdown-time-colon">:</span>
    <span class="countdown-time-seg">{{ parts.minutes }}</span>
    <span class="countdown-time-colon">:</span>
    <span class="countdown-time-seg">{{ parts.seconds }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  parts: {
    type: Object,
    required: true
  },
  theme: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'black-white', 'white-black'].includes(v)
  },
  fontFamily: {
    type: String,
    required: true
  }
})

const timeStyle = computed(() => ({
  fontFamily: props.fontFamily
}))
</script>

<style scoped>
.countdown-time-only {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  margin: 0;
  width: 9ch;
  font-size: clamp(48px, 12vw, 96px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  white-space: nowrap;
}

.countdown-time-only--black-white {
  color: #fff;
}

.countdown-time-only--white-black {
  color: #000;
}

.countdown-time-only--default {
  color: var(--gold);
}

.countdown-time-seg {
  display: inline-block;
  text-align: center;
  width: 2ch;
  min-width: 2ch;
  flex-shrink: 0;
  font-family: inherit;
}

.countdown-time-seg--hours {
  width: 3ch;
  min-width: 3ch;
}

.countdown-time-colon {
  display: inline-block;
  width: 1ch;
  min-width: 1ch;
  text-align: center;
  flex-shrink: 0;
  font-family: inherit;
}

.countdown-time-only--black-white .countdown-time-colon {
  color: rgba(255, 255, 255, 0.45);
}

.countdown-time-only--white-black .countdown-time-colon {
  color: rgba(0, 0, 0, 0.35);
}

.countdown-time-only--default .countdown-time-colon {
  color: rgba(217, 192, 138, 0.45);
}
</style>
