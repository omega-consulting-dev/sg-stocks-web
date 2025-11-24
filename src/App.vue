<script lang="ts">
export const description = 'A sidebar that collapses to icons.'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
</script>

<script setup lang="ts">
import AppNavbar from './components/navigation/AppNavbar.vue'
import AppSidebar from '@/components/navigation/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { onMounted, computed } from 'vue'
import { useUserStore } from './stores/user'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

// Check if current route is an auth route
const isAuthRoute = computed(() => route.meta.layout === 'auth')

onMounted(() => {
    userStore.setDomain()
})
</script>

<template>
  <!-- Auth Layout (no sidebar/navbar) -->
  <div v-if="isAuthRoute" class="min-h-screen">
    <RouterView />
  </div>

  <!-- App Layout (with sidebar/navbar) -->
  <SidebarProvider v-else>
    <AppSidebar />
    <SidebarInset>
      <AppNavbar />
      <main class="p-4 flex-1">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
