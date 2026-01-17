import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * Composable pour gérer les permissions utilisateur
 * Permet de vérifier si l'utilisateur a accès à certaines fonctionnalités
 */
export function usePermissions() {
  const userStore = useUserStore()

  // Vérifie si l'utilisateur a une permission spécifique
  const hasPermission = (permission: string): boolean => {
    if (!userStore.user) return false

    // Super admin a toutes les permissions (vérifier AVANT le rôle)
    if (userStore.user.is_superuser || userStore.user.is_staff) return true

    // Si pas de rôle et pas superuser, pas de permissions
    if (!userStore.user.role) return false

    const role = userStore.user.role

    // Vérifier la permission dans le rôle
    return (role as any)[permission] === true
  }

  // Vérifie si l'utilisateur a au moins une des permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    // Si pas de permissions requises, retourner true
    if (!permissions || permissions.length === 0) return true

    // Super admin a toujours accès (vérifier is_superuser OU is_staff)
    if (userStore.user?.is_superuser || userStore.user?.is_staff) {
      return true
    }

    return permissions.some(permission => hasPermission(permission))
  }

  // Vérifie si l'utilisateur a toutes les permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // Vérifie si l'utilisateur est admin ou superadmin
  const isAdmin = computed(() => {
    if (!userStore.user) return false
    return userStore.user.is_superuser || userStore.user.is_staff
  })

  // Permissions computed
  const permissions = computed(() => ({
    // Utilisateurs
    canManageUsers: hasPermission('can_manage_users'),

    // Produits
    canManageProducts: hasPermission('can_manage_products'),
    canViewProducts: hasPermission('can_view_products'),

    // Catégories
    canManageCategories: hasPermission('can_manage_categories'),
    canViewCategories: hasPermission('can_view_categories'),

    // Services
    canManageServices: hasPermission('can_manage_services'),
    canViewServices: hasPermission('can_view_services'),

    // Stock/Inventaire
    canManageInventory: hasPermission('can_manage_inventory'),
    canViewInventory: hasPermission('can_view_inventory'),

    // Ventes
    canManageSales: hasPermission('can_manage_sales'),

    // Clients
    canManageCustomers: hasPermission('can_manage_customers'),

    // Fournisseurs
    canManageSuppliers: hasPermission('can_manage_suppliers'),

    // Caisse
    canManageCashbox: hasPermission('can_manage_cashbox'),

    // Prêts
    canManageLoans: hasPermission('can_manage_loans'),

    // Dépenses
    canManageExpenses: hasPermission('can_manage_expenses'),

    // Analytics
    canViewAnalytics: hasPermission('can_view_analytics'),

    // Export
    canExportData: hasPermission('can_export_data'),
  }))

  // Obtenir un message d'erreur descriptif pour une permission manquante
  const getPermissionErrorMessage = (permission: string): string => {
    const permissionMessages: Record<string, string> = {
      can_manage_products: 'créer ou modifier les produits',
      can_view_products: 'consulter les produits',
      can_manage_categories: 'créer ou modifier les catégories',
      can_view_categories: 'consulter les catégories',
      can_manage_services: 'créer ou modifier les services',
      can_view_services: 'consulter les services',
      can_manage_inventory: 'gérer le stock',
      can_view_inventory: 'consulter le stock',
      can_manage_sales: 'créer ou modifier les ventes',
      can_manage_customers: 'créer ou modifier les clients',
      can_manage_suppliers: 'créer ou modifier les fournisseurs',
      can_manage_cashbox: 'gérer la caisse',
      can_manage_loans: 'gérer les emprunts',
      can_manage_expenses: 'gérer les dépenses',
      can_manage_users: 'gérer les utilisateurs',
      can_view_analytics: 'consulter les statistiques',
      can_export_data: 'exporter les données',
    }

    const action = permissionMessages[permission] || 'effectuer cette action'
    return `Vous n'avez pas les droits nécessaires pour ${action}. Veuillez contacter votre supérieur.`
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    permissions,
    getPermissionErrorMessage
  }
}
