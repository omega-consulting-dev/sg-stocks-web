import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Client {
  id: number
  name: string
  phone: string
  email: string
  location: string
  legal_form: string
  created_at: string
  updated_at: string
}

export interface CompteClient {
  id: number
  client_id: number
  client_name: string
  montant_facture: number
  date_facture: string
  montant_encaissement: number
  date_encaissement: string
  created_at: string
}

export interface OperationClient {
  id: number
  compte_id: number
  intitule: string
  montant: number
  date_reglement: string
  piece_jointe: string | null
  created_at: string
}

export const useClientsStore = defineStore('clients', () => {
  // État - Clients
  const clients = ref<Client[]>([
    {
      id: 1,
      name: 'Dilane Kamdem',
      phone: '+237 652 26 35 17',
      email: 'dilane@gmail.com',
      location: 'Akwa rue pau',
      legal_form: 'Particulier',
      created_at: '2025-01-15T10:00:00',
      updated_at: '2025-01-15T10:00:00',
    },
    {
      id: 2,
      name: 'Entreprise ABC SA',
      phone: '+237 677 88 77 66',
      email: 'contact@abc-sa.cm',
      location: 'Yaoundé Centre',
      legal_form: 'SA',
      created_at: '2025-01-10T09:00:00',
      updated_at: '2025-01-10T09:00:00',
    },
    {
      id: 3,
      name: 'Boutique Mode SARL',
      phone: '+237 655 44 33 22',
      email: 'info@boutiquemode.cm',
      location: 'Douala Bonanjo',
      legal_form: 'SARL',
      created_at: '2025-01-05T14:30:00',
      updated_at: '2025-01-05T14:30:00',
    },
    {
      id: 4,
      name: 'Jean Paul Mbarga',
      phone: '+237 699 11 22 33',
      email: 'jpmbarga@yahoo.fr',
      location: 'Bafoussam Centre',
      legal_form: 'Particulier',
      created_at: '2025-01-08T11:00:00',
      updated_at: '2025-01-08T11:00:00',
    },
  ])

  // État - Comptes Clients
  const comptes = ref<CompteClient[]>([
    {
      id: 1,
      client_id: 1,
      client_name: 'Dilane Kamdem',
      montant_facture: 250000,
      date_facture: '2025-01-20',
      montant_encaissement: 150000,
      date_encaissement: '2025-01-25',
      created_at: '2025-01-20T10:00:00',
    },
    {
      id: 2,
      client_id: 2,
      client_name: 'Entreprise ABC SA',
      montant_facture: 500000,
      date_facture: '2025-01-18',
      montant_encaissement: 500000,
      date_encaissement: '2025-01-22',
      created_at: '2025-01-18T11:00:00',
    },
    {
      id: 3,
      client_id: 3,
      client_name: 'Boutique Mode SARL',
      montant_facture: 750000,
      date_facture: '2025-01-15',
      montant_encaissement: 400000,
      date_encaissement: '2025-01-28',
      created_at: '2025-01-15T09:00:00',
    },
    {
      id: 4,
      client_id: 1,
      client_name: 'Dilane Kamdem',
      montant_facture: 125000,
      date_facture: '2025-01-22',
      montant_encaissement: 0,
      date_encaissement: '',
      created_at: '2025-01-22T14:00:00',
    },
  ])

  // État - Opérations
  const operations = ref<OperationClient[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const clientsCount = computed(() => clients.value.length)
  const comptesCount = computed(() => comptes.value.length)

  // Actions - Clients
  const fetchClients = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (e) {
      error.value = 'Erreur lors du chargement des clients'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newClient: Client = {
        ...client,
        id: Math.max(...clients.value.map((c) => c.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      clients.value.push(newClient)
      return newClient
    } catch (e) {
      error.value = "Erreur lors de l'ajout du client"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (id: number, updates: Partial<Client>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const index = clients.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        clients.value[index] = {
          ...clients.value[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        return clients.value[index]
      }
      throw new Error('Client non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la modification du client'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      clients.value = clients.value.filter((c) => c.id !== id)
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression du client'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Comptes Clients
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

  const addCompte = async (compte: Omit<CompteClient, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newCompte: CompteClient = {
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
  const addOperation = async (operation: Omit<OperationClient, 'id' | 'created_at'>) => {
    loading.value = true
    error.value = null
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newOperation: OperationClient = {
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
    clients,
    comptes,
    operations,
    loading,
    error,
    // Computed
    clientsCount,
    comptesCount,
    // Actions Clients
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    // Actions Comptes
    fetchComptes,
    addCompte,
    deleteCompte,
    // Actions Opérations
    addOperation,
  }
})
