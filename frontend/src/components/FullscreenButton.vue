<template>
  <button
    type="button"
    class="fullscreen-btn"
    :title="isFullscreen ? '退出全屏' : '全屏显示'"
    @click="$emit('toggle')"
  >
    <svg
      v-if="!isFullscreen"
      class="fullscreen-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
    <svg
      v-else
      class="fullscreen-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
    <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
  </button>
</template>

<script setup>
defineProps({
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.fullscreen-btn {
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

.fullscreen-btn:hover {
  background: rgba(212, 184, 122, 0.12);
  border-color: rgba(212, 184, 122, 0.55);
  color: #e8eef7;
}

.fullscreen-icon {
  width: 16px;
  height: 16px;
}
</style>
