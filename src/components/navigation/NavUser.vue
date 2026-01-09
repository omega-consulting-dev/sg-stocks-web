<script setup lang="ts">
import { LogOut, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

defineProps<{
  user: {
    name: string
    email: string
    avatar: string
    company: string
  }
}>()

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const handleLogout = () => {
  // Déconnexion des deux stores
  authStore.logout()
  userStore.logout()

  // Nettoyer le localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')

  // Redirection immédiate
  router.replace('/login')
}

// Fonction pour obtenir les initiales
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="relative flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity outline-none">
      <p class="truncate max-w-32 text-sm">{{ user.company }}</p>
      <Avatar class="h-8 w-8 rounded-lg bg-primary">
        <AvatarFallback class="rounded-lg bg-primary text-primary-foreground">
          {{ getInitials(user.name) }}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      :side="'bottom'"
      align="end"
      :side-offset="4"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded-lg bg-primary">
            <AvatarFallback class="rounded-lg bg-primary text-primary-foreground">
              {{ getInitials(user.name) }}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ user.name }}</span>
            <span class="truncate text-xs">{{ user.email }}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout">
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
