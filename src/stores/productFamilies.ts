import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { productFamiliesApi } from '@/services/api/productFamilies.api'
import type {
  ProductFamily,
  CreateProductFamilyDto,
  UpdateProductFamilyDto
} from '@/services/api/productFamilies.api'

// Réexporter le type pour les composants
export type { ProductFamily }
export const useProductFamiliesStore = defineStore('productFamilies', () => {
  // État
  const families = ref<ProductFamily[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Données mock pour le développement
  // const mockFamilies: ProductFamily[] = [
  //   {
  //     id: 1,
  //     code: 'ELEC',
  //     libelle: 'Électronique',
  //     description: 'Produits électroniques et accessoires',
  //     createdAt: new Date('2024-01-15'),
  //     updatedAt: new Date('2024-01-15'),
  //   },
  //   {
  //     id: 2,
  //     code: 'ALIM',
  //     libelle: 'Alimentation',
  //     description: 'Produits alimentaires et boissons',
  //     createdAt: new Date('2024-01-20'),
  //     updatedAt: new Date('2024-02-10'),
  //   },
  //   {
  //     id: 3,
  //     code: 'VEST',
  //     libelle: 'Vêtements',
  //     description: 'Vêtements et accessoires de mode',
  //     createdAt: new Date('2024-02-01'),
  //     updatedAt: new Date('2024-02-01'),
  //   },
  //   {
  //     id: 4,
  //     code: 'MEUBL',
  //     libelle: 'Meubles',
  //     description: 'Mobilier pour la maison et le bureau',
  //     createdAt: new Date('2024-02-15'),
  //     updatedAt: new Date('2024-03-01'),
  //   },
  //   {
  //     id: 5,
  //     code: 'SPORT',
  //     libelle: 'Sport',
  //     description: 'Équipements sportifs et accessoires',
  //     createdAt: new Date('2024-03-01'),
  //     updatedAt: new Date('2024-03-01'),
  //   },
  // ]

  // Computed
  const familiesCount = computed(() => families.value.length)

  // Actions
  const fetchFamilies = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await productFamiliesApi.fetchAll()
      families.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des familles de produits'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addFamily = async (family: CreateProductFamilyDto) => {
    loading.value = true
    error.value = null
    try {
      const newFamily = await productFamiliesApi.create(family)
      families.value.push(newFamily)
      return newFamily
    } catch (e) {
      error.value = 'Erreur lors de l\'ajout de la famille'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateFamily = async (id: number, updates: UpdateProductFamilyDto) => {
    loading.value = true
    error.value = null
    try {
      const updatedFamily = await productFamiliesApi.update(id, updates)
      const index = families.value.findIndex(f => f.id === id)
      if (index !== -1) {
        families.value[index] = updatedFamily
      }
      return updatedFamily
    } catch (e) {
      error.value = 'Erreur lors de la modification de la famille'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteFamily = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await productFamiliesApi.remove(id)
      const index = families.value.findIndex(f => f.id === id)
      if (index !== -1) {
        families.value.splice(index, 1)
      }
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression de la famille'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getFamilyById = (id: number) => {
    return families.value.find(f => f.id === id)
  }

  const exportExcel = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await productFamiliesApi.exportExcel()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `familles_produits_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Erreur lors de l\'export Excel'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportPdf = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await productFamiliesApi.exportPdf()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `familles_produits_${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Erreur lors de l\'export PDF'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const importExcel = async (file: File) => {
    loading.value = true
    error.value = null
    try {
      const result = await productFamiliesApi.importExcel(file)
      // Recharger les familles après import
      await fetchFamilies()
      return result
    } catch (e) {
      error.value = 'Erreur lors de l\'import Excel'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    families,
    loading,
    error,
    // Computed
    familiesCount,
    // Actions
    fetchFamilies,
    addFamily,
    updateFamily,
    deleteFamily,
    getFamilyById,
    exportExcel,
    exportPdf,
    importExcel,
  }
})
