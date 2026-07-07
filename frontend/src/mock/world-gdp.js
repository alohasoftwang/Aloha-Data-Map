/**
 * World GDP TOP 10 mock data (1985-2024)
 * Unit: million USD
 */

const COUNTRIES = [
  { name: 'UNITED STATES', code: 'us', gdp1985: 4_340_000, gdp2024: 28_780_000, color: '#5b9fd4' },
  { name: 'CHINA', code: 'cn', gdp1985: 310_000, gdp2024: 18_270_000, color: '#e85d6a' },
  { name: 'JAPAN', code: 'jp', gdp1985: 1_380_000, gdp2024: 4_110_000, color: '#c77dba' },
  { name: 'GERMANY', code: 'de', gdp1985: 730_000, gdp2024: 4_590_000, color: '#7aabde' },
  { name: 'INDIA', code: 'in', gdp1985: 230_000, gdp2024: 3_940_000, color: '#f0a070' },
  { name: 'UNITED KINGDOM', code: 'gb', gdp1985: 540_000, gdp2024: 3_350_000, color: '#6888d8' },
  { name: 'FRANCE', code: 'fr', gdp1985: 560_000, gdp2024: 3_030_000, color: '#6ed4c8' },
  { name: 'ITALY', code: 'it', gdp1985: 440_000, gdp2024: 2_330_000, color: '#8ed482' },
  { name: 'BRAZIL', code: 'br', gdp1985: 220_000, gdp2024: 2_170_000, color: '#7ec87a' },
  { name: 'CANADA', code: 'ca', gdp1985: 360_000, gdp2024: 2_140_000, color: '#d48ec4' },
  { name: 'RUSSIA', code: 'ru', gdp1985: 910_000, gdp2024: 2_020_000, color: '#e89868' },
  { name: 'SOUTH KOREA', code: 'kr', gdp1985: 95_000, gdp2024: 1_760_000, color: '#5ec9d8' },
  { name: 'AUSTRALIA', code: 'au', gdp1985: 180_000, gdp2024: 1_720_000, color: '#f0d060' },
  { name: 'MEXICO', code: 'mx', gdp1985: 210_000, gdp2024: 1_660_000, color: '#62c4de' },
  { name: 'SPAIN', code: 'es', gdp1985: 190_000, gdp2024: 1_580_000, color: '#e8c868' }
]

const START_YEAR = 1985
const END_YEAR = 2024
const YEAR_COUNT = END_YEAR - START_YEAR + 1

function growthFactor(country, year) {
  const t = (year - START_YEAR) / (END_YEAR - START_YEAR)

  if (country.name === 'CHINA') {
    return Math.pow(t, 0.55)
  }
  if (country.name === 'INDIA') {
    return Math.pow(t, 0.7)
  }
  if (country.name === 'UNITED STATES') {
    return Math.pow(t, 0.9)
  }

  return t
}

function gdpAtYear(country, year) {
  const factor = growthFactor(country, year)
  return country.gdp1985 + (country.gdp2024 - country.gdp1985) * factor
}

function buildDataset() {
  const header = ['GDP', 'Country', 'Year']
  const rows = []

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (const country of COUNTRIES) {
      rows.push([Math.round(gdpAtYear(country, year)), country.name, year])
    }
  }

  return [header, ...rows]
}

const countryColors = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.color])
)

const countryCodes = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, c.code])
)

const countryFlagImages = Object.fromEntries(
  COUNTRIES.map((c) => [c.name, `/flags/${c.code}.png`])
)

export const worldGdpTop10Mock = {
  id: 'world-gdp-top10',
  title: 'TOP 15 WORLD GDP',
  unit: '(IN MILLION $)',
  chartType: 'bar-race',
  updateFrequency: 2250,
  maxBars: 15,
  startYear: START_YEAR,
  endYear: END_YEAR,
  years: Array.from({ length: YEAR_COUNT }, (_, i) => START_YEAR + i),
  countryColors,
  countryCodes,
  countryFlagImages,
  dataset: buildDataset()
}
