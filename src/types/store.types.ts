/**
 * Types pour la gestion des magasins/points de vente
 */

export type StoreType = 'retail' | 'warehouse' | 'both'

export interface Store {
  id: number
  name: string
  code: string
  address: string
  city: string
  phone: string
  email: string
  manager: number | null
  manager_name?: string
  store_type: StoreType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreCreateData {
  name: string
  code: string
  address: string
  city: string
  phone?: string
  email?: string
  manager?: number | null
  store_type: StoreType
  is_active?: boolean
}

export interface StoreUpdateData extends Partial<StoreCreateData> {}

export interface StoreFilters {
  search?: string
  store_type?: StoreType
  is_active?: boolean
  manager?: number
  city?: string
}

export interface StoreStats {
  total_stores: number
  active_stores: number
  retail_stores: number
  warehouses: number
}
