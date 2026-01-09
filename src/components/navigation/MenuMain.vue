<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import { ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import { useRoute } from 'vue-router'

const props = defineProps<{
  items: {
    title: string
    url?: string
    icon: LucideIcon
    children?: {
      title: string
      url: string
    }[]
  }[]
}>()

const route = useRoute()

// Fonction pour vérifier si un menu parent est actif
const isParentActive = (item: typeof props.items[0]) => {
  if (!item.children) return false

  // Vérifier si la route actuelle correspond exactement à l'un des enfants
  return item.children.some((child) => route.path === child.url)
}

// Fonction pour vérifier si une route correspond (correspondance exacte uniquement)
const isRouteActive = (url: string) => {
  return route.path === url
}
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <Collapsible
          v-if="item.children"
          as-child
          :default-open="isParentActive(item)"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title" :is-active="isParentActive(item)">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
                <ChevronRight
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.children" :key="subItem.title">
                  <SidebarMenuSubButton as-child :is-active="isRouteActive(subItem.url)">
                    <RouterLink :to="subItem.url">
                      <span>{{ subItem.title }}</span>
                    </RouterLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton as-child :tooltip="item.title" :is-active="isRouteActive(item.url ?? '')">
            <RouterLink :to="item.url ?? ''">
              <component :is="item.icon" v-if="item.icon" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
