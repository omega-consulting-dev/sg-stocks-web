import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Interface pour Supplier (liste) - correspond au backend Supplier model
 */
export interface Supplier {
  id: number
  name: string // Raison sociale (nom de l'entreprise)
  supplier_code: string
  contact_person: string // Nom du contact principal
  email: string
  phone: string
  mobile: string
  website: string
  address: string
  city: string
  postal_code: string
  country: string
  tax_id: string
  bank_account: string
  rating: number | null
  balance: number
  is_active: boolean
  notes: string
  created_at: string
  updated_at: string
}

/**
 * Interface pour Supplier détaillé - identique à Supplier
 */
export interface SupplierDetail extends Supplier {
  // Tous les champs sont déjà dans Supplier
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
 */
export interface CreateSupplierDto {
  name: string // Raison sociale (obligatoire)
  supplier_code: string // Code fournisseur (obligatoire)
  contact_person?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  tax_id?: string
  bank_account?: string
  rating?: number
  notes?: string
}

/**
 * Type pour mettre à jour un fournisseur
 */
export interface UpdateSupplierDto {
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  tax_id?: string
  bank_account?: string
  rating?: number
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
  name: string // Nom de l'entreprise
  contact_person: string
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
  created_by_name?: string | null
}

/**
 * Service API pour la gestion des fournisseurs
 *
 * Note: Tous les endpoints utilisent /suppliers/suppliers/ pour les opérations CRUD
 */
export const suppliersApi = {
  /**
   * Récupérer tous les fournisseurs avec filtres optionnels
   */
  async fetchAll(filters?: SupplierFilters): Promise<Supplier[]> {
    const response: AxiosResponse<Supplier[] | PaginatedResponse<Supplier>> = await Axios.get(
      '/suppliers/suppliers/',
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
    const response: AxiosResponse<SupplierDetail> = await Axios.get(`/suppliers/suppliers/${id}/`)
    return response.data
  },

  /**
   * Créer un nouveau fournisseur
   */
  async create(data: CreateSupplierDto): Promise<SupplierDetail> {
    const response: AxiosResponse<SupplierDetail> = await Axios.post('/suppliers/suppliers/', data)
    return response.data
  },

  /**
   * Mettre à jour un fournisseur
   */
  async update(id: number, data: UpdateSupplierDto): Promise<SupplierDetail> {
    const response: AxiosResponse<SupplierDetail> = await Axios.patch(`/suppliers/suppliers/${id}/`, data)
    return response.data
  },

  /**
   * Supprimer un fournisseur (soft delete - désactivation)
   */
  async delete(id: number): Promise<void> {
    await Axios.delete(`/suppliers/suppliers/${id}/`)
  },

  /**
   * Activer un fournisseur
   */
  async activate(id: number): Promise<{ message: string }> {
    const response = await Axios.post(`/suppliers/suppliers/${id}/activate/`)
    return response.data
  },

  /**
   * Désactiver un fournisseur
   */
  async deactivate(id: number): Promise<{ message: string }> {
    const response = await Axios.post(`/suppliers/suppliers/${id}/deactivate/`)
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
  },

  /**
   * Récupérer l'historique détaillé des paiements d'un fournisseur
   */
  async fetchSupplierPayments(supplierId: number): Promise<SupplierPayment[]> {
    const response: AxiosResponse<SupplierPayment[] | PaginatedResponse<SupplierPayment>> = await Axios.get('/suppliers/payments/', {
      params: { supplier: supplierId, ordering: '-payment_date' }
    })

    // Gérer réponse paginée ou non
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results
  }
}

export default suppliersApi
