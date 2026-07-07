import { createRouter, createWebHistory } from 'vue-router'
import AsiaGdpView from '../views/AsiaGdpView.vue'
import WorldGdpTop10View from '../views/WorldGdpTop10View.vue'
import WbDataAdminView from '../views/admin/WbDataAdminView.vue'

const routes = [
  {
    path: '/',
    redirect: '/asia-gdp'
  },
  {
    path: '/asia-gdp',
    name: 'asia-gdp',
    component: AsiaGdpView,
    meta: { title: 'Asia GDP' }
  },
  {
    path: '/world-gdp/top10',
    redirect: '/world-gdp/top15'
  },
  {
    path: '/world-gdp/top15',
    name: 'world-gdp-top15',
    component: WorldGdpTop10View,
    meta: { title: 'World GDP TOP 15', menuGroup: 'world-gdp' }
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
