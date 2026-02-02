import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { inventoryApi } from '@/services/api/inventory.api'
import type {
  StockLevel,
  StockMovement,
  PhysicalInventory,
  PhysicalInventoryDetail,
  CreateStockAdjustmentData,
  CreatePhysicalInventoryData,
  UpdatePhysicalInventoryData,
  StockFilters,
  MovementFilters,
  InventoryFilters,
  StockStats
} from '@/services/api/inventory.api'

export const useInventoryStore = defineStore('inventory', () => {
  // State - Stock Levels
  const stockLevels = ref<StockLevel[]>([])
  const currentStock = ref<StockLevel | null>(null)

  // State - Movements
  const movements = ref<StockMovement[]>([])
  const currentMovement = ref<StockMovement | null>(null)

  // State - Physical Inventories
  const inventories = ref<PhysicalInventory[]>([])
  const currentInventory = ref<PhysicalInventoryDetail | null>(null)

  // State - Stats
  const stats = ref<StockStats>({
    total_products: 0,
    total_value: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_movements: 0
  })

  // State - UI
  const loading = ref(false)
  const error = ref<string | null>(null)

  // State - Pagination
  const stockTotalCount = ref(0)
  const stockCurrentPage = ref(1)
  const movementsTotalCount = ref(0)
  const movementsCurrentPage = ref(1)
  const inventoriesTotalCount = ref(0)
  const inventoriesCurrentPage = ref(1)

  // Computed
  const lowStockProducts = computed(() =>
    stockLevels.value.filter(stock =>
      stock.reorder_point && stock.quantity <= stock.reorder_point
    )
  )

  const outOfStockProducts = computed(() =>
    stockLevels.value.filter(stock => stock.quantity === 0)
  )

  // Actions - Stock Levels

  /**
   * Fetch stock levels with filters
   */
  const fetchStockLevels = async (filters?: StockFilters, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.getStockLevels(filters, page)
      stockLevels.value = response.results
      stockTotalCount.value = response.count
      stockCurrentPage.value = page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des stocks'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get stock for specific product in store
   */
  const fetchProductStock = async (productId: number, storeId: number) => {
    loading.value = true
    error.value = null

    try {
      currentStock.value = await inventoryApi.getProductStock(productId, storeId)
      return currentStock.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch stock statistics
   */
  const fetchStats = async (storeId?: number) => {
    try {
      stats.value = await inventoryApi.getStats(storeId)
    } catch (err: any) {
    }
  }

  // Actions - Stock Movements

  /**
   * Fetch stock movements with filters
   */
  const fetchMovements = async (filters?: MovementFilters, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.getMovements(filters, page)
      movements.value = response.results
      movementsTotalCount.value = response.count
      movementsCurrentPage.value = page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des mouvements'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create stock adjustment
   */
  const createAdjustment = async (data: CreateStockAdjustmentData) => {
    loading.value = true
    error.value = null

    try {
      const newMovement = await inventoryApi.createAdjustment(data)
      movements.value.unshift(newMovement)

      // Update stock level in list if present
      const stockIndex = stockLevels.value.findIndex(
        s => s.product === data.product && s.store === data.store
      )
      if (stockIndex !== -1) {
        // La quantité est déjà signée (positive pour in, négative pour out)
        stockLevels.value[stockIndex].quantity += data.quantity
      }

      return newMovement
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'ajustement'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Physical Inventories

  /**
   * Fetch physical inventories with filters
   */
  const fetchInventories = async (filters?: InventoryFilters, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.getInventories(filters, page)
      inventories.value = response.results
      inventoriesTotalCount.value = response.count
      inventoriesCurrentPage.value = page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des inventaires'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single inventory by ID
   */
  const fetchInventory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      currentInventory.value = await inventoryApi.getInventory(id)
      return currentInventory.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new physical inventory
   */
  const createInventory = async (data: CreatePhysicalInventoryData) => {
    loading.value = true
    error.value = null

    try {
      const newInventory = await inventoryApi.createInventory(data)
      inventories.value.unshift(newInventory)
      inventoriesTotalCount.value++
      return newInventory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update physical inventory (only if draft)
   */
  const updateInventory = async (id: number, data: UpdatePhysicalInventoryData) => {
    loading.value = true
    error.value = null

    try {
      const updatedInventory = await inventoryApi.updateInventory(id, data)

      const index = inventories.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        inventories.value[index] = updatedInventory
      }

      if (currentInventory.value?.id === id) {
        currentInventory.value = updatedInventory
      }

      return updatedInventory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la modification de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validate physical inventory
   */
  const validateInventory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const validatedInventory = await inventoryApi.validateInventory(id)

      const index = inventories.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        inventories.value[index] = validatedInventory
      }

      if (currentInventory.value?.id === id) {
        currentInventory.value = validatedInventory
      }

      return validatedInventory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la validation de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel physical inventory
   */
  const cancelInventory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const cancelledInventory = await inventoryApi.cancelInventory(id)

      const index = inventories.value.findIndex(inv => inv.id === id)
      if (index !== -1) {
        inventories.value[index] = cancelledInventory
      }

      if (currentInventory.value?.id === id) {
        currentInventory.value = cancelledInventory
      }

      return cancelledInventory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'annulation de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete physical inventory (only if draft)
   */
  const deleteInventory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await inventoryApi.deleteInventory(id)

      inventories.value = inventories.value.filter(inv => inv.id !== id)
      inventoriesTotalCount.value--

      if (currentInventory.value?.id === id) {
        currentInventory.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'inventaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear current inventory
   */
  const clearCurrentInventory = () => {
    currentInventory.value = null
  }

  return {
    // State - Stock Levels
    stockLevels,
    currentStock,
    stockTotalCount,
    stockCurrentPage,

    // State - Movements
    movements,
    currentMovement,
    movementsTotalCount,
    movementsCurrentPage,

    // State - Inventories
    inventories,
    currentInventory,
    inventoriesTotalCount,
    inventoriesCurrentPage,

    // State - Stats & UI
    stats,
    loading,
    error,

    // Computed
    lowStockProducts,
    outOfStockProducts,

    // Actions - Stock
    fetchStockLevels,
    fetchProductStock,
    fetchStats,

    // Actions - Movements
    fetchMovements,
    createAdjustment,

    // Actions - Inventories
    fetchInventories,
    fetchInventory,
    createInventory,
    updateInventory,
    validateInventory,
    cancelInventory,
    deleteInventory,
    clearCurrentInventory
  }
})
