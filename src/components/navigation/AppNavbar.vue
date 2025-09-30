<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell } from 'lucide-vue-next'

import ToggleMode from '@/components/navigation/ToggleMode.vue'
import NavUser from '@/components/navigation/NavUser.vue'

const user = {
  name: 'Super user',
  email: 'admin@gmail.com',
  avatar:
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  company: 'My Company',
}
</script>

<template>
  <header
    class="sticky top-0 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b"
  >
    <div class="flex items-center justify-between px-4 w-full">
      <SidebarTrigger class="-ml-1" />

      <div class="flex items-center gap-2">
        <ToggleMode />
        <Button variant="ghost" class="size-fit"><Bell :size="12" /></Button>
        <NavUser :user="user" />
      </div>
    </div>
  </header>
</template>
