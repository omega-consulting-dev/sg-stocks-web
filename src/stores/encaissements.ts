import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Encaissement {
  id: number
  code: string
  date: string
  referenceFacture: string
  montant: number
  createdAt: string
  updatedAt: string
}

export const useEncaissementsStore = defineStore('encaissements', () => {
  const encaissements = ref<Encaissement[]>([
    {
      id: 1,
      code: '1',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 25000,
      createdAt: '2025-01-23T10:00:00',
      updatedAt: '2025-01-23T10:00:00'
    },
    {
      id: 2,
      code: '2',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 25000,
      createdAt: '2025-01-23T11:00:00',
      updatedAt: '2025-01-23T11:00:00'
    },
    {
      id: 3,
      code: '3',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 250000,
      createdAt: '2025-01-23T12:00:00',
      updatedAt: '2025-01-23T12:00:00'
    },
    {
      id: 4,
      code: '4',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 12000,
      createdAt: '2025-01-23T13:00:00',
      updatedAt: '2025-01-23T13:00:00'
    },
    {
      id: 5,
      code: '5',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 12000,
      createdAt: '2025-01-23T14:00:00',
      updatedAt: '2025-01-23T14:00:00'
    },
    {
      id: 6,
      code: '6',
      date: '2025-01-23',
      referenceFacture: 'RF2025001',
      montant: 1000,
      createdAt: '2025-01-23T15:00:00',
      updatedAt: '2025-01-23T15:00:00'
    }
  ])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const totalEncaisse = computed(() =>
    encaissements.value.reduce((sum, e) => sum + e.montant, 0)
  )

  const encaissementsFiltered = computed(() => {
    return (startDate?: string, endDate?: string) => {
      if (!startDate && !endDate) return encaissements.value

      return encaissements.value.filter((e) => {
        const encDate = new Date(e.date)
        if (startDate && encDate < new Date(startDate)) return false
        if (endDate && encDate > new Date(endDate)) return false
        return true
      })
    }
  })

  // Actions
  async function fetchEncaissements() {
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

  async function addEncaissement(encaissement: Omit<Encaissement, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newEncaissement: Encaissement = {
        ...encaissement,
        id: Math.max(...encaissements.value.map((e) => e.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      encaissements.value.push(newEncaissement)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateEncaissement(id: number, data: Partial<Encaissement>) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const index = encaissements.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        encaissements.value[index] = {
          ...encaissements.value[index],
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

  async function deleteEncaissement(id: number) {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const index = encaissements.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        encaissements.value.splice(index, 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    encaissements,
    totalEncaisse,
    encaissementsFiltered,
    loading,
    error,
    fetchEncaissements,
    addEncaissement,
    updateEncaissement,
    deleteEncaissement
  }
})
