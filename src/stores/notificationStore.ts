import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/services/axios.service'
import { useWebSocket } from '@/composables/useWebSocket'

export interface Notification {
  id: number
  type: string
  type_display: string
  title: string
  message: string
  priority: string
  priority_display: string
  is_read: boolean
  read_at: string | null
  data: any
  action_url: string | null
  created_at: string
  updated_at: string
}

// Interface pour le callback toast
export interface ToastCallback {
  (notification: Notification): void
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const toastCallback = ref<ToastCallback | null>(null)
  const soundCallback = ref<(() => void) | null>(null)

  // WebSocket
  const ws = useWebSocket()

  // Computed
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.is_read)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.is_read)
  )

  // Actions
  async function fetchNotifications() {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get('/notifications/')
      notifications.value = response.data.results || response.data
      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await axios.get('/notifications/unread_count/')
      unreadCount.value = response.data.count
    } catch (err: any) {
      // Ignorer silencieusement l'erreur 404 (endpoint non disponible)
      if (err.response?.status !== 404) {
        console.error('Error fetching unread count:', err)
      }
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      await axios.post(`/notifications/${notificationId}/mark_as_read/`)

      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du marquage'
      console.error('Error marking as read:', err)
    }
  }

  async function markMultipleAsRead(notificationIds: number[]) {
    try {
      await axios.post('/notifications/mark_multiple_as_read/', {
        notification_ids: notificationIds
      })

      notificationIds.forEach(id => {
        const notification = notifications.value.find(n => n.id === id)
        if (notification && !notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        }
      })

      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du marquage multiple'
      console.error('Error marking multiple as read:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await axios.post('/notifications/mark_multiple_as_read/', {
        mark_all: true
      })

      notifications.value.forEach(n => {
        if (!n.is_read) {
          n.is_read = true
          n.read_at = new Date().toISOString()
        }
      })

      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du marquage de toutes'
      console.error('Error marking all as read:', err)
    }
  }

  async function deleteReadNotifications() {
    try {
      await axios.delete('/notifications/delete_read/')
      notifications.value = notifications.value.filter(n => !n.is_read)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      console.error('Error deleting read notifications:', err)
    }
  }

  // Afficher les ruptures de stock non lues à la connexion
  async function showStockRuptureOnLogin() {
    try {
      const response = await axios.get('/notifications/')
      const stockRuptureNotifications = (response.data.results || response.data).filter(
        (n: Notification) => n.type === 'stock_rupture' && !n.is_read
      )

      // Afficher chaque notification de rupture dans le toast
      if (toastCallback.value && stockRuptureNotifications.length > 0) {
        stockRuptureNotifications.forEach((notif: Notification) => {
          toastCallback.value!(notif)
        })
      }
    } catch (err: any) {
      console.error('Error fetching stock rupture notifications:', err)
    }
  }

  // WebSocket handlers
  function initializeWebSocket(token: string) {
    if (!token || ws.isConnected.value) {
      return
    }

    // Set up message handler
    ws.setMessageHandler((data) => {
      if (data.type === 'new_notification' && data.notification) {
        // Add new notification to the list
        const newNotif = {
          ...data.notification,
          type_display: data.notification.category,
          priority_display: data.notification.priority,
          read_at: null,
          data: {},
          action_url: null,
          updated_at: data.notification.created_at
        } as Notification

        // Add to beginning of list
        notifications.value.unshift(newNotif)
        unreadCount.value++

        // Play sound
        if (soundCallback.value) {
          soundCallback.value()
        }

        // Show toast
        if (toastCallback.value) {
          toastCallback.value(newNotif)
        }
      } else if (data.type === 'unread_count' && data.count !== undefined) {
        unreadCount.value = data.count
      }
    })

    // Connect WebSocket
    ws.connect(token)
  }

  function disconnectWebSocket() {
    ws.disconnect()
  }

  // Setters pour les callbacks
  function setToastCallback(callback: ToastCallback) {
    toastCallback.value = callback
  }

  function setSoundCallback(callback: () => void) {
    soundCallback.value = callback
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    unreadNotifications,
    readNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteReadNotifications,
    showStockRuptureOnLogin,
    initializeWebSocket,
    disconnectWebSocket,
    setToastCallback,
    setSoundCallback,
    // Expose WebSocket state
    isWebSocketConnected: ws.isConnected
  }
})
