<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStoresStore } from '@/stores/stores.store'
import type { Store } from '@/types/store.types'
import StoreEditForm from '@/components/stores/StoreEditForm.vue'
import { Plus, Search, Edit, Trash2, Store as StoreIcon, ShoppingBag, Warehouse, Phone, Mail, Eye, Package, Loader2, MapPin } from 'lucide-vue-next'
import Axios from '@/services/axios.service'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const storesStore = useStoresStore()

// État local
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedStore = ref<Store | null>(null)
const storeToDelete = ref<Store | null>(null)
const showStoreDetails = ref(false)
const loadingProducts = ref(false)
const storeProducts = ref<any>(null)
const searchQueryProducts = ref('')
const filterStatusProducts = ref('all')

// Computed
const filteredStores = computed(() => {
  let stores = storesStore.stores

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    stores = stores.filter(
      (store) =>
        store.code.toLowerCase().includes(query) ||
        store.name.toLowerCase().includes(query) ||
        store.city.toLowerCase().includes(query) ||
        (store.address || '').toLowerCase().includes(query)
    )
  }

  // Filtre par type
  if (filterType.value) {
    stores = stores.filter((store) => store.store_type === filterType.value)
  }

  // Filtre par statut
  if (filterStatus.value === 'active') {
    stores = stores.filter((store) => store.is_active)
  } else if (filterStatus.value === 'inactive') {
    stores = stores.filter((store) => !store.is_active)
  }

  return stores
})

const stats = computed(() => ({
  total: storesStore.stores.length,
  active: storesStore.stores.filter((s) => s.is_active).length,
  retail: storesStore.stores.filter((s) => s.store_type === 'retail').length,
  warehouse: storesStore.stores.filter((s) => s.store_type === 'warehouse').length,
}))

// Charger les données au montage
onMounted(() => {
  storesStore.fetchStores()
})

// Gestion de la recherche
const handleSearch = (e: Event) => {
  searchQuery.value = (e.target as HTMLInputElement).value
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedStore.value = null
  isFormOpen.value = true
}

// Gestion de l'édition
const handleEdit = (store: Store) => {
  selectedStore.value = store
  isFormOpen.value = true
}

// Gestion de la suppression
const confirmDelete = (store: Store) => {
  storeToDelete.value = store
  isDeleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!storeToDelete.value) return

  try {
    await storesStore.deleteStore(storeToDelete.value.id)
    isDeleteDialogOpen.value = false
    storeToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression du magasin')
  }
}

// Gestion de la sauvegarde
const handleStoreSaved = () => {
  isFormOpen.value = false
  selectedStore.value = null
  storesStore.fetchStores()
}

// Toggle statut
const toggleStatus = async (store: Store) => {
  try {
    await storesStore.toggleStoreStatus(store.id)
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
}

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterType.value || filterStatus.value
})

function getStoreTypeLabel(type: string) {
  const labels: Record<string, string> = {
    retail: 'Point de vente',
    warehouse: 'Entrepôt',
    both: 'Les deux'
  }
  return labels[type] || type
}

// Gestion de la consultation
const handleView = async (store: Store) => {
  selectedStore.value = store
  showStoreDetails.value = true
  loadingProducts.value = true
  searchQueryProducts.value = ''
  filterStatusProducts.value = 'all'

  try {
    const response = await Axios.get(`/inventory/stores/${store.id}/products/`)
    storeProducts.value = response.data
  } catch (error) {
    console.error('Erreur chargement produits:', error)
    alert('Erreur: Impossible de charger les produits du magasin')
  } finally {
    loadingProducts.value = false
  }
}

