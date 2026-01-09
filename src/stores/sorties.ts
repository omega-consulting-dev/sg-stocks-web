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
  const currentPage = ref(1)

  // Computed
  const sortiesCount = computed(() => sorties.value.length)
  const totalQuantity = computed(() =>
    sorties.value.reduce((sum, sortie) => sum + Number(sortie.quantity), 0)
  )
  const totalAmount = computed(() =>
    sorties.value.reduce((sum, sortie) => sum + Number(sortie.invoice_amount || sortie.total_value || 0), 0)
  )

  // Actions
  const fetchSorties = async (filters?: Omit<MovementFilters, 'movement_type'>, page: number = 1, page_size: number = 10) => {
    loading.value = true
    error.value = null
    try {
      // Récupérer les sorties (type "out") et les transferts (type "transfer") en un seul appel
      // L'API backend accepte plusieurs movement_types via BaseInFilter (movement_type__in)
      console.log('[SORTIES] Chargement avec filters:', { ...filters, movement_type: 'out,transfer', page_size, page })
      console.log('[SORTIES] Date filters:', { date_from: filters?.date_from, date_to: filters?.date_to })

      const response = await inventoryApi.getMovements({
        ...filters,
        movement_type: 'out,transfer',
        page_size
      }, page)

      console.log('[SORTIES] Réponse reçue:', response)
      console.log('[SORTIES] Nombre de mouvements:', response.results.length)
      console.log('[SORTIES] Types de mouvements:', response.results.map(m => ({ type: m.movement_type, product: m.product_name, date: m.date })))

      sorties.value = response.results
      totalCount.value = response.count
      currentPage.value = page
    } catch (e: any) {
      console.error('[SORTIES] Erreur:', e)
      error.value = 'Erreur lors du chargement des sorties de stock'
      console.error(e)
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
      console.error(e)
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
      console.error(e)
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
      console.error(e)
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
    currentPage,
    sortiesCount,
    totalQuantity,
    totalAmount,
    fetchSorties,
    deleteSortie,
    exportExcel,
    exportPdf,
  }
})
