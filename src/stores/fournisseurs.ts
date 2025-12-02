import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Fournisseur {
  id: number
  name: string
  phone: string
  email: string
  location: string
  legal_form: string
  created_at: string
  updated_at: string
}

export interface CompteFournisseur {
  id: number
  fournisseur_id: number
  fournisseur_name: string
  montant_facture: number
  date_facture: string
  montant_encaissement: number
  date_encaissement: string
  created_at: string
}

export interface Operation {
  id: number
  compte_id: number
  intitule: string
  montant: number
  date_reglement: string
  piece_jointe: string | null
  created_at: string
}

export const useFournisseursStore = defineStore('fournisseurs', () => {
  // État - Fournisseurs
  const fournisseurs = ref<Fournisseur[]>([
    {
      id: 1,
      name: 'Nkadon Landry',
      phone: '+237 699 99 99 99',
      email: 'nkadon@gmail.com',
      location: 'Douala Akwa',
      legal_form: 'SARL',
      created_at: '2025-01-15T10:00:00',
      updated_at: '2025-01-15T10:00:00',
    },
    {
      id: 2,
      name: 'Tech Solutions SA',
      phone: '+237 677 88 77 66',
      email: 'contact@techsolutions.cm',
      location: 'Yaoundé Bastos',
      legal_form: 'SA',
      created_at: '2025-01-10T09:00:00',
      updated_at: '2025-01-10T09:00:00',
    },
    {
      id: 3,
      name: 'Import Export SARL',
      phone: '+237 655 44 33 22',
      email: 'info@importexport.cm',
      location: 'Douala Bonanjo',
      legal_form: 'SARL',
      created_at: '2025-01-05T14:30:00',
      updated_at: '2025-01-05T14:30:00',
    },
  ])

  // État - Comptes Fournisseurs
  const comptes = ref<CompteFournisseur[]>([
    {
      id: 1,
      fournisseur_id: 1,
      fournisseur_name: 'Nkadon Landry',
      montant_facture: 250000,
      date_facture: '2025-01-20',
      montant_encaissement: 150000,
      date_encaissement: '2025-01-25',
      created_at: '2025-01-20T10:00:00',
    },
    {
      id: 2,
      fournisseur_id: 2,
      fournisseur_name: 'Tech Solutions SA',
      montant_facture: 500000,
      date_facture: '2025-01-18',
      montant_encaissement: 500000,
      date_encaissement: '2025-01-22',
      created_at: '2025-01-18T11:00:00',
    },
    {
      id: 3,
      fournisseur_id: 3,
      fournisseur_name: 'Import Export SARL',
      montant_facture: 750000,
      date_facture: '2025-01-15',
      montant_encaissement: 400000,
      date_encaissement: '2025-01-28',
      created_at: '2025-01-15T09:00:00',
    },
  ])

  // État - Opérations
  const operations = ref<Operation[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const fournisseursCount = computed(() => fournisseurs.value.length)
  const comptesCount = computed(() => comptes.value.length)

  // Actions - Fournisseurs
  const fetchFournisseurs = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Les données sont déjà en mémoire
    } catch (e) {
      error.value = 'Erreur lors du chargement des fournisseurs'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addFournisseur = async (fournisseur: Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newFournisseur: Fournisseur = {
        ...fournisseur,
        id: Math.max(...fournisseurs.value.map((f) => f.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      fournisseurs.value.push(newFournisseur)
      return newFournisseur
    } catch (e) {
      error.value = "Erreur lors de l'ajout du fournisseur"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateFournisseur = async (id: number, updates: Partial<Fournisseur>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const index = fournisseurs.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        fournisseurs.value[index] = {
          ...fournisseurs.value[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        return fournisseurs.value[index]
      }
      throw new Error('Fournisseur non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la modification du fournisseur'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteFournisseur = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      fournisseurs.value = fournisseurs.value.filter((f) => f.id !== id)
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression du fournisseur'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Comptes Fournisseurs
  const fetchComptes = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (e) {
      error.value = 'Erreur lors du chargement des comptes'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addCompte = async (compte: Omit<CompteFournisseur, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newCompte: CompteFournisseur = {
        ...compte,
        id: Math.max(...comptes.value.map((c) => c.id), 0) + 1,
        created_at: new Date().toISOString(),
      }
      comptes.value.push(newCompte)
      return newCompte
    } catch (e) {
      error.value = "Erreur lors de l'ajout du compte"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteCompte = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      comptes.value = comptes.value.filter((c) => c.id !== id)
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression du compte'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Opérations
  const addOperation = async (operation: Omit<Operation, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newOperation: Operation = {
        ...operation,
        id: Math.max(...operations.value.map((o) => o.id), 0) + 1,
        created_at: new Date().toISOString(),
      }
      operations.value.push(newOperation)

      // Mettre à jour le montant_encaissement du compte correspondant
      const compteIndex = comptes.value.findIndex(c => c.id === operation.compte_id)
      if (compteIndex !== -1) {
        comptes.value[compteIndex].montant_encaissement += operation.montant
        comptes.value[compteIndex].date_encaissement = operation.date_reglement
      }

      return newOperation
    } catch (e) {
      error.value = "Erreur lors de l'ajout de l'opération"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    fournisseurs,
    comptes,
    operations,
    loading,
    error,
    // Computed
    fournisseursCount,
    comptesCount,
    // Actions Fournisseurs
    fetchFournisseurs,
    addFournisseur,
    updateFournisseur,
    deleteFournisseur,
    // Actions Comptes
    fetchComptes,
    addCompte,
    deleteCompte,
    // Actions Opérations
    addOperation,
  }
})
