import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/auth.api'
import type { User, LoginCredentials } from '@/types/auth.types'

/**
 * Store unifié pour l'authentification et la gestion de l'utilisateur
 * Utilisé par axios.service.ts pour les intercepteurs
 * Utilisé par les composants pour la logique d'authentification
 */
export const useUserStore = defineStore('user', () => {
  // ========== État ==========
  const user = ref<User | null>(null)
  const domain = ref<string | null>(null)
  const access_token = ref<string | null>(localStorage.getItem('access_token') || null)
  const refresh_token = ref<string | null>(localStorage.getItem('refresh_token') || null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Computed ==========
  const isAuthenticated = computed(() => !!access_token.value && !!user.value)
  const isAdmin = computed(() => !!user.value?.is_staff)

  // Store assignment computed properties
  const defaultStore = computed(() => user.value?.default_store || null)
  const isStoreRestricted = computed(() => user.value?.is_store_restricted || false)
  const hasAssignedStores = computed(() => user.value?.has_assigned_stores || false)

  // ========== Actions d'Authentification ==========

  /**
   * Connexion utilisateur
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      // Appel API
      const response = await authApi.login(credentials)

      // Mettre à jour l'état
      user.value = response.user
      setAccessToken(response.access)
      setRefreshToken(response.refresh)

      // Sauvegarder l'utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Synchroniser authStore pour que les permissions soient immédiatement disponibles
      const { useAuthStore } = await import('./auth.store')
      const authStore = useAuthStore()
      authStore.setUser(response.user)
      authStore.setToken(response.access)

      // Debug: Vérifier les données de magasin
      return response
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        'Email ou mot de passe incorrect'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }


  /**
   * Déconnexion utilisateur
   */
  const logout = async () => {
    try {
      // Appeler l'API de déconnexion si un refresh token existe
      if (refresh_token.value) {
        await authApi.logout(refresh_token.value)
      }
    } catch (e) {
      // On continue quand même la déconnexion côté client
    } finally {
      // Nettoyer tout
      clearUser()
    }
  }

  /**
   * Vérifier si le token JWT est expiré
   */
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true

    try {
      // Décoder le payload du JWT (sans vérifier la signature)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp

      if (!exp) return true

      // Vérifier si le token expire dans moins de 5 minutes
      const expirationTime = exp * 1000 // Convertir en millisecondes
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      return expirationTime < (now + fiveMinutes)
    } catch (e) {
      return true
    }
  }

  /**
   * Charger l'utilisateur depuis localStorage au démarrage
   */
  const loadUserFromStorage = () => {
    const storedToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUser = localStorage.getItem('user')

    // Vérifier si le token est expiré (seulement si un token existe)
    if (storedToken && isTokenExpired(storedToken)) {
      clearUser()
      return
    }

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      access_token.value = storedToken
      refresh_token.value = storedRefreshToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        clearUser()
      }
    } else if (storedUser === 'undefined' || storedUser === 'null') {
      // Nettoyer le localStorage si les données sont invalides
      localStorage.removeItem('user')
    }
  }

  /**
   * Connexion Google OAuth
   */
  const googleLogin = async () => {
    loading.value = true
    error.value = null

    try {
      // TODO: Implémenter Google OAuth
      throw new Error('Google OAuth non implémenté')
    } catch (e: any) {
      error.value = 'Erreur lors de la connexion avec Google'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== Gestion des Tokens ==========

  /**
   * Définir le token d'accès
   */
  const setAccessToken = (token: string) => {
    localStorage.setItem('access_token', token)
    access_token.value = token
  }

  /**
   * Définir le token de rafraîchissement
   */
  const setRefreshToken = (token: string) => {
    localStorage.setItem('refresh_token', token)
    refresh_token.value = token
  }

  /**
   * Nettoyer toutes les données utilisateur
   */
  const clearUser = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    user.value = null
    access_token.value = null
    refresh_token.value = null
    error.value = null
  }

  // ========== Gestion du Domaine (Multi-tenant) ==========

  /**
   * Définir le domaine depuis l'URL (pour multi-tenant)
   */
  const setDomain = () => {
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      domain.value = parts[0]
    }
  }

  // ========== Retour du Store ==========

  return {
    // État
    user,
    access_token,
    refresh_token,
    domain,
    loading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,
    defaultStore,
    isStoreRestricted,
    hasAssignedStores,

    // Actions d'authentification
    login,
    logout,
    loadUserFromStorage,
    googleLogin,

    // Gestion des tokens
    setAccessToken,
    setRefreshToken,
    clearUser,

    // Multi-tenant
    setDomain,
  }
})

// Export des types pour utilisation dans les composants
export type { User, LoginCredentials }
