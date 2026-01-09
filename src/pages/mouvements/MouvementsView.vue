<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMouvementsStore, type Mouvement } from '@/stores/mouvements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeftRight, Upload, FileText, Sheet, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-vue-next'
import { encaissementsApi } from '@/services/api/encaissements.api'
import MouvementsTable from '@/components/mouvements/MouvementsTable.vue'

const store = useMouvementsStore()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isDeleteDialogOpen = ref(false)
const mouvementToDelete = ref<Mouvement | null>(null)
const stores = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedStoreId = ref<number | string>('')
const selectedMovementType = ref<string>('')

const filters = ref({
  start_date: '',
  end_date: '',
  store: undefined as number | string | undefined,
  product: undefined as number | string | undefined,
  movement_type: undefined as string | undefined,
})

// Date du jour au format YYYY-MM-DD
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

// Computed
const paginatedMouvements = computed(() => {
  // Utiliser directement les mouvements du store (déjà paginés et filtrés par l'API)
  return store.mouvements
})

// Nom du produit filtré (pour l'affichage)
const filteredProductName = computed(() => {
  if (store.mouvements.length > 0) {
    return store.mouvements[0].product_name
  }
  return null
})

// Statistiques basées sur les totaux du store
const filteredEntreeCount = computed(() => store.entreeCount)
const filteredSortieCount = computed(() => store.sortieCount)
const filteredTotalQuantityIn = computed(() => store.totalQuantityIn)
const filteredTotalQuantityOut = computed(() => store.totalQuantityOut)
const filteredMouvements = computed(() => store.mouvements)

// Charger les données au montage
onMounted(async () => {
  // Charger la liste des stores
  stores.value = await encaissementsApi.getStores()

  loadMouvements()
})

// Charger les données avec filtres
const loadMouvements = async (page: number = 1) => {
  const apiFilters: Record<string, string | number> = {}
  if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
  if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
  if (filters.value.store) apiFilters.store = filters.value.store
  if (filters.value.product) apiFilters.product = filters.value.product
  if (filters.value.movement_type) apiFilters.movement_type = filters.value.movement_type
  if (searchQuery.value) apiFilters.search = searchQuery.value
  await store.fetchMouvements(apiFilters, page, pageSize.value)
  currentPage.value = page
}

// Gestion du changement de store
const handleStoreChange = () => {
  filters.value.store = selectedStoreId.value === '' ? undefined : selectedStoreId.value
  currentPage.value = 1
  loadMouvements(1)
}

// Gestion du changement de type de mouvement
const handleMovementTypeChange = () => {
  // Si c'est "out", inclure aussi "transfer" car les transferts sont des sorties
  if (selectedMovementType.value === 'out') {
    filters.value.movement_type = 'out,transfer'
  } else {
    filters.value.movement_type = selectedMovementType.value === '' ? undefined : selectedMovementType.value
  }
  currentPage.value = 1
  loadMouvements(1)
}

// Gestion de la recherche
const handleSearch = () => {
  currentPage.value = 1
  loadMouvements(1)
}

// Gestion de la pagination
const handlePageChange = async (page: number) => {
  await loadMouvements(page)
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    const apiFilters: Record<string, string | number> = {}
    if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
    if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
    if (filters.value.store) apiFilters.store = filters.value.store
    if (filters.value.product) apiFilters.product = filters.value.product
    if (filters.value.movement_type) apiFilters.movement_type = filters.value.movement_type
    await store.exportPdf(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    alert('Erreur lors de l\'export PDF')
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    const apiFilters: Record<string, string | number> = {}
    if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
    if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
    if (filters.value.store) apiFilters.store = filters.value.store
    if (filters.value.product) apiFilters.product = filters.value.product
    if (filters.value.movement_type) apiFilters.movement_type = filters.value.movement_type
    await store.exportExcel(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error)
    alert('Erreur lors de l\'export Excel')
  }
}

