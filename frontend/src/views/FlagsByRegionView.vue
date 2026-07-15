<template>
  <div
    ref="panelRef"
    class="flags-page"
    :class="{
      'flags-page--fullscreen': isFullscreen,
      'flags-page--grid-3x4': countryPreset === 'southeast-asia',
      'flags-page--grid-2x4': countryPreset === 'south-asia',
      'flags-page--grid-4x4': countryPreset === 'middle-east',
      'flags-page--grid-cols-5': continentFilter === 'southAmerica',
      'flags-page--grid-compact': continentFilter === 'africa'
    }"
  >
    <header class="flags-header oswald-chart">
      <div class="flags-header-text">
        <h1 class="flags-title">{{ t(titleKey) }}</h1>
        <p v-if="catalog && !isFlatList" class="flags-subtitle">
          {{ t('countries.subtitle', { total: catalog.totalCountries, flags: catalog.totalFlags }) }}
        </p>
      </div>
      <div v-if="!isFullscreen" class="flags-header-actions">
        <FullscreenButton
          :is-fullscreen="isFullscreen"
          @toggle="toggleFullscreen"
        />
      </div>
    </header>

    <div v-if="loading" class="flags-state">{{ t('countries.loading') }}</div>
    <div v-else-if="error" class="flags-state flags-state--error">{{ error }}</div>

    <div v-else-if="catalog" class="flags-body">
      <section v-if="isFlatList" class="flags-region flags-region--flat">
        <ul class="flags-grid">
          <li
            v-for="country in flatCountries"
            :key="country.id"
            class="flag-card"
          >
            <div class="flag-card-visual">
              <img
                v-if="country.flag"
                :src="country.flag"
                :alt="country.name"
                class="flag-image"
                :style="flagImageStyle(country.iso2)"
                loading="lazy"
              />
              <div v-else class="flag-placeholder" :title="t('countries.noFlag')">
                <span>{{ country.iso3 }}</span>
              </div>
            </div>
            <span class="flag-name">{{ country.name }}</span>
            <span class="flag-code">{{ country.iso3 }}</span>
          </li>
        </ul>
      </section>

      <template v-else>
        <section
          v-for="continent in catalog.continents"
          :key="continent.id"
          class="flags-continent"
        >
          <h2 class="flags-continent-title">
            {{ t(`countries.continents.${continent.id}`) }}
          </h2>
          <p class="flags-continent-count">
            {{ t('countries.countryCount', { count: continent.countryCount }) }}
          </p>

          <section
            v-for="region in continent.regions"
            :key="region.id"
            class="flags-region"
          >
            <h3 class="flags-region-title">{{ t(`countries.regions.${region.id}`) }}</h3>
            <p class="flags-region-count">
              {{ t('countries.countryCount', { count: region.countries.length }) }}
            </p>
            <ul class="flags-grid">
              <li
                v-for="country in region.countries"
                :key="country.id"
                class="flag-card"
              >
                <div class="flag-card-visual">
                  <img
                    v-if="country.flag"
                    :src="country.flag"
                    :alt="country.name"
                    class="flag-image"
                    :style="flagImageStyle(country.iso2)"
                    loading="lazy"
                  />
                  <div v-else class="flag-placeholder" :title="t('countries.noFlag')">
                    <span>{{ country.iso3 }}</span>
                  </div>
                </div>
                <span class="flag-name">{{ country.name }}</span>
                <span class="flag-code">{{ country.iso3 }}</span>
              </li>
            </ul>
          </section>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import FullscreenButton from '../components/FullscreenButton.vue'
import { fetchCountries } from '../api/countryApi.js'
import { useFullscreen } from '../composables/useFullscreen.js'
import {
  FLAG_DISPLAY_HEIGHT_REFERENCE,
  toFlagCssSize
} from '../utils/flagAspectRatios.js'
import {
  groupCountriesByContinent,
  toCountryItem
} from '../utils/groupCountriesByContinent.js'
import {
  EXCLUDED_ASIA_COUNTRY_CODES,
  MIDDLE_EAST_COUNTRY_CODES,
  SOUTH_ASIA_COUNTRY_CODES,
  SOUTHEAST_ASIA_COUNTRY_CODES
} from '../data/asiaCountries.js'
import { EXCLUDED_EUROPE_COUNTRY_CODES } from '../data/europeCountries.js'

