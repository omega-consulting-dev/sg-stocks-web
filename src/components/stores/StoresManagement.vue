<template>
  <div class="space-y-6">
    <!-- Header avec bouton d'ajout -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Magasins</h2>
        <p class="text-muted-foreground">
          Gérez vos points de vente et entrepôts
        </p>
      </div>
      <button
        @click="openCreateDialog"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Plus class="h-4 w-4" />
        Nouveau magasin
      </button>
    </div>

    <!-- Filtres et recherche -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un magasin..."
                class="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <select
            v-model="filterType"
            class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            @change="applyFilters"
          >
            <option value="">Tous les types</option>
            <option value="retail">Point de vente</option>
            <option value="warehouse">Entrepôt</option>
            <option value="both">Les deux</option>
          </select>

          <select
            v-model="filterStatus"
            class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            @change="applyFilters"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Store class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total</p>
              <p class="text-2xl font-bold">{{ storesStore.totalItems }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <CheckCircle class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Actifs</p>
              <p class="text-2xl font-bold">{{ storesStore.activeStores.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag class="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Points de vente</p>
              <p class="text-2xl font-bold">{{ storesStore.storesByType.retail.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-orange-100 rounded-lg">
              <Warehouse class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Entrepôts</p>
              <p class="text-2xl font-bold">{{ storesStore.storesByType.warehouse.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Liste des magasins -->
    <Card>
      <CardContent class="p-0">
        <!-- Loading state -->
        <LoadingState v-if="storesStore.loading && storesStore.stores.length === 0" />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!storesStore.loading && storesStore.stores.length === 0"
          :icon="StoreIcon"
          title="Aucun magasin"
          message="Commencez par créer votre premier magasin."
        >
          <button
            @click="openCreateDialog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus class="h-4 w-4" />
            Créer un magasin
          </button>
        </EmptyState>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Magasin
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Localisation
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Responsable
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-border">
              <tr
                v-for="store in storesStore.stores"
                :key="store.id"
                class="hover:bg-muted/50 transition-colors"
              >
                <!-- Magasin -->
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium">{{ store.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ store.code }}</div>
                  </div>
                </td>

                <!-- Type -->
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                      store.store_type === 'retail' ? 'bg-purple-100 text-purple-700' :
                      store.store_type === 'warehouse' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    ]"
                  >
                    <component
                      :is="store.store_type === 'retail' ? ShoppingBag : store.store_type === 'warehouse' ? Warehouse : Store"
                      class="h-3 w-3"
                    />
                    {{ getStoreTypeLabel(store.store_type) }}
                  </span>
                </td>

                <!-- Localisation -->
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <div>{{ store.city }}</div>
                    <div class="text-muted-foreground">{{ store.address }}</div>
                  </div>
                </td>

                <!-- Contact -->
                <td class="px-6 py-4">
                  <div class="text-sm space-y-1">
                    <div v-if="store.phone" class="flex items-center gap-2">
                      <Phone class="h-3 w-3 text-muted-foreground" />
                      {{ store.phone }}
                    </div>
                    <div v-if="store.email" class="flex items-center gap-2">
                      <Mail class="h-3 w-3 text-muted-foreground" />
                      {{ store.email }}
                    </div>
                  </div>
                </td>

                <!-- Responsable -->
                <td class="px-6 py-4">
                  <div v-if="store.manager_name" class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">{{ store.manager_name }}</span>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">Non assigné</span>
                </td>

                <!-- Statut -->
                <td class="px-6 py-4">
                  <button
                    @click="toggleStatus(store)"
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                      store.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'h-1.5 w-1.5 rounded-full',
                        store.is_active ? 'bg-green-600' : 'bg-gray-400'
                      ]"
                    />
                    {{ store.is_active ? 'Actif' : 'Inactif' }}
                  </button>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEditDialog(store)"
                      class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      title="Modifier"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button
                      @click="confirmDelete(store)"
                      class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="storesStore.stores.length > 0"
          class="px-6 py-4 border-t flex items-center justify-between"
        >
          <div class="text-sm text-muted-foreground">
            Affichage de {{ ((storesStore.currentPage - 1) * storesStore.pageSize) + 1 }} à
            {{ Math.min(storesStore.currentPage * storesStore.pageSize, storesStore.totalItems) }}
            sur {{ storesStore.totalItems }} magasins
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(storesStore.currentPage - 1)"
              :disabled="storesStore.currentPage === 1"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Précédent
            </button>
            <span class="text-sm">
              Page {{ storesStore.currentPage }} sur {{ storesStore.totalPages }}
            </span>
            <button
              @click="goToPage(storesStore.currentPage + 1)"
              :disabled="storesStore.currentPage >= storesStore.totalPages"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Suivant
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Dialog pour créer/modifier un magasin -->
    <StoreEditForm
      :open="dialogOpen"
      :store="selectedStore"
      @update:open="dialogOpen = $event"
      @saved="handleStoreSuccess"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le magasin
            <strong>{{ storeToDelete?.name }}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            @click="deleteDialogOpen = false"
            class="px-4 py-2 border rounded-md hover:bg-muted"
          >
            Annuler
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            Supprimer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStoresStore } from '@/stores/stores.store'
import type { Store } from '@/types/store.types'

// Components
import StoreEditForm from './StoreEditForm.vue'
import LoadingState from '@/components/ui/loading/LoadingState.vue'
import EmptyState from '@/components/ui/empty/EmptyState.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Icons
import {
  Store as StoreIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  ShoppingBag,
  Warehouse,
  Phone,
  Mail,
  User
} from 'lucide-vue-next'

// Store
const storesStore = useStoresStore()

// État local
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dialogOpen = ref(false)
const selectedStore = ref<Store | null>(null)
const deleteDialogOpen = ref(false)
const storeToDelete = ref<Store | null>(null)

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || filterType.value || filterStatus.value
})

// Alias pour l'icône Store
const Store = StoreIcon

// Méthodes
function getStoreTypeLabel(type: string) {
  const labels: Record<string, string> = {
    retail: 'Point de vente',
    warehouse: 'Entrepôt',
    both: 'Les deux'
  }
  return labels[type] || type
}

let searchTimeout: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

function applyFilters() {
  storesStore.setFilters({
    search: searchQuery.value || undefined,
    store_type: (filterType.value as 'retail' | 'warehouse' | 'both' | '') || undefined,
    is_active: filterStatus.value === 'active' ? true : filterStatus.value === 'inactive' ? false : undefined
  })
}

function resetFilters() {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
  storesStore.resetFilters()
}

function openCreateDialog() {
  selectedStore.value = null
  dialogOpen.value = true
}

function openEditDialog(store: Store) {
  selectedStore.value = store
  dialogOpen.value = true
}

function confirmDelete(store: Store) {
  storeToDelete.value = store
  deleteDialogOpen.value = true
}

async function handleDelete() {
  if (!storeToDelete.value) return

  try {
    await storesStore.deleteStore(storeToDelete.value.id)
    deleteDialogOpen.value = false
    storeToDelete.value = null
  } catch (error) {
  }
}

async function toggleStatus(store: Store) {
  try {
    await storesStore.toggleStoreStatus(store.id)
  } catch (error) {
  }
}

function handleStoreSuccess() {
  dialogOpen.value = false
  selectedStore.value = null
  storesStore.fetchStores(storesStore.currentPage)
}

function goToPage(page: number) {
  if (page >= 1 && page <= storesStore.totalPages) {
    storesStore.fetchStores(page)
  }
}

// Lifecycle
onMounted(() => {
  storesStore.fetchStores()
})
</script>
