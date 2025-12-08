import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Supplier (liste) - correspond au backend UserListSerializer
 */
export interface Supplier {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  user_type: string
  user_type_display: string
  phone: string
  avatar: string | null
  role_name: string | null
  is_collaborator: boolean
  is_customer: boolean
  is_supplier: boolean
  is_active: boolean
  is_active_employee: boolean
  date_joined: string
  // Champs additionnels
  city: string
  supplier_code: string | null
  customer_code: string | null
  supplier_company_name: string
  customer_company_name: string
}

/**
 * Interface pour Supplier détaillé - correspond au backend UserDetailSerializer
 */
export interface SupplierDetail extends Supplier {
  alternative_phone: string
  address: string
  city: string
  postal_code: string
  country: string
  // Champs spécifiques fournisseur
  supplier_code: string
  supplier_company_name: string
  supplier_tax_id: string
  supplier_bank_account: string
  supplier_rating: number | null
  supplier_balance: number
  // Timestamps
  last_login: string | null
  created_at: string
  updated_at: string
  notes: string
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
 * Type pour créer un nouveau fournisseur
 *
 * Note: username, password sont optionnels pour les fournisseurs.
 * Le username sera généré automatiquement si non fourni.
 * Sans mot de passe, le fournisseur ne pourra pas se connecter.
 */
export interface CreateSupplierDto {
  username?: string              // Optionnel - généré auto si non fourni
  email: string
  password?: string              // Optionnel pour fournisseur
  password_confirm?: string      // Optionnel pour fournisseur
  first_name?: string
  last_name?: string
  phone?: string
  alternative_phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  is_supplier: true
  supplier_code: string
  supplier_company_name?: string
  supplier_tax_id?: string
  supplier_bank_account?: string
  supplier_rating?: number
  notes?: string
}

/**
 * Type pour mettre à jour un fournisseur
 */
export interface UpdateSupplierDto {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  alternative_phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  supplier_company_name?: string
  supplier_tax_id?: string
  supplier_bank_account?: string
  supplier_rating?: number
  is_active?: boolean
  notes?: string
}

/**
 * Interface pour les filtres de recherche de fournisseurs
 */
export interface SupplierFilters {
  search?: string
  is_active?: boolean
  ordering?: string
}

/**
 * Interface pour le résultat d'import
 */
export interface ImportResult {
  success: boolean
  message: string
  created: number
  updated: number
  errors: string[]
}

/**
 * Interface pour les fournisseurs avec dettes
 */
export interface SupplierDebt {
  id: number
  supplier_code: string
  name: string
  email: string
  phone: string
  total_ordered: number
  total_paid: number
  balance: number
}

/**
 * Interface pour créer un paiement fournisseur
 */
export interface CreateSupplierPaymentDto {
  supplier: number
  purchase_order?: number | null
  payment_date: string
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'mobile_money'
  reference?: string
  notes?: string
}

/**
 * Interface pour un paiement fournisseur
 */
export interface SupplierPayment {
  id: number
  payment_number: string
  supplier: number
  purchase_order: number | null
  payment_date: string
  amount: number
  payment_method: string
  reference: string
  notes: string
  created_at: string
  created_by: number | null
}

/**
 * Service API pour la gestion des fournisseurs
 *
 * Note: Le CRUD utilise /auth/users/ car les fournisseurs sont des User avec is_supplier=true
 * Les exports/imports utilisent /suppliers/ pour les fonctionnalités spécifiques
 */
export const suppliersApi = {
  /**
   * Récupérer tous les fournisseurs avec filtres optionnels
   * Utilise l'endpoint spécialisé /auth/users/suppliers/
   */
  async fetchAll(filters?: SupplierFilters): Promise<Supplier[]> {
    const response: AxiosResponse<Supplier[] | PaginatedResponse<Supplier>> = await Axios.get(
      '/auth/users/suppliers/',
      { params: filters }
    )

    // Gérer réponse paginée ou non
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results
  },

  /**
   * Récupérer un fournisseur par son ID
   */
  async fetchById(id: number): Promise<SupplierDetail> {
    const response: AxiosResponse<SupplierDetail> = await Axios.get(`/auth/users/${id}/`)
    return response.data
  },

  /**
   * Créer un nouveau fournisseur
   */
  async create(data: CreateSupplierDto): Promise<SupplierDetail> {
    const response: AxiosResponse<SupplierDetail> = await Axios.post('/auth/users/', {
      ...data,
      is_supplier: true,
      is_collaborator: false,
      is_customer: false
    })
    return response.data
  },

  /**
   * Mettre à jour un fournisseur
   */
  async update(id: number, data: UpdateSupplierDto): Promise<SupplierDetail> {
    const response: AxiosResponse<SupplierDetail> = await Axios.patch(`/auth/users/${id}/`, data)
    return response.data
  },

  /**
   * Supprimer un fournisseur (soft delete - désactivation)
   */
  async delete(id: number): Promise<void> {
    await Axios.delete(`/auth/users/${id}/`)
  },

  /**
   * Activer un fournisseur
   */
  async activate(id: number): Promise<{ message: string }> {
    const response = await Axios.post(`/auth/users/${id}/activate/`)
    return response.data
  },

  /**
   * Désactiver un fournisseur
   */
  async deactivate(id: number): Promise<{ message: string }> {
    const response = await Axios.post(`/auth/users/${id}/deactivate/`)
    return response.data
  },

  /**
   * Récupérer les fournisseurs avec dettes
   */
  async fetchDebts(): Promise<SupplierDebt[]> {
    const response: AxiosResponse<SupplierDebt[]> = await Axios.get('/suppliers/suppliers/debts/')
    return response.data
  },

  /**
   * Exporter les fournisseurs en Excel
   */
  async exportExcel(filters?: SupplierFilters): Promise<Blob> {
    const response = await Axios.get('/suppliers/suppliers/export_excel/', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Exporter les fournisseurs en PDF
   */
  async exportPdf(filters?: SupplierFilters): Promise<Blob> {
    const response = await Axios.get('/suppliers/suppliers/export_pdf/', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Importer des fournisseurs depuis un fichier Excel
   */
  async importExcel(file: File): Promise<ImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await Axios.post('/suppliers/suppliers/import_excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Télécharger le template d'import Excel
   */
  async downloadTemplate(): Promise<Blob> {
    const response = await Axios.get('/suppliers/suppliers/download_template/', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Créer un paiement fournisseur
   */
  async createPayment(data: CreateSupplierPaymentDto): Promise<SupplierPayment> {
    const response: AxiosResponse<SupplierPayment> = await Axios.post('/suppliers/payments/', data)
    return response.data
  },

  /**
   * Récupérer les paiements d'un fournisseur
   */
  async fetchPayments(supplierId?: number): Promise<SupplierPayment[]> {
    const params = supplierId ? { supplier: supplierId } : {}
    const response: AxiosResponse<SupplierPayment[]> = await Axios.get('/suppliers/payments/', { params })
    return response.data
  }
}

export default suppliersApi
