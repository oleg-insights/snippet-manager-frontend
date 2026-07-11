import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router/index'
import App from './App.vue'

import './assets/styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Toast, { timeout: 2500 })
app.use(router)
app.mount('#app')
