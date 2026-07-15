import { createI18n } from 'vue-i18n'
import {
  DEFAULT_LOCALE,
  getLocaleMeta,
  readStoredLocale
} from './config.js'
import { localeMessages } from './locales/index.js'

const initialLocale = readStoredLocale()
const initialMeta = getLocaleMeta(initialLocale)

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: DEFAULT_LOCALE,
  messages: localeMessages
})

export function applyDocumentLocale(locale) {
  const meta = getLocaleMeta(locale)
  document.documentElement.lang = meta.htmlLang
}

applyDocumentLocale(initialLocale)
