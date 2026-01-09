import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

export interface Encaissement {
  id: string
  code: string
  type: string
  date: string
  reference_facture: string
  montant: number
  mode_paiement: string
  client: string
  created_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface EncaissementsFilters {
  start_date?: string
  end_date?: string
  store?: number | string
  page?: number
  page_size?: number
}

export interface CaisseSolde {
  solde_actuel: number
  total_encaissements: number
  total_sorties: number
  details: {
    paiements_factures: number
    ventes: number
    depenses: number
    paiements_fournisseurs: number
    remboursements_emprunts: number
  }
}

/**
 * Service API pour la gestion des encaissements
 */
export const encaissementsApi = {
  /**
   * Récupérer la liste des encaissements
   */
  async getEncaissements(filters?: EncaissementsFilters): Promise<PaginatedResponse<Encaissement>> {
    const response: AxiosResponse<PaginatedResponse<Encaissement>> = await Axios.get('/cashbox/encaissements/', { params: filters })
    return response.data
  },

  /**
   * Exporter les encaissements en Excel
   */
  async exportToExcel(filters?: EncaissementsFilters): Promise<Blob> {
    const response: AxiosResponse<Blob> = await Axios.get('/cashbox/encaissements/export/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Récupérer le solde actuel de la caisse
   */
  async getCaisseSolde(storeId?: number | string): Promise<CaisseSolde> {
    const params = storeId ? { store: storeId } : {}
    const response: AxiosResponse<CaisseSolde> = await Axios.get('/cashbox/caisse/solde/', { params })
    return response.data
  },

  /**
   * Récupérer la liste des stores actifs
   */
  async getStores(): Promise<Array<{ id: number; name: string; code: string; store_type?: string }>> {
    const response = await Axios.get('/cashbox/stores/')
    return response.data
  },
}

export default encaissementsApi
