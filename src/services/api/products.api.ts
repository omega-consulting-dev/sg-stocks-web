import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Product (correspond au store)
 */
export interface Product {
  id: number
  code: string
  designation: string
  familleId: number
  familleLibelle: string
  prixAchat: number
  prixVente: number
  quantiteStock: number
  seuilAlerte: number
  image?: string
  description: string
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Type pour créer un nouveau produit (sans id, createdAt, updatedAt)
 */
export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Type pour mettre à jour un produit (tous les champs optionnels sauf id)
 */
export type UpdateProductDto = Partial<CreateProductDto>

/**
 * Interface pour les filtres de recherche de produits
 */
export interface ProductFilters {
  familleId?: number
  minPrix?: number
  maxPrix?: number
  enStock?: boolean
  search?: string
}

/**
 * Service API pour la gestion des produits
 */
export const productsApi = {
  /**
   * Récupérer tous les produits avec filtres optionnels
   */
  async fetchAll(filters?: ProductFilters): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await Axios.get('/products', {
      params: filters,
    })
    return response.data
  },

  /**
   * Récupérer un produit par son ID
   */
  async fetchById(id: number): Promise<Product> {
    const response: AxiosResponse<Product> = await Axios.get(`/products/${id}`)
    return response.data
  },

  /**
   * Récupérer les produits d'une famille spécifique
   */
  async fetchByFamily(familleId: number): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await Axios.get(
      `/product-families/${familleId}/products`
    )
    return response.data
  },

  /**
   * Récupérer les produits en rupture de stock ou sous le seuil d'alerte
   */
  async fetchLowStock(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await Axios.get('/products/low-stock')
    return response.data
  },

  /**
   * Créer un nouveau produit
   */
  async create(data: CreateProductDto): Promise<Product> {
    const response: AxiosResponse<Product> = await Axios.post('/products', data)
    return response.data
  },

  /**
   * Mettre à jour un produit existant
   */
  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const response: AxiosResponse<Product> = await Axios.put(`/products/${id}`, data)
    return response.data
  },

  /**
   * Mettre à jour le stock d'un produit
   */
  async updateStock(id: number, quantite: number): Promise<Product> {
    const response: AxiosResponse<Product> = await Axios.patch(`/products/${id}/stock`, {
      quantite,
    })
    return response.data
  },

  /**
   * Supprimer un produit
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/products/${id}`)
  },

  /**
   * Upload d'une image pour un produit
   */
  async uploadImage(id: number, imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response: AxiosResponse<{ imageUrl: string }> = await Axios.post(
      `/products/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}

export default productsApi
