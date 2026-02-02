/**
 * Field Configuration Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fieldConfigApi, type FieldConfiguration } from '@/services/api/field-config.api'

export const useFieldConfigStore = defineStore('fieldConfig', () => {
  const configurations = ref<FieldConfiguration[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all configurations
   */
  const fetchConfigurations = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fieldConfigApi.getAll()
      // Handle paginated response from DRF
      configurations.value = Array.isArray(response) ? response : (response.results || [])
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des configurations'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch configurations by form name
   */
  const fetchByForm = async (formName: string) => {
    loading.value = true
    error.value = null
    try {
      const configs = await fieldConfigApi.getByForm(formName)
      return configs
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des configurations'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize default configurations
   */
  const initializeDefaults = async (force: boolean = false) => {
    loading.value = true
    error.value = null
    try {
      const result = await fieldConfigApi.initializeDefaults(force)
      await fetchConfigurations()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'initialisation'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk update configurations
   */
  const bulkUpdate = async (updates: Array<{ id: number; is_visible?: boolean; is_required?: boolean; display_order?: number }>) => {
    loading.value = true
    error.value = null
    try {
      const result = await fieldConfigApi.bulkUpdate({ configurations: updates })
      // DON'T fetch here - let the caller decide when to refresh
      // await fetchConfigurations()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update single configuration
   */
  const updateConfiguration = async (id: number, data: Partial<FieldConfiguration>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await fieldConfigApi.update(id, data)
      const index = configurations.value.findIndex(c => c.id === id)
      if (index !== -1) {
        configurations.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get configurations grouped by form
   */
  const getConfigsByForm = () => {
    const grouped: Record<string, FieldConfiguration[]> = {}
    const configArray = Array.isArray(configurations.value) ? configurations.value : []
    configArray.forEach(config => {
      if (!grouped[config.form_name]) {
        grouped[config.form_name] = []
      }
      grouped[config.form_name].push(config)
    })
    return grouped
  }

  return {
    configurations,
    loading,
    error,
    fetchConfigurations,
    fetchByForm,
    initializeDefaults,
    bulkUpdate,
    updateConfiguration,
    getConfigsByForm
  }
})
