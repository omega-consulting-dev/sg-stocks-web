import type { AxiosResponse } from 'axios'
import Axios from '../axios.service'

/**
 * Customer Debt Interface
 */
export interface CustomerDebt {
  id: number
  customer_code: string
  name: string
  email: string | null
  phone: string | null
  total_invoiced: number
  total_paid: number
  balance: number
  user_id: number | null
}

/**
 * Customer Payment Interface
 */
export interface CustomerPayment {
  id: number
  payment_number: string
  invoice_number: string
  payment_date: string
  amount: number
  payment_method: 'cash' | 'card' | 'mobile_money' | 'check' | 'bank_transfer'
  payment_method_display: string
  reference: string
  notes: string
}

/**
 * Create Payment Data
 */
export interface CreateCustomerPaymentDto {
  invoice_id: number
  amount: number
  payment_method: 'cash' | 'card' | 'mobile_money' | 'check' | 'bank_transfer'
  payment_date?: string
  reference?: string
  notes?: string
}

/**
 * Invoice Interface (minimal pour selection)
 */
export interface CustomerInvoice {
  id: number
  invoice_number: string
  invoice_date: string
  total_amount: number
  paid_amount: number
  balance_due: number
  status: string
}

/**
 * Customer Accounts API Service
 */
export const customerAccountsApi = {
  /**
   * Get all customer debts
   */
  async getDebts(): Promise<CustomerDebt[]> {
    const response: AxiosResponse<CustomerDebt[]> = await Axios.get(
      '/customers/customers/debts/'
    )
    return response.data
  },

  /**
   * Get payment history for a customer
   */
  async getPaymentHistory(customerId: number): Promise<CustomerPayment[]> {
    const response: AxiosResponse<CustomerPayment[]> = await Axios.get(
      `/customers/customers/${customerId}/payment_history/`
    )
    return response.data
  },

  /**
   * Create a payment for a customer
   */
  async createPayment(
    customerId: number,
    data: CreateCustomerPaymentDto
  ): Promise<{ id: number; payment_number: string; amount: number; message: string }> {
    const response = await Axios.post(
      `/customers/customers/${customerId}/create-payment/`,
      data
    )
    return response.data
  },

  /**
   * Get customer invoices (for payment selection)
   */
  async getCustomerInvoices(customerId: number): Promise<CustomerInvoice[]> {
    const response: AxiosResponse<CustomerInvoice[]> = await Axios.get(
      `/invoicing/invoices/`,
      {
        params: {
          customer_id: customerId,
          status: 'sent,overdue', // Only unpaid/partially paid invoices
        },
      }
    )
    return response.data
  },
}
