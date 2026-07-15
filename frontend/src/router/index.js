import { createRouter, createWebHistory } from 'vue-router'
import AsiaGdpLineRaceView from '../views/AsiaGdpLineRaceView.vue'
import AsiaGdpView from '../views/AsiaGdpView.vue'
import CountdownBlackWhiteView from '../views/CountdownBlackWhiteView.vue'
import CountdownView from '../views/CountdownView.vue'
import CountdownWhiteBlackView from '../views/CountdownWhiteBlackView.vue'
import AfricaGdpLineRaceView from '../views/AfricaGdpLineRaceView.vue'
import AfricaGdpView from '../views/AfricaGdpView.vue'
import SouthAmericaGdpLineRaceView from '../views/SouthAmericaGdpLineRaceView.vue'
import SouthAmericaGdpView from '../views/SouthAmericaGdpView.vue'
import EuropeGdpLineRaceView from '../views/EuropeGdpLineRaceView.vue'
import EuropeGdpView from '../views/EuropeGdpView.vue'
import FlagsByRegionView from '../views/FlagsByRegionView.vue'
import GdpChinaG7BarRaceView from '../views/GdpChinaG7BarRaceView.vue'
import GdpChinaG7CompareView from '../views/GdpChinaG7CompareView.vue'
import GdpCjkBarRaceView from '../views/GdpCjkBarRaceView.vue'
import GdpCjkCompareView from '../views/GdpCjkCompareView.vue'
import GdpCjkLineRaceView from '../views/GdpCjkLineRaceView.vue'
import GdpIndiaG7KoreaCompareView from '../views/GdpIndiaG7KoreaCompareView.vue'
import GdpDualCompareView from '../views/GdpDualCompareView.vue'
import SouthAsiaBarRaceView from '../views/SouthAsiaBarRaceView.vue'
import SouthAsiaLineRaceView from '../views/SouthAsiaLineRaceView.vue'
import SoutheastAsiaBarRaceView from '../views/SoutheastAsiaBarRaceView.vue'
import SoutheastAsiaLineRaceView from '../views/SoutheastAsiaLineRaceView.vue'
import MiddleEastBarRaceView from '../views/MiddleEastBarRaceView.vue'
import MiddleEastLineRaceView from '../views/MiddleEastLineRaceView.vue'
import WorldGdpLineRaceView from '../views/WorldGdpLineRaceView.vue'
import WorldGdpTop10View from '../views/WorldGdpTop10View.vue'
import WorldGdpTreemapView from '../views/WorldGdpTreemapView.vue'
import WbDataAdminView from '../views/admin/WbDataAdminView.vue'

