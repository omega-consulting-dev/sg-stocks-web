import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Customer Payment Term
 */
export type PaymentTerm = 'immediate' | '15_days' | '30_days' | '60_days' | '90_days'

/**
 * Customer Interface
 */
export interface Customer {
  id: number
  customer_code: string
  name: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  billing_address?: string
  tax_id?: string
  payment_term: PaymentTerm
  payment_term_display?: string
  credit_limit: number
  balance?: number
  notes?: string
  user?: number
  user_email?: string
  is_active: boolean
  created_at: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

/**
 * Create Customer Data
 */
export interface CreateCustomerData {
  customer_code?: string
  name: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  billing_address?: string
  tax_id?: string
  payment_term?: PaymentTerm
  credit_limit?: number
  notes?: string
  user?: number
  is_active?: boolean
}

/**
 * Update Customer Data
 */
export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

/**
 * Customer Filters
 */
export interface CustomerFilters {
  search?: string
  city?: string
  payment_term?: PaymentTerm
  is_active?: boolean
  ordering?: string
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Customers API Service
 */
export const customersApi = {
  /**
   * Get all customers
   */
  async getCustomers(params?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const response: AxiosResponse<PaginatedResponse<Customer>> = await Axios.get(
      '/customers/customers/',
      { params }
    )
    return response.data
  },

  /**
   * Get customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const response: AxiosResponse<Customer> = await Axios.get(
      `/customers/customers/${id}/`
    )
    return response.data
  },

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const response: AxiosResponse<Customer> = await Axios.post(
      '/customers/customers/',
      data
    )
    return response.data
  },

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: UpdateCustomerData): Promise<Customer> {
    const response: AxiosResponse<Customer> = await Axios.patch(
      `/customers/customers/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Delete customer (soft delete)
   */
  async deleteCustomer(id: number): Promise<void> {
    await Axios.delete(`/customers/customers/${id}/`)
  },

  /**
   * Export customers to Excel
   */
  async exportExcel(params?: CustomerFilters): Promise<ArrayBuffer> {
    const response: AxiosResponse<ArrayBuffer> = await Axios.get(
      '/customers/customers/export_excel/',
      {
        params,
        responseType: 'arraybuffer'
      }
    )
    return response.data
  }
}
