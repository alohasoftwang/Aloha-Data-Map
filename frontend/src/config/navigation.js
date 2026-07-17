export const NAV_GROUPS = [
  {
    id: 'foundation-data',
    labelKey: 'menu.groups.foundationData',
    children: [
      { path: '/admin/data', labelKey: 'menu.items.wbTables' },
      { path: '/flags/by-region', labelKey: 'menu.items.flagsByRegion' }
    ]
  },
  {
    id: 'gdp',
    labelKey: 'menu.groups.gdp',
    children: [
      {
        id: 'world-gdp-top15',
        labelKey: 'menu.items.worldGdpTop15',
        children: [
          { path: '/world-gdp/top15', labelKey: 'menu.items.worldGdpTop15Bar' },
          { path: '/line-race/world-top15', labelKey: 'menu.items.worldGdpTop15Line' },
          { path: '/m/world-gdp/top15', labelKey: 'menu.items.worldGdpTop15Mobile' }
        ]
      },
      {
        id: 'asia-gdp-top15',
        labelKey: 'menu.items.asiaGdpTop15',
        children: [
          { path: '/asia-gdp/top15', labelKey: 'menu.items.asiaGdpTop15Bar' },
          { path: '/line-race/asia-top15', labelKey: 'menu.items.asiaGdpTop15Line' },
          { path: '/asia-gdp/countries', labelKey: 'menu.items.asiaCountries' }
        ]
      },
      {
        id: 'europe-gdp-top15',
        labelKey: 'menu.items.europeGdpTop15',
        children: [
          { path: '/europe-gdp/top15', labelKey: 'menu.items.europeGdpTop15Bar' },
          { path: '/line-race/europe-top15', labelKey: 'menu.items.europeGdpTop15Line' },
          { path: '/europe-gdp/countries', labelKey: 'menu.items.europeCountries' }
        ]
      },
      {
        id: 'africa-gdp-top15',
        labelKey: 'menu.items.africaGdpTop15',
        children: [
          { path: '/africa-gdp/top15', labelKey: 'menu.items.africaGdpTop15Bar' },
          { path: '/line-race/africa-top15', labelKey: 'menu.items.africaGdpTop15Line' },
          { path: '/africa-gdp/countries', labelKey: 'menu.items.africaCountries' }
        ]
      },
      {
        id: 'south-america-gdp-top15',
        labelKey: 'menu.items.southAmericaGdpTop15',
        children: [
          { path: '/south-america-gdp/top15', labelKey: 'menu.items.southAmericaGdpTop15Bar' },
          { path: '/line-race/south-america-top15', labelKey: 'menu.items.southAmericaGdpTop15Line' },
          { path: '/south-america-gdp/countries', labelKey: 'menu.items.southAmericaCountries' }
        ]
      },
      {
        id: 'southeast-asia-gdp',
        labelKey: 'menu.items.southeastAsiaGdp',
        children: [
          { path: '/bar-race/southeast-asia', labelKey: 'menu.items.southeastAsiaGdpBar' },
          { path: '/line-race/southeast-asia', labelKey: 'menu.items.southeastAsiaGdpLine' },
          { path: '/southeast-asia/countries', labelKey: 'menu.items.southeastAsiaCountries' }
        ]
      },
      {
        id: 'south-asia-gdp',
        labelKey: 'menu.items.southAsiaGdp',
        children: [
          { path: '/bar-race/south-asia', labelKey: 'menu.items.southAsiaGdpBar' },
          { path: '/line-race/south-asia', labelKey: 'menu.items.southAsiaGdpLine' },
          { path: '/south-asia/countries', labelKey: 'menu.items.southAsiaCountries' }
        ]
      },
      {
        id: 'middle-east-gdp',
        labelKey: 'menu.items.middleEastGdp',
        children: [
          { path: '/bar-race/middle-east', labelKey: 'menu.items.middleEastGdpBar' },
          { path: '/line-race/middle-east', labelKey: 'menu.items.middleEastGdpLine' },
          { path: '/middle-east/countries', labelKey: 'menu.items.middleEastCountries' }
        ]
      },
      {
        id: 'china-special',
        labelKey: 'menu.items.chinaSpecial',
        children: [
          {
            id: 'china-vs-g7',
            labelKey: 'menu.items.chinaVsG7',
            children: [
              { path: '/bar-race/china-g7', labelKey: 'menu.items.chinaVsG7Bar' },
              { path: '/world-gdp/line-race/china-g7', labelKey: 'menu.items.chinaVsG7Line' }
            ]
          },
          {
            id: 'cjk-three',
            labelKey: 'menu.items.cjkThree',
            children: [
              { path: '/bar-race/cjk', labelKey: 'menu.items.cjkThreeBar' },
              { path: '/line-race/cjk', labelKey: 'menu.items.cjkThreeLine' }
            ]
          },
          {
            path: '/world-gdp/line-race/cjk',
            labelKey: 'menu.items.cjkCompare'
          }
        ]
      },
      {
        id: 'india-special',
        labelKey: 'menu.items.indiaSpecial',
        children: [
          {
            path: '/world-gdp/line-race/india-g7-kr',
            labelKey: 'menu.items.indiaG7KrLine'
          }
        ]
      },
      {
        path: '/world-gdp/dual',
        labelKey: 'menu.items.gdpDualCurveRace'
      }
    ]
  },
  {
    id: 'charts',
    labelKey: 'menu.groups.charts',
    children: [
      { path: '/world-gdp/treemap-top10', labelKey: 'menu.items.worldGdpTreemapTop10' }
    ]
  },
  {
    id: 'countdown',
    labelKey: 'menu.groups.countdown',
    children: [
      { path: '/countdown', labelKey: 'menu.items.countdown' },
      { path: '/countdown/black-white', labelKey: 'menu.items.countdownBlackWhite' },
      { path: '/countdown/white-black', labelKey: 'menu.items.countdownWhiteBlack' }
    ]
  }
]
