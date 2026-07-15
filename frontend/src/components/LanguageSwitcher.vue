<template>
  <div
    ref="rootRef"
    class="language-switcher"
    :class="{ 'language-switcher--sidebar': placement === 'sidebar' }"
  >
    <button
      type="button"
      class="language-switcher-trigger"
      :aria-label="t('common.selectLanguage')"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggleMenu"
    >
      <svg
        class="language-switcher-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.8 3.1 4.3 6.9 4.3 9s-1.5 5.9-4.3 9M12 3c-2.8 3.1-4.3 6.9-4.3 9s1.5 5.9 4.3 9" />
      </svg>
      <span class="language-switcher-label">{{ currentLocaleMeta.shortLabel }}</span>
      <svg
        class="language-switcher-caret"
        :class="{ open }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <div v-if="open" class="language-switcher-menu" role="listbox">
      <button
        v-for="option in localeOptions"
        :key="option.code"
        type="button"
        class="language-switcher-option"
        :class="{ active: option.active }"
        role="option"
        :aria-selected="option.active"
        @click="selectLocale(option.code)"
      >
        <span class="language-switcher-option-name">{{ option.name }}</span>
        <span v-if="option.active" class="language-switcher-check" aria-hidden="true">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppLocale } from '../composables/useAppLocale.js'

const { t } = useI18n()
const { currentLocaleMeta, localeOptions, setLocale } = useAppLocale()

defineProps({
  placement: {
    type: String,
    default: 'header',
    validator: (value) => ['header', 'sidebar'].includes(value)
  }
})

const rootRef = ref(null)
const open = ref(false)

function toggleMenu() {
  open.value = !open.value
}

function closeMenu() {
  open.value = false
}

function selectLocale(code) {
  setLocale(code)
  closeMenu()
}

function handleDocumentClick(event) {
  if (!rootRef.value?.contains(event.target)) {
    closeMenu()
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-switcher-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(217, 192, 138, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--pearl);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.language-switcher-trigger:hover,
.language-switcher-trigger[aria-expanded='true'] {
  background: rgba(217, 192, 138, 0.12);
  border-color: rgba(217, 192, 138, 0.5);
  color: #fff;
}

.language-switcher-icon {
  width: 16px;
  height: 16px;
  opacity: 0.9;
}

.language-switcher-label {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.language-switcher-caret {
  width: 14px;
  height: 14px;
  opacity: 0.75;
  transition: transform 0.15s;
}

.language-switcher-caret.open {
  transform: rotate(180deg);
}

.language-switcher-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  min-width: 180px;
  padding: 6px;
  border: 1px solid rgba(217, 192, 138, 0.22);
  border-radius: 12px;
  background: rgba(30, 39, 56, 0.98);
  box-shadow: 0 16px 40px rgba(10, 14, 24, 0.35);
  backdrop-filter: blur(16px);
}

.language-switcher-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--mist);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.language-switcher-option:hover,
.language-switcher-option.active {
  background: rgba(217, 192, 138, 0.12);
  color: var(--pearl);
}

.language-switcher-option-name {
  font-weight: 500;
}

.language-switcher-check {
  color: var(--gold);
  font-size: 12px;
}

.language-switcher--sidebar {
  width: 100%;
  margin-top: 14px;
}

.language-switcher--sidebar .language-switcher-trigger {
  width: 100%;
  justify-content: center;
}

.language-switcher--sidebar .language-switcher-menu {
  left: 0;
  right: auto;
  width: 100%;
}
</style>
