/**
 * Types pour la gestion du tenant (société)
 */

export interface Tenant {
  id: number
  schema_name: string
  name: string
  email: string
  phone: string | null
  address: string | null
  plan: 'starter' | 'business' | 'enterprise' | 'custom'
  max_users: number
  max_stores: number
  max_products: number
  max_storage_mb: number
  feature_services: boolean
  feature_multi_store: boolean
  feature_loans: boolean
  feature_advanced_analytics: boolean
  feature_api_access: boolean
  is_active: boolean
  trial_end_date: string | null
  subscription_end_date: string | null
  monthly_price: number
  last_payment_date: string | null
  next_billing_date: string | null
  storage_used_mb: number
  total_users_count: number
  total_products_count: number
  currency: string
  tax_rate: string
  created_on: string
}

export interface TenantUpdateData {
  name?: string
  email?: string
  phone?: string | null
  address?: string | null
}
