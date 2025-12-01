import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour ServiceCategory (correspond au backend ServiceCategorySerializer)
 * Endpoint: /api/v1/services/categories/
 */
export interface ServiceFamily {
  id: number
  name: string
  description: string
  is_active: boolean
  services_count: number
  created_at: string
  updated_at: string
}

/**
 * Type pour créer une nouvelle famille de services
 */
export interface CreateServiceFamilyDto {
  name: string
  description?: string
  is_active?: boolean
}

/**
 * Type pour mettre à jour une famille de services
 */
export type UpdateServiceFamilyDto = Partial<CreateServiceFamilyDto>

/**
 * Interface pour la réponse paginée de Django REST
 */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Service API pour la gestion des familles de services (ServiceCategory)
 * Base URL: /services/categories/
 */
export const serviceFamiliesApi = {
  /**
   * Récupérer toutes les familles de services
   */
  async fetchAll(): Promise<ServiceFamily[]> {
    const response: AxiosResponse<PaginatedResponse<ServiceFamily> | ServiceFamily[]> =
      await Axios.get('/services/categories/')
    // Gérer les deux formats de réponse (paginée ou liste directe)
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  /**
   * Récupérer une famille de services par son ID
   */
  async fetchById(id: number): Promise<ServiceFamily> {
    const response: AxiosResponse<ServiceFamily> = await Axios.get(`/services/categories/${id}/`)
    return response.data
  },

  /**
   * Créer une nouvelle famille de services
   */
  async create(data: CreateServiceFamilyDto): Promise<ServiceFamily> {
    const response: AxiosResponse<ServiceFamily> = await Axios.post('/services/categories/', data)
    return response.data
  },

  /**
   * Mettre à jour une famille de services existante
   */
  async update(id: number, data: UpdateServiceFamilyDto): Promise<ServiceFamily> {
    const response: AxiosResponse<ServiceFamily> = await Axios.patch(
      `/services/categories/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Supprimer une famille de services
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/services/categories/${id}/`)
  },
}

export default serviceFamiliesApi
