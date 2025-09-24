<script lang="ts">
export const description
  = "A sidebar that collapses to icons."
export const iframeHeight = "800px"
export const containerClass = "w-full h-full"
</script>

<script setup lang="ts">
import AppNavbar from "./components/navigation/AppNavbar.vue"
import AppSidebar from "@/components/navigation/AppSidebar.vue"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppNavbar />
      <main class="p-4 flex-1">
        <RouterView />      
        <div v-for="( ico, index) in 7" :key="index" class="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="aspect-video rounded-xl bg-muted/50" />
            <div class="aspect-video rounded-xl bg-muted/50" />
            <div class="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
