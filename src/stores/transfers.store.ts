import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transfersApi } from '@/services/api/transfers.api'
import type {
  StockTransfer,
  StockTransferDetail,
  CreateTransferData,
  UpdateTransferData,
  ReceiveTransferData,
  TransferFilters,
  TransferStatus
} from '@/services/api/transfers.api'

export const useTransfersStore = defineStore('transfers', () => {
  // State
  const transfers = ref<StockTransfer[]>([])
  const currentTransfer = ref<StockTransferDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)

  // Statistics
  const stats = ref({
    total: 0,
    draft: 0,
    validated: 0,
    received: 0,
    cancelled: 0
  })

  /**
   * Fetch all transfers with filters
   */
  const fetchTransfers = async (filters?: TransferFilters, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await transfersApi.getTransfers(filters, page)
      transfers.value = response.results
      totalCount.value = response.count
      currentPage.value = page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des transferts'
      console.error('Error fetching transfers:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single transfer by ID
   */
  const fetchTransfer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      currentTransfer.value = await transfersApi.getTransfer(id)
      return currentTransfer.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du transfert'
      console.error('Error fetching transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new transfer
   */
  const createTransfer = async (data: CreateTransferData) => {
    loading.value = true
    error.value = null

    try {
      const newTransfer = await transfersApi.createTransfer(data)

      // Recharger la liste complète pour avoir tous les champs (noms de magasins, etc.)
      // au lieu d'ajouter directement le transfert incomplet
      await fetchTransfers()

      return newTransfer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du transfert'
      console.error('Error creating transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update transfer (only if draft)
   */
  const updateTransfer = async (id: number, data: UpdateTransferData) => {
    loading.value = true
    error.value = null

    try {
      await transfersApi.updateTransfer(id, data)

      // Recharger la liste pour avoir les données complètes
      await fetchTransfers()

      // Si on visualise ce transfert, le recharger aussi
      if (currentTransfer.value?.id === id) {
        await fetchTransfer(id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du transfert'
      console.error('Error updating transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete transfer (only if draft)
   */
  const deleteTransfer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await transfersApi.deleteTransfer(id)
      transfers.value = transfers.value.filter(t => t.id !== id)
      totalCount.value--

      if (currentTransfer.value?.id === id) {
        currentTransfer.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du transfert'
      console.error('Error deleting transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validate transfer (draft → validated)
   */
  const validateTransfer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await transfersApi.validateTransfer(id)

      // Recharger la liste pour avoir les données complètes
      await fetchTransfers()

      // Si on visualise ce transfert, le recharger aussi
      if (currentTransfer.value?.id === id) {
        await fetchTransfer(id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la validation du transfert'
      console.error('Error validating transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Receive transfer (validated → received)
   */
  const receiveTransfer = async (id: number, data?: ReceiveTransferData) => {
    loading.value = true
    error.value = null

    try {
      await transfersApi.receiveTransfer(id, data)

      // Recharger la liste pour avoir les données complètes
      await fetchTransfers()

      // Si on visualise ce transfert, le recharger aussi
      if (currentTransfer.value?.id === id) {
        await fetchTransfer(id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la réception du transfert'
      console.error('Error receiving transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel transfer
   */
  const cancelTransfer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await transfersApi.cancelTransfer(id)

      // Recharger la liste pour avoir les données complètes
      await fetchTransfers()

      // Si on visualise ce transfert, le recharger aussi
      if (currentTransfer.value?.id === id) {
        await fetchTransfer(id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'annulation du transfert'
      console.error('Error cancelling transfer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch transfer statistics
   */
  const fetchStats = async () => {
    try {
      // Calculer les stats depuis les transferts chargés
      const draft = transfers.value.filter(t => t.status === 'draft').length
      const pending = transfers.value.filter(t => t.status === 'pending').length
      const in_transit = transfers.value.filter(t => t.status === 'in_transit').length
      const received = transfers.value.filter(t => t.status === 'received').length
      const cancelled = transfers.value.filter(t => t.status === 'cancelled').length

      stats.value = {
        total: transfers.value.length,
        draft,
        validated: pending + in_transit,
        received,
        cancelled
      }
    } catch (err) {
      console.error('Error calculating transfer stats:', err)
    }
  }

  /**
   * Clear current transfer
   */
  const clearCurrentTransfer = () => {
    currentTransfer.value = null
  }

  /**
   * Export transfers to Excel
   */
  const exportExcel = async (filters?: TransferFilters) => {
    loading.value = true
    error.value = null

    try {
      // Construire les params
      const params: any = {}
      if (filters?.status) params.status = filters.status
      if (filters?.source_store) params.source_store = filters.source_store
      if (filters?.destination_store) params.destination_store = filters.destination_store
      if (filters?.start_date) params.start_date = filters.start_date
      if (filters?.end_date) params.end_date = filters.end_date
      if (filters?.search) params.search = filters.search

      const response = await transfersApi.exportExcel(params)

      // Créer un blob et télécharger
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transferts_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'export Excel'
      console.error('Error exporting Excel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    transfers,
    currentTransfer,
    loading,
    error,
    totalCount,
    currentPage,
    stats,

    // Actions
    fetchTransfers,
    fetchTransfer,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    validateTransfer,
    receiveTransfer,
    cancelTransfer,
    fetchStats,
    clearCurrentTransfer,
    exportExcel
  }
})