// Gestion de la suppression
const handleDelete = (mouvement: Mouvement) => {
  mouvementToDelete.value = mouvement
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!mouvementToDelete.value) return

  try {
    await store.deleteMouvement(mouvementToDelete.value.id)
    isDeleteDialogOpen.value = false
    mouvementToDelete.value = null
    // Recharger la liste après suppression
    await store.fetchMouvements()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert(store.error || 'Erreur lors de la suppression du mouvement')
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-3 shadow-lg">
              <ArrowLeftRight class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Mouvements de stock</h1>
              <p class="text-sm text-slate-600">
                Gérer toutes les entrées et sorties de stock
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-4">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Mouvements</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2.5">
              <ArrowLeftRight class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {{ filteredMouvements.length }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Tous les mouvements
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Entrées</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <ArrowDownToLine class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ filteredEntreeCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ filteredTotalQuantityIn.toLocaleString('fr-FR') }} unités
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Sorties</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-pink-500 p-2.5">
              <ArrowUpFromLine class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {{ filteredSortieCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ filteredTotalQuantityOut.toLocaleString('fr-FR') }} unités
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Stock Final</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <TrendingUp class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {{ (filteredTotalQuantityIn - filteredTotalQuantityOut).toLocaleString('fr-FR') }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Unités (Entrées - Sorties)
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Filtres de recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4 space-y-4">
        <!-- Ligne 1: Store, Type et Recherche -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="store-select" class="text-sm font-medium text-slate-700">Point de Vente</Label>
            <select
              id="store-select"
              v-model="selectedStoreId"
              @change="handleStoreChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous les points de vente</option>
              <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
                {{ storeItem.name }} ({{ storeItem.code }})
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="type-select" class="text-sm font-medium text-slate-700">Type de Mouvement</Label>
            <select
              id="type-select"
              v-model="selectedMovementType"
              @change="handleMovementTypeChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous les types</option>
              <option value="in">Entrée</option>
              <option value="out">Sortie</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="search" class="text-sm font-medium text-slate-700">Rechercher un produit</Label>
            <Input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Entrez le nom du produit (ex: Supe 1L)..."
              class="border-slate-300 focus:border-purple-500 focus:ring-purple-500"              @input="handleSearch"            />
          </div>
        </div>

        <!-- Ligne 2: Dates et Actions -->
        <div class="flex items-end justify-between gap-4">
          <div class="flex items-end gap-4 flex-1">
            <div class="space-y-2">
              <Label for="start-date" class="text-sm font-medium text-slate-700">Du</Label>
              <Input
                id="start-date"
                v-model="filters.start_date"
                type="date"
                :max="today"
                class="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                @change="() => loadMouvements(1)"
              />
            </div>
            <div class="space-y-2">
              <Label for="end-date" class="text-sm font-medium text-slate-700">Au</Label>
              <Input
                id="end-date"
                v-model="filters.end_date"
                type="date"
                :min="filters.start_date"
                :max="today"
                class="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                @change="() => loadMouvements(1)"
              />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="px-4">
                  <Upload class="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="rounded-lg" align="end">
                <DropdownMenuItem @select="handleExportPdf">
                  <FileText class="mr-2 h-4 w-4" />
                  Document PDF
                </DropdownMenuItem>
                <DropdownMenuItem @select="handleExportExcel">
                  <Sheet class="mr-2 h-4 w-4" />
                  Document Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <!-- Message d'information sur le produit filtré -->
      <div v-if="filteredProductName" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-blue-500 p-1">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-sm font-medium text-blue-900">
            Produit : <span class="font-bold">{{ filteredProductName }}</span>
          </p>
        </div>
      </div>

      <!-- Tableau des mouvements -->
      <MouvementsTable
        :mouvements="paginatedMouvements"
        :all-mouvements="store.allMouvements"
        :loading="store.loading"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="store.totalCount"
        :show-movement-type-columns="selectedMovementType === ''"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />

      <!-- Dialog de confirmation de suppression -->
      <Dialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible et inversera
              les modifications de stock.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="isDeleteDialogOpen = false">
              Annuler
            </Button>
            <Button variant="destructive" @click="confirmDelete" :disabled="store.loading">
              {{ store.loading ? 'Suppression...' : 'Supprimer' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
