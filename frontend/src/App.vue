<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const { t, locale } = useI18n()

function syncDocumentTitle() {
  const titleKey = route.meta.titleKey
  const pageTitle = titleKey ? t(titleKey) : t('app.name')
  document.title = `${pageTitle} · ${t('app.name')}`
}

watch(() => [route.path, locale.value], syncDocumentTitle, { immediate: true })
</script>
