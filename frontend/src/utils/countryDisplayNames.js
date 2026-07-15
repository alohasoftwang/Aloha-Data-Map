/** ISO3 → 国家及地区列表展示名覆盖 */
export const COUNTRY_DISPLAY_NAME_OVERRIDES = {
  TWN: 'Taiwan, China'
}

export function getCountryDisplayName(iso3, fallbackName) {
  if (!iso3) return fallbackName
  return COUNTRY_DISPLAY_NAME_OVERRIDES[iso3.trim().toUpperCase()] ?? fallbackName
}
