<template>
  <div class="admin-page">
    <header class="admin-page-header">
      <div>
        <h2>Data Management</h2>
        <p>Manage World Bank tables: wb_country, wb_indicator, wb_gdp_value</p>
      </div>
      <div class="admin-header-actions">
        <button type="button" class="admin-btn secondary" :disabled="importing" @click="handleImport">
          {{ importing ? 'Importing...' : 'Re-import from Excel' }}
        </button>
      </div>
    </header>

    <section class="admin-stats">
      <article class="stat-card">
        <span class="stat-label">Countries</span>
        <strong class="stat-value">{{ stats?.countryCount ?? '—' }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Indicators</span>
        <strong class="stat-value">{{ stats?.indicatorCount ?? '—' }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">GDP Records</span>
        <strong class="stat-value">{{ stats?.gdpValueCount ?? '—' }}</strong>
      </article>
      <article class="stat-card">
        <span class="stat-label">Status</span>
        <strong class="stat-value" :class="stats?.imported ? 'ok' : 'warn'">
          {{ stats?.imported ? 'Imported' : 'Empty' }}
        </strong>
      </article>
    </section>

    <div class="admin-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="admin-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <AdminDataTable
      v-if="activeTab === 'countries'"
      :columns="countryColumns"
      :rows="countryRows"
      :page="countryPage"
      :loading="countryLoading"
      :error="countryError"
      :keyword="countryKeyword"
      search-placeholder="Search code / name / region"
      create-label="Add Country"
      @search="onCountrySearch"
      @page-change="onCountryPageChange"
      @create="openCountryCreate"
      @edit="openCountryEdit"
      @delete="confirmCountryDelete"
    />

    <AdminDataTable
      v-else-if="activeTab === 'indicators'"
      :columns="indicatorColumns"
      :rows="indicatorRows"
      :page="indicatorPage"
      :loading="indicatorLoading"
      :error="indicatorError"
      :keyword="indicatorKeyword"
      search-placeholder="Search code / name"
      create-label="Add Indicator"
      @search="onIndicatorSearch"
      @page-change="onIndicatorPageChange"
      @create="openIndicatorCreate"
      @edit="openIndicatorEdit"
      @delete="confirmIndicatorDelete"
    />

    <AdminDataTable
      v-else
      :columns="gdpColumns"
      :rows="gdpRows"
      :page="gdpPage"
      :loading="gdpLoading"
      :error="gdpError"
      :searchable="false"
      create-label="Add GDP Record"
      @page-change="onGdpPageChange"
      @create="openGdpCreate"
      @edit="openGdpEdit"
      @delete="confirmGdpDelete"
    >
      <template #filters>
        <input
          v-model="gdpCountryCode"
          type="text"
          class="admin-input"
          placeholder="Country code (CHN)"
          maxlength="3"
        />
        <input
          v-model.number="gdpYear"
          type="number"
          class="admin-input year-input"
          placeholder="Year"
          min="1960"
          max="2100"
        />
        <button type="button" class="admin-btn secondary" @click="loadGdpValues">Filter</button>
      </template>
    </AdminDataTable>

    <!-- Country modal -->
    <AdminModal :visible="countryModalOpen" :title="countryModalTitle" @close="closeCountryModal">
      <div class="form-grid">
        <label>
          <span>Country Code *</span>
          <input v-model="countryForm.countryCode" class="admin-input" maxlength="3" />
        </label>
        <label>
          <span>Country Name *</span>
          <input v-model="countryForm.countryName" class="admin-input" />
        </label>
        <label>
          <span>Region</span>
          <input v-model="countryForm.region" class="admin-input" />
        </label>
        <label>
          <span>Income Group</span>
          <input v-model="countryForm.incomeGroup" class="admin-input" />
        </label>
        <label class="full-width">
          <span>Table Name</span>
          <input v-model="countryForm.tableName" class="admin-input" />
        </label>
      </div>
      <p v-if="countryFormError" class="form-error">{{ countryFormError }}</p>
      <template #footer>
        <button type="button" class="admin-btn secondary" @click="closeCountryModal">Cancel</button>
        <button type="button" class="admin-btn primary" :disabled="countrySaving" @click="saveCountry">
          {{ countrySaving ? 'Saving...' : 'Save' }}
        </button>
      </template>
    </AdminModal>

    <!-- Indicator modal -->
    <AdminModal :visible="indicatorModalOpen" :title="indicatorModalTitle" @close="closeIndicatorModal">
      <div class="form-grid">
        <label>
          <span>Indicator Code *</span>
          <input v-model="indicatorForm.indicatorCode" class="admin-input" />
        </label>
        <label>
          <span>Indicator Name *</span>
          <input v-model="indicatorForm.indicatorName" class="admin-input" />
        </label>
        <label class="full-width">
          <span>Source Note</span>
          <textarea v-model="indicatorForm.sourceNote" class="admin-textarea" rows="4" />
        </label>
        <label class="full-width">
          <span>Source Organization</span>
          <textarea v-model="indicatorForm.sourceOrganization" class="admin-textarea" rows="3" />
        </label>
      </div>
      <p v-if="indicatorFormError" class="form-error">{{ indicatorFormError }}</p>
      <template #footer>
        <button type="button" class="admin-btn secondary" @click="closeIndicatorModal">Cancel</button>
        <button type="button" class="admin-btn primary" :disabled="indicatorSaving" @click="saveIndicator">
          {{ indicatorSaving ? 'Saving...' : 'Save' }}
        </button>
      </template>
    </AdminModal>

    <!-- GDP modal -->
    <AdminModal :visible="gdpModalOpen" :title="gdpModalTitle" @close="closeGdpModal">
      <div class="form-grid">
        <label class="full-width">
          <span>Country *</span>
          <select v-model="gdpForm.countryId" class="admin-select full">
            <option value="">Select country</option>
            <option v-for="item in countryOptions" :key="item.id" :value="item.id">
              {{ item.countryCode }} — {{ item.countryName }}
            </option>
          </select>
        </label>
        <label class="full-width">
          <span>Indicator *</span>
          <select v-model="gdpForm.indicatorId" class="admin-select full">
            <option value="">Select indicator</option>
            <option v-for="item in indicatorOptions" :key="item.id" :value="item.id">
              {{ item.indicatorCode }} — {{ item.indicatorName }}
            </option>
          </select>
        </label>
        <label>
          <span>Year *</span>
          <input v-model.number="gdpForm.gdpYear" type="number" class="admin-input" min="1960" max="2100" />
        </label>
        <label>
          <span>Value (USD) *</span>
          <input v-model="gdpForm.valueUsd" type="text" class="admin-input" />
        </label>
      </div>
      <p v-if="gdpFormError" class="form-error">{{ gdpFormError }}</p>
      <template #footer>
        <button type="button" class="admin-btn secondary" @click="closeGdpModal">Cancel</button>
        <button type="button" class="admin-btn primary" :disabled="gdpSaving" @click="saveGdp">
          {{ gdpSaving ? 'Saving...' : 'Save' }}
        </button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AdminDataTable from '../../components/admin/AdminDataTable.vue'
import AdminModal from '../../components/admin/AdminModal.vue'
import {
  createCountry,
  createGdpValue,
  createIndicator,
  deleteCountry,
  deleteGdpValue,
  deleteIndicator,
  fetchAllCountries,
  fetchAllIndicators,
  fetchCountries,
  fetchGdpValues,
  fetchIndicators,
  fetchWbStats,
  triggerWbImport,
  updateCountry,
  updateGdpValue,
  updateIndicator
} from '../../api/wbAdminApi'

const tabs = [
  { id: 'countries', label: 'wb_country' },
  { id: 'indicators', label: 'wb_indicator' },
  { id: 'gdp', label: 'wb_gdp_value' }
]

const activeTab = ref('countries')
const stats = ref(null)
const importing = ref(false)

const countryColumns = [
  { key: 'id', label: 'ID', mono: true, width: '180px' },
  { key: 'countryCode', label: 'Code', width: '80px' },
  { key: 'countryName', label: 'Name' },
  { key: 'region', label: 'Region' },
  { key: 'incomeGroup', label: 'Income Group' }
]

const indicatorColumns = [
  { key: 'id', label: 'ID', mono: true, width: '180px' },
  { key: 'indicatorCode', label: 'Code', width: '140px' },
  { key: 'indicatorName', label: 'Name' },
  {
    key: 'sourceOrganization',
    label: 'Source',
    formatter: (v) => (v && v.length > 60 ? `${v.slice(0, 60)}...` : v)
  }
]

const gdpColumns = [
  { key: 'id', label: 'ID', mono: true, width: '180px' },
  { key: 'countryCode', label: 'Country', width: '80px' },
  { key: 'countryName', label: 'Name' },
  { key: 'indicatorCode', label: 'Indicator', width: '140px' },
  { key: 'gdpYear', label: 'Year', width: '80px' },
  {
    key: 'valueUsd',
    label: 'Value (USD)',
    formatter: (v) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
]

// countries state
const countryRows = ref([])
const countryPage = ref(null)
const countryLoading = ref(false)
const countryError = ref('')
const countryKeyword = ref('')
const countryPageIndex = ref(0)
const countryPageSize = ref(20)

// indicators state
const indicatorRows = ref([])
const indicatorPage = ref(null)
const indicatorLoading = ref(false)
const indicatorError = ref('')
const indicatorKeyword = ref('')
const indicatorPageIndex = ref(0)
const indicatorPageSize = ref(20)

// gdp state
const gdpRows = ref([])
const gdpPage = ref(null)
const gdpLoading = ref(false)
const gdpError = ref('')
const gdpCountryCode = ref('')
const gdpYear = ref(null)
const gdpPageIndex = ref(0)
const gdpPageSize = ref(20)

const countryOptions = ref([])
const indicatorOptions = ref([])

// country modal
const countryModalOpen = ref(false)
const countryEditingId = ref(null)
const countrySaving = ref(false)
const countryFormError = ref('')
const countryForm = ref(emptyCountryForm())

const countryModalTitle = computed(() =>
  countryEditingId.value ? 'Edit Country' : 'Add Country'
)

// indicator modal
const indicatorModalOpen = ref(false)
const indicatorEditingId = ref(null)
const indicatorSaving = ref(false)
const indicatorFormError = ref('')
const indicatorForm = ref(emptyIndicatorForm())

const indicatorModalTitle = computed(() =>
  indicatorEditingId.value ? 'Edit Indicator' : 'Add Indicator'
)

// gdp modal
const gdpModalOpen = ref(false)
const gdpEditingId = ref(null)
const gdpSaving = ref(false)
const gdpFormError = ref('')
const gdpForm = ref(emptyGdpForm())

const gdpModalTitle = computed(() =>
  gdpEditingId.value ? 'Edit GDP Record' : 'Add GDP Record'
)

function emptyCountryForm() {
  return {
    countryCode: '',
    countryName: '',
    region: '',
    incomeGroup: '',
    tableName: ''
  }
}

function emptyIndicatorForm() {
  return {
    indicatorCode: '',
    indicatorName: '',
    sourceNote: '',
    sourceOrganization: ''
  }
}

function emptyGdpForm() {
  return {
    countryId: '',
    indicatorId: '',
    gdpYear: new Date().getFullYear(),
    valueUsd: ''
  }
}

async function loadStats() {
  stats.value = await fetchWbStats()
}

async function loadCountryOptions() {
  countryOptions.value = await fetchAllCountries()
}

async function loadIndicatorOptions() {
  indicatorOptions.value = await fetchAllIndicators()
}

async function loadCountries() {
  countryLoading.value = true
  countryError.value = ''
  try {
    const data = await fetchCountries({
      keyword: countryKeyword.value || undefined,
      page: countryPageIndex.value,
      size: countryPageSize.value
    })
    countryRows.value = data.content
    countryPage.value = data
  } catch (err) {
    countryError.value = err.message
  } finally {
    countryLoading.value = false
  }
}

async function loadIndicators() {
  indicatorLoading.value = true
  indicatorError.value = ''
  try {
    const data = await fetchIndicators({
      keyword: indicatorKeyword.value || undefined,
      page: indicatorPageIndex.value,
      size: indicatorPageSize.value
    })
    indicatorRows.value = data.content
    indicatorPage.value = data
  } catch (err) {
    indicatorError.value = err.message
  } finally {
    indicatorLoading.value = false
  }
}

async function loadGdpValues() {
  gdpLoading.value = true
  gdpError.value = ''
  try {
    const data = await fetchGdpValues({
      countryCode: gdpCountryCode.value || undefined,
      year: gdpYear.value || undefined,
      page: gdpPageIndex.value,
      size: gdpPageSize.value
    })
    gdpRows.value = data.content
    gdpPage.value = data
  } catch (err) {
    gdpError.value = err.message
  } finally {
    gdpLoading.value = false
  }
}

function onCountrySearch(keyword) {
  countryKeyword.value = keyword
  countryPageIndex.value = 0
  loadCountries()
}

function onCountryPageChange({ page, size }) {
  countryPageIndex.value = page
  countryPageSize.value = size
  loadCountries()
}

function onIndicatorSearch(keyword) {
  indicatorKeyword.value = keyword
  indicatorPageIndex.value = 0
  loadIndicators()
}

function onIndicatorPageChange({ page, size }) {
  indicatorPageIndex.value = page
  indicatorPageSize.value = size
  loadIndicators()
}

function onGdpPageChange({ page, size }) {
  gdpPageIndex.value = page
  gdpPageSize.value = size
  loadGdpValues()
}

function openCountryCreate() {
  countryEditingId.value = null
  countryForm.value = emptyCountryForm()
  countryFormError.value = ''
  countryModalOpen.value = true
}

function openCountryEdit(row) {
  countryEditingId.value = row.id
  countryForm.value = {
    countryCode: row.countryCode,
    countryName: row.countryName,
    region: row.region || '',
    incomeGroup: row.incomeGroup || '',
    tableName: row.tableName || ''
  }
  countryFormError.value = ''
  countryModalOpen.value = true
}

function closeCountryModal() {
  countryModalOpen.value = false
}

async function saveCountry() {
  countrySaving.value = true
  countryFormError.value = ''
  try {
    if (countryEditingId.value) {
      await updateCountry(countryEditingId.value, countryForm.value)
    } else {
      await createCountry(countryForm.value)
    }
    countryModalOpen.value = false
    await Promise.all([loadCountries(), loadStats(), loadCountryOptions()])
  } catch (err) {
    countryFormError.value = err.message
  } finally {
    countrySaving.value = false
  }
}

async function confirmCountryDelete(row) {
  if (!window.confirm(`Delete country ${row.countryCode}?`)) return
  try {
    await deleteCountry(row.id)
    await Promise.all([loadCountries(), loadStats(), loadCountryOptions()])
  } catch (err) {
    window.alert(err.message)
  }
}

function openIndicatorCreate() {
  indicatorEditingId.value = null
  indicatorForm.value = emptyIndicatorForm()
  indicatorFormError.value = ''
  indicatorModalOpen.value = true
}

function openIndicatorEdit(row) {
  indicatorEditingId.value = row.id
  indicatorForm.value = {
    indicatorCode: row.indicatorCode,
    indicatorName: row.indicatorName,
    sourceNote: row.sourceNote || '',
    sourceOrganization: row.sourceOrganization || ''
  }
  indicatorFormError.value = ''
  indicatorModalOpen.value = true
}

function closeIndicatorModal() {
  indicatorModalOpen.value = false
}

async function saveIndicator() {
  indicatorSaving.value = true
  indicatorFormError.value = ''
  try {
    if (indicatorEditingId.value) {
      await updateIndicator(indicatorEditingId.value, indicatorForm.value)
    } else {
      await createIndicator(indicatorForm.value)
    }
    indicatorModalOpen.value = false
    await Promise.all([loadIndicators(), loadStats(), loadIndicatorOptions()])
  } catch (err) {
    indicatorFormError.value = err.message
  } finally {
    indicatorSaving.value = false
  }
}

async function confirmIndicatorDelete(row) {
  if (!window.confirm(`Delete indicator ${row.indicatorCode}?`)) return
  try {
    await deleteIndicator(row.id)
    await Promise.all([loadIndicators(), loadStats(), loadIndicatorOptions()])
  } catch (err) {
    window.alert(err.message)
  }
}

async function openGdpCreate() {
  await Promise.all([loadCountryOptions(), loadIndicatorOptions()])
  gdpEditingId.value = null
  gdpForm.value = emptyGdpForm()
  gdpFormError.value = ''
  gdpModalOpen.value = true
}

async function openGdpEdit(row) {
  await Promise.all([loadCountryOptions(), loadIndicatorOptions()])
  gdpEditingId.value = row.id
  gdpForm.value = {
    countryId: row.countryId,
    indicatorId: row.indicatorId,
    gdpYear: row.gdpYear,
    valueUsd: String(row.valueUsd ?? '')
  }
  gdpFormError.value = ''
  gdpModalOpen.value = true
}

function closeGdpModal() {
  gdpModalOpen.value = false
}

async function saveGdp() {
  gdpSaving.value = true
  gdpFormError.value = ''
  const payload = {
    countryId: gdpForm.value.countryId,
    indicatorId: gdpForm.value.indicatorId,
    gdpYear: gdpForm.value.gdpYear,
    valueUsd: gdpForm.value.valueUsd === '' ? null : gdpForm.value.valueUsd
  }
  try {
    if (gdpEditingId.value) {
      await updateGdpValue(gdpEditingId.value, payload)
    } else {
      await createGdpValue(payload)
    }
    gdpModalOpen.value = false
    await Promise.all([loadGdpValues(), loadStats()])
  } catch (err) {
    gdpFormError.value = err.message
  } finally {
    gdpSaving.value = false
  }
}

async function confirmGdpDelete(row) {
  if (!window.confirm(`Delete GDP record ${row.countryCode} ${row.gdpYear}?`)) return
  try {
    await deleteGdpValue(row.id)
    await Promise.all([loadGdpValues(), loadStats()])
  } catch (err) {
    window.alert(err.message)
  }
}

async function handleImport() {
  if (!window.confirm('Re-import from Excel? Existing data will be replaced by backend import logic.')) {
    return
  }
  importing.value = true
  try {
    await triggerWbImport()
    await refreshAll()
  } catch (err) {
    window.alert(err.message)
  } finally {
    importing.value = false
  }
}

async function refreshAll() {
  await loadStats()
  await loadCountryOptions()
  await loadIndicatorOptions()
  if (activeTab.value === 'countries') await loadCountries()
  if (activeTab.value === 'indicators') await loadIndicators()
  if (activeTab.value === 'gdp') await loadGdpValues()
}

watch(activeTab, (tab) => {
  if (tab === 'countries') loadCountries()
  if (tab === 'indicators') loadIndicators()
  if (tab === 'gdp') loadGdpValues()
})

onMounted(async () => {
  await refreshAll()
})
</script>
