/**
 * Configuration de la navigation avec les permissions requises
 * Chaque menu item définit les permissions nécessaires pour y accéder
 */

export interface MenuItem {
  id: string
  title: string
  url: string
  icon?: string
  permissions?: string[] // Permissions requises (au moins une)
  requiresAll?: boolean // Si true, toutes les permissions sont requises
  children?: MenuItem[]
}

export const navigationConfig: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    url: '/',
    icon: 'Home',
    permissions: [] // Accessible à tous les utilisateurs connectés
  },

  // Gestion des produits
  {
    id: 'products',
    title: 'Produits',
    url: '/products',
    icon: 'Package',
    permissions: ['can_manage_products', 'can_view_products'],
    children: [
      {
        id: 'products-list',
        title: 'Liste des produits',
        url: '/products',
        permissions: ['can_view_products', 'can_manage_products']
      },
      {
        id: 'products-categories',
        title: 'Catégories',
        url: '/famille-produits',
        permissions: ['can_view_categories', 'can_manage_categories']
      }
    ]
  },

  // Gestion des services
  {
    id: 'services',
    title: 'Services',
    url: '/services',
    icon: 'Briefcase',
    permissions: ['can_manage_services', 'can_view_services'],
    children: [
      {
        id: 'services-list',
        title: 'Liste des services',
        url: '/services',
        permissions: ['can_view_services', 'can_manage_services']
      },
      {
        id: 'services-categories',
        title: 'Catégories de services',
        url: '/famille-services',
        permissions: ['can_view_categories', 'can_manage_categories']
      }
    ]
  },

  // Gestion du stock
  {
    id: 'inventory',
    title: 'Stock',
    url: '/entree-stock',
    icon: 'Package2',
    permissions: ['can_manage_inventory', 'can_view_inventory']
  },

  // Ventes
  {
    id: 'sales',
    title: 'Ventes',
    url: '/facturation-produit',
    icon: 'ShoppingCart',
    permissions: ['can_manage_sales'],
    children: [
      {
        id: 'sales-products',
        title: 'Vente de produits',
        url: '/facturation-produit',
        permissions: ['can_manage_sales']
      },
      {
        id: 'sales-services',
        title: 'Vente de services',
        url: '/facturation-service',
        permissions: ['can_manage_sales']
      }
    ]
  },

  // Clients
  {
    id: 'customers',
    title: 'Clients',
    url: '/customers',
    icon: 'Users',
    permissions: ['can_manage_customers']
  },

  // Fournisseurs
  {
    id: 'suppliers',
    title: 'Fournisseurs',
    url: '/fournisseurs',
    icon: 'Truck',
    permissions: ['can_manage_suppliers'],
    children: [
      {
        id: 'suppliers-list',
        title: 'Liste des fournisseurs',
        url: '/fournisseurs',
        permissions: ['can_manage_suppliers']
      },
      {
        id: 'suppliers-accounts',
        title: 'Comptes fournisseurs',
        url: '/comptes-fournisseurs',
        permissions: ['can_manage_suppliers']
      }
    ]
  },

  // Caisse
  {
    id: 'cashbox',
    title: 'Caisse',
    url: '/encaissements',
    icon: 'Wallet',
    permissions: ['can_manage_cashbox'],
    children: [
      {
        id: 'cashbox-in',
        title: 'Encaissements',
        url: '/encaissements',
        permissions: ['can_manage_cashbox']
      },
      {
        id: 'cashbox-out',
        title: 'Décaissements',
        url: '/decaissements',
        permissions: ['can_manage_cashbox']
      }
    ]
  },

  // Prêts
  {
    id: 'loans',
    title: 'Prêts',
    url: '/prets',
    icon: 'HandCoins',
    permissions: ['can_manage_loans']
  },

  // Dépenses
  {
    id: 'expenses',
    title: 'Dépenses',
    url: '/depenses',
    icon: 'Receipt',
    permissions: ['can_manage_expenses']
  },

  // Analytics
  {
    id: 'analytics',
    title: 'Rapports',
    url: '/rapports',
    icon: 'BarChart3',
    permissions: ['can_view_analytics']
  },

  // Paramètres
  {
    id: 'settings',
    title: 'Paramètres',
    url: '/settings',
    icon: 'Settings',
    permissions: [], // Accessible à tous
    children: [
      {
        id: 'settings-company',
        title: 'Entreprise',
        url: '/settings/company',
        permissions: [] // Accessible à tous
      },
      {
        id: 'settings-users',
        title: 'Utilisateurs & Rôles',
        url: '/settings/users-roles',
        permissions: ['can_manage_users']
      }
    ]
  }
]

/**
 * Filtre les menus selon les permissions de l'utilisateur
 */
export function filterMenusByPermissions(
  menus: MenuItem[],
  hasPermission: (permission: string) => boolean,
  hasAnyPermission: (permissions: string[]) => boolean
): MenuItem[] {
  return menus
    .filter(menu => {
      // Si pas de permissions requises, accessible à tous
      if (!menu.permissions || menu.permissions.length === 0) {
        return true
      }

      // Vérifier si l'utilisateur a au moins une permission
      return hasAnyPermission(menu.permissions)
    })
    .map(menu => {
      // Filtrer récursivement les sous-menus
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterMenusByPermissions(
          menu.children,
          hasPermission,
          hasAnyPermission
        )

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
        return menu.children.length > 0 || !menu.permissions || menu.permissions.length === 0
      }
      return true
    })
}
