/**
 * Store Pinia pour la gestion du tenant (société)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tenantApi } from '@/services/api/tenant.api'
import type { Tenant, TenantUpdateData } from '@/types/tenant.types'

export const useTenantStore = defineStore('tenant', () => {
  // État
  const currentTenant = ref<Tenant | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchCurrentTenant() {
    loading.value = true
    error.value = null
    
    try {
      currentTenant.value = await tenantApi.getCurrentTenant()
      return currentTenant.value
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des informations'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTenant(data: TenantUpdateData) {
    loading.value = true
    error.value = null
    
    try {
      currentTenant.value = await tenantApi.updateTenant(data)
      return currentTenant.value
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    currentTenant,
    loading,
    error,
    
    // Actions
    fetchCurrentTenant,
    updateTenant
  }
})
