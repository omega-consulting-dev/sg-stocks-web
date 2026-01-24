import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { decaissementsApi, type Decaissement, type DecaissementsFilters, type CreateDecaissementDto } from '@/services/api/decaissements.api'
import { encaissementsApi } from '@/services/api/encaissements.api'

export const useDecaissementsStore = defineStore('decaissements', () => {
  const decaissements = ref<Decaissement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const soldeCaisse = ref(0)

  const fetchDecaissements = async (filters: DecaissementsFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await decaissementsApi.getDecaissements(filters)
      decaissements.value = response.results
      totalCount.value = response.count
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors du chargement des décaissements'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDecaissement = async (data: CreateDecaissementDto) => {
    loading.value = true
    error.value = null
    try {
      await decaissementsApi.createDecaissement(data)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors de la création du décaissement'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDecaissement = async (id: number, data: CreateDecaissementDto) => {
    loading.value = true
    error.value = null
    try {
      await decaissementsApi.updateDecaissement(id, data)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors de la modification du décaissement'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDecaissement = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await decaissementsApi.deleteDecaissement(id)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors de la suppression du décaissement'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCaisseSolde = async (storeId?: number | string) => {
    try {
      const response = await encaissementsApi.getCaisseSolde(storeId)
      soldeCaisse.value = response.solde_actuel
    } catch (err: any) {
      console.error('Erreur lors du chargement du solde:', err)
    }
  }

  const exportToExcel = async (filters: DecaissementsFilters = {}) => {
    try {
      const blob = await decaissementsApi.exportToExcel(filters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Générer le nom du fichier
      let filename = 'decaissements'
      if (filters.start_date && filters.end_date) {
        filename += `_${filters.start_date}_au_${filters.end_date}`
      } else if (filters.start_date) {
        filename += `_depuis_${filters.start_date}`
      } else if (filters.end_date) {
        filename += `_jusquau_${filters.end_date}`
      }
      filename += '.xlsx'

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors de l\'export des décaissements'
      throw err
    }
  }

  const exportToPDF = async (filters: DecaissementsFilters = {}) => {
    try {
      const blob = await decaissementsApi.exportToPDF(filters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Générer le nom du fichier
      let filename = 'decaissements'
      if (filters.start_date && filters.end_date) {
        filename += `_${filters.start_date}_au_${filters.end_date}`
      } else if (filters.start_date) {
        filename += `_depuis_${filters.start_date}`
      } else if (filters.end_date) {
        filename += `_jusquau_${filters.end_date}`
      }
      filename += '.pdf'

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erreur lors de l\'export PDF des décaissements'
      throw err
    }
  }

  const totalMontant = computed(() => {
    return decaissements.value.reduce((sum, dec) => sum + dec.montant, 0)
  })

  return {
    decaissements,
    loading,
    error,
    totalCount,
    soldeCaisse,
    totalMontant,
    fetchDecaissements,
    createDecaissement,
    updateDecaissement,
    deleteDecaissement,
    fetchCaisseSolde,
    exportToExcel,
    exportToPDF,
  }
})
