<script lang="ts">
export const description = 'A sidebar that collapses to icons.'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
</script>

<script setup lang="ts">
import AppNavbar from './components/navigation/AppNavbar.vue'
import AppSidebar from '@/components/navigation/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()

onMounted(() => {
    userStore.setDomain()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppNavbar />
      <main class="p-4 flex-1">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
