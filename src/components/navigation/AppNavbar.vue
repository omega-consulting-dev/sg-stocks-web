<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import { useUserStore } from '@/stores/user'

import ToggleMode from '@/components/navigation/ToggleMode.vue'
import NavUser from '@/components/navigation/NavUser.vue'

const userStore = useUserStore()

const user = computed(() => ({
  name: userStore.user?.name || userStore.user?.username || 'Utilisateur',
  email: userStore.user?.email || '',
  avatar: '',
  company: userStore.user?.tenant_name || 'My Company',
}))
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b"
  >
    <div class="flex items-center justify-between px-4 w-full">
      <SidebarTrigger class="-ml-1" />

      <div class="flex items-center gap-2">
        <ToggleMode />
        <NotificationBell />
        <NavUser :user="user" />
      </div>
    </div>
  </header>
</template>
