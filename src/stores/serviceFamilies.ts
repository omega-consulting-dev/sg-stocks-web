import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  serviceFamiliesApi,
  type ServiceFamily,
  type CreateServiceFamilyDto,
  type UpdateServiceFamilyDto,
} from '@/services/api/serviceFamilies.api'

// Ré-exporter les types pour les consommateurs du store
export type { ServiceFamily, CreateServiceFamilyDto, UpdateServiceFamilyDto }

export const useServiceFamiliesStore = defineStore('serviceFamilies', () => {
  // État
  const families = ref<ServiceFamily[]>([])
  const currentFamily = ref<ServiceFamily | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const familiesCount = computed(() => families.value.length)
  const activeFamilies = computed(() => families.value.filter((f) => f.is_active))
  const totalServicesCount = computed(() =>
    families.value.reduce((sum, f) => sum + f.services_count, 0)
  )

  // Actions
  const fetchFamilies = async () => {
    loading.value = true
    error.value = null
    try {
      families.value = await serviceFamiliesApi.fetchAll()
    } catch (e) {
      error.value = 'Erreur lors du chargement des familles de services'
      console.error('fetchFamilies error:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchFamilyById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      currentFamily.value = await serviceFamiliesApi.fetchById(id)
      return currentFamily.value
    } catch (e) {
      error.value = 'Erreur lors du chargement de la famille'
      console.error('fetchFamilyById error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const addFamily = async (family: CreateServiceFamilyDto) => {
    loading.value = true
    error.value = null
    try {
      const newFamily = await serviceFamiliesApi.create(family)
      families.value.push(newFamily)
      return newFamily
    } catch (e) {
      error.value = "Erreur lors de l'ajout de la famille"
      console.error('addFamily error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateFamily = async (id: number, updates: UpdateServiceFamilyDto) => {
    loading.value = true
    error.value = null
    try {
      const updatedFamily = await serviceFamiliesApi.update(id, updates)
      const index = families.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        families.value[index] = updatedFamily
      }
      return updatedFamily
    } catch (e) {
      error.value = 'Erreur lors de la modification de la famille'
      console.error('updateFamily error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteFamily = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await serviceFamiliesApi.remove(id)
      const index = families.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        families.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression de la famille'
      console.error('deleteFamily error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getFamilyById = (id: number) => {
    return families.value.find((f) => f.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // État
    families,
    currentFamily,
    loading,
    error,
    // Computed
    familiesCount,
    activeFamilies,
    totalServicesCount,
    // Actions
    fetchFamilies,
    fetchFamilyById,
    addFamily,
    updateFamily,
    deleteFamily,
    getFamilyById,
    clearError,
  }
})
