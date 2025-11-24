import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour la réponse API standard
 */
interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

/**
 * Interface pour ProductFamily (correspond au store)
 */
export interface ProductFamily {
  id: number
  code: string
  libelle: string
  description: string
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Type pour créer une nouvelle famille (sans id, createdAt, updatedAt)
 */
export type CreateProductFamilyDto = Omit<ProductFamily, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Type pour mettre à jour une famille (tous les champs optionnels sauf id)
 */
export type UpdateProductFamilyDto = Partial<CreateProductFamilyDto>

/**
 * Service API pour la gestion des familles de produits
 */
export const productFamiliesApi = {
  /**
   * Récupérer toutes les familles de produits
   */
  async fetchAll(): Promise<ProductFamily[]> {
    const response: AxiosResponse<ProductFamily[]> = await Axios.get('/product-families')
    return response.data
  },

  /**
   * Récupérer une famille de produits par son ID
   */
  async fetchById(id: number): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.get(`/product-families/${id}`)
    return response.data
  },

  /**
   * Créer une nouvelle famille de produits
   */
  async create(data: CreateProductFamilyDto): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.post('/product-families', data)
    return response.data
  },

  /**
   * Mettre à jour une famille de produits existante
   */
  async update(id: number, data: UpdateProductFamilyDto): Promise<ProductFamily> {
    const response: AxiosResponse<ProductFamily> = await Axios.put(
      `/product-families/${id}`,
      data
    )
    return response.data
  },

  /**
   * Supprimer une famille de produits
   */
  async remove(id: number): Promise<void> {
    await Axios.delete(`/product-families/${id}`)
  },
}

export default productFamiliesApi
