import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { stockMovementsApi } from '@/services/api/stockMovements.api'
import type {
  StockMovement,
  CreateStockMovementDto,
  UpdateStockMovementDto,
  StockMovementFilters,
} from '@/services/api/stockMovements.api'

// Réexporter les types pour les composants (avec alias pour compatibilité)
export type { StockMovement, CreateStockMovementDto }
export type Achat = StockMovement // Alias pour compatibilité

export const useAchatsStore = defineStore('achats', () => {
  // État
  const achats = ref<StockMovement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const achatsCount = computed(() => achats.value.length)
  const totalQuantity = computed(() =>
    achats.value.reduce((sum, achat) => sum + achat.quantity, 0)
  )

  // Actions
  const fetchAchats = async (filters?: Omit<StockMovementFilters, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      const data = await stockMovementsApi.fetchEntries(filters)
      achats.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des entrées de stock'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer toutes les références des entrées de stock pour la génération de code
   * Retourne uniquement les références pour calculer le prochain code
   */
  const fetchAllReferences = async (): Promise<string[]> => {
    try {
      return await stockMovementsApi.fetchAllEntryReferences()
    } catch (e) {
      console.error('Erreur lors de la récupération des références:', e)
      return achats.value.map(a => a.reference)
    }
  }

  const addAchat = async (achat: Omit<CreateStockMovementDto, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      const newAchat = await stockMovementsApi.createEntry(achat)
      achats.value.unshift(newAchat)
      return newAchat
    } catch (e) {
      error.value = "Erreur lors de l'ajout de l'entrée de stock"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAchat = async (id: number, updates: UpdateStockMovementDto) => {
    loading.value = true
    error.value = null
    try {
      const updatedAchat = await stockMovementsApi.update(id, updates)
      const index = achats.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        achats.value[index] = updatedAchat
      }
      return updatedAchat
    } catch (e) {
      error.value = "Erreur lors de la modification de l'entrée"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteAchat = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await stockMovementsApi.remove(id)
      achats.value = achats.value.filter((a) => a.id !== id)
      return true
    } catch (e) {
      error.value = "Erreur lors de la suppression de l'entrée"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getAchatById = (id: number) => {
    return achats.value.find((a) => a.id === id)
  }

  return {
    // État
    achats,
    loading,
    error,
    // Computed
    achatsCount,
    totalQuantity,
    // Actions
    fetchAchats,
    fetchAllReferences,
    addAchat,
    updateAchat,
    deleteAchat,
    getAchatById,
  }
})
