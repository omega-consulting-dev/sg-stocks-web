<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  Settings,
  Gauge,
  Blocks,
  ShoppingBag,
  ShoppingBasket,
  ScanLine,
  BadgePercent,
  HandCoins,
  BanknoteArrowDown,
  BanknoteArrowUp,
  ArrowLeftRight,
  ChartNoAxesColumnIncreasing,
  BookCheck,
  UserCog,
} from "lucide-vue-next"
import NavMain from '@/components/navigation/MenuMain.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const { open } = useSidebar()

const data = {
  menu: [
    {
      title: "Dashboard",
      url: "/",
      icon: Gauge,
    },
    {
      title: "Familles de produits / Services",
      url: "/familles-produits",
      icon: Blocks,
    },
    {
      title: "Produits",
      url: "/produits",
      icon: ShoppingBag,
    },
    {
      title: "Services",
      url: "/services",
      icon: ShoppingBasket,
    },
    {
      title: "Entrée en Stock",
      url: "#",
      icon: ScanLine,
    },
    {
      title: "Facturation",
      url: "#",
      icon: BadgePercent,
    },
    {
      title: "Encaissements",
      url: "#",
      icon: BanknoteArrowUp,
    },
    {
      title: "Decaissements",
      url: "#",
      icon: BanknoteArrowDown,
    },
    {
      title: "Emprunt",
      url: "#",
      icon: Settings,
    },
    {
      title: "Mouvement",
      icon: ArrowLeftRight,
      children: [
        {
          title: "Entrée",
          url: "#",
        },
        {
          title: "Sorties",
          url: "#",
        },
        {
          title: "Entrée / Sortir",
          url: "#",
        },
        {
          title: "Etat d'inventaire",
          url: "#",
        },
      ],
    },
    {
      title: "Statistiques",
      icon: ChartNoAxesColumnIncreasing,
      children: [
        {
          title: "Vente Mensuel",
          url: "#",
        },
        {
          title: "Charge Mensuel",
          url: "#",
        },
        {
          title: "Charge par nature",
          url: "#",
        },
        {
          title: "Suirvie clients",
          url: "#",
        },
        {
          title: "Suirvie Fournisseurs",
          url: "#",
        },
      ],
    },
    {
      title: "Depense",
      url: "#",
      icon: HandCoins,
    },
    {
      title: "Repporting Mensuel",
      url: "#",
      icon: BookCheck,
    },
    {
      title: "Gestion Utilisateur",
      icon: UserCog,
      children: [
        {
          title: "Gestion client",
          url: "#",
        },
        {
          title: "Gestion Fournisseur",
          url: "#",
        },
      ],
    },
  ],
  footerMenu: [
    {
      title: "Parametres",
      url: "#",
      icon: Settings,
    },
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <img v-if="open" src="@/assets/logo.svg" alt="logo de l'application" class="h-10 w-auto" />
      <img v-else src="@/assets/icon.svg" alt="logo de l'application sans nom" class="h-10 w-auto" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.menu" />
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child v-for="item in data.footerMenu" :key="item.title">
            <a :href=item.url>
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
