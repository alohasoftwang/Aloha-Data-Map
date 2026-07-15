<template>
  <section class="admin-panel">
    <div class="admin-toolbar">
      <div class="admin-toolbar-left">
        <input
          v-if="searchable"
          v-model="keywordModel"
          type="search"
          class="admin-input search-input"
          :placeholder="searchPlaceholder"
          @keyup.enter="emitSearch"
        />
        <slot name="filters" />
      </div>
      <div class="admin-toolbar-right">
        <button type="button" class="admin-btn secondary" @click="emitSearch">Search</button>
        <button v-if="creatable" type="button" class="admin-btn primary" @click="emit('create')">
          {{ createLabel }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="admin-state">Loading...</div>
    <div v-else-if="error" class="admin-state error">{{ error }}</div>
    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              :style="col.width ? { width: col.width } : undefined"
            >
              {{ columnLabel(col) }}
            </th>
            <th v-if="editable || deletable" class="actions-col">{{ t('admin.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td :colspan="visibleColumns.length + (editable || deletable ? 1 : 0)" class="empty-cell">
              No data
            </td>
          </tr>
          <tr v-for="row in rows" :key="row[rowKey]">
            <td v-for="col in visibleColumns" :key="col.key">
              <button
                v-if="col.clickable && formatCell(row, col) !== '—'"
                type="button"
                class="link-btn cell-action"
                @click="emit('cell-click', { column: col, row, value: row[col.key] })"
              >
                {{ formatCell(row, col) }}
              </button>
              <span v-else-if="col.mono" class="mono" :title="formatCell(row, col)">
                {{ formatCell(row, col) }}
              </span>
              <span v-else>{{ formatCell(row, col) }}</span>
            </td>
            <td v-if="editable || deletable" class="actions-cell">
              <button v-if="editable" type="button" class="link-btn" @click="emit('edit', row)">Edit</button>
              <button v-if="deletable" type="button" class="link-btn danger" @click="emit('delete', row)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="page && !loading && !error" class="admin-pagination">
      <span class="page-info">
        Page {{ page.page + 1 }} / {{ Math.max(page.totalPages, 1) }} · {{ page.totalElements }} rows
      </span>
      <div class="page-actions">
        <select v-model.number="sizeModel" class="admin-select" @change="emitPage">
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
        </select>
        <button type="button" class="admin-btn secondary" :disabled="page.page <= 0" @click="goPrev">
          Prev
        </button>
        <button
          type="button"
          class="admin-btn secondary"
          :disabled="page.page + 1 >= page.totalPages"
          @click="goNext"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  page: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Search...' },
  keyword: { type: String, default: '' },
  creatable: { type: Boolean, default: true },
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  createLabel: { type: String, default: 'Add' }
})

const emit = defineEmits(['search', 'page-change', 'create', 'edit', 'delete', 'cell-click'])

const { t } = useI18n()

const visibleColumns = computed(() => props.columns.filter((col) => !col.hidden))

const keywordModel = ref(props.keyword)
const sizeModel = ref(props.page?.size || 20)

watch(
  () => props.keyword,
  (value) => {
    keywordModel.value = value
  }
)

watch(
  () => props.page?.size,
  (value) => {
    if (value) sizeModel.value = value
  }
)

function columnLabel(col) {
  if (col.labelKey) return t(col.labelKey)
  return col.label ?? ''
}

function formatCell(row, col) {
  const value = row[col.key]
  if (value == null || value === '') return '—'
  if (col.formatter) return col.formatter(value, row)
  return value
}

function emitSearch() {
  emit('search', keywordModel.value)
}

function emitPage() {
  emit('page-change', { page: props.page?.page || 0, size: sizeModel.value })
}

function goPrev() {
  emit('page-change', { page: Math.max((props.page?.page || 0) - 1, 0), size: sizeModel.value })
}

function goNext() {
  emit('page-change', { page: (props.page?.page || 0) + 1, size: sizeModel.value })
}
</script>
