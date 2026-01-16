import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Stock Movement Type
 */
export type MovementType =
  | 'in'              // Entrée
  | 'out'             // Sortie
  | 'transfer'        // Transfert
  | 'adjustment'      // Ajustement
  | 'return'          // Retour

/**
 * Stock Level
 */
export interface StockLevel {
  id: number
  product: number | { id: number; name: string; reference?: string; price?: number }
  product_name?: string
  product_reference?: string
  store: number
  store_name?: string
  quantity: number
  reserved_quantity?: number
  available_quantity?: number
  minimum_stock?: number
  maximum_stock?: number
  reorder_point?: number
  last_updated: string
}

/**
 * Stock Movement
 */
export interface StockMovement {
  id: number
  product: number
  product_name?: string
  product_reference?: string
  store: number
  store_name?: string
  destination_store?: number
  destination_store_name?: string
  movement_type: MovementType
  quantity: number
  unit_price?: number
  unit_cost?: number
  total_value?: number
  invoice_amount?: number   // Montant de la facture
  receipt_number?: string   // Numéro de pièce (RECEIPT-001, etc.)
  reference?: string        // Référence document (BL-DELL-2025-001, etc.)
  supplier_name?: string    // Nom du fournisseur (pour les entrées)
  customer_name?: string    // Nom du client (pour les sorties/factures)
  notes?: string
  date?: string             // Date de réalisation du mouvement
  created_by?: number
  created_by_name?: string
  created_at: string
  payment_info?: {
    invoice_amount?: number
    payment_amount?: number
    payment_date?: string
    payment_method?: string
    due_date?: string
  }
}

/**
 * Physical Inventory
 */
export interface PhysicalInventory {
  id: number
  reference: string
  store: number
  store_name?: string
  inventory_date: string
  status: 'draft' | 'validated' | 'cancelled'
  notes?: string
  created_by?: number
  created_by_name?: string
  validated_by?: number
  validated_by_name?: string
  validated_at?: string
  created_at: string
  updated_at: string
}

/**
 * Physical Inventory Line
 */
export interface InventoryLine {
  id?: number
  product: number
  product_name?: string
  product_reference?: string
  system_quantity: number
  counted_quantity: number | null
  difference?: number
  notes?: string
}

/**
 * Physical Inventory Detail
 */
export interface PhysicalInventoryDetail extends PhysicalInventory {
  lines: InventoryLine[]
}

/**
 * Create Stock Adjustment Data
 */
export interface CreateStockAdjustmentData {
  store: number
  product: number
  quantity: number
  movement_type: 'adjustment_in' | 'adjustment_out'
  notes?: string
}

/**
 * Create Physical Inventory Data
 */
export interface CreatePhysicalInventoryData {
  store: number
  inventory_date: string
  notes?: string
  lines: Array<{
    product: number
    counted_quantity: number | null
    notes?: string
  }>
}

/**
 * Update Physical Inventory Data
 */
export interface UpdatePhysicalInventoryData {
  inventory_date?: string
  notes?: string
  lines?: Array<{
    id?: number
    product: number
    counted_quantity: number | null
    notes?: string
  }>
}

/**
 * Stock Filters
 */
export interface StockFilters {
  store?: number
  product?: number
  search?: string
  low_stock?: boolean
  date_from?: string // Date de début de la période (format YYYY-MM-DD)
  date_to?: string // Date de fin de la période (format YYYY-MM-DD)
}

/**
 * Movement Filters
 */
export interface MovementFilters {
  store?: number
  product?: number
  movement_type?: MovementType | 'out,transfer' | 'in,transfer'  // Peut être un type simple ou plusieurs combinés
  date_from?: string  // Format: YYYY-MM-DD
  date_to?: string    // Format: YYYY-MM-DD
  start_date?: string
  end_date?: string
  search?: string
  page_size?: number
}

/**
 * Inventory Filters
 */
