import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charger explicitement les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Définir les variables pour qu'elles soient disponibles côté client
    define: {
      'import.meta.env.VITE_API_BASE_DOMAIN': JSON.stringify(env.VITE_API_BASE_DOMAIN),
      'import.meta.env.VITE_API_PORT': JSON.stringify(env.VITE_API_PORT),
      'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(env.VITE_API_TIMEOUT)
    }
  }
})
