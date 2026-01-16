/**
 * Composable pour gérer l'assignation automatique de magasin
 * selon le rôle de l'utilisateur (admin vs magasinier/caissier)
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useStoreAssignment() {
  const userStore = useUserStore()

  // Debug: Afficher les valeurs du store
  console.log('🏪 useStoreAssignment - État actuel:', {
    user: userStore.user,
    defaultStore: userStore.defaultStore,
    isStoreRestricted: userStore.isStoreRestricted,
    hasAssignedStores: userStore.hasAssignedStores
  })

  /**
   * Vérifie si l'utilisateur a un magasin par défaut assigné
   */
  const hasDefaultStore = computed(() => {
    const result = userStore.defaultStore !== null
    console.log('🏪 hasDefaultStore:', result, userStore.defaultStore)
    return result
  })

  /**
   * Vérifie si l'utilisateur est restreint à des magasins spécifiques
   * (magasinier, caissier, etc.)
   */
  const isStoreRestricted = computed(() => {
    return userStore.isStoreRestricted
  })

  /**
   * Détermine si le sélecteur de magasin doit être affiché
   * - Admin/SuperAdmin: true (peuvent sélectionner n'importe quel magasin)
   * - Magasinier/Caissier: false (magasin auto-assigné)
   */
  const shouldShowStoreSelector = computed(() => {
    return !isStoreRestricted.value
  })

  /**
   * Récupère l'ID du magasin par défaut
   * Utilisé pour pré-remplir les formulaires pour les utilisateurs restreints
   */
  const getDefaultStoreId = computed(() => {
    return userStore.defaultStore?.id || null
  })

  /**
   * Récupère les informations complètes du magasin par défaut
   */
  const getDefaultStore = computed(() => {
    return userStore.defaultStore
  })

  /**
   * Vérifie si un magasin doit être pré-sélectionné dans un formulaire
   * Retourne l'ID du magasin à utiliser ou null
   */
  const getInitialStoreValue = () => {
    if (isStoreRestricted.value && hasDefaultStore.value) {
      return getDefaultStoreId.value
    }
    return null
  }

  /**
   * Retourne un message d'information pour l'utilisateur
   * si le magasin est auto-assigné
   */
  const getStoreAssignmentMessage = computed(() => {
    if (isStoreRestricted.value && hasDefaultStore.value) {
      return `Magasin assigné: ${userStore.defaultStore?.name || ''}`
    }
    return null
  })

  /**
   * Retourne le label approprié selon le rôle de l'utilisateur
   * - Caissier: "Point de vente"
   * - Magasinier: "Magasin"
   * - Autres: "Magasin"
   */
  const getStoreLabel = computed(() => {
    const roleName = userStore.user?.role?.name?.toLowerCase() || ''

    if (roleName.includes('caissier') || roleName.includes('cashier')) {
      return 'Point de vente'
    }

    return 'Magasin'
  })

  return {
    // Computed properties
    hasDefaultStore,
    isStoreRestricted,
    shouldShowStoreSelector,
    getDefaultStoreId,
    getDefaultStore,
    getStoreAssignmentMessage,
    getStoreLabel,

    // Methods
    getInitialStoreValue,
  }
}
