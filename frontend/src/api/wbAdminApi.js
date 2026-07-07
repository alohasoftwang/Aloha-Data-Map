import http from './http'

export async function fetchWbStats() {
  const { data } = await http.get('/wb/admin/stats')
  return data
}

export async function fetchWbImportStatus() {
  const { data } = await http.get('/wb/status')
  return data
}

export async function triggerWbImport() {
  const { data } = await http.post('/wb/import')
  return data
}

// countries
export async function fetchCountries(params) {
  const { data } = await http.get('/wb/admin/countries', { params })
  return data
}

export async function fetchAllCountries() {
  const { data } = await http.get('/wb/admin/countries/all')
  return data
}

export async function createCountry(payload) {
  const { data } = await http.post('/wb/admin/countries', payload)
  return data
}

export async function updateCountry(id, payload) {
  const { data } = await http.put(`/wb/admin/countries/${id}`, payload)
  return data
}

export async function deleteCountry(id) {
  await http.delete(`/wb/admin/countries/${id}`)
}

// indicators
export async function fetchIndicators(params) {
  const { data } = await http.get('/wb/admin/indicators', { params })
  return data
}

export async function fetchAllIndicators() {
  const { data } = await http.get('/wb/admin/indicators/all')
  return data
}

export async function createIndicator(payload) {
  const { data } = await http.post('/wb/admin/indicators', payload)
  return data
}

export async function updateIndicator(id, payload) {
  const { data } = await http.put(`/wb/admin/indicators/${id}`, payload)
  return data
}

export async function deleteIndicator(id) {
  await http.delete(`/wb/admin/indicators/${id}`)
}

// gdp values
export async function fetchGdpValues(params) {
  const { data } = await http.get('/wb/admin/gdp-values', { params })
  return data
}

export async function createGdpValue(payload) {
  const { data } = await http.post('/wb/admin/gdp-values', payload)
  return data
}

export async function updateGdpValue(id, payload) {
  const { data } = await http.put(`/wb/admin/gdp-values/${id}`, payload)
  return data
}

export async function deleteGdpValue(id) {
  await http.delete(`/wb/admin/gdp-values/${id}`)
}
