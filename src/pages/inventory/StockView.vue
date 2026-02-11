<template>
  <div class="container mx-auto py-6 px-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Niveaux de Stock</h1>
        <p class="text-sm text-gray-600 mt-1">Consultez les stocks par magasin et produit</p>
      </div>
      <Button @click="openAdjustmentDialog" class="gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajustement de stock
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ inventoryStore.stats.total_products }}</div>
          <p class="text-xs text-muted-foreground">Produits en stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold">{{ formatCurrency(inventoryStore.stats.total_value) }}</div>
          <p class="text-xs text-muted-foreground">Valeur totale</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold text-orange-600">{{ inventoryStore.stats.low_stock_count }}</div>
          <p class="text-xs text-muted-foreground">Stock faible</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="text-2xl font-bold text-red-600">{{ inventoryStore.stats.out_of_stock_count }}</div>
          <p class="text-xs text-muted-foreground">Rupture de stock</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardContent class="pt-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="store_filter">Magasin</Label>
            <Select v-model="filters.store">
              <SelectTrigger id="store_filter">
                <SelectValue placeholder="Tous les magasins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="undefined">Tous les magasins</SelectItem>
                <SelectItem
                  v-for="store in storesStore.stores"
                  :key="store.id"
                  :value="store.id"
                >
                  {{ store.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="search">Rechercher</Label>
            <Input
              id="search"
              v-model="filters.search"
              placeholder="Nom ou référence..."
              @keyup.enter="applyFilters"
            />
          </div>

          <div class="flex items-center pt-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="filters.low_stock"
                class="rounded"
                @change="applyFilters"
              />
              <span class="text-sm">Stock faible uniquement</span>
            </label>
          </div>

          <div class="flex items-end gap-2">
            <Button @click="applyFilters" class="flex-1">
              Filtrer
            </Button>
            <Button @click="resetFilters" variant="ghost">
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stock Table -->
    <Card>
      <CardContent class="pt-6">
        <div v-if="inventoryStore.loading" class="text-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>

        <div v-else-if="inventoryStore.error" class="text-center py-8 text-red-600">
          {{ inventoryStore.error }}
        </div>

        <div v-else-if="inventoryStore.stockLevels.length === 0" class="text-center py-8 text-gray-500">
          Aucun stock trouvé
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Produit</th>
                <th class="text-left py-3 px-4">Référence</th>
                <th class="text-left py-3 px-4">Magasin</th>
                <th class="text-right py-3 px-4">Quantité</th>
                <th class="text-right py-3 px-4">Réservée</th>
                <th class="text-right py-3 px-4">Disponible</th>
                <th class="text-right py-3 px-4">Seuil</th>
                <th class="text-center py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="stock in inventoryStore.stockLevels"
                :key="`${stock.product}-${stock.store}`"
                class="border-b hover:bg-gray-50"
              >
                <td class="py-3 px-4 font-medium">{{ stock.product_name }}</td>
                <td class="py-3 px-4 text-gray-600">{{ stock.product_reference }}</td>
                <td class="py-3 px-4">{{ stock.store_name }}</td>
                <td class="py-3 px-4 text-right font-medium">{{ stock.quantity }}</td>
                <td class="py-3 px-4 text-right text-gray-600">{{ stock.reserved_quantity || 0 }}</td>
                <td class="py-3 px-4 text-right font-medium">{{ stock.available_quantity || stock.quantity }}</td>
                <td class="py-3 px-4 text-right text-gray-600">{{ stock.reorder_point || '-' }}</td>
                <td class="py-3 px-4 text-center">
                  <span :class="getStockStatusClass(stock)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStockStatus(stock) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="inventoryStore.stockTotalCount > 20" class="flex justify-between items-center mt-4 pt-4 border-t">
          <div class="text-sm text-gray-600">
            {{ inventoryStore.stockLevels.length }} sur {{ inventoryStore.stockTotalCount }} produits
          </div>
          <div class="flex gap-2">
            <Button
              @click="previousPage"
              :disabled="inventoryStore.stockCurrentPage === 1"
              variant="outline"
              size="sm"
            >
              Précédent
            </Button>
            <Button
              @click="nextPage"
              :disabled="inventoryStore.stockCurrentPage * 20 >= inventoryStore.stockTotalCount"
              variant="outline"
              size="sm"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stock Adjustment Dialog -->
    <StockAdjustmentDialog
      :open="showAdjustmentDialog"
      @update:open="showAdjustmentDialog = $event"
      @saved="handleAdjustmentSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useInventoryStore } from '@/stores/inventory.store'
import { useStoresStore } from '@/stores/stores.store'
import StockAdjustmentDialog from '@/components/inventory/StockAdjustmentDialog.vue'
import type { StockLevel, StockFilters } from '@/services/api/inventory.api'

const inventoryStore = useInventoryStore()
const storesStore = useStoresStore()

const showAdjustmentDialog = ref(false)

const filters = ref<StockFilters>({
  store: undefined,
  search: '',
  low_stock: false
})

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchStockLevels(),
    inventoryStore.fetchStats(),
    storesStore.fetchStores()
  ])
})

const applyFilters = async () => {
  const filterData: StockFilters = {}
  if (filters.value.store) filterData.store = filters.value.store
  if (filters.value.search) filterData.search = filters.value.search
  if (filters.value.low_stock) filterData.low_stock = true

  await inventoryStore.fetchStockLevels(filterData)
}

const resetFilters = async () => {
  filters.value = {
    store: undefined,
    search: '',
    low_stock: false
  }
  await inventoryStore.fetchStockLevels()
}

const openAdjustmentDialog = () => {
  showAdjustmentDialog.value = true
}

const handleAdjustmentSaved = async () => {
  await Promise.all([
    inventoryStore.fetchStockLevels(filters.value),
    inventoryStore.fetchStats(filters.value.store)
  ])
}

const previousPage = async () => {
  if (inventoryStore.stockCurrentPage > 1) {
    await inventoryStore.fetchStockLevels(filters.value, inventoryStore.stockCurrentPage - 1)
  }
}

const nextPage = async () => {
  if (inventoryStore.stockCurrentPage * 20 < inventoryStore.stockTotalCount) {
    await inventoryStore.fetchStockLevels(filters.value, inventoryStore.stockCurrentPage + 1)
  }
}

const getStockStatus = (stock: StockLevel): string => {
  if (stock.quantity === 0) return 'Rupture'
  if (stock.reorder_point && stock.quantity <= stock.reorder_point) return 'Faible'
  return 'Normal'
}

const getStockStatusClass = (stock: StockLevel): string => {
  if (stock.quantity === 0) return 'bg-red-100 text-red-800'
  if (stock.reorder_point && stock.quantity <= stock.reorder_point) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value)
}
</script>