const CODE_PRESETS = {
  'southeast-asia': SOUTHEAST_ASIA_COUNTRY_CODES,
  'south-asia': SOUTH_ASIA_COUNTRY_CODES,
  'middle-east': MIDDLE_EAST_COUNTRY_CODES
}

const props = defineProps({
  continentId: { type: String, default: '' },
  countryPreset: { type: String, default: '' },
  titleKey: { type: String, default: '' }
})

const route = useRoute()
const { t } = useI18n()

const panelRef = ref(null)
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef)

const loading = ref(true)
const error = ref('')
const catalog = ref(null)

const continentFilter = computed(
  () => props.continentId || route.meta.continentId || ''
)

const countryPreset = computed(
  () => props.countryPreset || route.meta.countryPreset || ''
)

const allowedCodes = computed(() => {
  const preset = countryPreset.value
  if (!preset) return null
  const codes = CODE_PRESETS[preset]
  return codes ? new Set(codes) : null
})

const isFlatList = computed(
  () => Boolean(continentFilter.value || allowedCodes.value)
)

const titleKey = computed(
  () => props.titleKey || route.meta.titleKey || 'routes.flagsByRegion'
)

const flatCountries = computed(() => {
  if (!catalog.value?.continents?.length) return []
  return catalog.value.continents
    .flatMap((continent) => continent.regions.flatMap((region) => region.countries))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
})

function flagImageStyle(iso2) {
  if (isFlatList.value) {
    return undefined
  }
  return toFlagCssSize(iso2, FLAG_DISPLAY_HEIGHT_REFERENCE)
}

function buildFlatCatalog(countries) {
  const regions = [{ id: countryPreset.value || continentFilter.value || 'flat', countries }]
  const totalCountries = countries.length
  const totalFlags = countries.filter((c) => c.hasFlag).length
  return {
    continents: [
      {
        id: continentFilter.value || 'asia',
        regions,
        countryCount: totalCountries
      }
    ],
    totalCountries,
    totalFlags
  }
}

async function loadCountries() {
  loading.value = true
  error.value = ''

  try {
    const countries = await fetchCountries()
    const filterId = continentFilter.value
    const codes = allowedCodes.value
    const presetCodes = CODE_PRESETS[countryPreset.value]

    // 预设列表（东南亚 11 国等）：严格按 ISO3 白名单，最多就这些
    if (presetCodes?.length) {
      const allowed = new Set(presetCodes)
      const matched = countries
        .filter((row) => allowed.has(String(row.countryCode || '').toUpperCase()))
        .map(toCountryItem)
        .sort((a, b) => a.name.localeCompare(b.name, 'en'))
      catalog.value = buildFlatCatalog(matched)
      return
    }

    const grouped = groupCountriesByContinent(countries)

    if (!filterId) {
      catalog.value = grouped
      return
    }

    const continent = grouped.continents.find((item) => item.id === filterId)
    let regions = continent?.regions ?? []

    // Asia Countries 页：排除港、澳、台
    if (filterId === 'asia') {
      regions = regions
        .map((region) => ({
          ...region,
          countries: region.countries.filter(
            (c) => !EXCLUDED_ASIA_COUNTRY_CODES.has(c.iso3)
          )
        }))
        .filter((region) => region.countries.length > 0)
    }

    // Europe Countries 页：排除苏联历史实体与属地
    if (filterId === 'europe') {
      regions = regions
        .map((region) => ({
          ...region,
          countries: region.countries.filter(
            (c) => !EXCLUDED_EUROPE_COUNTRY_CODES.has(c.iso3)
          )
        }))
        .filter((region) => region.countries.length > 0)
    }

    const flat = regions.flatMap((region) => region.countries)
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    catalog.value = buildFlatCatalog(flat)
  } catch (err) {
    error.value = err.message || t('countries.loadError')
  } finally {
    loading.value = false
  }
}

watch([continentFilter, countryPreset], () => {
  loadCountries()
})

onMounted(loadCountries)
</script>

