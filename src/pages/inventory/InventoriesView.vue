<template>
  <div class="container mx-auto py-6 px-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Inventaires Physiques</h1>
        <p class="text-sm text-gray-600 mt-1">Gérez les comptages d'inventaire</p>
      </div>
      <Button @click="openCreateDialog" class="gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvel inventaire
      </Button>
    </div>

    <!-- Filters -->
    <Card class="mb-6">
      <CardContent class="pt-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="store_filter">Magasin</Label>
            <SelectRoot v-model="filters.store">
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
            </SelectRoot>
          </div>

          <div>
            <Label for="status_filter">Statut</Label>
            <SelectRoot v-model="filters.status">
              <SelectTrigger id="status_filter">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="undefined">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="validated">Validé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>

          <div>
            <Label for="search">Rechercher</Label>
            <Input
              id="search"
              v-model="filters.search"
              placeholder="Référence..."
              @keyup.enter="applyFilters"
            />
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

    <!-- Inventories Table -->
    <Card>
      <CardContent class="pt-6">
        <div v-if="inventoryStore.loading" class="text-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>

        <div v-else-if="inventoryStore.error" class="text-center py-8 text-red-600">
          {{ inventoryStore.error }}
        </div>

        <div v-else-if="inventoryStore.inventories.length === 0" class="text-center py-8 text-gray-500">
          Aucun inventaire trouvé
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">Référence</th>
                <th class="text-left py-3 px-4">Magasin</th>
                <th class="text-left py-3 px-4">Date</th>
                <th class="text-left py-3 px-4">Statut</th>
                <th class="text-left py-3 px-4">Créé par</th>
                <th class="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="inventory in inventoryStore.inventories"
                :key="inventory.id"
                class="border-b hover:bg-gray-50 cursor-pointer"
                @click="viewInventory(inventory.id)"
              >
                <td class="py-3 px-4 font-medium">{{ inventory.reference }}</td>
                <td class="py-3 px-4">{{ inventory.store_name }}</td>
                <td class="py-3 px-4">{{ formatDate(inventory.inventory_date) }}</td>
                <td class="py-3 px-4">
                  <span :class="getStatusBadgeClass(inventory.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusLabel(inventory.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-600">{{ inventory.created_by_name || '-' }}</td>
                <td class="py-3 px-4 text-right" @click.stop>
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="inventory.status === 'draft'"
                      @click="validateInventoryAction(inventory.id)"
                      variant="outline"
                      size="sm"
                      title="Valider"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </Button>
                    <Button
                      v-if="inventory.status === 'draft'"
                      @click="deleteInventoryAction(inventory.id)"
                      variant="destructive"
                      size="sm"
                      title="Supprimer"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="inventoryStore.inventoriesTotalCount > 20" class="flex justify-between items-center mt-4 pt-4 border-t">
          <div class="text-sm text-gray-600">
            {{ inventoryStore.inventories.length }} sur {{ inventoryStore.inventoriesTotalCount }} inventaires
          </div>
          <div class="flex gap-2">
            <Button
              @click="previousPage"
              :disabled="inventoryStore.inventoriesCurrentPage === 1"
              variant="outline"
              size="sm"
            >
              Précédent
            </Button>
            <Button
              @click="nextPage"
              :disabled="inventoryStore.inventoriesCurrentPage * 20 >= inventoryStore.inventoriesTotalCount"
              variant="outline"
              size="sm"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Inventory Form Dialog -->
    <InventoryFormDialog
      :open="showCreateDialog"
      @update:open="showCreateDialog = $event"
      @saved="handleInventorySaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useInventoryStore } from '@/stores/inventory.store'
import { useStoresStore } from '@/stores/stores.store'
import InventoryFormDialog from '@/components/inventory/InventoryFormDialog.vue'
import type { InventoryFilters } from '@/services/api/inventory.api'

const router = useRouter()
const inventoryStore = useInventoryStore()
const storesStore = useStoresStore()

const showCreateDialog = ref(false)

const filters = ref<InventoryFilters>({
  store: undefined,
  status: undefined,
  search: ''
})

onMounted(async () => {
  await Promise.all([
    inventoryStore.fetchInventories(),
    storesStore.fetchStores()
  ])
})

const applyFilters = async () => {
  const filterData: InventoryFilters = {}
  if (filters.value.store) filterData.store = filters.value.store
  if (filters.value.status) filterData.status = filters.value.status
  if (filters.value.search) filterData.search = filters.value.search

  await inventoryStore.fetchInventories(filterData)
}

const resetFilters = async () => {
  filters.value = {
    store: undefined,
    status: undefined,
    search: ''
  }
  await inventoryStore.fetchInventories()
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const handleInventorySaved = async () => {
  await inventoryStore.fetchInventories(filters.value)
}

const viewInventory = (id: number) => {
  router.push(`/stock/inventories/${id}`)
}

const validateInventoryAction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir valider cet inventaire ? Cette action ajustera les stocks.')) {
    try {
      await inventoryStore.validateInventory(id)
      await inventoryStore.fetchInventories(filters.value)
    } catch {
      // Error handled in store
    }
  }
}

const deleteInventoryAction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
    try {
      await inventoryStore.deleteInventory(id)
    } catch {
      // Error handled in store
    }
  }
}

const previousPage = async () => {
  if (inventoryStore.inventoriesCurrentPage > 1) {
    await inventoryStore.fetchInventories(filters.value, inventoryStore.inventoriesCurrentPage - 1)
  }
}

const nextPage = async () => {
  if (inventoryStore.inventoriesCurrentPage * 20 < inventoryStore.inventoriesTotalCount) {
    await inventoryStore.fetchInventories(filters.value, inventoryStore.inventoriesCurrentPage + 1)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Brouillon',
    validated: 'Validé',
    cancelled: 'Annulé'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    draft: 'bg-yellow-100 text-yellow-800',
    validated: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}
</script>
