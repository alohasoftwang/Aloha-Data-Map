import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SUPPORTED_LOCALES,
  getLocaleMeta,
  writeStoredLocale
} from '../i18n/config.js'
import { applyDocumentLocale } from '../i18n/index.js'

export function useAppLocale() {
  const { locale } = useI18n({ useScope: 'global' })

  const currentLocale = computed(() => locale.value)

  const currentLocaleMeta = computed(() => getLocaleMeta(locale.value))

  const localeOptions = computed(() =>
    SUPPORTED_LOCALES.map((item) => ({
      ...item,
      active: item.code === locale.value
    }))
  )

  function setLocale(nextLocale) {
    if (!SUPPORTED_LOCALES.some((item) => item.code === nextLocale)) {
      return
    }

    locale.value = nextLocale
    writeStoredLocale(nextLocale)
    applyDocumentLocale(nextLocale)
  }

  return {
    currentLocale,
    currentLocaleMeta,
    localeOptions,
    setLocale
  }
}
