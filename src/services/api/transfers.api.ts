import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Stock Transfer Status
 */
export type TransferStatus = 'draft' | 'pending' | 'in_transit' | 'received' | 'cancelled'

/**
 * Stock Transfer Line
 */
export interface TransferLine {
  id?: number
  product: number
  product_name?: string
  product_reference?: string
  quantity_requested: number
  quantity_sent?: number
  quantity_received?: number
  unit_price?: number
  notes?: string
}

/**
 * Stock Transfer
 */
export interface StockTransfer {
  id: number
  reference?: string
  transfer_number: string
  source_store: number
  source_store_name?: string
  destination_store: number
  destination_store_name?: string
  transfer_date: string
  expected_arrival?: string
  actual_arrival?: string
  status: TransferStatus
  status_display?: string
  lines_count?: number
  products?: string[]
  notes?: string
  validated_by?: number
  validated_by_name?: string
  validated_at?: string
  received_by?: number
  received_by_name?: string
  received_at?: string
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
}

/**
 * Stock Transfer Detail (with lines)
 */
export interface StockTransferDetail extends StockTransfer {
  lines: TransferLine[]
}

/**
 * Create Stock Transfer Data
 */
export interface CreateTransferData {
  transfer_number?: string
  reference?: string
  source_store: number
  destination_store: number
  transfer_date: string
  expected_arrival?: string
  status?: string
  notes?: string
  lines: Array<{
    product: number
    quantity_requested: number
    notes?: string
  }>
}

/**
 * Update Stock Transfer Data
 */
export interface UpdateTransferData {
  source_store?: number
  destination_store?: number
  transfer_date?: string
  expected_arrival?: string
  notes?: string
  lines?: Array<{
    id?: number
    product: number
    quantity_requested: number
    notes?: string
  }>
}

/**
 * Receive Transfer Data
 */
export interface ReceiveTransferData {
  received_quantities?: Array<{
    line_id: number
    received_quantity: number
  }>
  notes?: string
}

/**
 * Transfer Filters
 */
export interface TransferFilters {
  status?: TransferStatus
  source_store?: number
  destination_store?: number
  start_date?: string
  end_date?: string
  search?: string
  page_size?: number
}

/**
 * Paginated Transfer Response
 */
export interface PaginatedTransferResponse {
  count: number
  next: string | null
  previous: string | null
  results: StockTransfer[]
}

/**
 * Stock Transfers API Service
 */
export const transfersApi = {
  /**
   * Get all transfers with filters
   */
  async getTransfers(filters?: TransferFilters, page: number = 1): Promise<PaginatedTransferResponse> {
    const response: AxiosResponse<PaginatedTransferResponse> = await Axios.get(
      '/inventory/transfers/',
      { params: { ...filters, page, page_size: filters?.page_size ?? 8 } }
    )
    return response.data
  },

  /**
   * Get transfer by ID
   */
  async getTransfer(id: number): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.get(
      `/inventory/transfers/${id}/`
    )
    return response.data
  },

  /**
   * Create new transfer
   */
  async createTransfer(data: CreateTransferData): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.post(
      '/inventory/transfers/',
      data
    )
    return response.data
  },

  /**
   * Update transfer (only if status is draft)
   */
  async updateTransfer(id: number, data: UpdateTransferData): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.patch(
      `/inventory/transfers/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Delete transfer (only if status is draft)
   */
  async deleteTransfer(id: number): Promise<void> {
    await Axios.delete(`/inventory/transfers/${id}/`)
  },

  /**
   * Validate transfer (draft → in_transit)
   */
  async validateTransfer(id: number): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.post(
      `/inventory/transfers/${id}/validate_transfer/`
    )
    return response.data
  },

  /**
   * Receive transfer (validated → received)
   */
  async receiveTransfer(id: number, data?: ReceiveTransferData): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.post(
      `/inventory/transfers/${id}/receive/`,
      data || {}
    )
    return response.data
  },

  /**
   * Cancel transfer
   */
  async cancelTransfer(id: number): Promise<StockTransferDetail> {
    const response: AxiosResponse<StockTransferDetail> = await Axios.post(
      `/inventory/transfers/${id}/cancel/`
    )
    return response.data
  },

  /**
   * Export transfers to Excel
   */
  async exportExcel(params?: Record<string, any>): Promise<ArrayBuffer> {
    const response: AxiosResponse<ArrayBuffer> = await Axios.get(
      '/inventory/transfers/export_excel/',
      {
        params,
        responseType: 'arraybuffer'
      }
    )
    return response.data
  },

  /**
   * Get transfer statistics
   */
  async getTransferStats(): Promise<{
    total: number
    draft: number
    validated: number
    received: number
    cancelled: number
  }> {
    const response = await Axios.get('/inventory/stock-transfers/stats/')
    return response.data
  }
}
