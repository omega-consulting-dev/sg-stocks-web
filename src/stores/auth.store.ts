import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/auth.api'
import type { User, Role } from '@/types/user.types'

/**
 * Store d'authentification et gestion des permissions
 * Gère l'utilisateur connecté, ses rôles et permissions calculées
 * Sécurise l'accès aux fonctionnalités selon les rôles
 */
export const useAuthStore = defineStore('auth', () => {
  // ========== État ==========
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token')) // Utiliser access_token au lieu de token
  const isAuthenticated = ref<boolean>(!!token.value)

  // ========== Computed - Rôles ==========

  /**
   * Vérifie si l'utilisateur est super admin
   */
  const isAdmin = computed(() => {
    if (!user.value) return false
    return (
      user.value.is_superuser ||
      user.value.role?.name === 'super_admin' ||
      user.value.role?.name === 'manager'
    )
  })

  /**
   * Vérifie si l'utilisateur est caissier
   */
  const isCashier = computed(() => {
    if (!user.value?.role) return false
    return user.value.role.name === 'cashier'
  })

  /**
   * Vérifie si l'utilisateur est magasinier
   */
  const isWarehouseKeeper = computed(() => {
    if (!user.value?.role) return false
    return user.value.role.name === 'warehouse_keeper'
  })

  /**
   * Vérifie si l'utilisateur est responsable de magasin
   */
  const isStoreManager = computed(() => {
    if (!user.value?.role) return false
    return user.value.role.name === 'store_manager'
  })

  /**
   * Vérifie si l'utilisateur est comptable
   */
  const isAccountant = computed(() => {
    if (!user.value?.role) return false
    return user.value.role.name === 'accountant'
  })

  /**
   * Vérifie si l'utilisateur est vendeur
   */
  const isSalesperson = computed(() => {
    if (!user.value?.role) return false
    return user.value.role.name === 'salesperson'
  })

  // ========== Computed - Scope d'accès ==========

  /**
   * Scope d'accès de l'utilisateur
   * - 'all': Accès à tous les stores
   * - 'assigned': Accès uniquement aux stores assignés
   * - 'own': Accès uniquement à ses propres données
   */
  const accessScope = computed(() => {
    if (isAdmin.value) return 'all'
    return user.value?.role?.access_scope || 'assigned'
  })

  /**
   * Liste des stores assignés à l'utilisateur
   */
  const assignedStores = computed(() => {
    return user.value?.assigned_stores || []
  })

  /**
   * Premier store assigné (store par défaut)
   */
  const defaultStore = computed(() => {
    return assignedStores.value[0] || null
  })

  /**
   * Vérifie si l'utilisateur a accès à plusieurs stores
   */
  const hasMultipleStores = computed(() => {
    return assignedStores.value.length > 1
  })

  // ========== Computed - Permissions modules ==========

  /**
   * Peut gérer les factures
   */
  const canManageInvoices = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_sales || false
  })

  /**
   * Peut voir les factures
   */
  const canViewInvoices = computed(() => {
    if (isAdmin.value) return true
    return canManageInvoices.value || isCashier.value
  })

  /**
   * Peut gérer l'inventaire
   */
  const canManageInventory = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_inventory || false
  })

  /**
   * Peut voir l'inventaire
   */
  const canViewInventory = computed(() => {
    if (isAdmin.value) return true
    return canManageInventory.value || user.value?.role?.can_view_inventory || false
  })

  /**
   * Peut gérer les ventes
   */
  const canManageSales = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_sales || false
  })

  /**
   * Peut voir les ventes
   */
  const canViewSales = computed(() => {
    if (isAdmin.value) return true
    return canManageSales.value || isCashier.value || isSalesperson.value
  })

  /**
   * Peut gérer les clients
   */
  const canManageCustomers = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_customers || false
  })

  /**
   * Peut gérer les fournisseurs
   */
  const canManageSuppliers = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_suppliers || false
  })

  /**
   * Peut gérer les produits
   */
  const canManageProducts = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_products || false
  })

  /**
   * Peut voir les produits
   */
  const canViewProducts = computed(() => {
    if (isAdmin.value) return true
    return canManageProducts.value || user.value?.role?.can_view_products || false
  })

  /**
   * Peut gérer la caisse
   */
  const canManageCashbox = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_cashbox || false
  })

  /**
   * Peut voir les analytics
   */
  const canViewAnalytics = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_view_analytics || false
  })

  /**
   * Peut exporter les données
   */
  const canExportData = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_export_data || false
  })

  /**
   * Peut gérer les utilisateurs
   */
  const canManageUsers = computed(() => {
    if (isAdmin.value) return true
    return user.value?.role?.can_manage_users || false
  })

  // ========== Méthodes utilitaires ==========

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permission: string): boolean => {
    if (isAdmin.value) return true
    if (!user.value?.role) return false

    // Vérifier la permission sur le rôle
    return (user.value.role as any)[permission] === true
  }

  /**
   * Vérifie si l'utilisateur peut accéder à un store spécifique
   */
  const canAccessStore = (storeId: number): boolean => {
    if (accessScope.value === 'all') return true
    return assignedStores.value.some(store => store.id === storeId)
  }

  /**
   * Définir l'utilisateur connecté
   */
  const setUser = (userData: User) => {
    user.value = userData
  }

  /**
   * Définir le token d'authentification
   */
  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    localStorage.setItem('access_token', tokenValue) // Utiliser access_token au lieu de token
    isAuthenticated.value = true
  }

  /**
   * Se déconnecter
   */
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token') // Utiliser access_token au lieu de token
    isAuthenticated.value = false
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  const fetchCurrentUser = async () => {
    if (!token.value) return

    try {
      const response = await authApi.getCurrentUser()
      setUser(response)
    } catch (error) {
      // En cas d'erreur (token expiré), on déconnecte
      logout()
    }
  }

  return {
    // État
    user,
    token,
    isAuthenticated,

    // Rôles
    isAdmin,
    isCashier,
    isWarehouseKeeper,
    isStoreManager,
    isAccountant,
    isSalesperson,

    // Scope
    accessScope,
    assignedStores,
    defaultStore,
    hasMultipleStores,

    // Permissions modules
    canManageInvoices,
    canViewInvoices,
    canManageInventory,
    canViewInventory,
    canManageSales,
    canViewSales,
    canManageCustomers,
    canManageSuppliers,
    canManageProducts,
    canViewProducts,
    canManageCashbox,
    canViewAnalytics,
    canExportData,
    canManageUsers,

    // Méthodes
    hasPermission,
    canAccessStore,
    setUser,
    setToken,
    logout,
    fetchCurrentUser
  }
})
