import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/services/api/users.api'
import type {
  User,
  UserCreateData,
  UserUpdateData,
  Role,
  Permission,
  UserFilters
} from '@/types/user.types'

/**
 * Store pour la gestion des utilisateurs
 * Gère le CRUD complet des utilisateurs, rôles et permissions
 */
export const useUsersStore = defineStore('users', () => {
  // ========== État ==========
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pagination
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ========== Computed ==========
  const activeUsers = computed(() => users.value.filter((u) => u.is_active))
  const inactiveUsers = computed(() => users.value.filter((u) => !u.is_active))
  const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

  // ========== Actions Utilisateurs ==========

  /**
   * Récupère la liste des utilisateurs avec filtres
   */
  const fetchUsers = async (filters?: UserFilters) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: filters?.page || currentPage.value,
        page_size: filters?.page_size || pageSize.value,
        search: filters?.search,
        role: filters?.role,
        is_active: filters?.is_active,
        ordering: filters?.ordering
      }

      const response = await usersApi.getUsers(params)
      users.value = response.data.results
      totalUsers.value = response.data.count

      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  const fetchUserById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.getUserById(id)
      currentUser.value = response.data
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors du chargement de l'utilisateur"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  const createUser = async (data: UserCreateData) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.createUser(data)
      users.value.unshift(response.data)
      totalUsers.value++
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors de la création de l'utilisateur"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un utilisateur existant
   */
  const updateUser = async (id: number, data: UserUpdateData) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.updateUser(id, data)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      if (currentUser.value?.id === id) {
        currentUser.value = response.data
      }
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime (désactive) un utilisateur
   */
  const deleteUser = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await usersApi.deleteUser(id)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index].is_active = false
      }
      totalUsers.value--
      return true
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors de la suppression de l'utilisateur"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Change le mot de passe d'un utilisateur
   */
  const changePassword = async (
    id: number,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await usersApi.changePassword(id, {
        old_password: oldPassword,
        new_password: newPassword
      })
      return true
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du changement de mot de passe'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur (admin uniquement)
   */
  const resetPassword = async (id: number, newPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await usersApi.resetPassword(id, { new_password: newPassword })
      return true
    } catch (e: any) {
      error.value =
        e.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  const fetchCurrentUser = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.getCurrentUser()
      currentUser.value = response.data
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors du chargement de l'utilisateur"
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== Actions Rôles ==========

  /**
   * Récupère la liste des rôles
   */
  const fetchRoles = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.getRoles()
      // Gérer à la fois les tableaux directs et les réponses paginées
      if (Array.isArray(response.data)) {
        roles.value = response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        // Réponse paginée de Django REST Framework
        roles.value = response.data.results
      } else {
        roles.value = []
      }
      return roles.value
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des rôles'
      roles.value = [] // Réinitialiser en cas d'erreur
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau rôle
   */
  const createRole = async (data: Partial<Role>) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.createRole(data)
      roles.value.push(response.data)
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création du rôle'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un rôle existant
   */
  const updateRole = async (id: number, data: Partial<Role>) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.updateRole(id, data)
      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        roles.value[index] = response.data
      }
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour du rôle'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un rôle
   */
  const deleteRole = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await usersApi.deleteRole(id)
      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        roles.value.splice(index, 1)
      }
      return true
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression du rôle'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== Actions Permissions ==========

  /**
   * Récupère la liste des permissions
   */
  const fetchPermissions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await usersApi.getPermissions()
      permissions.value = response.data
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des permissions'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== Actions Utilitaires ==========

  /**
   * Réinitialise l'état du store
   */
  const resetState = () => {
    users.value = []
    currentUser.value = null
    roles.value = []
    permissions.value = []
    loading.value = false
    error.value = null
    totalUsers.value = 0
    currentPage.value = 1
  }

  /**
   * Change la page courante
   */
  const setPage = (page: number) => {
    currentPage.value = page
  }

  /**
   * Change la taille de page
   */
  const setPageSize = (size: number) => {
    pageSize.value = size
  }

  return {
    // État
    users,
    currentUser,
    roles,
    permissions,
    loading,
    error,
    totalUsers,
    currentPage,
    pageSize,

    // Computed
    activeUsers,
    inactiveUsers,
    totalPages,

    // Actions Utilisateurs
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    resetPassword,
    fetchCurrentUser,

    // Actions Rôles
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,

    // Actions Permissions
    fetchPermissions,

    // Utilitaires
    resetState,
    setPage,
    setPageSize
  }
})