<style scoped>
.flags-page {
  height: 100%;
  overflow: auto;
  padding: 28px 32px 48px;
  box-sizing: border-box;
}

.flags-page--fullscreen,
.flags-page:fullscreen {
  display: flex;
  flex-direction: column;
  padding: 80px 48px 48px;
  background: var(--bg-page-gradient);
  overflow: hidden;
}

.flags-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 36px;
  min-height: 44px;
  flex-shrink: 0;
}

.flags-page--fullscreen .flags-header,
.flags-page:fullscreen .flags-header {
  margin-top: 12px;
  margin-bottom: 28px;
}

.flags-header-text {
  text-align: center;
  max-width: 860px;
  padding: 0 120px;
}

.flags-header-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.flags-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--pearl);
  text-align: center;
}

.flags-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: var(--mist);
  text-align: center;
}

.flags-body {
  min-height: 0;
}

.flags-page--fullscreen .flags-body,
.flags-page:fullscreen .flags-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

/* 东南亚 / 南亚 / 中东 / 南美国家全屏：整体略上移 */
.flags-page--grid-3x4.flags-page--fullscreen .flags-body,
.flags-page--grid-3x4:fullscreen .flags-body,
.flags-page--grid-2x4.flags-page--fullscreen .flags-body,
.flags-page--grid-2x4:fullscreen .flags-body,
.flags-page--grid-4x4.flags-page--fullscreen .flags-body,
.flags-page--grid-4x4:fullscreen .flags-body,
.flags-page--grid-cols-5.flags-page--fullscreen .flags-body,
.flags-page--grid-cols-5:fullscreen .flags-body {
  align-items: flex-start;
  padding-top: 6vh;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-body,
.flags-page--grid-compact:fullscreen .flags-body {
  align-items: flex-start;
  padding-top: 2vh;
}

.flags-page--fullscreen .flags-region--flat,
.flags-page:fullscreen .flags-region--flat {
  width: min(100%, 1480px);
  margin: 0 auto;
}

.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page:fullscreen .flags-region--flat .flags-grid {
  justify-content: flex-start;
}

/* 东南亚国家：全屏固定 3 行 × 4 列 */
.flags-page--grid-3x4.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-3x4:fullscreen .flags-region--flat,
.flags-page--grid-2x4.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-2x4:fullscreen .flags-region--flat,
.flags-page--grid-4x4.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-4x4:fullscreen .flags-region--flat,
.flags-page--grid-cols-5.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-cols-5:fullscreen .flags-region--flat,
.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-compact:fullscreen .flags-region--flat {
  width: auto;
  max-width: 100%;
}

.flags-page--grid-3x4.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page--grid-3x4:fullscreen .flags-region--flat .flags-grid {
  display: grid;
  grid-template-columns: repeat(4, 148px);
  grid-template-rows: repeat(3, auto);
  gap: 28px 32px;
  justify-content: center;
  justify-items: stretch;
}

/* 南亚国家：全屏固定 2 行 × 4 列 */
.flags-page--grid-2x4.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page--grid-2x4:fullscreen .flags-region--flat .flags-grid {
  display: grid;
  grid-template-columns: repeat(4, 148px);
  grid-template-rows: repeat(2, auto);
  gap: 28px 32px;
  justify-content: center;
  justify-items: stretch;
}

/* 中东国家：全屏固定 4 行 × 4 列 */
.flags-page--grid-4x4.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page--grid-4x4:fullscreen .flags-region--flat .flags-grid {
  display: grid;
  grid-template-columns: repeat(4, 148px);
  grid-template-rows: repeat(4, auto);
  gap: 24px 28px;
  justify-content: center;
  justify-items: stretch;
}

/* 南美洲国家：全屏每行 5 个 */
.flags-page--grid-cols-5.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page--grid-cols-5:fullscreen .flags-region--flat .flags-grid {
  display: grid;
  grid-template-columns: repeat(5, 148px);
  gap: 28px 32px;
  justify-content: center;
  justify-items: stretch;
}

/* 非洲国家：全屏紧凑网格，略缩小卡片 */
.flags-page--grid-compact.flags-page--fullscreen .flags-header,
.flags-page--grid-compact:fullscreen .flags-header {
  margin-bottom: 18px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-title,
.flags-page--grid-compact:fullscreen .flags-title {
  font-size: 24px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat,
.flags-page--grid-compact:fullscreen .flags-region--flat {
  padding: 18px 20px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flags-grid,
.flags-page--grid-compact:fullscreen .flags-region--flat .flags-grid {
  display: grid;
  grid-template-columns: repeat(8, 112px);
  gap: 14px 16px;
  justify-content: center;
  justify-items: stretch;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-card,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-card {
  width: 100%;
  min-width: 0;
  max-width: none;
  flex: none;
  padding: 10px 8px 10px;
  gap: 6px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-card-visual,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-card-visual {
  width: 76px;
  height: 38px;
  min-height: 38px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-image,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-image {
  max-width: 76px;
  max-height: 38px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-placeholder,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-placeholder {
  width: 76px;
  min-width: 76px;
  min-height: 38px;
  padding: 5px 7px;
  font-size: 10px;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-name,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-name {
  font-size: 12px;
  max-width: 104px;
  line-height: 1.25;
}

.flags-page--grid-compact.flags-page--fullscreen .flags-region--flat .flag-code,
.flags-page--grid-compact:fullscreen .flags-region--flat .flag-code {
  font-size: 10px;
}

.flags-page--grid-3x4.flags-page--fullscreen .flags-region--flat .flag-card,
.flags-page--grid-3x4:fullscreen .flags-region--flat .flag-card,
.flags-page--grid-2x4.flags-page--fullscreen .flags-region--flat .flag-card,
.flags-page--grid-2x4:fullscreen .flags-region--flat .flag-card,
.flags-page--grid-4x4.flags-page--fullscreen .flags-region--flat .flag-card,
.flags-page--grid-4x4:fullscreen .flags-region--flat .flag-card,
.flags-page--grid-cols-5.flags-page--fullscreen .flags-region--flat .flag-card,
.flags-page--grid-cols-5:fullscreen .flags-region--flat .flag-card {
  width: 100%;
  min-width: 0;
  max-width: none;
  flex: none;
}

.flags-state {
  padding: 48px 0;
  text-align: center;
  color: var(--mist);
  font-size: 15px;
}

.flags-state--error {
  color: #ff8f8f;
}

.flags-continent {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(217, 192, 138, 0.28);
}

.flags-continent:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.flags-continent-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--pearl);
  letter-spacing: 0.04em;
}

.flags-continent-count {
  margin-top: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--mist);
}

.flags-region {
  margin-bottom: 28px;
  padding: 24px 28px;
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(16, 22, 36, 0.18);
}

.flags-region--flat {
  margin-bottom: 0;
}

.flags-region--flat .flags-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}

.flags-region--flat .flag-card {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  box-sizing: border-box;
  flex: 0 0 120px;
}

.flags-region--flat .flag-card-visual {
  width: 88px;
  height: 44px;
}

.flags-region--flat .flag-image {
  max-width: 88px;
  max-height: 44px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.flags-region--flat .flag-placeholder {
  width: 88px;
  min-width: 88px;
  min-height: 44px;
  box-sizing: border-box;
}

.flags-region-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.03em;
}

.flags-region-count {
  margin-top: 4px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--mist);
}

.flags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 20px;
  list-style: none;
}

.flag-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  padding: 14px 12px 12px;
  background: rgba(30, 39, 56, 0.55);
  border: 1px solid var(--border-glow);
  border-radius: 10px;
  transition: border-color 0.2s, transform 0.2s;
}

.flag-card:hover {
  border-color: rgba(217, 192, 138, 0.35);
  transform: translateY(-2px);
}

.flag-card-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

.flag-image {
  display: block;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}

.flag-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 48px;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(154, 175, 201, 0.28);
  color: var(--mist);
  font-size: 11px;
  font-family: Consolas, Monaco, monospace;
  letter-spacing: 0.06em;
}

.flag-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--pearl);
  text-align: center;
  line-height: 1.3;
  max-width: 120px;
}

.flag-code {
  font-size: 11px;
  font-family: Consolas, Monaco, monospace;
  color: var(--mist);
  letter-spacing: 0.08em;
}
</style>