const filteredProducts = computed(() => {
  if (!storeProducts.value) return []

  let products = storeProducts.value.products

  // Filtre par recherche
  if (searchQueryProducts.value) {
    const query = searchQueryProducts.value.toLowerCase()
    products = products.filter((p: any) =>
      p.product_name.toLowerCase().includes(query) ||
      p.product_reference.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    )
  }

  // Filtre par statut
  if (filterStatusProducts.value !== 'all') {
    products = products.filter((p: any) => p.stock_status === filterStatusProducts.value)
  }

  // Tri par référence en ordre croissant
  products = products.sort((a: any, b: any) => {
    const refA = a.product_reference || ''
    const refB = b.product_reference || ''
    return refA.localeCompare(refB, 'fr', { numeric: true })
  })

  return products
})

const calculateTotalValue = () => {
  if (!storeProducts.value) return 0
  return storeProducts.value.products.reduce((total: number, product: any) => {
    const value = product.cost_price ? product.quantity * product.cost_price : 0
    return total + value
  }, 0)
}

const formatAmount = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('fr-FR').format(amount)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header avec breadcrumb -->
    <div class="flex-none px-6 py-6 border-b bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-sm shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb class="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" class="text-gray-600 hover:text-blue-600 transition-colors">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage class="text-blue-600 font-medium">Gestion des Magasins</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <StoreIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">Gestion des Magasins</h1>
              <p class="text-sm text-gray-500 mt-0.5">Gérez vos points de vente et entrepôts</p>
            </div>
          </div>
        </div>
        <Button @click="handleAdd" class="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6">
          <Plus class="h-5 w-5" />
          <span class="font-semibold">Nouveau magasin</span>
        </Button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="flex-none px-6 py-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div class="grid grid-cols-4 gap-6">
        <Card class="border-2 border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent class="pt-6 pb-6 relative">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Total Magasins</p>
                <p class="text-4xl font-extrabold text-blue-700 group-hover:text-blue-800 transition-colors">{{ stats.total }}</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <StoreIcon class="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-green-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent class="pt-6 pb-6 relative">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">Magasins Actifs</p>
                <p class="text-4xl font-extrabold text-green-700 group-hover:text-green-800 transition-colors">{{ stats.active }}</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <StoreIcon class="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-purple-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent class="pt-6 pb-6 relative">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">Points de Vente</p>
                <p class="text-4xl font-extrabold text-purple-700 group-hover:text-purple-800 transition-colors">{{ stats.retail }}</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ShoppingBag class="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-2 border-orange-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent class="pt-6 pb-6 relative">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">Entrepôts</p>
                <p class="text-4xl font-extrabold text-orange-700 group-hover:text-orange-800 transition-colors">{{ stats.warehouse }}</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Warehouse class="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="flex-none px-6 py-5 bg-white border-b">
      <div class="flex gap-3 items-center">
        <div class="flex-1 relative group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <input
            type="text"
            :value="searchQuery"
            @input="handleSearch"
            placeholder="🔍 Rechercher par nom, code, ville ou adresse..."
            class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
          />
        </div>

        <select
          v-model="filterType"
          class="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-gray-50 hover:bg-white cursor-pointer font-medium text-gray-700"
        >
          <option value="">📦 Tous les types</option>
          <option value="retail">🏪 Point de vente</option>
          <option value="warehouse">🏭 Entrepôt</option>
          <option value="both">🔄 Les deux</option>
        </select>

        <select
          v-model="filterStatus"
          class="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-gray-50 hover:bg-white cursor-pointer font-medium text-gray-700"
        >
          <option value="">✨ Tous les statuts</option>
          <option value="active">✅ Actifs</option>
          <option value="inactive">⏸️ Inactifs</option>
        </select>

        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="px-5 py-3 text-sm font-medium text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>

    <!-- Table des magasins -->
    <div class="flex-1 overflow-auto px-6 py-6">
      <Card class="border-2 border-gray-100 shadow-xl rounded-2xl overflow-hidden">
        <CardContent class="p-0">
          <div v-if="storesStore.loading" class="p-16 text-center">
            <div class="inline-block h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-6 text-lg font-medium text-gray-600">Chargement des magasins...</p>
            <p class="mt-2 text-sm text-gray-400">Veuillez patienter</p>
          </div>

          <div v-else-if="filteredStores.length === 0" class="p-16 text-center">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6">
              <StoreIcon class="h-12 w-12 text-blue-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Aucun magasin trouvé</h3>
            <p class="text-gray-500 mb-6 max-w-md mx-auto">Commencez par créer votre premier magasin pour gérer vos stocks efficacement</p>
            <Button @click="handleAdd" class="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6">
              <Plus class="h-5 w-5" />
              <span class="font-semibold">Créer mon premier magasin</span>
            </Button>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-gray-50 via-blue-50/50 to-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Magasin</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Localisation</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr
                  v-for="store in filteredStores"
                  :key="store.id"
                  class="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                >
                  <!-- Magasin -->
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <StoreIcon class="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{{ store.name }}</div>
                        <div class="text-sm font-mono text-gray-500 mt-0.5">{{ store.code }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Type -->
                  <td class="px-6 py-5">
                    <span
                      :class="[
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm border-2 transition-all duration-300 hover:shadow-md hover:scale-105',
                        store.store_type === 'retail' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
                        store.store_type === 'warehouse' ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200' :
                        'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                      ]"
                    >
                      <component
                        :is="store.store_type === 'retail' ? ShoppingBag : store.store_type === 'warehouse' ? Warehouse : StoreIcon"
                        class="h-4 w-4"
                      />
                      {{ getStoreTypeLabel(store.store_type) }}
                    </span>
                  </td>

                  <!-- Localisation -->
                  <td class="px-6 py-5">
                    <div class="text-sm">
                      <div class="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin class="h-4 w-4 text-blue-500" />
                        {{ store.city }}
                      </div>
                      <div class="text-gray-500 mt-1 ml-6">{{ store.address }}</div>
                    </div>
                  </td>

                  <!-- Contact -->
                  <td class="px-6 py-5">
                    <div class="text-sm space-y-2">
                      <div v-if="store.phone" class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                        <Phone class="h-4 w-4 text-green-500" />
                        <span class="font-medium">{{ store.phone }}</span>
                      </div>
                      <div v-if="store.email" class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                        <Mail class="h-4 w-4 text-blue-500" />
                        <span class="font-medium">{{ store.email }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Statut -->
                  <td class="px-6 py-5">
                    <button
                      @click="toggleStatus(store)"
                      :class="[
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md border-2',
                        store.is_active
                          ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <span
                        :class="[
                          'h-2 w-2 rounded-full animate-pulse',
                          store.is_active ? 'bg-green-500' : 'bg-gray-400'
                        ]"
                      />
                      {{ store.is_active ? '✅ Actif' : '⏸️ Inactif' }}
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="handleView(store)"
                        class="p-2.5 text-gray-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border-2 border-gray-200 hover:border-blue-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110 group/btn"
                        title="Consulter"
                      >
                        <Eye class="h-4 w-4 group-hover/btn:animate-pulse" />
                      </button>
                      <button
                        @click="handleEdit(store)"
                        class="p-2.5 text-gray-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 border-2 border-gray-200 hover:border-amber-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110 group/btn"
                        title="Modifier"
                      >
                        <Edit class="h-4 w-4 group-hover/btn:animate-pulse" />
                      </button>
                      <button
                        @click="confirmDelete(store)"
                        class="p-2.5 text-gray-500 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border-2 border-gray-200 hover:border-red-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110 group/btn"
                        title="Supprimer"
                      >
                        <Trash2 class="h-4 w-4 group-hover/btn:animate-pulse" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Dialog formulaire -->
    <StoreEditForm
      :open="isFormOpen"
      :store="selectedStore"
      @update:open="isFormOpen = $event"
      @saved="handleStoreSaved"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
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
          <Button variant="outline" @click="isDeleteDialogOpen = false">
            Annuler
          </Button>
          <Button variant="destructive" @click="handleDelete">
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog détails magasin -->
    <Dialog :open="showStoreDetails" @update:open="showStoreDetails = $event">
      <DialogContent class="max-w-[90vw] w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader class="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 py-4 border-b">
          <DialogTitle class="flex items-center justify-between gap-2 text-2xl">
            <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ selectedStore?.name }}
            </span>
            <Badge class="px-4 py-2">{{ selectedStore?.code }}</Badge>
          </DialogTitle>
          <DialogDescription class="mt-2">
            📍 {{ selectedStore?.address }} - {{ selectedStore?.city }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="loadingProducts" class="flex justify-center py-16">
          <div class="text-center">
            <Loader2 class="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p class="text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>

        <div v-else-if="storeProducts" class="space-y-6 flex-1 overflow-y-auto px-6 py-4">
          <!-- Statistiques -->
          <div class="grid grid-cols-3 gap-6">
            <Card class="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Package class="h-4 w-4" />
                  Total Produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-blue-600">
                  {{ storeProducts.total_products }}
                </div>
              </CardContent>
            </Card>
            <Card class="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-green-700 flex items-center gap-2">
                  💰 Valeur Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-green-600">
                  {{ formatAmount(calculateTotalValue()) }}
                </div>
                <p class="text-xs text-green-700 mt-1">FCFA</p>
              </CardContent>
            </Card>
            <Card class="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader class="pb-3">
                <CardTitle class="text-sm font-medium text-orange-700 flex items-center gap-2">
                  ⚠️ Stock Bas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-orange-600">
                  {{ storeProducts.products.filter((p: any) => p.stock_status === 'low').length }}
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Filtres -->
          <div class="flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <Input
              v-model="searchQueryProducts"
              placeholder="🔍 Rechercher un produit..."
              class="max-w-sm"
            />
            <Select v-model="filterStatusProducts">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Statut stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
                <SelectItem value="low">Stock bas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Table des produits -->
          <div class="rounded-xl border-2 overflow-hidden shadow-lg bg-white">
            <Table>
              <TableHeader class="bg-gradient-to-r from-slate-100 to-slate-50">
                <TableRow>
                  <TableHead class="font-bold">Référence</TableHead>
                  <TableHead class="font-bold">Produit</TableHead>
                  <TableHead class="font-bold">Catégorie</TableHead>
                  <TableHead class="text-right font-bold">Quantité</TableHead>
                  <TableHead class="text-right font-bold">Disponible</TableHead>
                  <TableHead class="text-right font-bold">Stock Min</TableHead>
                  <TableHead class="text-right font-bold">Prix Achat</TableHead>
                  <TableHead class="text-right font-bold">Prix Vente</TableHead>
                  <TableHead class="font-bold">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="product in filteredProducts"
                  :key="product.product_id"
                  class="hover:bg-blue-50 transition-colors"
                >
                  <TableCell class="font-mono text-sm font-semibold text-blue-600">
                    {{ product.product_reference }}
                  </TableCell>
                  <TableCell class="font-medium">{{ product.product_name }}</TableCell>
                  <TableCell>
                    <Badge variant="outline" class="bg-purple-50 text-purple-700">
                      {{ product.category || 'N/A' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <span class="font-bold text-lg">{{ product.quantity }}</span>
                  </TableCell>
                  <TableCell class="text-right text-green-600 font-semibold">
                    {{ product.available_quantity }}
                  </TableCell>
                  <TableCell class="text-right text-muted-foreground">
                    {{ product.minimum_stock }}
                  </TableCell>
                  <TableCell class="text-right font-medium">
                    {{ formatAmount(product.cost_price) }}
                  </TableCell>
                  <TableCell class="text-right font-bold text-green-600">
                    {{ formatAmount(product.selling_price) }}
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="product.stock_status === 'low' ? 'destructive' : 'default'"
                      class="px-3 py-1 font-medium"
                    >
                      {{ product.stock_status === 'low' ? '⚠️ Stock bas' : '✅ Normal' }}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow v-if="filteredProducts.length === 0">
                  <TableCell colspan="9" class="text-center py-12">
                    <div class="text-muted-foreground">
                      <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p class="font-medium">Aucun produit trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
