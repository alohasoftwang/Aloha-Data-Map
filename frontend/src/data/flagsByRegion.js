/** 地理亚洲 + 其他图表用国旗（仅含 public/flags 中已有 PNG） */
export const FLAG_REGIONS = [
  {
    id: 'east-asia',
    label: 'East Asia (东亚)',
    countries: [
      { iso2: 'cn', name: 'China', flag: '/flags/cn.png' },
      { iso2: 'jp', name: 'Japan', flag: '/flags/jp.png' },
      { iso2: 'kr', name: 'South Korea', flag: '/flags/kr.png' },
      { iso2: 'kp', name: 'North Korea', flag: '/flags/kp.png' },
      { iso2: 'mn', name: 'Mongolia', flag: '/flags/mn.png' }
    ]
  },
  {
    id: 'southeast-asia',
    label: 'Southeast Asia (东南亚)',
    countries: [
      { iso2: 'id', name: 'Indonesia', flag: '/flags/id.png' },
      { iso2: 'th', name: 'Thailand', flag: '/flags/th.png' },
      { iso2: 'my', name: 'Malaysia', flag: '/flags/my.png' },
      { iso2: 'sg', name: 'Singapore', flag: '/flags/sg.png' },
      { iso2: 'vn', name: 'Vietnam', flag: '/flags/vn.png' },
      { iso2: 'ph', name: 'Philippines', flag: '/flags/ph.png' },
      { iso2: 'mm', name: 'Myanmar', flag: '/flags/mm.png' },
      { iso2: 'kh', name: 'Cambodia', flag: '/flags/kh.png' },
      { iso2: 'la', name: 'Laos', flag: '/flags/la.png' },
      { iso2: 'bn', name: 'Brunei', flag: '/flags/bn.png' },
      { iso2: 'tl', name: 'Timor-Leste', flag: '/flags/tl.png' }
    ]
  },
  {
    id: 'south-asia',
    label: 'South Asia (南亚)',
    countries: [
      { iso2: 'in', name: 'India', flag: '/flags/in.png' },
      { iso2: 'pk', name: 'Pakistan', flag: '/flags/pk.png' },
      { iso2: 'bd', name: 'Bangladesh', flag: '/flags/bd.png' },
      { iso2: 'lk', name: 'Sri Lanka', flag: '/flags/lk.png' },
      { iso2: 'np', name: 'Nepal', flag: '/flags/np.png' },
      { iso2: 'bt', name: 'Bhutan', flag: '/flags/bt.png' },
      { iso2: 'mv', name: 'Maldives', flag: '/flags/mv.png' },
      { iso2: 'af', name: 'Afghanistan', flag: '/flags/af.png' }
    ]
  },
  {
    id: 'west-asia',
    label: 'West Asia (西亚)',
    countries: [
      { iso2: 'sa', name: 'Saudi Arabia', flag: '/flags/sa.png' },
      { iso2: 'ae', name: 'United Arab Emirates', flag: '/flags/ae.png' },
      { iso2: 'qa', name: 'Qatar', flag: '/flags/qa.png' },
      { iso2: 'kw', name: 'Kuwait', flag: '/flags/kw.png' },
      { iso2: 'om', name: 'Oman', flag: '/flags/om.png' },
      { iso2: 'bh', name: 'Bahrain', flag: '/flags/bh.png' },
      { iso2: 'il', name: 'Israel', flag: '/flags/il.png' },
      { iso2: 'jo', name: 'Jordan', flag: '/flags/jo.png' },
      { iso2: 'lb', name: 'Lebanon', flag: '/flags/lb.png' },
      { iso2: 'iq', name: 'Iraq', flag: '/flags/iq.png' },
      { iso2: 'ir', name: 'Iran', flag: '/flags/ir.png' },
      { iso2: 'sy', name: 'Syria', flag: '/flags/sy.png' },
      { iso2: 'ye', name: 'Yemen', flag: '/flags/ye.png' },
      { iso2: 'tr', name: 'Türkiye', flag: '/flags/tr.png' },
      { iso2: 'cy', name: 'Cyprus', flag: '/flags/cy.png' }
    ]
  },
  {
    id: 'central-asia',
    label: 'Central Asia (中亚)',
    countries: [
      { iso2: 'kz', name: 'Kazakhstan', flag: '/flags/kz.png' },
      { iso2: 'uz', name: 'Uzbekistan', flag: '/flags/uz.png' },
      { iso2: 'tm', name: 'Turkmenistan', flag: '/flags/tm.png' },
      { iso2: 'kg', name: 'Kyrgyzstan', flag: '/flags/kg.png' },
      { iso2: 'tj', name: 'Tajikistan', flag: '/flags/tj.png' }
    ]
  },
  {
    id: 'oceania',
    label: 'Oceania',
    countries: [
      { iso2: 'au', name: 'Australia', flag: '/flags/au.png' },
      { iso2: 'fj', name: 'Fiji', flag: '/flags/fj.png' },
      { iso2: 'pg', name: 'Papua New Guinea', flag: '/flags/pg.png' },
      { iso2: 'pf', name: 'French Polynesia', flag: '/flags/pf.png' }
    ]
  },
  {
    id: 'europe',
    label: 'Europe',
    countries: [
      { iso2: 'fr', name: 'France', flag: '/flags/fr.png' },
      { iso2: 'de', name: 'Germany', flag: '/flags/de.png' },
      { iso2: 'it', name: 'Italy', flag: '/flags/it.png' },
      { iso2: 'nl', name: 'Netherlands', flag: '/flags/nl.png' },
      { iso2: 'ru', name: 'Russia', flag: '/flags/ru.png' },
      { iso2: 'es', name: 'Spain', flag: '/flags/es.png' },
      { iso2: 'su', name: 'Soviet Union', flag: '/flags/su.png' },
      { iso2: 'se', name: 'Sweden', flag: '/flags/se.png' },
      { iso2: 'ch', name: 'Switzerland', flag: '/flags/ch.png' },
      { iso2: 'gb', name: 'United Kingdom', flag: '/flags/gb.png' }
    ]
  },
  {
    id: 'north-america',
    label: 'North America',
    countries: [
      { iso2: 'ca', name: 'Canada', flag: '/flags/ca.png' },
      { iso2: 'us', name: 'United States', flag: '/flags/us.png' }
    ]
  },
  {
    id: 'latin-america-caribbean',
    label: 'Latin America & Caribbean',
    countries: [
      { iso2: 'ar', name: 'Argentina', flag: '/flags/ar.png' },
      { iso2: 'br', name: 'Brazil', flag: '/flags/br.png' },
      { iso2: 'mx', name: 'Mexico', flag: '/flags/mx.png' }
    ]
  }
]

export const FLAG_COUNT = FLAG_REGIONS.reduce(
  (sum, region) => sum + region.countries.length,
  0
)
