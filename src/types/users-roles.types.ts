// Types for Users, Roles and Permissions Management

export interface Permission {
  id: number
  name: string
  codename: string
  description: string
  module: string
  module_display: string
  action: string
  action_display: string
  roles?: number[]
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  access_scope: 'all' | 'assigned_stores' | 'own_store'
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
  can_manage_bank: boolean
  can_manage_mobile_money: boolean
  can_manage_loans: boolean
  can_manage_expenses: boolean
  can_view_analytics: boolean
  can_export_data: boolean
  permissions_count?: number
  users_count?: number
  created_at: string
  updated_at: string
}

export interface Store {
  id: number
  name: string
  code: string
  address?: string
  phone?: string
  is_active: boolean
}

export interface UserDetail {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  phone?: string
  alternative_phone?: string
  avatar?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string

  // Employee fields
  employee_id?: string
  role?: number
  role_name?: string
  secondary_roles?: number[]
  secondary_roles_list?: Role[]
  assigned_stores?: number[]
  assigned_stores_list?: Store[]
  hire_date?: string
  termination_date?: string

  // Emergency contact
  emergency_contact_name?: string
  emergency_contact_phone?: string

  // Status
  is_active: boolean
  is_staff: boolean
  notes?: string
  date_joined: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface UserList {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  phone?: string
  avatar?: string
  role_name?: string
  is_active: boolean
  date_joined: string
}

export interface UserCreate {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone?: string
  alternative_phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string

  // Employee fields
  employee_id?: string
  role: number // Required
  secondary_roles?: number[]
  assigned_stores?: number[]
  hire_date?: string

  // Emergency contact
  emergency_contact_name?: string
  emergency_contact_phone?: string

  notes?: string
}

export interface UserUpdate {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  alternative_phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string

  // Employee fields
  employee_id?: string
  role?: number
  secondary_roles?: number[]
  assigned_stores?: number[]
  hire_date?: string
  termination_date?: string

  // Emergency contact
  emergency_contact_name?: string
  emergency_contact_phone?: string

  is_active?: boolean
  notes?: string
}

export interface RoleCreate {
  name: string
  display_name: string
  description?: string
  access_scope?: 'all' | 'assigned_stores' | 'own_store'
  can_manage_users?: boolean
  can_manage_products?: boolean
  can_view_products?: boolean
  can_manage_categories?: boolean
  can_view_categories?: boolean
  can_manage_services?: boolean
  can_view_services?: boolean
  can_manage_inventory?: boolean
  can_view_inventory?: boolean
  can_manage_sales?: boolean
  can_manage_customers?: boolean
  can_manage_suppliers?: boolean
  can_manage_cashbox?: boolean
  can_manage_bank?: boolean
  can_manage_mobile_money?: boolean
  can_manage_loans?: boolean
  can_manage_expenses?: boolean
  can_view_analytics?: boolean
  can_export_data?: boolean
}

export type RoleUpdate = Partial<RoleCreate>

export interface ChangePasswordData {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface ResetPasswordData {
  new_password: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
