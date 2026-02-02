import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { productsApi } from '@/services/api/products.api'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters
} from '@/services/api/products.api'

// Réexporter le type pour les composants
export type { Product }

export const useProductsStore = defineStore('products', () => {
  // État
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const productsCount = computed(() => products.value.length)
  const lowStockProducts = computed(() =>
    products.value.filter((p) => p.is_low_stock || p.current_stock <= p.minimum_stock)
  )

  // Actions
  const fetchProducts = async (filters?: ProductFilters) => {
    loading.value = true
    error.value = null
    try {
      const data = await productsApi.fetchAll(filters)
      products.value = data
    } catch (e) {
      error.value = 'Erreur lors du chargement des produits'
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer tous les produits (actifs + inactifs) pour la génération de code
   * Retourne uniquement les références pour calculer le prochain code
   */
  const fetchAllReferences = async (): Promise<string[]> => {
    try {
      const allProducts = await productsApi.fetchAll(undefined, true)
      return allProducts.map(p => p.reference)
    } catch (e) {
      return products.value.map(p => p.reference)
    }
  }

  const addProduct = async (product: CreateProductDto) => {
    loading.value = true
    error.value = null
    try {
      const newProduct = await productsApi.create(product)
      products.value.push(newProduct)
      return newProduct
    } catch (e) {
      error.value = "Erreur lors de l'ajout du produit"
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, updates: UpdateProductDto) => {
    loading.value = true
    error.value = null
    try {
      const updatedProduct = await productsApi.update(id, updates)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return updatedProduct
    } catch (e) {
      error.value = 'Erreur lors de la modification du produit'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await productsApi.remove(id)
      // Retirer immédiatement le produit de la liste locale
      products.value = products.value.filter((p) => p.id !== id)
      return true
    } catch (e) {
      error.value = 'Erreur lors de la suppression du produit'
      throw e
    } finally {
      loading.value = false
    }
  }

  const getProductById = (id: number) => {
    return products.value.find((p) => p.id === id)
  }

  const exportExcel = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await productsApi.exportExcel()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `produits_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export Excel"
      throw e
    } finally {
      loading.value = false
    }
  }

  const exportPdf = async () => {
    loading.value = true
    error.value = null
    try {
      const blob = await productsApi.exportPdf()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `produits_${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      error.value = "Erreur lors de l'export PDF"
      throw e
    } finally {
      loading.value = false
    }
  }

  const importExcel = async (file: File) => {
    loading.value = true
    error.value = null
    try {
      const result = await productsApi.importExcel(file)
      // Recharger les produits après import
      await fetchProducts()
      return result
    } catch (e) {
      error.value = "Erreur lors de l'import Excel"
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    products,
    loading,
    error,
    // Computed
    productsCount,
    lowStockProducts,
    // Actions
    fetchProducts,
    fetchAllReferences,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    exportExcel,
    exportPdf,
    importExcel,
  }
})
