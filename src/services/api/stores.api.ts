import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Store (Magasin)
 */
export interface Store {
  id: number
  name: string
  code: string
  address: string
  city: string
  phone: string
  email: string
  store_type: 'warehouse' | 'store' | 'virtual'
  store_type_display: string
  manager: number | null
  manager_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Interface pour réponse paginée
 */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Interface pour les filtres
 */
export interface StoreFilters {
  store_type?: string
  is_active?: boolean
  search?: string
}

/**
 * Service API pour la gestion des magasins
 */
export const storesApi = {
  /**
   * Récupérer tous les magasins
   */
  async fetchAll(filters?: StoreFilters): Promise<Store[]> {
    const params = { is_active: true, ...filters }
    const response: AxiosResponse<PaginatedResponse<Store> | Store[]> = await Axios.get(
      '/inventory/stores/',
      { params }
    )

    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  /**
   * Récupérer un magasin par son ID
   */
  async fetchById(id: number): Promise<Store> {
    const response: AxiosResponse<Store> = await Axios.get(`/inventory/stores/${id}/`)
    return response.data
  },
}

export default storesApi