export interface InventoryFilters {
  store?: number
  status?: 'draft' | 'validated' | 'cancelled'
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
 * Stock Statistics
 */
export interface StockStats {
  total_products: number
  total_value: number
  low_stock_count: number
  out_of_stock_count: number
  total_movements: number
}

/**
 * Inventory/Stock API Service
 */
export const inventoryApi = {
  /**
   * Get stock levels with filters
   */
  async getStockLevels(
    filters?: StockFilters,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<StockLevel>> {
    const response: AxiosResponse<PaginatedResponse<StockLevel>> = await Axios.get(
      '/inventory/stocks/',
      { params: { ...filters, page, page_size: pageSize } }
    )
    return response.data
  },

  /**
   * Get stock level for specific product in store
   */
  async getProductStock(productId: number, storeId: number): Promise<StockLevel> {
    const response: AxiosResponse<StockLevel> = await Axios.get(
      `/inventory/stocks/by-product/`,
      { params: { product: productId, store: storeId } }
    )
    return response.data
  },

  /**
   * Get stock movements with filters
   */
  async getMovements(
    filters?: MovementFilters,
    page: number = 1
  ): Promise<PaginatedResponse<StockMovement>> {
    const response: AxiosResponse<PaginatedResponse<StockMovement>> = await Axios.get(
      '/inventory/movements/',
      { params: { ...filters, page } }
    )
    return response.data
  },

  /**
   * Create stock adjustment
   */
  async createAdjustment(data: CreateStockAdjustmentData): Promise<StockMovement> {
    const response: AxiosResponse<StockMovement> = await Axios.post(
      '/inventory/movements/',
      data
    )
    return response.data
  },

  /**
   * Update stock movement
   */
  async updateMovement(id: number, data: Partial<CreateStockAdjustmentData>): Promise<StockMovement> {
    const response: AxiosResponse<StockMovement> = await Axios.put(
      `/inventory/movements/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Delete stock movement
   */
  async deleteMovement(id: number): Promise<void> {
    await Axios.delete(`/inventory/movements/${id}/`)
  },

  /**
   * Get next available receipt number
   */
  async getNextReceiptNumber(): Promise<string> {
    const response: AxiosResponse<{ next_receipt_number: string }> = await Axios.get(
      '/inventory/movements/next-receipt-number/'
    )
    return response.data.next_receipt_number
  },

  /**
   * Get physical inventories with filters
   */
  async getInventories(
    filters?: InventoryFilters,
    page: number = 1
  ): Promise<PaginatedResponse<PhysicalInventory>> {
    const response: AxiosResponse<PaginatedResponse<PhysicalInventory>> = await Axios.get(
      '/inventory/inventories/',
      { params: { ...filters, page } }
    )
    return response.data
  },

  /**
   * Get inventory by ID
   */
  async getInventory(id: number): Promise<PhysicalInventoryDetail> {
    const response: AxiosResponse<PhysicalInventoryDetail> = await Axios.get(
      `/inventory/inventories/${id}/`
    )
    return response.data
  },

  /**
   * Create new physical inventory
   */
  async createInventory(data: CreatePhysicalInventoryData): Promise<PhysicalInventoryDetail> {
    const response: AxiosResponse<PhysicalInventoryDetail> = await Axios.post(
      '/inventory/inventories/',
      data
    )
    return response.data
  },

  /**
   * Update physical inventory (only if draft)
   */
  async updateInventory(
    id: number,
    data: UpdatePhysicalInventoryData
  ): Promise<PhysicalInventoryDetail> {
    const response: AxiosResponse<PhysicalInventoryDetail> = await Axios.patch(
      `/inventory/inventories/${id}/`,
      data
    )
    return response.data
  },

  /**
   * Validate physical inventory
   */
  async validateInventory(id: number): Promise<PhysicalInventoryDetail> {
    const response: AxiosResponse<PhysicalInventoryDetail> = await Axios.post(
      `/inventory/inventories/${id}/validate_inventory/`
    )
    return response.data
  },

  /**
   * Cancel physical inventory
   */
  async cancelInventory(id: number): Promise<PhysicalInventoryDetail> {
    const response: AxiosResponse<PhysicalInventoryDetail> = await Axios.post(
      `/inventory/inventories/${id}/cancel/`
    )
    return response.data
  },

  /**
   * Delete physical inventory (only if draft)
   */
  async deleteInventory(id: number): Promise<void> {
    await Axios.delete(`/inventory/inventories/${id}/`)
  },

  /**
   * Get stock statistics
   */
  async getStats(storeId?: number): Promise<StockStats> {
    const response: AxiosResponse<StockStats> = await Axios.get(
      '/inventory/stocks/stats/',
      { params: storeId ? { store: storeId } : {} }
    )
    return response.data
  },

  /**
   * Export stock movements to Excel
   */
  async exportMovementsExcel(filters?: MovementFilters): Promise<Blob> {
    const response = await Axios.get('/inventory/movements/export_excel/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export stock movements to PDF
   */
  async exportMovementsPdf(filters?: MovementFilters): Promise<Blob> {
    const response = await Axios.get('/inventory/movements/export_pdf/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export stock levels to Excel
   */
  async exportStockExcel(filters?: StockFilters): Promise<Blob> {
    const response = await Axios.get('/inventory/stocks/export_excel/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export stock levels to PDF
   */
  async exportStockPdf(filters?: StockFilters): Promise<Blob> {
    const response = await Axios.get('/inventory/stocks/export_pdf/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  }
}
