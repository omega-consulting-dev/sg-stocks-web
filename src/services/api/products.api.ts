import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Product (liste) - correspond au backend ProductListSerializer
 */
export interface Product {
  id: number
  reference: string
  name: string
  description: string
  category: number
  category_name: string
  cost_price: number
  selling_price: number
  tax_rate: number
  minimum_stock: number
  optimal_stock: number
  current_stock: number
  is_low_stock: boolean
  product_type: 'storable' | 'consumable' | 'service'
  is_for_sale: boolean
  is_for_purchase: boolean
  is_active: boolean
  primary_image: string | null
  barcode: string | null
  weight: number | null
  volume: number | null
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
 * Type pour créer un nouveau produit
 */
export interface CreateProductDto {
  reference: string
  name: string
  description?: string
  category: number
  cost_price: number
  selling_price: number
  tax_rate?: number
  minimum_stock?: number
  optimal_stock?: number
  product_type?: 'storable' | 'consumable' | 'service'
  is_for_sale?: boolean
  is_for_purchase?: boolean
  is_active?: boolean
  barcode?: string | null
  weight?: number | null
  volume?: number | null
}

/**
 * Type pour mettre à jour un produit
 */
export type UpdateProductDto = Partial<CreateProductDto>

/**
 * Interface pour les filtres de recherche de produits
 */
export interface ProductFilters {
  category?: number
  search?: string
  is_active?: boolean
  is_for_sale?: boolean
  ordering?: string
}

/**
 * Service API pour la gestion des produits
 */
export const productsApi = {
  /**
   * Récupérer tous les produits avec filtres optionnels
   * Par défaut, ne récupère que les produits actifs
   * @param filters - Filtres optionnels
   * @param includeInactive - Si true, récupère aussi les produits inactifs
   */
  async fetchAll(filters?: ProductFilters, includeInactive = false): Promise<Product[]> {
    const params = includeInactive ? { ...filters } : { is_active: true, ...filters }
    const response: AxiosResponse<Product[] | PaginatedResponse<Product>> = await Axios.get(
      '/products/products/',
      { params }
    )

    // Gérer réponse paginée ou non
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results
  },

  /**
   * Récupérer un produit par son ID
   */
  async fetchById(id: number): Promise<Product> {
    const response: AxiosResponse<Product> = await Axios.get(`/products/products/${id}/`)
    return response.data
  },

  /**
   * Récupérer les produits d'une catégorie spécifique
   */
  async fetchByCategory(categoryId: number): Promise<Product[]> {
    return this.fetchAll({ category: categoryId })
  },

  /**
   * Récupérer les produits en rupture de stock
   */
  async fetchLowStock(): Promise<Product[]> {
    const response: AxiosResponse<Product[] | PaginatedResponse<Product>> = await Axios.get(
      '/products/products/low_stock/'
    )

    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results
  },

  /**
   * Créer un nouveau produit
   */
  async create(data: CreateProductDto & { image?: File }): Promise<Product> {
    // Si une image est fournie, utiliser FormData
    if (data.image) {
      const formData = new FormData()

      // Ajouter tous les champs sauf l'image
      Object.keys(data).forEach(key => {
        if (key !== 'image' && data[key as keyof typeof data] !== undefined) {
          formData.append(key, String(data[key as keyof typeof data]))
        }
      })

      // Ajouter l'image
      formData.append('primary_image', data.image)

      const response: AxiosResponse<Product> = await Axios.post('/products/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    }

    // Sinon, envoyer en JSON comme avant
    const response: AxiosResponse<Product> = await Axios.post('/products/products/', data)
    return response.data
  },

  /**
   * Mettre à jour un produit existant
   */
  async update(id: number, data: UpdateProductDto & { image?: File }): Promise<Product> {
    // Si une image est fournie, utiliser FormData
    if (data.image) {
      const formData = new FormData()

      // Ajouter tous les champs sauf l'image
      Object.keys(data).forEach(key => {
        if (key !== 'image' && data[key as keyof typeof data] !== undefined && data[key as keyof typeof data] !== null) {
          const value = data[key as keyof typeof data]
          // Gérer correctement les booléens et les nombres
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false')
          } else if (typeof value === 'number') {
            formData.append(key, String(value))
          } else if (typeof value === 'string') {
            formData.append(key, value)
          }
        }
      })

      // Ajouter l'image
      formData.append('primary_image', data.image)

      const response: AxiosResponse<Product> = await Axios.patch(`/products/products/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    }

    // Sinon, envoyer en JSON comme avant
    const response: AxiosResponse<Product> = await Axios.patch(`/products/products/${id}/`, data)
    return response.data
  },

  /**
   * Supprimer un produit (soft delete)
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/products/products/${id}/`)
  },

  /**
   * Upload d'une image pour un produit
   */
  async uploadImage(id: number, imageFile: File): Promise<{ image: string }> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await Axios.post(`/products/products/${id}/add_image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Exporter les produits en Excel
   */
  async exportExcel(): Promise<Blob> {
    const response = await Axios.get('/products/products/export_excel/', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Exporter les produits en PDF
   */
  async exportPdf(): Promise<Blob> {
    const response = await Axios.get('/products/products/export_pdf/', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Importer des produits depuis un fichier Excel
   */
  async importExcel(
    file: File
  ): Promise<{ message: string; created: number; updated: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await Axios.post('/products/products/import_excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default productsApi
