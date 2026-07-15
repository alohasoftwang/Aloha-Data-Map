import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue'

function parseTarget(target) {
  if (!target) {
    return 0
  }
  const ms = new Date(target).getTime()
  return Number.isFinite(ms) ? ms : 0
}

function resolveTarget(source) {
  const raw = typeof source === 'function' ? source() : unref(source)
  return parseTarget(raw)
}

function calcRemaining(targetMs, nowMs) {
  if (!Number.isFinite(targetMs) || targetMs <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  }

  const diff = targetMs - nowMs
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { expired: false, days, hours, minutes, seconds, totalMs: diff }
}

export function useCountdown(target) {
  const now = ref(Date.now())
  let timerId = null

  const targetMs = computed(() => resolveTarget(target))

  const remaining = computed(() => calcRemaining(targetMs.value, now.value))

  onMounted(() => {
    timerId = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timerId !== null) {
      clearInterval(timerId)
    }
  })

  return { remaining }
}

export function formatTargetDate(target) {
  return new Date(target).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

/** 将时/分/秒转为总毫秒数 */
export function durationToMs(hours, minutes, seconds) {
  const h = Math.max(0, Number(hours) || 0)
  const m = Math.max(0, Number(minutes) || 0)
  const s = Math.max(0, Number(seconds) || 0)
  return (h * 3600 + m * 60 + s) * 1000
}

export function formatDuration(hours, minutes, seconds) {
  const h = Math.max(0, Number(hours) || 0)
  const m = Math.max(0, Number(minutes) || 0)
  const s = Math.max(0, Number(seconds) || 0)
  const parts = []
  if (h > 0) parts.push(`${h} 时`)
  if (m > 0 || h > 0) parts.push(`${m} 分`)
  parts.push(`${s} 秒`)
  return parts.join(' ')
}

export function formatRemainingClock(remaining) {
  const parts = getRemainingClockParts(remaining)
  return `${parts.hours}:${parts.minutes}:${parts.seconds}`
}

export function getPreviewClockParts(hours, minutes, seconds) {
  const h = Math.max(0, Math.floor(Number(hours) || 0))
  const m = Math.max(0, Math.min(59, Math.floor(Number(minutes) || 0)))
  const s = Math.max(0, Math.min(59, Math.floor(Number(seconds) || 0)))
  const hourText = h >= 100 ? String(h).padStart(3, '0') : pad2(h)
  return {
    hours: hourText,
    minutes: pad2(m),
    seconds: pad2(s)
  }
}

export function getRemainingClockParts(remaining) {
  if (remaining.expired) {
    return { hours: '00', minutes: '00', seconds: '00' }
  }
  const totalHours = remaining.days * 24 + remaining.hours
  const hours =
    totalHours >= 100 ? String(totalHours).padStart(3, '0') : pad2(totalHours)
  return {
    hours,
    minutes: pad2(remaining.minutes),
    seconds: pad2(remaining.seconds)
  }
}

/** @deprecated 仅默认 Countdown 页预设事件使用 */
export function toDatetimeLocalValue(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const h = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  return `${y}-${m}-${day}T${h}:${min}`
}
