<script setup lang="ts">
import { computed } from 'vue'
import type { SidebarProps } from '@/components/ui/sidebar'
import { usePermissions } from '@/composables/usePermissions'

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
  Store,
  Package,
  Receipt,

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
const { hasAnyPermission, isAdmin } = usePermissions()

// Structure complète des menus avec permissions
const allMenus = [
  {
    title: "Dashboard",
    url: "/",
    icon: Gauge,
    permissions: [] // Accessible à tous
  },
  {
    title: "Categories",
    icon: Blocks,
    permissions: ['can_manage_categories', 'can_view_categories', 'can_manage_products', 'can_manage_services'],
    children: [
      {
        title: "Famille de produits",
        url: "/categories/produits",
        permissions: ['can_manage_categories', 'can_view_categories']
      },
      {
        title: "Famille de services",
        url: "/categories/services",
        permissions: ['can_manage_categories', 'can_view_categories']
      },
    ],
  },
  {
    title: "Produits",
    url: "/produits",
    icon: ShoppingBag,
    permissions: ['can_manage_products', 'can_view_products']
  },
  {
    title: "Services",
    url: "/services",
    icon: ShoppingBasket,
    permissions: ['can_manage_services', 'can_view_services']
  },
  {
    title: "Entrée en Stock",
    url: "/achats/entree-stock",
    icon: ScanLine,
    permissions: ['can_manage_inventory', 'can_view_inventory']
  },
  {
    title: "Transferts de Stock",
    url: "/transfers",
    icon: Package,
    permissions: ['can_manage_inventory']
  },
  {
    title: "Facturation",
    icon: BadgePercent,
    permissions: ['can_manage_sales'],
    children: [
      {
        title: "Facturation Produit",
        url: "/facturation/produit",
        permissions: ['can_manage_sales']
      },
      {
        title: "Facturation Service",
        url: "/facturation/service",
        permissions: ['can_manage_sales']
      },
    ],
  },
  {
    title: "Encaissements",
    url: "/encaissements",
    icon: BanknoteArrowUp,
    permissions: ['can_manage_cashbox']
  },
  {
    title: "Décaissements",
    url: "/decaissements",
    icon: BanknoteArrowDown,
    permissions: ['can_manage_cashbox']
  },
  {
    title: "Emprunt",
    url: "/emprunts",
    icon: HandCoins,
    permissions: ['can_manage_loans']
  },
  {
    title: "Mouvement",
    icon: ArrowLeftRight,
    permissions: ['can_manage_inventory', 'can_view_inventory'],
    children: [
      {
        title: "Entrée",
        url: "/mouvements/entree",
        permissions: ['can_manage_inventory']
      },
      {
        title: "Sorties",
        url: "/mouvements/sortie",
        permissions: ['can_manage_inventory']
      },
      {
        title: "Entrée / Sortir",
        url: "/mouvements",
        permissions: ['can_manage_inventory', 'can_view_inventory']
      },
      {
        title: "Etat d'inventaire",
        url: "/mouvements/inventaire",
        permissions: ['can_view_inventory']
      },
    ],
  },
  {
    title: "Statistiques",
    icon: ChartNoAxesColumnIncreasing,
    permissions: ['can_view_analytics', 'can_manage_customers', 'can_manage_suppliers'],
    children: [
      {
        title: "Vente Mensuel",
        url: "/statistiques/ventes",
        permissions: ['can_view_analytics']
      },
      {
        title: "Charge Mensuel",
        url: "/statistiques/charges",
        permissions: ['can_view_analytics']
      },
      {
        title: "Suivie Clients",
        url: "/clients/dettes",
        permissions: ['can_manage_customers']
      },
      {
        title: "Suirvie Fournisseurs",
        url: "/fournisseurs",
        permissions: ['can_manage_suppliers']
      },
    ],
  },
  {
    title: "Depense",
    url: "/depenses",
    icon: Receipt,
    permissions: ['can_manage_expenses']
  },
  {
    title: "Reporting Mensuel",
    url: "/reporting",
    icon: BookCheck,
    permissions: ['can_view_analytics']
  },
  {
    title: "Gestion Utilisateur",
    icon: UserCog,
    permissions: ['can_manage_users', 'can_manage_customers', 'can_manage_suppliers'],
    children: [
      {
        title: "Gestion client",
        url: "/clients",
        permissions: ['can_manage_customers']
      },
      {
        title: "Comptes Fournisseur",
        url: "/fournisseurs/comptes",
        permissions: ['can_manage_suppliers']
      },
    ],
  },
  {
    title: "Store (Magasin / point de vente)",
    url: "/stores",
    icon: Store,
    permissions: ['can_manage_users'], // Réservé aux admin
    requiresAdmin: true // Flag spécial pour vérification admin
  },
]

// Menu du footer (séparé)
const footerMenu = [
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
    permissions: [] // Accessible à tous
  },
]

// Interface pour le menu
interface MenuItem {
  id: string
  label: string
  icon: any
  route?: string
  children?: MenuItem[]
  permissions?: string[]
  requiresAdmin?: boolean
  separator?: boolean
  badge?: string
}

// Filtrer les menus selon les permissions de l'utilisateur
const data = computed(() => {
  const filterMenus = (menus: MenuItem[]): MenuItem[] => {
    return menus
      .filter(menu => {
        // Vérifier si le menu nécessite des droits admin
        if (menu.requiresAdmin && !isAdmin.value) {
          return false
        }

        // Si pas de permissions requises, accessible à tous
        if (!menu.permissions || menu.permissions.length === 0) {
          return true
        }

        // Vérifier si l'utilisateur a au moins une permission
        return hasAnyPermission(menu.permissions)
      })
      .map((menu): MenuItem => {
        // Filtrer récursivement les sous-menus
        if (menu.children && menu.children.length > 0) {
          const filteredChildren = filterMenus(menu.children)

          return {
            ...menu,
            children: filteredChildren
          }
        }

        return menu
      })
      .filter(menu => {
        // Supprimer les menus parents qui n'ont plus d'enfants
        if (menu.children !== undefined) {
          return menu.children.length > 0
        }
        return true
      })
  }

  return {
    menu: filterMenus(allMenus),
    footerMenu: filterMenus(footerMenu)
  }
})
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
        <SidebarMenuItem v-for="item in data.footerMenu" :key="item.title">
          <SidebarMenuButton as-child>
            <RouterLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
