import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Types de mouvement de stock
 */
export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'return'

/**
 * Interface pour StockMovement (correspond au backend StockMovementSerializer)
 */
export interface StockMovement {
  id: number
  product: number
  product_name: string
  store: number
  store_name: string
  movement_type: MovementType
  movement_type_display: string
  quantity: number
  reference: string
  destination_store: number | null
  destination_store_name: string | null
  notes: string
  created_at: string
  created_by: number | null
  created_by_name: string | null
}

/**
 * Type pour créer un nouveau mouvement de stock
 */
export interface CreateStockMovementDto {
  product: number
  store: number
  movement_type: MovementType
  quantity: number
  reference?: string
  destination_store?: number | null
  notes?: string
}

/**
 * Type pour mettre à jour un mouvement
 */
export type UpdateStockMovementDto = Partial<CreateStockMovementDto>

/**
 * Interface pour les filtres de recherche
 */
export interface StockMovementFilters {
  movement_type?: MovementType
  product?: number
  store?: number
  search?: string
  ordering?: string
  created_at__gte?: string
  created_at__lte?: string
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
 * Service API pour la gestion des mouvements de stock
 * Base URL: /inventory/movements/
 */
export const stockMovementsApi = {
  /**
   * Récupérer tous les mouvements avec filtres optionnels
   */
  async fetchAll(filters?: StockMovementFilters): Promise<StockMovement[]> {
    const response: AxiosResponse<PaginatedResponse<StockMovement> | StockMovement[]> =
      await Axios.get('/inventory/movements/', { params: filters })

    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  /**
   * Récupérer uniquement les entrées de stock
   * @param filters - Filtres optionnels
   * @param includeAll - Si true, récupère toutes les entrées sans filtre supplémentaire
   */
  async fetchEntries(filters?: Omit<StockMovementFilters, 'movement_type'>, includeAll = false): Promise<StockMovement[]> {
    return this.fetchAll({ ...filters, movement_type: 'in' })
  },

  /**
   * Récupérer toutes les références des entrées de stock
   * Utilisé pour générer un code unique
   */
  async fetchAllEntryReferences(): Promise<string[]> {
    const entries = await this.fetchAll({ movement_type: 'in' })
    return entries.map(e => e.reference)
  },

  /**
   * Récupérer uniquement les sorties de stock
   */
  async fetchExits(filters?: Omit<StockMovementFilters, 'movement_type'>): Promise<StockMovement[]> {
    return this.fetchAll({ ...filters, movement_type: 'out' })
  },

  /**
   * Récupérer un mouvement par son ID
   */
  async fetchById(id: number): Promise<StockMovement> {
    const response: AxiosResponse<StockMovement> = await Axios.get(
      `/inventory/movements/${id}/`
    )
    return response.data
  },

  /**
   * Créer un nouveau mouvement de stock
   */
  async create(data: CreateStockMovementDto): Promise<StockMovement> {
    const response: AxiosResponse<StockMovement> = await Axios.post(
      '/inventory/movements/',
      data
    )
    return response.data
  },

  /**
   * Créer une entrée de stock
   */
  async createEntry(data: Omit<CreateStockMovementDto, 'movement_type'>): Promise<StockMovement> {
    return this.create({ ...data, movement_type: 'in' })
  },

  /**
   * Mettre à jour un mouvement existant
   */
  async update(id: number, data: UpdateStockMovementDto): Promise<StockMovement> {
    const response: AxiosResponse<StockMovement> = await Axios.patch(
      `/inventory/movements/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Supprimer un mouvement
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/inventory/movements/${id}/`)
  },
}

export default stockMovementsApi
