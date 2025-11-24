/**
 * Types unifiés pour l'authentification
 * Utilisés par userStore et les composants
 */

/**
 * Interface utilisateur unifiée
 * Compatible avec le backend et axios.service.ts
 */
export interface User {
  id: number
  email: string
  username?: string
  name?: string
  is_staff?: boolean
  is_active?: boolean
  role?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * Credentials de connexion
 */
export interface LoginCredentials {
  email: string
  password: string
  domain?: string
}

/**
 * Données d'inscription
 * NOTE: L'inscription est désactivée - les utilisateurs sont créés par l'admin
 */
// export interface RegisterData {
//   name: string
//   email: string
//   password: string
//   domain?: string
// }

/**
 * Réponse d'authentification de l'API
 */
export interface AuthResponse {
  user: User
  access: string
  refresh: string
}
