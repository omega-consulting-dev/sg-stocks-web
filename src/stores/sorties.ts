import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { inventoryApi } from '@/services/api/inventory.api'
import type {
  StockMovement,
  MovementFilters,
} from '@/services/api/inventory.api'

// Réexporter les types pour les composants
export type Sortie = StockMovement

export const useSortiesStore = defineStore('sorties', () => {
  // État
  const sorties = ref<StockMovement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const totalQuantity = ref(0) // Quantité totale globale (tous les enregistrements)
  const totalAmount = ref(0) // Montant total global (tous les enregistrements)
  const currentPage = ref(1)

  // Computed
  const sortiesCount = computed(() => sorties.value.length)

  // Actions
  const fetchSorties = async (filters?: Omit<MovementFilters, 'movement_type'>, page: number = 1, page_size: number = 10) => {
    loading.value = true
    error.value = null
    try {
      // Récupérer les sorties (type "out") et les transferts (type "transfer") en un seul appel
      // L'API backend accepte plusieurs movement_types via BaseInFilter (movement_type__in)
      const response = await inventoryApi.getMovements({
        ...filters,
        movement_type: 'out,transfer',
        page_size
      }, page)

      sorties.value = response.results
      totalCount.value = response.count
      currentPage.value = page

      // Récupérer toutes les données pour calculer les statistiques globales
      // uniquement si c'est la première page ou si les filtres changent
      if (page === 1 || totalQuantity.value === 0) {
        try {
          // Faire un appel pour obtenir toutes les données (sans pagination)
          const statsResponse = await inventoryApi.getMovements({
            ...filters,
            movement_type: 'out,transfer',
            page_size: 10000 // Grande limite pour tout récupérer
          }, 1)

          // Calculer les totaux globaux
          totalQuantity.value = statsResponse.results.reduce((sum, sortie) => sum + Number(sortie.quantity), 0)
          totalAmount.value = statsResponse.results.reduce((sum, sortie) => sum + Number(sortie.invoice_amount || sortie.total_value || 0), 0)
        } catch (statsError) {
          // Utiliser les valeurs de la page courante si le calcul échoue
          totalQuantity.value = response.results.reduce((sum, sortie) => sum + Number(sortie.quantity), 0)
          totalAmount.value = response.results.reduce((sum, sortie) => sum + Number(sortie.invoice_amount || sortie.total_value || 0), 0)
        }
      }
    } catch (e: any) {
      error.value = 'Erreur lors du chargement des sorties de stock'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteSortie = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await inventoryApi.deleteMovement(id)
      sorties.value = sorties.value.filter((s) => s.id !== id)
      totalCount.value--
    } catch (e: any) {
      error.value = 'Erreur lors de la suppression de la sortie'
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportExcel = async (filters?: Omit<MovementFilters, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      // Pour l'export, on combine les sorties et les transferts
      // L'API backend supporte plusieurs movement_types via BaseInFilter
      const blob = await inventoryApi.exportMovementsExcel({ ...filters, movement_type: 'out,transfer' })

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sorties_stock_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      error.value = 'Erreur lors de l\'export Excel'
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportPdf = async (filters?: Omit<MovementFilters, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      // Pour l'export, on combine les sorties et les transferts
      // L'API backend supporte plusieurs movement_types via BaseInFilter
      const blob = await inventoryApi.exportMovementsPdf({ ...filters, movement_type: 'out,transfer' })

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sorties_stock_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      error.value = 'Erreur lors de l\'export PDF'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    sorties,
    loading,
    error,
    totalCount,
    totalQuantity,
    totalAmount,
    currentPage,
    sortiesCount,
    fetchSorties,
    deleteSortie,
    exportExcel,
    exportPdf,
  }
})
