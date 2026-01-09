import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { inventoryApi } from '@/services/api/inventory.api'
import type {
  StockMovement,
  CreateStockAdjustmentData,
  MovementFilters,
} from '@/services/api/inventory.api'

// Réexporter les types pour les composants (avec alias pour compatibilité)
export type Achat = StockMovement
export type CreateStockMovementDto = CreateStockAdjustmentData

// Type pour un bon regroupé
export interface BonEntree {
  receipt_number: string
  reference: string
  notes: string
  date: string
  store_name: string
  supplier_name?: string
  total_quantity: number
  total_amount: number
  products: StockMovement[]
  created_at: string
}

export const useAchatsStore = defineStore('achats', () => {
  // État
  const achats = ref<StockMovement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)

  // Computed
  const achatsCount = computed(() => achats.value.length)
  const totalQuantity = computed(() =>
    achats.value.reduce((sum, achat) => sum + Number(achat.quantity), 0)
  )
  const totalAmount = computed(() =>
    achats.value.reduce((sum, achat) => sum + Number(achat.invoice_amount || achat.total_value || 0), 0)
  )

  // Actions
  const fetchAchats = async (filters?: Omit<MovementFilters, 'movement_type'>, page: number = 1, page_size: number = 10) => {
    loading.value = true
    error.value = null
    try {
      // Filtrer uniquement les mouvements de type "in" (entrées en stock/achats)
      const response = await inventoryApi.getMovements(
        { ...filters, movement_type: 'in', page_size },
        page
      )
      achats.value = response.results
      totalCount.value = response.count
      currentPage.value = page
    } catch (e: any) {
      error.value = 'Erreur lors du chargement des entrées de stock'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }


  /**
   * Récupérer tous les numéros de pièces (receipt_number) des entrées de stock pour la génération de code
   */
  const fetchAllReferences = async (): Promise<string[]> => {
    try {
      // Récupérer tous les mouvements d'entrée sans limite de pagination
      const response = await inventoryApi.getMovements({
        movement_type: 'in',
        page_size: 1000 // Récupérer jusqu'à 1000 entrées
      })
      const receiptNumbers = response.results.map(a => a.receipt_number || '').filter(Boolean)
      console.log('Receipt numbers récupérés:', receiptNumbers)
      return receiptNumbers
    } catch (e) {
      console.error('Erreur lors de la récupération des numéros de pièces:', e)
      return achats.value.map(a => a.receipt_number || '').filter(Boolean)
    }
  }

  const addAchat = async (achat: Omit<CreateStockAdjustmentData, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      const newAchat = await inventoryApi.createAdjustment({
        ...achat,
        movement_type: 'in',
      })
      achats.value.unshift(newAchat)
      totalCount.value++
      return newAchat
    } catch (e: any) {
      error.value = "Erreur lors de l'ajout de l'entrée de stock"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAchat = async (id: number, updates: Partial<CreateStockAdjustmentData>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await inventoryApi.updateMovement(id, updates)
      // Mettre à jour dans la liste locale
      const index = achats.value.findIndex(a => a.id === id)
      if (index !== -1) {
        achats.value[index] = updated
      }
      return updated
    } catch (e: any) {
      error.value = e.response?.data?.detail || "Erreur lors de la modification de l'entrée"
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
      await inventoryApi.deleteMovement(id)
      // Retirer l'achat de la liste locale
      const index = achats.value.findIndex(a => a.id === id)
      if (index !== -1) {
        achats.value.splice(index, 1)
        totalCount.value--
      }
    } catch (e: any) {
      error.value = e.response?.data?.detail || "Erreur lors de la suppression de l'entrée"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getAchatById = (id: number) => {
    return achats.value.find((a) => a.id === id)
  }

  const getNextReceiptNumber = async (): Promise<string> => {
    try {
      return await inventoryApi.getNextReceiptNumber()
    } catch (e) {
      console.error('Erreur lors de la récupération du prochain numéro:', e)
      throw e
    }
  }

  const exportExcel = async (filters?: Omit<MovementFilters, 'movement_type'>) => {
    loading.value = true
    error.value = null
    try {
      const blob = await inventoryApi.exportMovementsExcel({
        ...filters,
        movement_type: 'in',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.download = `entrees_stock_${dateStr}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export Excel"
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
      const blob = await inventoryApi.exportMovementsPdf({
        ...filters,
        movement_type: 'in',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.download = `entrees_stock_${dateStr}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export PDF"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Regrouper les achats par numéro de bon
  const groupedByReceipt = computed((): BonEntree[] => {
    const grouped = new Map<string, StockMovement[]>()

    achats.value.forEach(achat => {
      const key = achat.receipt_number || `UNGROUPED-${achat.id}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(achat)
    })

    return Array.from(grouped.entries()).map(([receipt_number, products]) => {
      const first = products[0]
      return {
        receipt_number,
        reference: first.reference || '',
        notes: first.notes || '',
        date: first.date || first.created_at,
        store_name: first.store_name || '',
        supplier_name: first.supplier_name,
        total_quantity: products.reduce((sum, p) => sum + Number(p.quantity), 0),
        total_amount: products.reduce((sum, p) => sum + Number(p.invoice_amount || p.total_value || 0), 0),
        products,
        created_at: first.created_at
      }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  return {
    // État
    achats,
    loading,
    error,
    totalCount,
    currentPage,
    // Computed
    achatsCount,
    totalQuantity,
    totalAmount,
    groupedByReceipt,
    // Actions
    fetchAchats,
    fetchAllReferences,
    addAchat,
    updateAchat,
    deleteAchat,
    getAchatById,
    getNextReceiptNumber,
    exportExcel,
    exportPdf,
  }
})
