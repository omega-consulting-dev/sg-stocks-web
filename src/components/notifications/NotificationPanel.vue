<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore, type Notification } from '@/stores/notificationStore'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AlertCircle,
  CheckCircle,
  Package,
  Clock,
  DollarSign,
  FileText,
  CheckCheck,
  Trash2,
  Loader2,
  Bell
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)
const unreadNotifications = computed(() => notificationStore.unreadNotifications)
const readNotifications = computed(() => notificationStore.readNotifications)
const isLoading = computed(() => notificationStore.isLoading)

const activeTab = ref('all')

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'stock_rupture':
    case 'stock_low':
      return Package
    case 'debt_due':
    case 'payment_due':
      return Clock
    case 'transfer_pending':
    case 'transfer_validated':
      return CheckCircle
    case 'payment_received':
      return DollarSign
    case 'invoice_created':
    case 'invoice_paid':
      return FileText
    default:
      return AlertCircle
  }
}

const getNotificationColor = (type: string, priority: string) => {
  if (priority === 'urgent') return 'text-red-600 bg-red-50'
  if (priority === 'high') return 'text-orange-600 bg-orange-50'

  switch (type) {
    case 'stock_rupture':
      return 'text-red-600 bg-red-50'
    case 'stock_low':
      return 'text-yellow-600 bg-yellow-50'
    case 'debt_due':
    case 'payment_due':
      return 'text-orange-600 bg-orange-50'
    case 'transfer_validated':
    case 'payment_received':
    case 'invoice_paid':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-blue-600 bg-blue-50'
  }
}

const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr
  })
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.id)
  }

  // Rediriger vers l'action si URL fournie
  if (notification.action_url) {
    // TODO: Implémenter la navigation
  }
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDeleteRead = async () => {
  await notificationStore.deleteReadNotifications()
}
</script>

<template>
  <div class="flex flex-col h-full max-h-[600px]">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>

      <div class="flex items-center gap-2">
        <Button
          v-if="unreadNotifications.length > 0"
          variant="ghost"
          size="sm"
          @click="handleMarkAllAsRead"
          class="text-xs"
        >
          <CheckCheck :size="14" class="mr-1" />
          Tout marquer
        </Button>

        <Button
          v-if="readNotifications.length > 0"
          variant="ghost"
          size="sm"
          @click="handleDeleteRead"
          class="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 :size="14" class="mr-1" />
          Supprimer lues
        </Button>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="flex-1 flex flex-col">
      <TabsList class="w-full justify-start rounded-none border-b px-4">
        <TabsTrigger value="all" class="relative">
          Toutes
          <span v-if="notifications.length > 0" class="ml-2 text-xs text-gray-500">
            {{ notifications.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="unread" class="relative">
          Non lues
          <span v-if="unreadNotifications.length > 0" class="ml-2 px-1.5 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
            {{ unreadNotifications.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <Loader2 :size="32" class="animate-spin text-gray-400" />
      </div>

      <!-- Content -->
      <template v-else>
        <!-- All Notifications -->
        <TabsContent value="all" class="flex-1 m-0">
          <ScrollArea class="h-[500px]">
            <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell :size="48" class="text-gray-300 mb-3" />
              <p class="text-sm text-gray-500">Aucune notification</p>
            </div>

            <div v-else class="divide-y">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                @click="handleNotificationClick(notification)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{ 'bg-blue-50/50': !notification.is_read }"
              >
                <div class="flex gap-3">
                  <!-- Icon -->
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    :class="getNotificationColor(notification.type, notification.priority)"
                  >
                    <component :is="getNotificationIcon(notification.type)" :size="20" />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-gray-900 truncate">
                        {{ notification.title }}
                      </h4>
                      <span
                        v-if="!notification.is_read"
                        class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"
                      />
                    </div>

                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                      {{ notification.message }}
                    </p>

                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ formatDate(notification.created_at) }}</span>
                      <span v-if="notification.priority === 'urgent' || notification.priority === 'high'"
                            class="px-2 py-0.5 rounded-full font-medium"
                            :class="notification.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                        {{ notification.priority_display }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <!-- Unread Notifications -->
        <TabsContent value="unread" class="flex-1 m-0">
          <ScrollArea class="h-[500px]">
            <div v-if="unreadNotifications.length === 0" class="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CheckCircle :size="48" class="text-green-400 mb-3" />
              <p class="text-sm text-gray-500">Aucune notification non lue</p>
            </div>

            <div v-else class="divide-y">
              <div
                v-for="notification in unreadNotifications"
                :key="notification.id"
                @click="handleNotificationClick(notification)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors bg-blue-50/50"
              >
                <div class="flex gap-3">
                  <!-- Icon -->
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    :class="getNotificationColor(notification.type, notification.priority)"
                  >
                    <component :is="getNotificationIcon(notification.type)" :size="20" />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-gray-900 truncate">
                        {{ notification.title }}
                      </h4>
                      <span class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                    </div>

                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                      {{ notification.message }}
                    </p>

                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ formatDate(notification.created_at) }}</span>
                      <span v-if="notification.priority === 'urgent' || notification.priority === 'high'"
                            class="px-2 py-0.5 rounded-full font-medium"
                            :class="notification.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                        {{ notification.priority_display }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </template>
    </Tabs>
  </div>
</template>
