import { createRouter, createWebHistory } from 'vue-router'
import AsiaGdpLineRaceView from '../views/AsiaGdpLineRaceView.vue'
import AsiaGdpView from '../views/AsiaGdpView.vue'
import FlagsByRegionView from '../views/FlagsByRegionView.vue'
import GdpChinaG7BarRaceView from '../views/GdpChinaG7BarRaceView.vue'
import GdpChinaG7CompareView from '../views/GdpChinaG7CompareView.vue'
import GdpCjkCompareView from '../views/GdpCjkCompareView.vue'
import GdpIndiaG7KoreaCompareView from '../views/GdpIndiaG7KoreaCompareView.vue'
import GdpDualCompareView from '../views/GdpDualCompareView.vue'
import SouthAsiaBarRaceView from '../views/SouthAsiaBarRaceView.vue'
import SouthAsiaLineRaceView from '../views/SouthAsiaLineRaceView.vue'
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
    meta: { title: 'Asia GDP TOP 15', menuGroup: 'bar-chart-race' }
  },
  {
    path: '/world-gdp/top10',
    redirect: '/world-gdp/top15'
  },
  {
    path: '/world-gdp/top15',
    name: 'world-gdp-top15',
    component: WorldGdpTop10View,
    meta: { title: 'World GDP TOP 15', menuGroup: 'bar-chart-race' }
  },
  {
    path: '/bar-race/china-g7',
    name: 'bar-race-china-g7',
    component: GdpChinaG7BarRaceView,
    meta: { title: 'China vs G7', menuGroup: 'bar-chart-race' }
  },
  {
    path: '/bar-race/south-asia',
    name: 'bar-race-south-asia',
    component: SouthAsiaBarRaceView,
    meta: { title: 'South Asia GDP', menuGroup: 'bar-chart-race' }
  },
  {
    path: '/world-gdp/treemap-top10',
    name: 'world-gdp-treemap-top10',
    component: WorldGdpTreemapView,
    meta: { title: 'World GDP TOP 10 Treemap', menuGroup: 'charts' }
  },
  {
    path: '/line-race/world-top15',
    name: 'line-race-world-top15',
    component: WorldGdpLineRaceView,
    meta: {
      title: 'World GDP TOP 15',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/world-gdp/dual',
    name: 'world-gdp-dual',
    component: GdpDualCompareView,
    meta: {
      title: 'GDP Dual Curve Race',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/world-gdp/line-race/cjk',
    name: 'world-gdp-cjk',
    component: GdpCjkCompareView,
    meta: {
      title: 'China vs Japan vs Korea vs India',
      menuGroup: 'line-race'
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
      title: 'China vs G7',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/world-gdp/line-race/india-g7-kr',
    name: 'world-gdp-india-g7-kr',
    component: GdpIndiaG7KoreaCompareView,
    meta: {
      title: 'India vs G7 ex-US + Korea',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/line-race/asia-top15',
    name: 'line-race-asia-top15',
    component: AsiaGdpLineRaceView,
    meta: {
      title: 'Asia GDP TOP 15',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/line-race/south-asia',
    name: 'line-race-south-asia',
    component: SouthAsiaLineRaceView,
    meta: {
      title: 'South Asia GDP',
      menuGroup: 'line-race'
    }
  },
  {
    path: '/flags/by-region',
    name: 'flags-by-region',
    component: FlagsByRegionView,
    meta: { title: 'Flags by Region', menuGroup: 'reference' }
  },
  {
    path: '/admin/data',
    name: 'wb-data-admin',
    component: WbDataAdminView,
    meta: { title: 'Data Management', menuGroup: 'data-admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
