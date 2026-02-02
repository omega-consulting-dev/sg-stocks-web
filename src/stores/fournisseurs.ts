import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { suppliersApi } from '@/services/api/suppliers.api'
import type {
  Supplier,
  SupplierDetail,
  SupplierFilters,
  ImportResult,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierDebt,
  CreateSupplierPaymentDto,
  SupplierPayment
} from '@/services/api/suppliers.api'

// Réexporter les types pour les composants
export type {
  Supplier,
  SupplierDetail,
  SupplierFilters,
  ImportResult,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierDebt,
  CreateSupplierPaymentDto,
  SupplierPayment
}

export const useFournisseursStore = defineStore('fournisseurs', () => {
  // État - Fournisseurs
  const fournisseurs = ref<Supplier[]>([])
  const selectedFournisseur = ref<SupplierDetail | null>(null)
  const debts = ref<SupplierDebt[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const fournisseursCount = computed(() => fournisseurs.value.length)
  const activeFournisseurs = computed(() =>
    fournisseurs.value.filter(f => f.is_active)
  )
  const totalDebts = computed(() =>
    debts.value.reduce((sum, d) => sum + d.balance, 0)
  )

  // Actions - Fournisseurs
  /**
   * Récupérer tous les fournisseurs
   */
  const fetchFournisseurs = async (filters?: SupplierFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await suppliersApi.fetchAll(filters)
      fournisseurs.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des fournisseurs'
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer un fournisseur par son ID
   */
  const fetchFournisseurById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const data = await suppliersApi.fetchById(id)
      selectedFournisseur.value = data
      return data
    } catch (e) {
      error.value = 'Erreur lors du chargement du fournisseur'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtenir un fournisseur depuis le cache local
   */
  const getFournisseurById = (id: number) => {
    return fournisseurs.value.find(f => f.id === id)
  }

  /**
   * Export Excel
   */
  const exportExcel = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await suppliersApi.exportExcel()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fournisseurs_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export Excel"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Export PDF
   */
  const exportPdf = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await suppliersApi.exportPdf()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fournisseurs_${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export PDF"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Import Excel
   */
  const importExcel = async (file: File): Promise<ImportResult> => {
    loading.value = true
    error.value = null
    try {
      const result = await suppliersApi.importExcel(file)
      // Recharger les fournisseurs après import
      await fetchFournisseurs()
      return result
    } catch (e) {
      error.value = "Erreur lors de l'import Excel"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Télécharger le template d'import
   */
  const downloadTemplate = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await suppliersApi.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'modele_import_fournisseurs.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Erreur lors du téléchargement du template'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== CRUD Actions ==========

  /**
   * Créer un nouveau fournisseur
   */
  const createFournisseur = async (data: CreateSupplierDto): Promise<SupplierDetail> => {
    loading.value = true
    error.value = null
    try {
      const newFournisseur = await suppliersApi.create(data)
      // Recharger la liste pour inclure le nouveau fournisseur
      await fetchFournisseurs()
      return newFournisseur
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, string[]> } }
      // Extraire les messages d'erreur du backend
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n')
        error.value = messages || 'Erreur lors de la création du fournisseur'
      } else {
        error.value = 'Erreur lors de la création du fournisseur'
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour un fournisseur
   */
  const updateFournisseur = async (id: number, data: UpdateSupplierDto): Promise<SupplierDetail> => {
    loading.value = true
    error.value = null
    try {
      const updatedFournisseur = await suppliersApi.update(id, data)
      // Mettre à jour le fournisseur dans la liste locale
      const index = fournisseurs.value.findIndex(f => f.id === id)
      if (index !== -1) {
        // Mettre à jour avec les données de base
        fournisseurs.value[index] = {
          ...fournisseurs.value[index],
          ...updatedFournisseur
        }
      }
      // Mettre à jour selectedFournisseur si c'est le même
      if (selectedFournisseur.value?.id === id) {
        selectedFournisseur.value = updatedFournisseur
      }
      return updatedFournisseur
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, string[]> } }
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n')
        error.value = messages || 'Erreur lors de la mise à jour du fournisseur'
      } else {
        error.value = 'Erreur lors de la mise à jour du fournisseur'
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer un fournisseur (soft delete)
   */
  const deleteFournisseur = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await suppliersApi.delete(id)
      // Retirer de la liste locale
      fournisseurs.value = fournisseurs.value.filter(f => f.id !== id)
      // Réinitialiser selectedFournisseur si c'est celui qu'on supprime
      if (selectedFournisseur.value?.id === id) {
        selectedFournisseur.value = null
      }
    } catch (e) {
      error.value = 'Erreur lors de la suppression du fournisseur'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Activer un fournisseur
   */
  const activateFournisseur = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await suppliersApi.activate(id)
      // Mettre à jour le statut dans la liste locale
      const fournisseur = fournisseurs.value.find(f => f.id === id)
      if (fournisseur) {
        fournisseur.is_active = true
      }
      if (selectedFournisseur.value?.id === id) {
        selectedFournisseur.value.is_active = true
      }
    } catch (e) {
      error.value = "Erreur lors de l'activation du fournisseur"
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Désactiver un fournisseur
   */
  const deactivateFournisseur = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await suppliersApi.deactivate(id)
      // Mettre à jour le statut dans la liste locale
      const fournisseur = fournisseurs.value.find(f => f.id === id)
      if (fournisseur) {
        fournisseur.is_active = false
      }
      if (selectedFournisseur.value?.id === id) {
        selectedFournisseur.value.is_active = false
      }
    } catch (e) {
      error.value = 'Erreur lors de la désactivation du fournisseur'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ========== Dettes ==========

  /**
   * Récupérer les fournisseurs avec dettes
   */
  const fetchDebts = async (): Promise<SupplierDebt[]> => {
    loading.value = true
    error.value = null
    try {
      const data = await suppliersApi.fetchDebts()
      debts.value = data
      return data
    } catch (e) {
      error.value = 'Erreur lors du chargement des dettes fournisseurs'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un paiement fournisseur
   */
  const createPayment = async (data: CreateSupplierPaymentDto): Promise<SupplierPayment> => {
    loading.value = true
    error.value = null
    try {
      const payment = await suppliersApi.createPayment(data)
      // Rafraîchir les dettes après le paiement
      await fetchDebts()
      return payment
    } catch (e) {
      error.value = 'Erreur lors de la création du paiement'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer l'historique des paiements d'un fournisseur
   */
  const fetchSupplierPayments = async (supplierId: number): Promise<SupplierPayment[]> => {
    loading.value = true
    error.value = null
    try {
      const payments = await suppliersApi.fetchSupplierPayments(supplierId)
      return payments
    } catch (e) {
      error.value = 'Erreur lors du chargement de l\'historique des paiements'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialiser le store
   */
  const reset = () => {
    fournisseurs.value = []
    selectedFournisseur.value = null
    debts.value = []
    loading.value = false
    error.value = null
  }

  return {
    // État
    fournisseurs,
    selectedFournisseur,
    debts,
    loading,
    error,
    // Computed
    fournisseursCount,
    activeFournisseurs,
    totalDebts,
    // Actions - Lecture
    fetchFournisseurs,
    fetchFournisseurById,
    getFournisseurById,
    // Actions - CRUD
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    activateFournisseur,
    deactivateFournisseur,
    // Actions - Dettes
    fetchDebts,
    createPayment,
    fetchSupplierPayments,
    // Actions - Export/Import
    exportExcel,
    exportPdf,
    importExcel,
    downloadTemplate,
    // Actions - Utilitaires
    reset
  }
})
