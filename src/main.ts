import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { permission } from './directives/permission'
import { useUserStore } from './stores/user'
import i18n from './locales'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(i18n)

// Charger l'utilisateur depuis localStorage avant de monter l'app
const userStore = useUserStore()
userStore.loadUserFromStorage()

app.use(router)

// Enregistrer la directive de permissions
app.directive('permission', permission)

app.mount('#app')
