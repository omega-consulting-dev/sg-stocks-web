import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Service en mode liste (ServiceListSerializer)
 * Endpoint: /api/v1/services/services/
 */
export interface Service {
  id: number
  reference: string
  name: string
  category: number
  category_name: string
  unit_price: number
  estimated_duration: number | null
  assigned_staff_count: number
  is_active: boolean
  created_at: string
}

/**
 * Interface pour le personnel assigné
 */
export interface AssignedStaff {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

/**
 * Interface pour Service en mode détail (ServiceDetailSerializer)
 */
export interface ServiceDetail extends Service {
  description: string
  tax_rate: number
  unit_price_with_tax: number
  assigned_staff: number[]
  assigned_staff_list: AssignedStaff[]
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

/**
 * Type pour créer un nouveau service (ServiceCreateUpdateSerializer)
 */
export interface CreateServiceDto {
  reference: string
  name: string
  description: string
  category: number
  unit_price: number
  tax_rate?: number
  estimated_duration?: number | null
  assigned_staff?: number[]
  is_active?: boolean
}

/**
 * Type pour mettre à jour un service
 */
export type UpdateServiceDto = Partial<CreateServiceDto>

/**
 * Interface pour les filtres de recherche
 */
export interface ServiceFilters {
  category?: number
  is_active?: boolean
  search?: string
  ordering?: string
}

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
 * Interface pour les statistiques des services
 */
export interface ServiceStats {
  total_services: number
  total_categories: number
  total_interventions: number
  pending_interventions: number
  completed_interventions: number
}

/**
 * Service API pour la gestion des services
 * Base URL: /services/services/
 */
export const servicesApi = {
  /**
   * Récupérer tous les services avec filtres optionnels
   * @param filters - Filtres optionnels
   * @param includeInactive - Si true, récupère aussi les services inactifs
   */
  async fetchAll(filters?: ServiceFilters, includeInactive = false): Promise<Service[]> {
    const params = includeInactive ? { ...filters } : { is_active: true, ...filters }
    const response: AxiosResponse<PaginatedResponse<Service> | Service[]> = await Axios.get(
      '/services/services/',
      { params }
    )
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  /**
   * Récupérer un service par son ID (détail complet)
   */
  async fetchById(id: number): Promise<ServiceDetail> {
    const response: AxiosResponse<ServiceDetail> = await Axios.get(`/services/services/${id}/`)
    return response.data
  },

  /**
   * Récupérer les services d'une catégorie spécifique
   */
  async fetchByCategory(categoryId: number): Promise<Service[]> {
    const response: AxiosResponse<PaginatedResponse<Service> | Service[]> = await Axios.get(
      '/services/services/',
      { params: { category: categoryId } }
    )
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results || []
  },

  /**
   * Créer un nouveau service
   */
  async create(data: CreateServiceDto): Promise<ServiceDetail> {
    const response: AxiosResponse<ServiceDetail> = await Axios.post('/services/services/', data)
    return response.data
  },

  /**
   * Mettre à jour un service existant (PATCH pour mise à jour partielle)
   */
  async update(id: number, data: UpdateServiceDto): Promise<ServiceDetail> {
    const response: AxiosResponse<ServiceDetail> = await Axios.patch(
      `/services/services/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Remplacer un service existant (PUT pour mise à jour complète)
   */
  async replace(id: number, data: CreateServiceDto): Promise<ServiceDetail> {
    const response: AxiosResponse<ServiceDetail> = await Axios.put(
      `/services/services/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Supprimer un service
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/services/services/${id}/`)
  },

  /**
   * Récupérer les statistiques des services
   */
  async getStats(): Promise<ServiceStats> {
    const response: AxiosResponse<ServiceStats> = await Axios.get('/services/services/stats/')
    return response.data
  },

  /**
   * Exporter les services en Excel
   */
  async exportExcel(): Promise<Blob> {
    const response = await Axios.get('/services/services/export_excel/', {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Exporter les services en PDF
   */
  async exportPdf(): Promise<Blob> {
    const response = await Axios.get('/services/services/export_pdf/', {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Importer des services depuis un fichier Excel
   */
  async importExcel(
    file: File
  ): Promise<{ message: string; created: number; updated: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await Axios.post('/services/services/import_excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export default servicesApi
