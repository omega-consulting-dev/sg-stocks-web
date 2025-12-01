import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

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
 * Interface pour ServiceIntervention en mode liste (ServiceInterventionListSerializer)
 * Endpoint: /api/v1/services/interventions/
 */
export interface ServiceIntervention {
  id: number
  service: number
  service_name: string
  customer: number
  customer_name: string
  assigned_to: number | null
  assigned_to_name: string | null
  scheduled_date: string
  scheduled_time: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  status_display: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface ServiceInterventionDetail extends ServiceIntervention {
  actual_start: string | null
  actual_end: string | null
  total_price: number
  total_price_with_tax: number
  notes: string
  internal_notes: string
  quality_rating: number | null
  quality_comments: string | null
  updated_at: string
  created_by: number
  updated_by: number | null
}

export interface CreateServiceInterventionDto {
  service: number
  customer: number
  assigned_to?: number | null
  scheduled_date: string
  scheduled_time?: string | null
  status?: string
  quantity: number
  unit_price?: number
  notes?: string
  internal_notes?: string
}

export interface UpdateServiceInterventionDto extends Partial<CreateServiceInterventionDto> {}

export interface ServiceInterventionFilters {
  service?: number
  customer?: number
  assigned_to?: number
  status?: string
  scheduled_date?: string
  search?: string
}

/**
 * Service API pour la gestion des interventions de service
 * Base URL: /services/interventions/
 */
export const serviceInterventionsApi = {
  /**
   * Récupérer toutes les interventions avec filtres optionnels
   */
  async fetchAll(filters?: ServiceInterventionFilters): Promise<ServiceIntervention[]> {
    const response: AxiosResponse<PaginatedResponse<ServiceIntervention> | ServiceIntervention[]> =
      await Axios.get('/services/interventions/', { params: filters })
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  async fetchById(id: number): Promise<ServiceInterventionDetail> {
    const response = await Axios.get(`/services/interventions/${id}/`)
    return response.data
  },

  async create(data: CreateServiceInterventionDto): Promise<ServiceIntervention> {
    const response = await Axios.post('/services/interventions/', data)
    return response.data
  },

  async update(id: number, data: UpdateServiceInterventionDto): Promise<ServiceIntervention> {
    const response = await Axios.patch(`/services/interventions/${id}/`, data)
    return response.data
  },

  async remove(id: number): Promise<void> {
    await Axios.delete(`/services/interventions/${id}/`)
  },

  async start(id: number): Promise<ServiceIntervention> {
    const response = await Axios.post(`/services/interventions/${id}/start/`)
    return response.data
  },

  async complete(id: number): Promise<ServiceIntervention> {
    const response = await Axios.post(`/services/interventions/${id}/complete/`)
    return response.data
  },
}
