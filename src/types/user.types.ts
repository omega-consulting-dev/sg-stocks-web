/**
 * Types pour la gestion des utilisateurs
 * Basés sur les modèles Django de l'API
 */

// ========== Rôle ==========
export interface Role {
  id: number
  name: string
  display_name: string
  description: string
  access_scope: 'all' | 'assigned' | 'own'

  // Permissions flags
  can_manage_users: boolean
  can_manage_products: boolean
  can_view_products: boolean
  can_manage_categories: boolean
  can_view_categories: boolean
  can_manage_services: boolean
  can_view_services: boolean
  can_manage_inventory: boolean
  can_view_inventory: boolean
  can_manage_sales: boolean
  can_manage_customers: boolean
  can_manage_suppliers: boolean
  can_manage_cashbox: boolean
  can_manage_loans: boolean
  can_manage_expenses: boolean
  can_view_analytics: boolean
  can_export_data: boolean

  permissions_count?: number
  users_count?: number
  created_at: string
  updated_at: string
}

// ========== Permission ==========
export interface Permission {
  id: number
  name: string
  codename: string
  description: string
  module: string
  module_display: string
  action: string
  action_display: string
  roles: number[]
  created_at: string
  updated_at: string
}

// ========== Utilisateur ==========
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string

  // Employee information
  employee_id?: string
  hire_date?: string
  termination_date?: string

  // Role and permissions
  role?: Role
  role_name?: string
  secondary_roles?: Role[]
  display_name?: string

  // Store assignments
  assigned_stores?: number[]
  assigned_stores_details?: any[]

  // Additional contact
  alternative_phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string

  // Status
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean

  // Notes
  notes?: string

  // Timestamps
  date_joined: string
  last_login?: string
  created_at?: string
  updated_at?: string
}

// ========== User Create Data ==========
export interface UserCreateData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  employee_id?: string
  role?: number
  secondary_roles?: number[]
  assigned_stores?: number[]
  hire_date?: string
  alternative_phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
}

// ========== User Update Data ==========
export interface UserUpdateData {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  employee_id?: string
  role?: number
  secondary_roles?: number[]
  assigned_stores?: number[]
  hire_date?: string
  termination_date?: string
  alternative_phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_active?: boolean
  notes?: string
}

// ========== User Stats ==========
export interface UserStats {
  total_sales?: number
  total_amount?: number
  total_orders?: number
  active_sessions?: number
  last_activity?: string
}

// ========== User Activity ==========
export interface UserActivity {
  id: number
  user: number
  action: string
  description: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// ========== User Session ==========
export interface UserSession {
  id: number
  user: number
  session_key: string
  ip_address?: string
  user_agent?: string
  is_active: boolean
  last_activity: string
  created_at: string
}

// ========== Filtres de recherche ==========
export interface UserFilters {
  search?: string
  role?: string
  is_active?: boolean
  ordering?: string
  page?: number
  page_size?: number
}
