<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUserStore } from '@/stores/user'
import NotificationPanel from './NotificationPanel.vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const notificationStore = useNotificationStore()
const userStore = useUserStore()

const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => unreadCount.value > 0)
const isWebSocketConnected = computed(() => notificationStore.isWebSocketConnected)

let pollingInterval: number | null = null

onMounted(async () => {
  // Charger les données initiales uniquement si l'utilisateur est authentifié
  if (userStore.isAuthenticated) {
    await notificationStore.fetchUnreadCount()

    // Démarrer le polling pour rafraîchir le compteur toutes les 10 secondes
    pollingInterval = window.setInterval(async () => {
      if (userStore.isAuthenticated) {
        await notificationStore.fetchUnreadCount()
      }
    }, 10000) // 10 secondes
  }
  // Le WebSocket est maintenant initialisé dans App.vue
})

onUnmounted(() => {
  // Nettoyer l'intervalle quand le composant est détruit
  if (pollingInterval !== null) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
})

const handleOpen = async () => {
  // Charger les notifications quand on ouvre le panel
  await notificationStore.fetchNotifications()
  // Rafraîchir le compteur après ouverture
  await notificationStore.fetchUnreadCount()
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button
        @click="handleOpen"
        class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell :size="20" />

        <!-- Indicateur de connexion WebSocket -->
        <span
          v-if="!isWebSocketConnected"
          class="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"
          title="WebSocket déconnecté"
        />

        <!-- Badge de compteur -->
        <span
          v-if="hasUnread"
          class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent
      class="w-[400px] p-0"
      align="end"
      :side-offset="8"
    >
      <NotificationPanel />
    </PopoverContent>
  </Popover>
</template>