const routes = [
  {
    path: '/',
    redirect: '/world-gdp/top15'
  },
  {
    path: '/asia-gdp',
    redirect: '/asia-gdp/top15'
  },
  {
    path: '/asia-gdp/top15',
    name: 'asia-gdp-top15',
    component: AsiaGdpView,
    meta: {
      titleKey: 'routes.asiaGdpTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'asia-gdp-top15'
    }
  },
  {
    path: '/asia-gdp/countries',
    name: 'asia-gdp-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.asiaCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'asia-gdp-top15',
      continentId: 'asia'
    }
  },
  {
    path: '/europe-gdp',
    redirect: '/europe-gdp/top15'
  },
  {
    path: '/europe-gdp/top15',
    name: 'europe-gdp-top15',
    component: EuropeGdpView,
    meta: {
      titleKey: 'routes.europeGdpTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'europe-gdp-top15'
    }
  },
  {
    path: '/europe-gdp/countries',
    name: 'europe-gdp-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.europeCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'europe-gdp-top15',
      continentId: 'europe'
    }
  },
  {
    path: '/africa-gdp',
    redirect: '/africa-gdp/top15'
  },
  {
    path: '/africa-gdp/top15',
    name: 'africa-gdp-top15',
    component: AfricaGdpView,
    meta: {
      titleKey: 'routes.africaGdpTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'africa-gdp-top15'
    }
  },
  {
    path: '/africa-gdp/countries',
    name: 'africa-gdp-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.africaCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'africa-gdp-top15',
      continentId: 'africa'
    }
  },
  {
    path: '/south-america-gdp',
    redirect: '/south-america-gdp/top15'
  },
  {
    path: '/south-america-gdp/top15',
    name: 'south-america-gdp-top15',
    component: SouthAmericaGdpView,
    meta: {
      titleKey: 'routes.southAmericaGdpTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'south-america-gdp-top15'
    }
  },
  {
    path: '/south-america-gdp/countries',
    name: 'south-america-gdp-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.southAmericaCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'south-america-gdp-top15',
      continentId: 'southAmerica'
    }
  },
  {
    path: '/world-gdp/top10',
    redirect: '/world-gdp/top15'
  },
  {
    path: '/world-gdp/top15',
    name: 'world-gdp-top15',
    component: WorldGdpTop10View,
    meta: {
      titleKey: 'routes.worldGdpTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'world-gdp-top15'
    }
  },
  {
    path: '/bar-race/cjk',
    name: 'bar-race-cjk',
    component: GdpCjkBarRaceView,
    meta: {
      titleKey: 'routes.barRaceCjk',
      menuGroup: 'gdp',
      menuSubGroup: 'china-special',
      menuNestedSubGroup: 'cjk-three'
    }
  },
  {
    path: '/bar-race/china-g7',
    name: 'bar-race-china-g7',
    component: GdpChinaG7BarRaceView,
    meta: {
      titleKey: 'routes.barRaceChinaG7',
      menuGroup: 'gdp',
      menuSubGroup: 'china-special',
      menuNestedSubGroup: 'china-vs-g7'
    }
  },
  {
    path: '/bar-race/southeast-asia',
    name: 'bar-race-southeast-asia',
    component: SoutheastAsiaBarRaceView,
    meta: {
      titleKey: 'routes.barRaceSoutheastAsia',
      menuGroup: 'gdp',
      menuSubGroup: 'southeast-asia-gdp'
    }
  },
  {
    path: '/southeast-asia/countries',
    name: 'southeast-asia-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.southeastAsiaCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'southeast-asia-gdp',
      countryPreset: 'southeast-asia'
    }
  },
  {
    path: '/bar-race/south-asia',
    name: 'bar-race-south-asia',
    component: SouthAsiaBarRaceView,
    meta: {
      titleKey: 'routes.barRaceSouthAsia',
      menuGroup: 'gdp',
      menuSubGroup: 'south-asia-gdp'
    }
  },
  {
    path: '/south-asia/countries',
    name: 'south-asia-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.southAsiaCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'south-asia-gdp',
      countryPreset: 'south-asia'
    }
  },
  {
    path: '/bar-race/middle-east',
    name: 'bar-race-middle-east',
    component: MiddleEastBarRaceView,
    meta: {
      titleKey: 'routes.barRaceMiddleEast',
      menuGroup: 'gdp',
      menuSubGroup: 'middle-east-gdp'
    }
  },
  {
    path: '/middle-east/countries',
    name: 'middle-east-countries',
    component: FlagsByRegionView,
    meta: {
      titleKey: 'routes.middleEastCountries',
      menuGroup: 'gdp',
      menuSubGroup: 'middle-east-gdp',
      countryPreset: 'middle-east'
    }
  },
  {
    path: '/world-gdp/treemap-top10',
    name: 'world-gdp-treemap-top10',
    component: WorldGdpTreemapView,
    meta: { titleKey: 'routes.worldGdpTreemapTop10', menuGroup: 'charts' }
  },
  {
    path: '/line-race/world-top15',
    name: 'line-race-world-top15',
    component: WorldGdpLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceWorldTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'world-gdp-top15'
    }
  },
  {
    path: '/world-gdp/dual',
    name: 'world-gdp-dual',
    component: GdpDualCompareView,
    meta: {
      titleKey: 'routes.worldGdpDual',
      menuGroup: 'gdp'
    }
  },
  {
    path: '/line-race/cjk',
    name: 'line-race-cjk',
    component: GdpCjkLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceCjk',
      menuGroup: 'gdp',
      menuSubGroup: 'china-special',
      menuNestedSubGroup: 'cjk-three'
    }
  },
  {
    path: '/world-gdp/line-race/cjk',
    name: 'world-gdp-cjk',
    component: GdpCjkCompareView,
    meta: {
      titleKey: 'routes.worldGdpCjk',
      menuGroup: 'gdp',
      menuSubGroup: 'china-special'
    }
  },
  {
    path: '/world-gdp/line-race/china-g8',
    redirect: '/world-gdp/line-race/china-g7'
  },
  {
    path: '/world-gdp/line-race/china-g7',
    name: 'world-gdp-china-g7',
    component: GdpChinaG7CompareView,
    meta: {
      titleKey: 'routes.worldGdpChinaG7',
      menuGroup: 'gdp',
      menuSubGroup: 'china-special',
      menuNestedSubGroup: 'china-vs-g7'
    }
  },
  {
    path: '/world-gdp/line-race/india-g7-kr',
    name: 'world-gdp-india-g7-kr',
    component: GdpIndiaG7KoreaCompareView,
    meta: {
      titleKey: 'routes.worldGdpIndiaG7Kr',
      menuGroup: 'gdp',
      menuSubGroup: 'india-special'
    }
  },
  {
    path: '/line-race/asia-top15',
    name: 'line-race-asia-top15',
    component: AsiaGdpLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceAsiaTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'asia-gdp-top15'
    }
  },
  {
    path: '/line-race/europe-top15',
    name: 'line-race-europe-top15',
    component: EuropeGdpLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceEuropeTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'europe-gdp-top15'
    }
  },
  {
    path: '/line-race/africa-top15',
    name: 'line-race-africa-top15',
    component: AfricaGdpLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceAfricaTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'africa-gdp-top15'
    }
  },
  {
    path: '/line-race/south-america-top15',
    name: 'line-race-south-america-top15',
    component: SouthAmericaGdpLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceSouthAmericaTop15',
      menuGroup: 'gdp',
      menuSubGroup: 'south-america-gdp-top15'
    }
  },
  {
    path: '/line-race/southeast-asia',
    name: 'line-race-southeast-asia',
    component: SoutheastAsiaLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceSoutheastAsia',
      menuGroup: 'gdp',
      menuSubGroup: 'southeast-asia-gdp'
    }
  },
  {
    path: '/line-race/south-asia',
    name: 'line-race-south-asia',
    component: SouthAsiaLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceSouthAsia',
      menuGroup: 'gdp',
      menuSubGroup: 'south-asia-gdp'
    }
  },
  {
    path: '/line-race/middle-east',
    name: 'line-race-middle-east',
    component: MiddleEastLineRaceView,
    meta: {
      titleKey: 'routes.lineRaceMiddleEast',
      menuGroup: 'gdp',
      menuSubGroup: 'middle-east-gdp'
    }
  },
  {
    path: '/countdown',
    name: 'countdown',
    component: CountdownView,
    meta: { titleKey: 'routes.countdown', menuGroup: 'countdown' }
  },
  {
    path: '/countdown/black-white',
    name: 'countdown-black-white',
    component: CountdownBlackWhiteView,
    meta: { titleKey: 'routes.countdownBlackWhite', menuGroup: 'countdown' }
  },
  {
    path: '/countdown/white-black',
    name: 'countdown-white-black',
    component: CountdownWhiteBlackView,
    meta: { titleKey: 'routes.countdownWhiteBlack', menuGroup: 'countdown' }
  },
  {
    path: '/flags/by-region',
    name: 'flags-by-region',
    component: FlagsByRegionView,
    meta: { titleKey: 'routes.flagsByRegion', menuGroup: 'foundation-data' }
  },
  {
    path: '/admin/data',
    name: 'wb-data-admin',
    component: WbDataAdminView,
    meta: { titleKey: 'routes.wbDataAdmin', menuGroup: 'foundation-data' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
