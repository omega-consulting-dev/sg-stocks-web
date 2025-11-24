import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Achat {
  id: number
  intitule: string
  dateAchat: Date
  montantFacture: number
  nbreProduits: number
  fournisseur: string
  createdAt: Date
  updatedAt: Date
}

export const useAchatsStore = defineStore('achats', () => {
  // État
  const achats = ref<Achat[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Données mock pour le développement
  const mockAchats: Achat[] = [
    {
      id: 1,
      intitule: 'Achat bidon',
      dateAchat: new Date('2025-01-20'),
      montantFacture: 25000,
      nbreProduits: 5,
      fournisseur: 'nova plastique Sarl',
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      id: 2,
      intitule: 'Achat etiquette',
      dateAchat: new Date('2025-01-20'),
      montantFacture: 23000,
      nbreProduits: 23,
      fournisseur: 'graphic design',
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      id: 3,
      intitule: 'Achat matiere',
      dateAchat: new Date('2025-01-20'),
      montantFacture: 15000,
      nbreProduits: 6,
      fournisseur: 'zone sarl',
      createdAt: new Date('2025-01-20'),
      updatedAt: new Date('2025-01-20'),
    },
    {
      id: 4,
      intitule: 'Achat fournitures',
      dateAchat: new Date('2025-01-18'),
      montantFacture: 18500,
      nbreProduits: 12,
      fournisseur: 'nova plastique Sarl',
      createdAt: new Date('2025-01-18'),
      updatedAt: new Date('2025-01-18'),
    },
    {
      id: 5,
      intitule: 'Achat packaging',
      dateAchat: new Date('2025-01-15'),
      montantFacture: 32000,
      nbreProduits: 8,
      fournisseur: 'graphic design',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
    },
  ]

  // Computed
  const achatsCount = computed(() => achats.value.length)
  const totalMontant = computed(() =>
    achats.value.reduce((sum, achat) => sum + achat.montantFacture, 0)
  )

  // Actions
  const fetchAchats = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 500))
      achats.value = mockAchats
    } catch (e) {
      error.value = 'Erreur lors du chargement des achats'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addAchat = async (achat: Omit<Achat, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newAchat: Achat = {
        ...achat,
        id: Math.max(...achats.value.map((a) => a.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      achats.value.push(newAchat)
      return newAchat
    } catch (e) {
      error.value = "Erreur lors de l'ajout de l'achat"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateAchat = async (
    id: number,
    updates: Partial<Omit<Achat, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = achats.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        achats.value[index] = {
          ...achats.value[index],
          ...updates,
          updatedAt: new Date(),
        }
        return achats.value[index]
      }
      throw new Error('Achat non trouvé')
    } catch (e) {
      error.value = "Erreur lors de la modification de l'achat"
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
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = achats.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        achats.value.splice(index, 1)
        return true
      }
      throw new Error('Achat non trouvé')
    } catch (e) {
      error.value = "Erreur lors de la suppression de l'achat"
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
    totalMontant,
    // Actions
    fetchAchats,
    addAchat,
    updateAchat,
    deleteAchat,
    getAchatById,
  }
})
