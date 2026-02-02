import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { encaissementsApi, type Encaissement, type EncaissementsFilters, type CaisseSolde } from '@/services/api/encaissements.api'

export type { Encaissement }

export const useEncaissementsStore = defineStore('encaissements', () => {
  const encaissements = ref<Encaissement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const caisseSolde = ref<CaisseSolde | null>(null)

  // Computed properties
  const totalEncaisse = computed(() =>
    encaissements.value.reduce((sum, e) => sum + e.montant, 0)
  )

  const soldeCaisse = computed(() => {
    return caisseSolde.value?.solde_actuel || 0
  })

  // Actions
  async function fetchEncaissements(filters?: EncaissementsFilters) {
    loading.value = true
    error.value = null
    try {
      const response = await encaissementsApi.getEncaissements(filters)
      encaissements.value = response.results
      totalCount.value = response.count
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  async function fetchCaisseSolde(storeId?: number | string) {
    try {
      caisseSolde.value = await encaissementsApi.getCaisseSolde(storeId)
    } catch (e) {
    }
  }

  async function fetchStores() {
    try {
      return await encaissementsApi.getStores()
    } catch (e) {
      return []
    }
  }

  async function exportToExcel(filters?: EncaissementsFilters) {
    try {
      const blob = await encaissementsApi.exportToExcel(filters)

      // Créer un lien pour télécharger le fichier
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Générer le nom du fichier
      let filename = 'encaissements'
      if (filters?.start_date && filters?.end_date) {
        filename += `_${filters.start_date}_au_${filters.end_date}`
      } else if (filters?.start_date) {
        filename += `_depuis_${filters.start_date}`
      } else if (filters?.end_date) {
        filename += `_jusquau_${filters.end_date}`
      }
      filename += '.xlsx'

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de l\'export'
      throw e
    }
  }

  async function deleteEncaissement(id: string) {
    // Note: L'API de suppression n'est pas encore implémentée
    // Supprimer localement pour l'instant
    const index = encaissements.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      encaissements.value.splice(index, 1)
      totalCount.value--
    }
  }

  return {
    encaissements,
    totalEncaisse,
    soldeCaisse,
    caisseSolde,
    totalCount,
    loading,
    error,
    fetchEncaissements,
    fetchCaisseSolde,
    fetchStores,
    exportToExcel,
    deleteEncaissement
  }
})
