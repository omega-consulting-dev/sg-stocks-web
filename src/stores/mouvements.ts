import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { inventoryApi } from '@/services/api/inventory.api'
import type {
  StockMovement,
  MovementFilters,
} from '@/services/api/inventory.api'

// Type pour les mouvements (entrées + sorties)
export type Mouvement = StockMovement

export const useMouvementsStore = defineStore('mouvements', () => {
  // État
  const mouvements = ref<StockMovement[]>([])
  const allMouvements = ref<StockMovement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)

  // Computed
  const mouvementsCount = computed(() => mouvements.value.length)

  // Total des quantités entrées (calculé sur TOUS les mouvements, pas juste la page courante)
  const totalQuantityIn = computed(() =>
    allMouvements.value
      .filter(m => m.movement_type === 'in')
      .reduce((sum, m) => sum + Number(m.quantity), 0)
  )

  // Total des quantités sorties (inclut les sorties et les transferts)
  const totalQuantityOut = computed(() =>
    allMouvements.value
      .filter(m => m.movement_type === 'out' || m.movement_type === 'transfer')
      .reduce((sum, m) => sum + Number(m.quantity), 0)
  )

  // Total des valeurs entrées
  const totalValueIn = computed(() =>
    allMouvements.value
      .filter(m => m.movement_type === 'in')
      .reduce((sum, m) => sum + Number(m.invoice_amount || m.total_value || 0), 0)
  )

  // Total des valeurs sorties (inclut les sorties et les transferts)
  const totalValueOut = computed(() =>
    allMouvements.value
      .filter(m => m.movement_type === 'out' || m.movement_type === 'transfer')
      .reduce((sum, m) => sum + Number(m.invoice_amount || m.total_value || 0), 0)
  )

  // Nombre d'entrées (calculé sur TOUS les mouvements)
  const entreeCount = computed(() =>
    allMouvements.value.filter(m => m.movement_type === 'in').length
  )

  // Nombre de sorties (inclut les sorties et les transferts)
  const sortieCount = computed(() =>
    allMouvements.value.filter(m => m.movement_type === 'out' || m.movement_type === 'transfer').length
  )


  // Actions
  const fetchMouvements = async (filters?: MovementFilters, page: number = 1, page_size: number = 10) => {
    loading.value = true
    error.value = null
    try {
      // Récupérer tous les mouvements avec un page_size élevé pour avoir le stock final correct
      const response = await inventoryApi.getMovements({ ...filters, page_size: 10000 }, 1)

      allMouvements.value = response.results
      totalCount.value = response.count

      // Paginer côté client
      const startIndex = (page - 1) * page_size
      const endIndex = startIndex + page_size
      mouvements.value = allMouvements.value.slice(startIndex, endIndex)
      currentPage.value = page
    } catch (e: any) {
      error.value = 'Erreur lors du chargement des mouvements'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteMouvement = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await inventoryApi.deleteMovement(id)
      mouvements.value = mouvements.value.filter((m) => m.id !== id)
      totalCount.value--
    } catch (e: any) {
      error.value = 'Erreur lors de la suppression du mouvement'
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportExcel = async (filters?: MovementFilters) => {
    loading.value = true
    error.value = null
    try {
      const blob = await inventoryApi.exportMovementsExcel(filters)

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mouvements_stock_${new Date().toISOString().split('T')[0]}.xlsx`
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

  const exportPdf = async (filters?: MovementFilters) => {
    loading.value = true
    error.value = null
    try {
      const blob = await inventoryApi.exportMovementsPdf(filters)

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mouvements_stock_${new Date().toISOString().split('T')[0]}.pdf`
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
    // État
    mouvements,
    allMouvements,
    loading,
    error,
    totalCount,
    currentPage,
    // Computed
    mouvementsCount,
    totalQuantityIn,
    totalQuantityOut,
    totalValueIn,
    totalValueOut,
    entreeCount,
    sortieCount,
    // Actions
    fetchMouvements,
    deleteMouvement,
    exportExcel,
    exportPdf,
  }
})
