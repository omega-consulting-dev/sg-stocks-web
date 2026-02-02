import { Axios } from './axios.service'
import type { AxiosResponse } from 'axios'

export interface SaleLineCreate {
  line_type: 'product' | 'service'
  product?: number
  service?: number
  description?: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount_percentage?: number
}

export interface SaleCreateData {
  customer: number | null
  store: number
  sale_date: string
  notes?: string
  paid_amount?: number
  payment_method?: 'cash' | 'card' | 'transfer'
  due_date?: string
  lines: SaleLineCreate[]
}

export interface Sale {
  id: number
  sale_number: string
  customer: {
    id: number
    name: string
  } | null
  store: {
    id: number
    name: string
  }
  sale_date: string
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid'
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  balance_due: string
  notes: string
  lines: any[]
  invoice_id?: number
  invoice?: {
    id: number
    invoice_number: string
  }
}

export const SalesService = {
  /**
   * Create a new sale (draft)
   */
  async createSale(data: SaleCreateData): Promise<Sale> {
    const response: AxiosResponse<Sale> = await Axios.post('/sales/sales/', data)
    return response.data
  },

  /**
   * Get all sales
   */
  async getSales(params?: {
    status?: string
    payment_status?: string
    customer?: number
    store?: number
    date_from?: string
    date_to?: string
  }): Promise<Sale[]> {
    // Ajouter page_size pour récupérer toutes les ventes (pas seulement les 20 premières)
    const queryParams = { ...params, page_size: 1000 }
    const response: AxiosResponse<{ results: Sale[] }> = await Axios.get('/sales/sales/', { params: queryParams })
    return response.data.results || []
  },

  /**
   * Get single sale
   */
  async getSale(id: number): Promise<Sale> {
    const response: AxiosResponse<Sale> = await Axios.get(`/sales/sales/${id}/`)
    return response.data
  },

  /**
   * Confirm sale (decrement stock, generate invoice automatically)
   */
  async confirmSale(id: number): Promise<{ message: string; sale: Sale }> {
    const response: AxiosResponse<{ message: string; sale: Sale }> = await Axios.post(`/sales/sales/${id}/confirm/`)
    return response.data
  },

  /**
   * Generate invoice from confirmed sale (manual if auto-generation disabled)
   */
  async generateInvoice(saleId: number): Promise<{ message: string; invoice: any }> {
    const response: AxiosResponse<{ message: string; invoice: any }> = await Axios.post(`/sales/sales/${saleId}/generate_invoice/`)
    return response.data
  },

  /**
   * Mark sale as completed
   */
  async completeSale(id: number): Promise<{ message: string; sale: Sale }> {
    const response: AxiosResponse<{ message: string; sale: Sale }> = await Axios.post(`/sales/sales/${id}/complete/`)
    return response.data
  },

  /**
   * Cancel sale (restore stock if confirmed)
   */
  async cancelSale(id: number): Promise<{ message: string; sale: Sale }> {
    const response: AxiosResponse<{ message: string; sale: Sale }> = await Axios.post(`/sales/sales/${id}/cancel/`)
    return response.data
  },

  /**
   * Update sale
   */
  async updateSale(id: number, data: Partial<SaleCreateData>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await Axios.patch(`/sales/sales/${id}/`, data)
    return response.data
  },

  /**
   * Delete sale
   */
  async deleteSale(id: number): Promise<void> {
    await Axios.delete(`/sales/sales/${id}/`)
  }
}
