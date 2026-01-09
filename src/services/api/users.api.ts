import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'
import type {
  User,
  UserCreateData,
  UserUpdateData,
  Role,
  Permission,
  UserStats,
  UserActivity,
  UserSession
} from '@/types/user.types'

/**
 * Service API pour la gestion des utilisateurs
 * Basé sur l'API Django avec tous les endpoints disponibles
 */

// ========== Endpoints Utilisateurs ==========

/**
 * Récupère la liste de tous les utilisateurs avec filtres et pagination
 */
const getUsers = (params?: {
  page?: number
  page_size?: number
  search?: string
  role?: string
  is_active?: boolean
  ordering?: string
}): Promise<AxiosResponse<{ results: User[]; count: number; next: string; previous: string }>> => {
  return Axios.get('/auth/users/', { params })
}

/**
 * Récupère les détails d'un utilisateur spécifique
 */
const getUserById = (id: number): Promise<AxiosResponse<User>> => {
  return Axios.get(`/auth/users/${id}/`)
}

/**
 * Crée un nouveau utilisateur
 */
const createUser = (data: UserCreateData): Promise<AxiosResponse<User>> => {
  return Axios.post('/auth/users/', data)
}

/**
 * Met à jour un utilisateur existant
 */
const updateUser = (id: number, data: UserUpdateData): Promise<AxiosResponse<User>> => {
  return Axios.patch(`/auth/users/${id}/`, data)
}

/**
 * Désactive un utilisateur (soft delete)
 */
const deleteUser = (id: number): Promise<AxiosResponse<void>> => {
  return Axios.delete(`/auth/users/${id}/`)
}

/**
 * Change le mot de passe d'un utilisateur
 */
const changePassword = (
  id: number,
  data: { old_password: string; new_password: string }
): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post(`/auth/users/${id}/change_password/`, data)
}

/**
 * Réinitialise le mot de passe d'un utilisateur (admin uniquement)
 */
const resetPassword = (
  id: number,
  data: { new_password: string }
): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post(`/auth/users/${id}/reset_password/`, data)
}

/**
 * Récupère les statistiques d'un utilisateur
 */
const getUserStats = (id: number): Promise<AxiosResponse<UserStats>> => {
  return Axios.get(`/auth/users/${id}/stats/`)
}

/**
 * Récupère l'activité récente d'un utilisateur
 */
const getUserActivity = (
  id: number,
  params?: { limit?: number }
): Promise<AxiosResponse<UserActivity[]>> => {
  return Axios.get(`/auth/users/${id}/activity/`, { params })
}

/**
 * Récupère les sessions actives d'un utilisateur
 */
const getUserSessions = (id: number): Promise<AxiosResponse<UserSession[]>> => {
  return Axios.get(`/auth/users/${id}/sessions/`)
}

/**
 * Termine toutes les sessions d'un utilisateur sauf la session actuelle
 */
const terminateUserSessions = (id: number): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post(`/auth/users/${id}/terminate_sessions/`)
}

/**
 * Récupère les informations de l'utilisateur connecté
 */
const getCurrentUser = (): Promise<AxiosResponse<User>> => {
  return Axios.get('/auth/users/me/')
}

// ========== Endpoints Rôles ==========

/**
 * Récupère la liste de tous les rôles
 */
const getRoles = (): Promise<AxiosResponse<Role[]>> => {
  return Axios.get('/auth/roles/')
}

/**
 * Récupère les choix de rôles disponibles
 */
const getRoleChoices = (): Promise<AxiosResponse<{ value: string; label: string }[]>> => {
  return Axios.get('/auth/roles/choices/')
}

/**
 * Récupère les détails d'un rôle spécifique
 */
const getRoleById = (id: number): Promise<AxiosResponse<Role>> => {
  return Axios.get(`/auth/roles/${id}/`)
}

/**
 * Crée un nouveau rôle
 */
const createRole = (data: Partial<Role>): Promise<AxiosResponse<Role>> => {
  return Axios.post('/auth/roles/', data)
}

/**
 * Met à jour un rôle existant
 */
const updateRole = (id: number, data: Partial<Role>): Promise<AxiosResponse<Role>> => {
  return Axios.patch(`/auth/roles/${id}/`, data)
}

/**
 * Supprime un rôle
 */
const deleteRole = (id: number): Promise<AxiosResponse<void>> => {
  return Axios.delete(`/auth/roles/${id}/`)
}

// ========== Endpoints Permissions ==========

/**
 * Récupère la liste de toutes les permissions
 */
const getPermissions = (): Promise<AxiosResponse<Permission[]>> => {
  return Axios.get('/auth/permissions/')
}

/**
 * Récupère les permissions d'un utilisateur spécifique
 */
const getUserPermissions = (userId: number): Promise<AxiosResponse<Permission[]>> => {
  return Axios.get(`/auth/users/${userId}/permissions/`)
}

// ========== Export du service ==========

export const usersApi = {
  // Utilisateurs
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  getUserStats,
  getUserActivity,
  getUserSessions,
  terminateUserSessions,
  getCurrentUser,

  // Rôles
  getRoles,
  getRoleChoices,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,

  // Permissions
  getPermissions,
  getUserPermissions
}
