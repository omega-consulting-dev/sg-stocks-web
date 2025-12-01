import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour ProductFamily - correspond au backend ProductCategorySerializer
 */
export interface ProductFamily {
  id: number
  name: string
  description: string
  parent: number | null
  parent_name?: string
  full_path?: string
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
 * Type pour créer une nouvelle famille
 */
export interface CreateProductFamilyDto {
  name: string
  description?: string
  parent?: number | null
}

/**
 * Type pour mettre à jour une famille
 */
export type UpdateProductFamilyDto = Partial<CreateProductFamilyDto>

/**
 * Service API pour la gestion des familles de produits
 */
export const productFamiliesApi = {
  /**
   * Récupérer toutes les familles de produits
   */
  async fetchAll(params?: { search?: string; ordering?: string }): Promise<ProductFamily[]> {
    const response: AxiosResponse<ProductFamily[] | PaginatedResponse<ProductFamily>> =
      await Axios.get('/products/categories/', { params })

    // Gérer réponse paginée ou non
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results
  },

  /**
   * Récupérer une famille de produits par son ID
   */
  async fetchById(id: number): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.get(`/products/categories/${id}/`)
    return response.data
  },

  /**
   * Créer une nouvelle famille de produits
   */
  async create(data: CreateProductFamilyDto): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.post('/products/categories/', data)
    return response.data
  },

  /**
   * Mettre à jour une famille de produits existante
   */
  async update(id: number, data: UpdateProductFamilyDto): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.patch(
      `/products/categories/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Supprimer une famille de produits
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/products/categories/${id}/`)
  },

  /**
   * Exporter les familles en Excel
   */
  async exportExcel(): Promise<Blob> {
    const response = await Axios.get('/products/categories/export_excel/', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Exporter les familles en PDF
   */
  async exportPdf(): Promise<Blob> {
    const response = await Axios.get('/products/categories/export_pdf/', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Importer des familles depuis un fichier Excel
   */
  async importExcel(file: File): Promise<{ message: string; created: number; updated: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await Axios.post('/products/categories/import_excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default productFamiliesApi
