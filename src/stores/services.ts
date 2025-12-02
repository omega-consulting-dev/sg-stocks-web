import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { servicesApi } from '@/services/api/services.api'
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
} from '@/services/api/services.api'

// Réexporter les types pour les composants
export type { Service, CreateServiceDto }

export const useServicesStore = defineStore('services', () => {
  // État
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const servicesCount = computed(() => services.value.length)

  // Actions
  const fetchServices = async (filters?: ServiceFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await servicesApi.fetchAll(filters)
      services.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des services'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer tous les services (actifs + inactifs) pour la génération de code
   * Retourne uniquement les références pour calculer le prochain code
   */
  const fetchAllReferences = async (): Promise<string[]> => {
    try {
      const allServices = await servicesApi.fetchAll(undefined, true)
      return allServices.map(s => s.reference)
    } catch (e) {
      console.error('Erreur lors de la récupération des références:', e)
      return services.value.map(s => s.reference)
    }
  }

  const addService = async (service: CreateServiceDto) => {
    loading.value = true
    error.value = null
    try {
      const newService = await servicesApi.create(service)
      // Convertir ServiceDetail en Service pour la liste
      services.value.push({
        id: newService.id,
        reference: newService.reference,
        name: newService.name,
        category: newService.category,
        category_name: newService.category_name,
        unit_price: newService.unit_price,
        estimated_duration: newService.estimated_duration,
        assigned_staff_count: newService.assigned_staff_count,
        is_active: newService.is_active,
        created_at: newService.created_at,
      })
      return newService
    } catch (e) {
      error.value = "Erreur lors de l'ajout du service"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateService = async (id: number, updates: UpdateServiceDto) => {
    loading.value = true
    error.value = null
    try {
      const updatedService = await servicesApi.update(id, updates)
      const index = services.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        services.value[index] = {
          id: updatedService.id,
          reference: updatedService.reference,
          name: updatedService.name,
          category: updatedService.category,
          category_name: updatedService.category_name,
          unit_price: updatedService.unit_price,
          estimated_duration: updatedService.estimated_duration,
          assigned_staff_count: updatedService.assigned_staff_count,
          is_active: updatedService.is_active,
          created_at: updatedService.created_at,
        }
      }
      return updatedService
    } catch (e) {
      error.value = 'Erreur lors de la modification du service'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteService = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await servicesApi.remove(id)
      // Retirer immédiatement le service de la liste locale
      services.value = services.value.filter((s) => s.id !== id)
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression du service'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getServiceById = (id: number) => {
    return services.value.find((s) => s.id === id)
  }

  const exportExcel = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await servicesApi.exportExcel()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `services_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export Excel"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportPdf = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await servicesApi.exportPdf()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `services_${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export PDF"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const importExcel = async (file: File) => {
    loading.value = true
    error.value = null
    try {
      const result = await servicesApi.importExcel(file)
      // Recharger les services après import
      await fetchServices()
      return result
    } catch (e) {
      error.value = "Erreur lors de l'import Excel"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    services,
    loading,
    error,
    // Computed
    servicesCount,
    // Actions
    fetchServices,
    fetchAllReferences,
    addService,
    updateService,
    deleteService,
    getServiceById,
    exportExcel,
    exportPdf,
    importExcel,
  }
})
