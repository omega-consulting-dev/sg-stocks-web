import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { storesApi } from '@/services/api/stores.api'
import type { Store, StoreFilters } from '@/services/api/stores.api'

// Réexporter le type pour les composants
export type { Store }

export const useStoresStore = defineStore('stores', () => {
  // État
  const stores = ref<Store[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const storesCount = computed(() => stores.value.length)
  const activeStores = computed(() => stores.value.filter(s => s.is_active))

  // Actions
  const fetchStores = async (filters?: StoreFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await storesApi.fetchAll(filters)
      stores.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des magasins'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const getStoreById = (id: number) => {
    return stores.value.find((s) => s.id === id)
  }

  return {
    // État
    stores,
    loading,
    error,
    // Computed
    storesCount,
    activeStores,
    // Actions
    fetchStores,
    getStoreById,
  }
})
