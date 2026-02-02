import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'
import type { Store, StoreCreateData, StoreUpdateData, StoreFilters } from '@/types/store.types'

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
 * Service API pour la gestion des magasins
 */
export const storesApi = {
  /**
   * Récupérer la liste paginée des magasins
   */
  async getStores(params?: StoreFilters & { page?: number; page_size?: number }): Promise<PaginatedResponse<Store>> {
    const response: AxiosResponse<PaginatedResponse<Store>> = await Axios.get('/inventory/stores/', { params })
    return response.data
  },

  /**
   * Récupérer tous les magasins (sans pagination)
   */
  async getAllStores(filters?: StoreFilters): Promise<Store[]> {
    const params = { is_active: true, ...filters }
    const response: AxiosResponse<PaginatedResponse<Store>> = await Axios.get('/inventory/stores/', { params })
    return response.data.results || []
  },

  /**
   * Récupérer un magasin par son ID
   */
  async getStore(id: number): Promise<Store> {
    const response: AxiosResponse<Store> = await Axios.get(`/inventory/stores/${id}/`)
    return response.data
  },

  /**
   * Créer un nouveau magasin
   */
  async createStore(data: StoreCreateData): Promise<Store> {
    const response: AxiosResponse<Store> = await Axios.post('/inventory/stores/', data)
    return response.data
  },

  /**
   * Mettre à jour un magasin
   */
  async updateStore(id: number, data: StoreUpdateData): Promise<Store> {
    const response: AxiosResponse<Store> = await Axios.patch(`/inventory/stores/${id}/`, data)
    return response.data
  },

  /**
   * Supprimer un magasin
   */
  async deleteStore(id: number): Promise<void> {
    await Axios.delete(`/inventory/stores/${id}/`)
  },

  /**
   * Activer/désactiver un magasin
   */
  async toggleStoreStatus(id: number, isActive: boolean): Promise<Store> {
    const response: AxiosResponse<Store> = await Axios.patch(`/inventory/stores/${id}/`, { is_active: isActive })
    return response.data
  },

  /**
   * Obtenir les statistiques d'un magasin
   */
  async getStoreStats(id: number): Promise<{
    total_products: number
    total_stock_value: number
    low_stock_items: number
  }> {
    const response = await Axios.get(`/inventory/stores/${id}/stats/`)
    return response.data
  },

  /**
   * Récupérer tous les magasins actifs pour les transferts (sans restriction d'accès)
   */
  async getAllStoresForTransfers(): Promise<Store[]> {
    const response: AxiosResponse<Store[]> = await Axios.get('/inventory/stores/all_for_transfers/')
    return response.data
  }
}

export default storesApi
