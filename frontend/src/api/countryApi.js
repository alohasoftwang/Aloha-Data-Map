import http from './http.js'

export async function fetchCountries() {
  const { data } = await http.get('/countries')
  return data
}

export async function fetchGdpByYear(year = 2025) {
  const { data } = await http.get('/countries/gdp-by-year', { params: { year } })
  return data
}
