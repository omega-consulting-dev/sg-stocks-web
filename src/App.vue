<script lang="ts">
export const description = 'A sidebar that collapses to icons.'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
</script>

<script setup lang="ts">
import AppNavbar from './components/navigation/AppNavbar.vue'
import AppSidebar from '@/components/navigation/AppSidebar.vue'
import ToastNotification from '@/components/notifications/ToastNotification.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useUserStore } from './stores/user'
import { useNotificationStore } from './stores/notificationStore'
import { useNotificationSound } from '@/composables/useNotificationSound'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const { play: playNotificationSound, init: initSound } = useNotificationSound()

// Référence au composant toast
const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null)

// Flag pour savoir si l'audio a été initialisé
const audioInitialized = ref(false)

// Initialiser l'audio au premier clic de l'utilisateur
const initAudioOnInteraction = async () => {
  if (!audioInitialized.value) {
    await initSound()
    audioInitialized.value = true
    // Retirer l'écouteur après la première interaction
    document.removeEventListener('click', initAudioOnInteraction)
    document.removeEventListener('keydown', initAudioOnInteraction)
  }
}

// Check if current route is an auth route
const isAuthRoute = computed(() => route.meta.layout === 'auth')

onMounted(async () => {
    userStore.setDomain()

    // Ajouter des écouteurs pour initialiser l'audio dès la première interaction
    document.addEventListener('click', initAudioOnInteraction, { once: true })
    document.addEventListener('keydown', initAudioOnInteraction, { once: true })

    // Configurer les callbacks pour les notifications AVANT d'initialiser le WebSocket
    notificationStore.setToastCallback((notification) => {
      if (toastRef.value) {
        toastRef.value.addToast({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        })
      }
    })

    notificationStore.setSoundCallback(async () => {
      // S'assurer que l'audio est initialisé avant de jouer
      if (!audioInitialized.value) {
        await initSound()
        audioInitialized.value = true
      }
      // Jouer le son
      await playNotificationSound()
    })

    // Initialiser le WebSocket si l'utilisateur a un token
    if (userStore.access_token) {
      notificationStore.initializeWebSocket(userStore.access_token)

      // Afficher les ruptures de stock non lues à la connexion
      setTimeout(() => {
        notificationStore.showStockRuptureOnLogin()
      }, 1000) // Délai de 1 seconde pour laisser le temps au WebSocket de se connecter
    }
})

// NOTE: On ne déconnecte PAS le WebSocket sur unmount car pendant le développement
// Vite HMR peut démonter/remonter le composant plusieurs fois, ce qui déconnecterait
// le WebSocket à chaque fois. Le WebSocket global reste connecté et c'est voulu.
// En production, la page se recharge complètement donc le WebSocket se ferme naturellement.

onUnmounted(() => {
  // Retirer les écouteurs d'événements
  document.removeEventListener('click', initAudioOnInteraction)
  document.removeEventListener('keydown', initAudioOnInteraction)

  // Déconnecter le WebSocket
  notificationStore.disconnectWebSocket()

  // Nettoyer les callbacks
  notificationStore.setToastCallback(() => {})
  notificationStore.setSoundCallback(() => {})
})
</script>

<template>
  <!-- Toast notifications (visible globally) -->
  <ToastNotification ref="toastRef" />
  <ToastContainer />

  <!-- Onboarding Modal (affiche automatiquement à la première connexion) -->
  <OnboardingModal v-if="!isAuthRoute" />

  <!-- Auth Layout (no sidebar/navbar) -->
  <div v-if="isAuthRoute" class="min-h-screen">
    <RouterView :key="route.fullPath" />
  </div>

  <!-- App Layout (with sidebar/navbar) -->
  <SidebarProvider v-else>
    <AppSidebar />
    <SidebarInset>
      <AppNavbar />
      <main class="p-4 flex-1">
        <RouterView :key="route.fullPath" />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
