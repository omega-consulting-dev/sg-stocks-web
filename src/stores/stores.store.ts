/**
 * Store Pinia pour la gestion des magasins/points de vente
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storesApi } from '@/services/api/stores.api'
import type { Store, StoreCreateData, StoreUpdateData, StoreFilters } from '@/types/store.types'

export const useStoresStore = defineStore('stores', () => {
  // État
  const stores = ref<Store[]>([])
  const currentStore = ref<Store | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalItems = ref(0)
  
  // Filtres
  const filters = ref<StoreFilters>({})
  
  // Computed
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
  
  const activeStores = computed(() => 
    stores.value.filter(store => store.is_active)
  )
  
  const storesByType = computed(() => ({
    retail: stores.value.filter(s => s.store_type === 'retail' || s.store_type === 'both'),
    warehouse: stores.value.filter(s => s.store_type === 'warehouse' || s.store_type === 'both')
  }))

  // Actions
  async function fetchStores(page = 1) {
    loading.value = true
    error.value = null
    
    try {
      const response = await storesApi.getStores({
        ...filters.value,
        page,
        page_size: pageSize.value
      })
      
      stores.value = response.results
      totalItems.value = response.count
      currentPage.value = page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des magasins'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStore(id: number) {
    loading.value = true
    error.value = null
    
    try {
      currentStore.value = await storesApi.getStore(id)
      return currentStore.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du magasin'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createStore(data: StoreCreateData) {
    loading.value = true
    error.value = null
    
    try {
      const newStore = await storesApi.createStore(data)
      stores.value.unshift(newStore)
      totalItems.value++
      return newStore
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du magasin'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStore(id: number, data: StoreUpdateData) {
    loading.value = true
    error.value = null
    
    try {
      const updatedStore = await storesApi.updateStore(id, data)
      const index = stores.value.findIndex(s => s.id === id)
      if (index !== -1) {
        stores.value[index] = updatedStore
      }
      if (currentStore.value?.id === id) {
        currentStore.value = updatedStore
      }
      return updatedStore
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du magasin'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStore(id: number) {
    loading.value = true
    error.value = null
    
    try {
      await storesApi.deleteStore(id)
      stores.value = stores.value.filter(s => s.id !== id)
      totalItems.value--
      if (currentStore.value?.id === id) {
        currentStore.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du magasin'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleStoreStatus(id: number) {
    const store = stores.value.find(s => s.id === id)
    if (!store) return
    
    try {
      const updated = await storesApi.toggleStoreStatus(id, !store.is_active)
      const index = stores.value.findIndex(s => s.id === id)
      if (index !== -1) {
        stores.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de statut'
      throw err
    }
  }

  function setFilters(newFilters: StoreFilters) {
    filters.value = { ...filters.value, ...newFilters }
    fetchStores(1)
  }

  function resetFilters() {
    filters.value = {}
    fetchStores(1)
  }

  function setPageSize(size: number) {
    pageSize.value = size
    fetchStores(1)
  }

  return {
    // État
    stores,
    currentStore,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filters,
    
    // Computed
    activeStores,
    storesByType,
    
    // Actions
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    deleteStore,
    toggleStoreStatus,
    setFilters,
    resetFilters,
    setPageSize
  }
})
