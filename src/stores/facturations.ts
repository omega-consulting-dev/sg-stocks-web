import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Facturation {
  id: number
  intitule: string
  dateVente: string
  client: string
  quantite: number
  montantFacture: number
  type: 'produit' | 'service'
  createdAt: string
  updatedAt: string
}

export const useFacturationsStore = defineStore('facturations', () => {
  const facturations = ref<Facturation[]>([
    {
      id: 1,
      intitule: 'Achat bidon',
      dateVente: '2025-01-20',
      client: 'nova plastique Sarl',
      quantite: 5,
      montantFacture: 25000,
      type: 'produit',
      createdAt: '2025-01-20T10:00:00',
      updatedAt: '2025-01-20T10:00:00'
    },
    {
      id: 2,
      intitule: 'Achat etiquette',
      dateVente: '2025-01-20',
      client: 'graphic design',
      quantite: 23,
      montantFacture: 23000,
      type: 'produit',
      createdAt: '2025-01-20T11:00:00',
      updatedAt: '2025-01-20T11:00:00'
    },
    {
      id: 3,
      intitule: 'Achat matiere',
      dateVente: '2025-01-20',
      client: 'zone sarl',
      quantite: 6,
      montantFacture: 15000,
      type: 'produit',
      createdAt: '2025-01-20T12:00:00',
      updatedAt: '2025-01-20T12:00:00'
    },
    {
      id: 4,
      intitule: 'Service de design',
      dateVente: '2025-01-21',
      client: 'creative studio',
      quantite: 2,
      montantFacture: 45000,
      type: 'service',
      createdAt: '2025-01-21T09:00:00',
      updatedAt: '2025-01-21T09:00:00'
    },
    {
      id: 5,
      intitule: 'Consultation technique',
      dateVente: '2025-01-21',
      client: 'tech solutions',
      quantite: 8,
      montantFacture: 32000,
      type: 'service',
      createdAt: '2025-01-21T14:00:00',
      updatedAt: '2025-01-21T14:00:00'
    },
    {
      id: 6,
      intitule: 'Formation staff',
      dateVente: '2025-01-22',
      client: 'business corp',
      quantite: 12,
      montantFacture: 28000,
      type: 'service',
      createdAt: '2025-01-22T10:00:00',
      updatedAt: '2025-01-22T10:00:00'
    }
  ])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const facturationsProduits = computed(() =>
    facturations.value.filter((f) => f.type === 'produit')
  )

  const facturationsServices = computed(() =>
    facturations.value.filter((f) => f.type === 'service')
  )

  const totalMontantProduits = computed(() =>
    facturationsProduits.value.reduce((sum, f) => sum + f.montantFacture, 0)
  )

  const totalMontantServices = computed(() =>
    facturationsServices.value.reduce((sum, f) => sum + f.montantFacture, 0)
  )

  const totalMontant = computed(() => totalMontantProduits.value + totalMontantServices.value)

  // Actions
  async function fetchFacturations() {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Data already loaded in ref
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  async function addFacturation(facturation: Omit<Facturation, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newFacturation: Facturation = {
        ...facturation,
        id: Math.max(...facturations.value.map((f) => f.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      facturations.value.push(newFacturation)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateFacturation(id: number, data: Partial<Facturation>) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const index = facturations.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        facturations.value[index] = {
          ...facturations.value[index],
          ...data,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteFacturation(id: number) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const index = facturations.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        facturations.value.splice(index, 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    facturations,
    facturationsProduits,
    facturationsServices,
    totalMontantProduits,
    totalMontantServices,
    totalMontant,
    loading,
    error,
    fetchFacturations,
    addFacturation,
    updateFacturation,
    deleteFacturation
  }
})
