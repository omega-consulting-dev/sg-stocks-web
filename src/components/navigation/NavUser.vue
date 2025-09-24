<script setup lang="ts">
import {
  Bell,
  LogOut,
} from "lucide-vue-next"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <div class="relative flex items-center gap-2">
        <p class="truncate max-w-32 text-sm">{{ user.company }}</p>
        <Avatar class="h-8 w-8 rounded-lg">
          <AvatarImage :src="user.avatar" :alt="user.name" />
          <AvatarFallback class="rounded-lg">
            {{user.name.split(' ').map(n => n[0]).join('')}}
          </AvatarFallback>
        </Avatar>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg" :side="'bottom'" align="end"
      :side-offset="4">
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded-lg">
            <AvatarImage :src="user.avatar" :alt="user.name" />
            <AvatarFallback class="rounded-lg">
              {{user.name.split(' ').map(n => n[0]).join('')}}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">{{ user.name }}</span>
            <span class="truncate text-xs">{{ user.email }}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
