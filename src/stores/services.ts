import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Service {
  id: number
  dateOperation: Date
  intitule: string
  client: string
  quantite: number
  montantFacture: number
  familleId: number
  familleLibelle: string
  createdAt: Date
  updatedAt: Date
}

export const useServicesStore = defineStore('services', () => {
  // État
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Données mock correspondant au design Figma
  const mockServices: Service[] = [
    {
      id: 1,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Conception de site web',
      client: 'RD design',
      quantite: 20,
      montantFacture: 255000,
      familleId: 1,
      familleLibelle: 'Développement Web',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
    {
      id: 2,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Gestion de page facebook',
      client: 'Negoce cameroun',
      quantite: 25,
      montantFacture: 25000,
      familleId: 2,
      familleLibelle: 'Marketing Digital',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
    {
      id: 3,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Campagne Publicitaire',
      client: 'Negoce cameroun',
      quantite: 358,
      montantFacture: 105000,
      familleId: 2,
      familleLibelle: 'Marketing Digital',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
    {
      id: 4,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Campagne Publicitaire',
      client: 'WE GO',
      quantite: 26,
      montantFacture: 255000,
      familleId: 2,
      familleLibelle: 'Marketing Digital',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
    {
      id: 5,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Creaction de spot publicitaire',
      client: 'Agri bio future',
      quantite: 235,
      montantFacture: 125000,
      familleId: 3,
      familleLibelle: 'Production Vidéo',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
    {
      id: 6,
      dateOperation: new Date('2025-04-26'),
      intitule: 'Creaction de spot publicitaire',
      client: 'Agri bio future',
      quantite: 12,
      montantFacture: 125000,
      familleId: 3,
      familleLibelle: 'Production Vidéo',
      createdAt: new Date('2025-04-26'),
      updatedAt: new Date('2025-04-26'),
    },
  ]

  // Computed
  const servicesCount = computed(() => services.value.length)

  // Actions
  const fetchServices = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 500))
      services.value = mockServices
    } catch (e) {
      error.value = 'Erreur lors du chargement des services'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addService = async (
    service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newService: Service = {
        ...service,
        id: Math.max(...services.value.map((s) => s.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      services.value.push(newService)
      return newService
    } catch (e) {
      error.value = "Erreur lors de l'ajout du service"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateService = async (
    id: number,
    updates: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = services.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        services.value[index] = {
          ...services.value[index],
          ...updates,
          updatedAt: new Date(),
        }
        return services.value[index]
      }
      throw new Error('Service non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la modification du service'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteService = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = services.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        services.value.splice(index, 1)
        return true
      }
      throw new Error('Service non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la suppression du service'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getServiceById = (id: number) => {
    return services.value.find((s) => s.id === id)
  }

  return {
    // État
    services,
    loading,
    error,
    // Computed
    servicesCount,
    // Actions
    fetchServices,
    addService,
    updateService,
    deleteService,
    getServiceById,
  }
})
