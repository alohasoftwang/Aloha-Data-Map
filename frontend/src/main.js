import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n/index.js'
import router from './router'
import './styles/chart-title-font.css'
import './styles/main.css'

createApp(App).use(i18n).use(router).mount('#app')
