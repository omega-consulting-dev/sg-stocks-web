import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Purchase Order Status
 */
export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'received' | 'cancelled'

/**
 * Purchase Order Line
 */
export interface PurchaseOrderLine {
  id?: number
  product: number
  product_name?: string
  product_reference?: string
  quantity: number
  unit_price: number
  total_price?: number
  received_quantity?: number
  notes?: string
}

/**
 * Purchase Order
 */
export interface PurchaseOrder {
  id: number
  reference: string
  supplier: number
  supplier_name?: string
  store: number
  store_name?: string
  order_date: string
  expected_delivery_date?: string
  status: PurchaseOrderStatus
  total_amount: number
  paid_amount: number
  balance: number
  payment_method?: string
  notes?: string
  created_by?: number
  created_by_name?: string
  received_by?: number
  received_by_name?: string
  received_at?: string
  created_at: string
  updated_at: string
}

/**
 * Purchase Order Detail (with lines)
 */
export interface PurchaseOrderDetail extends PurchaseOrder {
  lines: PurchaseOrderLine[]
}

/**
 * Create Purchase Order Data
 */
export interface CreatePurchaseOrderData {
  supplier: number
  store: number
  order_date: string
  expected_delivery_date?: string
  payment_method?: string
  paid_amount?: number
  notes?: string
  lines: Array<{
    product: number
    quantity: number
    unit_price: number
    notes?: string
  }>
}

/**
 * Update Purchase Order Data
 */
export interface UpdatePurchaseOrderData {
  supplier?: number
  store?: number
  order_date?: string
  expected_delivery_date?: string
  payment_method?: string
  paid_amount?: number
  notes?: string
  lines?: Array<{
    id?: number
    product: number
    quantity: number
    unit_price: number
    notes?: string
  }>
}

/**
 * Receive Purchase Order Data
 */
export interface ReceivePurchaseOrderData {
  received_quantities?: Array<{
    line_id: number
    received_quantity: number
  }>
  notes?: string
}

/**
 * Purchase Filters
 */
export interface PurchaseFilters {
  supplier?: number
  store?: number
  status?: PurchaseOrderStatus
  start_date?: string
  end_date?: string
  search?: string
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
 * Purchase Statistics
 */
export interface PurchaseStats {
  total_orders: number
  total_amount: number
  paid_amount: number
  balance: number
  draft_count: number
  confirmed_count: number
  received_count: number
}

/**
 * Purchases/Achats API Service
 */
export const purchasesApi = {
  /**
   * Get all purchase orders with filters
   */
  async getPurchaseOrders(
    filters?: PurchaseFilters,
    page: number = 1
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const response: AxiosResponse<PaginatedResponse<PurchaseOrder>> = await Axios.get(
      '/suppliers/purchase-orders/',
      { params: { ...filters, page } }
    )
    return response.data
  },

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(id: number): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.get(
      `/suppliers/purchase-orders/${id}/`
    )
    return response.data
  },

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.post(
      '/suppliers/purchase-orders/',
      data
    )
    return response.data
  },

  /**
   * Update purchase order (only if draft)
   */
  async updatePurchaseOrder(
    id: number,
    data: UpdatePurchaseOrderData
  ): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.patch(
      `/suppliers/purchase-orders/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Confirm purchase order
   */
  async confirmPurchaseOrder(id: number): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.post(
      `/suppliers/purchase-orders/${id}/confirm/`
    )
    return response.data
  },

  /**
   * Receive purchase order (mark as received and update stock)
   */
  async receivePurchaseOrder(
    id: number,
    data?: ReceivePurchaseOrderData
  ): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.post(
      `/suppliers/purchase-orders/${id}/receive/`,
      data || {}
    )
    return response.data
  },

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id: number): Promise<PurchaseOrderDetail> {
    const response: AxiosResponse<PurchaseOrderDetail> = await Axios.post(
      `/suppliers/purchase-orders/${id}/cancel/`
    )
    return response.data
  },

  /**
   * Delete purchase order (only if draft)
   */
  async deletePurchaseOrder(id: number): Promise<void> {
    await Axios.delete(`/suppliers/purchase-orders/${id}/`)
  },

  /**
   * Get purchase statistics
   */
  async getStats(filters?: { supplier?: number; store?: number }): Promise<PurchaseStats> {
    const response: AxiosResponse<PurchaseStats> = await Axios.get(
      '/suppliers/purchase-orders/stats/',
      { params: filters }
    )
    return response.data
  }
}
