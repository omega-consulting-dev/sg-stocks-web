import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SalesService, type Sale, type SaleCreateData } from '@/services/sales.service'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const currentSale = ref<Sale | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const draftSales = computed(() => 
    sales.value.filter(s => s.status === 'draft')
  )

  const confirmedSales = computed(() => 
    sales.value.filter(s => s.status === 'confirmed')
  )

  const completedSales = computed(() => 
    sales.value.filter(s => s.status === 'completed')
  )

  // Actions
  async function fetchSales(params?: {
    status?: string
    payment_status?: string
    customer?: number
    store?: number
    date_from?: string
    date_to?: string
  }) {
    loading.value = true
    error.value = null
    try {
      sales.value = await SalesService.getSales(params)
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des ventes'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchSale(id: number) {
    loading.value = true
    error.value = null
    try {
      currentSale.value = await SalesService.getSale(id)
      return currentSale.value
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createSale(data: SaleCreateData) {
    loading.value = true
    error.value = null
    try {
      const newSale = await SalesService.createSale(data)
      sales.value.unshift(newSale)
      currentSale.value = newSale
      return newSale
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function confirmSale(id: number) {
    loading.value = true
    error.value = null
    try {
      const result = await SalesService.confirmSale(id)
      
      // Update in list
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sales.value[index] = result.sale
      }
      
      // Update current if it's the same
      if (currentSale.value?.id === id) {
        currentSale.value = result.sale
      }
      
      return result
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Erreur lors de la confirmation de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function generateInvoice(saleId: number) {
    loading.value = true
    error.value = null
    try {
      const result = await SalesService.generateInvoice(saleId)
      
      // Refresh the sale to get the invoice relation
      await fetchSale(saleId)
      
      return result
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || 'Erreur lors de la génération de la facture'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function completeSale(id: number) {
    loading.value = true
    error.value = null
    try {
      const result = await SalesService.completeSale(id)
      
      // Update in list
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sales.value[index] = result.sale
      }
      
      // Update current if it's the same
      if (currentSale.value?.id === id) {
        currentSale.value = result.sale
      }
      
      return result
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Erreur lors de la complétion de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function cancelSale(id: number) {
    loading.value = true
    error.value = null
    try {
      const result = await SalesService.cancelSale(id)
      
      // Update in list
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sales.value[index] = result.sale
      }
      
      // Update current if it's the same
      if (currentSale.value?.id === id) {
        currentSale.value = result.sale
      }
      
      return result
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Erreur lors de l\'annulation de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateSale(id: number, data: Partial<SaleCreateData>) {
    loading.value = true
    error.value = null
    try {
      const updatedSale = await SalesService.updateSale(id, data)
      
      // Update in list
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sales.value[index] = updatedSale
      }
      
      // Update current if it's the same
      if (currentSale.value?.id === id) {
        currentSale.value = updatedSale
      }
      
      return updatedSale
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSale(id: number) {
    loading.value = true
    error.value = null
    try {
      await SalesService.deleteSale(id)
      
      // Remove from list
      sales.value = sales.value.filter(s => s.id !== id)
      
      // Clear current if it's the same
      if (currentSale.value?.id === id) {
        currentSale.value = null
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression de la vente'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    sales,
    currentSale,
    loading,
    error,
    
    // Computed
    draftSales,
    confirmedSales,
    completedSales,
    
    // Actions
    fetchSales,
    fetchSale,
    createSale,
    confirmSale,
    generateInvoice,
    completeSale,
    cancelSale,
    updateSale,
    deleteSale,
    clearError
  }
})
