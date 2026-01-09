import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { inventoryApi, type StockLevel, type StockFilters } from '@/services/api/inventory.api'
import { encaissementsApi } from '@/services/api/encaissements.api'
import { productsApi, type Product } from '@/services/api/products.api'

interface Store {
  id: number
  name: string
  code: string
  store_type?: string
}

export const useInventaireStore = defineStore('inventaire', () => {
  // State
  const stocks = ref<StockLevel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalCount = ref(0)
  const stores = ref<Store[]>([])
  const products = ref<Product[]>([])

  // Computed
  const totalQuantity = computed(() =>
    stocks.value.reduce((sum, stock) => sum + Number(stock.quantity), 0)
  )

  const totalValue = computed(() =>
    stocks.value.reduce((sum, stock) => {
      const price = typeof stock.product === 'object' && stock.product.price ? stock.product.price : 0
      return sum + (Number(stock.quantity) * price)
    }, 0)
  )

  const lowStockCount = computed(() =>
    stocks.value.filter(stock => {
      const minStock = stock.minimum_stock || 0
      return stock.quantity < minStock
    }).length
  )

  const outOfStockCount = computed(() =>
    stocks.value.filter(stock => stock.quantity === 0).length
  )

  // Actions
  const fetchStocks = async (filters?: StockFilters, page: number = 1) => {
    loading.value = true
    error.value = null
    console.log('fetchStocks appelé avec filters:', filters, 'page:', page)
    try {
      const response = await inventoryApi.getStockLevels(filters, page)
      console.log('Réponse API stocks:', response)
      stocks.value = response.results
      currentPage.value = page
      totalCount.value = response.count
      totalPages.value = Math.ceil(response.count / 20)
    } catch (err) {
      console.error('Erreur lors de la récupération des stocks:', err)
      error.value = 'Erreur lors de la récupération des stocks'
    } finally {
      loading.value = false
    }
  }

  const fetchStores = async () => {
    try {
      const response = await encaissementsApi.getStores()
      stores.value = response as Store[]
    } catch (err) {
      console.error('Erreur lors de la récupération des magasins:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productsApi.fetchAll({}, false)
      products.value = response
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err)
    }
  }

  const exportExcel = async (filters?: StockFilters) => {
    loading.value = true
    error.value = null
    try {
      const blob = await inventoryApi.exportStockExcel(filters)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inventaire_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur lors de l\'export Excel:', err)
      error.value = 'Erreur lors de l\'export Excel'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stocks,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    stores,
    products,
    totalQuantity,
    totalValue,
    lowStockCount,
    outOfStockCount,
    fetchStocks,
    fetchStores,
    fetchProducts,
    exportExcel
  }
})
