import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { refreshChartJson } from '../api/chartApi'

/**
 * 图表页「更新数据」：从库导出指定 chartId 的 JSON，再执行 reload。
 * @param {string} chartId 如 asia-gdp-top15
 * @param {() => Promise<void>} reload 重新拉取并渲染图表
 */
export function useChartJsonRefresh(chartId, reload) {
  const { t } = useI18n()
  const refreshing = ref(false)

  async function handleRefresh() {
    if (refreshing.value) return
    if (!window.confirm(t('chart.refreshConfirm'))) return

    refreshing.value = true
    try {
      const result = await refreshChartJson(chartId)
      await reload({ cacheBust: true })
      const file = result?.files?.[0]
      const detail = file
        ? `${file.id} · ${file.startYear}–${file.endYear} · ${file.entityCount} entities · ${file.rowCount} rows`
        : ''
      window.alert(detail ? `${t('chart.refreshDone')}\n${detail}` : t('chart.refreshDone'))
    } catch (err) {
      window.alert(err.message || t('chart.refreshFailed'))
    } finally {
      refreshing.value = false
    }
  }

  return { refreshing, handleRefresh }
}
