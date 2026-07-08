/**
 * Asia GDP mock data (1985-2024)
 * Unit: million USD
 */

const COUNTRIES = [
  { name: 'CHINA', code: 'cn', gdp1985: 310_000, gdp2024: 18_270_000, color: '#e85d6a' },
  { name: 'JAPAN', code: 'jp', gdp1985: 1_380_000, gdp2024: 4_110_000, color: '#c77dba' },
  { name: 'INDIA', code: 'in', gdp1985: 230_000, gdp2024: 3_940_000, color: '#f0a070' },
  { name: 'SOUTH KOREA', code: 'kr', gdp1985: 95_000, gdp2024: 1_760_000, color: '#5b9fd4' },
  { name: 'INDONESIA', code: 'id', gdp1985: 90_000, gdp2024: 1_400_000, color: '#7ec87a' },
  { name: 'SAUDI ARABIA', code: 'sa', gdp1985: 115_000, gdp2024: 1_070_000, color: '#5ec9d8' },
  { name: 'TURKEY', code: 'tr', gdp1985: 70_000, gdp2024: 1_030_000, color: '#f0d060' },
  { name: 'THAILAND', code: 'th', gdp1985: 40_000, gdp2024: 540_000, color: '#7aabde' },
  { name: 'ISRAEL', code: 'il', gdp1985: 25_000, gdp2024: 520_000, color: '#6ed4c8' },
  { name: 'SINGAPORE', code: 'sg', gdp1985: 27_000, gdp2024: 500_000, color: '#d48ec4' },
  { name: 'MALAYSIA', code: 'my', gdp1985: 31_000, gdp2024: 430_000, color: '#6888d8' },
  { name: 'PHILIPPINES', code: 'ph', gdp1985: 36_000, gdp2024: 430_000, color: '#e89868' },
  { name: 'VIETNAM', code: 'vn', gdp1985: 9_000, gdp2024: 430_000, color: '#8ed482' },
  { name: 'BANGLADESH', code: 'bd', gdp1985: 28_000, gdp2024: 450_000, color: '#62c4de' },
  { name: 'PAKISTAN', code: 'pk', gdp1985: 38_000, gdp2024: 340_000, color: '#e8c868' }
]

const START_YEAR = 1985
const END_YEAR = 2024
const YEAR_COUNT = END_YEAR - START_YEAR + 1

function growthFactor(country, year) {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR)

  if (country.name === 'CHINA') {
    return Math.pow(t, 0.55)
  }
  if (country.name === 'JAPAN') {
    return Math.pow(t, 0.85)
  }
  if (country.name === 'INDIA') {
    return Math.pow(t, 0.7)
  }

  return t
}

function gdpAtYear(country, year) {
  const factor = growthFactor(country, year)
  return country.gdp1985 + (country.gdp2024 - country.gdp1985) * factor
}

function buildDataset() {
  const header = ['GDP', 'Entity', 'Year']
  const rows = []

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (const country of COUNTRIES) {
      rows.push([Math.round(gdpAtYear(country, year)), country.name, year])
    }
  }

  return [header, ...rows]
}

const entityColors = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.color])
)

const entityCodes = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.code])
)

const entityFlagImages = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, `/flags/${c.code}.png`])
)

export const asiaGdpMock = {
  id: 'asia-gdp',
  title: 'TOP 10 ASIA GDP',
  unit: '(IN MILLION $)',
  chartType: 'bar-race',
  updateFrequency: 2250,
  maxBars: 10,
  startYear: START_YEAR,
  endYear: END_YEAR,
  years: Array.from({ length: YEAR_COUNT }, (_, i) => START_YEAR + i),
  entityColors,
  entityCodes,
  entityFlagImages,
  dataset: buildDataset()
}
