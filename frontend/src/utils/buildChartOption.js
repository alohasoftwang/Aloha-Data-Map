export function buildChartOption(chartData) {
  const series = chartData.series.map((item) => ({
    name: item.name,
    type: chartData.chartType || 'bar',
    data: item.data,
    itemStyle: {
      borderRadius: chartData.chartType === 'bar' ? [4, 4, 0, 0] : undefined
    }
  }))

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => `${value} 万亿美元`
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.categories,
      axisLabel: {
        rotate: chartData.categories.length > 8 ? 35 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '万亿美元'
    },
    series
  }
}
