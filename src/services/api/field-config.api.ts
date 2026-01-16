/**
 * Field Configuration API Service
 */

import Axios from '../axios.service'

export interface FieldConfiguration {
  id: number
  form_name: string
  form_name_display: string
  field_name: string
  field_label: string
  is_visible: boolean
  is_required: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface FieldConfigBulkUpdate {
  configurations: Array<{
    id: number
    is_visible?: boolean
    is_required?: boolean
    display_order?: number
  }>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const fieldConfigApi = {
  /**
   * Get all field configurations
   */
  async getAll(): Promise<FieldConfiguration[] | PaginatedResponse<FieldConfiguration>> {
    const response = await Axios.get('/core/field-configurations/', {
      params: { page_size: 1000 } // Get all configurations
    })
    return response.data
  },

  /**
   * Get field configurations by form name
   */
  async getByForm(formName: string): Promise<FieldConfiguration[]> {
    const response = await Axios.get('/core/field-configurations/by_form/', {
      params: { form_name: formName }
    })
    return response.data
  },

  /**
   * Initialize default configurations
   */
  async initializeDefaults(): Promise<{ message: string; total: number }> {
    const response = await Axios.post('/core/field-configurations/initialize_defaults/')
    return response.data
  },

  /**
   * Bulk update configurations
   */
  async bulkUpdate(data: FieldConfigBulkUpdate): Promise<{ message: string; errors: string[] | null }> {
    const response = await Axios.post('/core/field-configurations/bulk_update/', data)
    return response.data
  },

  /**
   * Update single configuration
   */
  async update(id: number, data: Partial<FieldConfiguration>): Promise<FieldConfiguration> {
    const response = await Axios.patch(`/core/field-configurations/${id}/`, data)
    return response.data
  }
}
