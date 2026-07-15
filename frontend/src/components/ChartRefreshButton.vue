<template>
  <button
    type="button"
    class="chart-refresh-btn"
    :disabled="loading"
    :title="loading ? t('chart.refreshing') : t('chart.refreshData')"
    @click="$emit('click')"
  >
    <svg
      class="chart-refresh-icon"
      :class="{ spinning: loading }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
    <span>{{ loading ? t('chart.refreshing') : t('chart.refreshData') }}</span>
  </button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const { t } = useI18n()
</script>

<style scoped>
.chart-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(212, 184, 122, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #c8d4e4;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.chart-refresh-btn:hover:not(:disabled) {
  background: rgba(212, 184, 122, 0.12);
  border-color: rgba(212, 184, 122, 0.55);
  color: #e8eef7;
}

.chart-refresh-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.chart-refresh-icon {
  width: 16px;
  height: 16px;
}

.chart-refresh-icon.spinning {
  animation: chart-refresh-spin 0.8s linear infinite;
}

@keyframes chart-refresh-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
