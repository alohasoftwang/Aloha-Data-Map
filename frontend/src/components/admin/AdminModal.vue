<template>
  <div v-if="visible" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card" role="dialog" :aria-label="title">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button type="button" class="icon-btn" aria-label="Close" @click="emit('close')">×</button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])
</script>
