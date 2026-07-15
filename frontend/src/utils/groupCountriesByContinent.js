import { CONTINENT_ORDER, SUBREGION_ORDER, getGeography } from '../config/countryGeography.js'
import { getCountryDisplayName } from './countryDisplayNames.js'
import { getFlagUrl } from './availableFlags.js'
import { iso3ToIso2 } from './iso3ToIso2.js'

function toCountryItem(row) {
  const iso3 = row.countryCode?.toUpperCase() ?? ''
  const iso2 = iso3ToIso2(iso3)

  return {
    id: row.id,
    iso3,
    iso2,
    name: getCountryDisplayName(iso3, row.countryName),
    region: row.region,
    incomeGroup: row.incomeGroup,
    flag: getFlagUrl(iso2),
    hasFlag: Boolean(getFlagUrl(iso2))
  }
}

export { toCountryItem }

export function groupCountriesByContinent(countries) {
  const continentMap = new Map(
    CONTINENT_ORDER.map((id) => [id, new Map()])
  )

  const unassigned = []

  for (const row of countries) {
    if (!row.region) continue

    const item = toCountryItem(row)
    const geo = getGeography(item.iso3)

    if (!geo) {
      unassigned.push(item)
      continue
    }

    const { continent, subregion } = geo
    if (!continentMap.has(continent)) {
      continentMap.set(continent, new Map())
    }

    const subregionMap = continentMap.get(continent)
    if (!subregionMap.has(subregion)) {
      subregionMap.set(subregion, [])
    }
    subregionMap.get(subregion).push(item)
  }

  const continents = CONTINENT_ORDER.map((continentId) => {
    const subregionMap = continentMap.get(continentId)
    if (!subregionMap?.size) return null

    const subregionOrder = SUBREGION_ORDER[continentId] ?? []
    const regions = subregionOrder
      .map((subregionId) => {
        const items = subregionMap.get(subregionId) ?? []
        if (!items.length) return null
        items.sort((a, b) => a.name.localeCompare(b.name, 'en'))
        return {
          id: subregionId,
          countries: items
        }
      })
      .filter(Boolean)

    for (const [subregionId, items] of subregionMap.entries()) {
      if (subregionOrder.includes(subregionId)) continue
      items.sort((a, b) => a.name.localeCompare(b.name, 'en'))
      regions.push({ id: subregionId, countries: items })
    }

    const countryCount = regions.reduce((sum, region) => sum + region.countries.length, 0)
    if (!countryCount) return null

    return {
      id: continentId,
      regions,
      countryCount
    }
  }).filter(Boolean)

  if (unassigned.length) {
    unassigned.sort((a, b) => a.name.localeCompare(b.name, 'en'))
    continents.push({
      id: 'other',
      regions: [{ id: 'other', countries: unassigned }],
      countryCount: unassigned.length
    })
  }

  const totalCountries = continents.reduce((sum, continent) => sum + continent.countryCount, 0)
  const totalFlags = countries.reduce((sum, row) => {
    const iso2 = iso3ToIso2(row.countryCode)
    return sum + (getFlagUrl(iso2) ? 1 : 0)
  }, 0)

  return {
    continents,
    totalCountries,
    totalFlags
  }
}
