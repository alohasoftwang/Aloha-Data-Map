export const LOCALE_STORAGE_KEY = 'aloha.locale'

export const DEFAULT_LOCALE = 'zh-CN'

/**
 * Register new languages here. Each entry needs a matching file in ./locales/.
 */
export const SUPPORTED_LOCALES = [
  {
    code: 'zh-CN',
    name: '简体中文',
    shortLabel: '中',
    htmlLang: 'zh-CN'
  },
  {
    code: 'en',
    name: 'English',
    shortLabel: 'EN',
    htmlLang: 'en'
  }
]

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.some((item) => item.code === locale)
}

export function getLocaleMeta(locale) {
  return SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0]
}

export function readStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function writeStoredLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Ignore storage failures in private browsing.
  }
}
