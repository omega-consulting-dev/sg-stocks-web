import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'
import type { CustomAxiosRequestConfig } from '../axios.service'
import type { User, LoginCredentials, AuthResponse } from '@/types/auth.types'

/**
 * Interface pour le refresh token
 */
export interface RefreshTokenRequest {
  refresh: string
}

/**
 * Interface pour la réponse du refresh token
 */
export interface RefreshTokenResponse {
  access: string
}

/**
 * Service API pour l'authentification
 */
export const authApi = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await Axios.post(
      '/auth/login/',
      credentials,
      { skipAuthRefresh: true } as CustomAxiosRequestConfig
    )
    return response.data
  },

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response: AxiosResponse<RefreshTokenResponse> = await Axios.post(
      '/auth/login/',
      { refresh: refreshToken },
      { skipAuthRefresh: true } as CustomAxiosRequestConfig
    )
    return response.data
  },

  /**
   * Déconnexion utilisateur
   */
  async logout(refreshToken: string): Promise<void> {
    await Axios.post('/auth/logout/', { refresh: refreshToken })
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await Axios.get('/auth/me/')
    return response.data
  },

  /**
   * Vérifier si le token est valide
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await Axios.post('/auth/verify/', { token })
      return true
    } catch {
      return false
    }
  },

  /**
   * Demander la réinitialisation du mot de passe
   */
  async requestPasswordReset(email: string): Promise<void> {
    await Axios.post('/auth/password-reset/', { email })
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await Axios.post('/auth/password-reset/confirm/', {
      token,
      password: newPassword,
    })
  },
}

export default authApi
