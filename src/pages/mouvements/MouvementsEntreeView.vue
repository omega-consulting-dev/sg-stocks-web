<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAchatsStore, type Achat } from '@/stores/achats'
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
import { Package, Upload, FileText, Sheet } from 'lucide-vue-next'
import { encaissementsApi } from '@/services/api/encaissements.api'
import MouvementsEntreeTable from '@/components/mouvements/MouvementsEntreeTable.vue'
import { useStoreAssignment } from '@/composables/useStoreAssignment'

const router = useRouter()
const store = useAchatsStore()
const { shouldShowStoreSelector, getDefaultStoreId, getStoreLabel } = useStoreAssignment()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isDeleteDialogOpen = ref(false)
const achatToDelete = ref<Achat | null>(null)
const stores = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedStoreId = ref<number | string>('')

const filters = ref({
  start_date: '',
  end_date: '',
  store: undefined as number | string | undefined,
  product: undefined as number | string | undefined,
})

// Date du jour au format YYYY-MM-DD
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

// Computed
const paginatedAchats = computed(() => {
  // Utiliser directement les achats du store (déjà paginés et filtrés par l'API)
  return store.achats
})

// Charger les données au montage
onMounted(async () => {
  // Charger la liste des stores
  stores.value = await encaissementsApi.getStores()

  // Si l'utilisateur a un magasin par défaut, le sélectionner automatiquement
  if (getDefaultStoreId.value) {
    selectedStoreId.value = getDefaultStoreId.value
    filters.value.store = getDefaultStoreId.value
  }

  loadAchats()
})

// Charger les données avec filtres
const loadAchats = async (page: number = 1) => {
  const apiFilters: Record<string, string | number> = {}
  if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
  if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
  if (filters.value.store) apiFilters.store = filters.value.store
  if (filters.value.product) apiFilters.product = filters.value.product
  if (searchQuery.value) apiFilters.search = searchQuery.value
  await store.fetchAchats(apiFilters, page, pageSize.value)
  currentPage.value = page
}

// Gestion du changement de store
const handleStoreChange = () => {
  filters.value.store = selectedStoreId.value === '' ? undefined : selectedStoreId.value
  currentPage.value = 1
  loadAchats(1)
}

// Gestion de la recherche
const handleSearch = () => {
  currentPage.value = 1
  loadAchats(1)
}

// Gestion de la pagination
const handlePageChange = async (page: number) => {
  await loadAchats(page)
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    const apiFilters: Record<string, string | number> = {}
    if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
    if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
    if (filters.value.store) apiFilters.store = filters.value.store
    if (filters.value.product) apiFilters.product = filters.value.product
    if (searchQuery.value) apiFilters.search = searchQuery.value
    await store.exportPdf(apiFilters)
  } catch (error) {
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
    if (searchQuery.value) apiFilters.search = searchQuery.value
    await store.exportExcel(apiFilters)
  } catch (error) {
    alert('Erreur lors de l\'export Excel')
  }
}

// Gestion de la suppression
const handleDelete = (achat: Achat) => {
  achatToDelete.value = achat
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!achatToDelete.value) return

  try {
    await store.deleteAchat(achatToDelete.value.id)
    isDeleteDialogOpen.value = false
    achatToDelete.value = null
    // Recharger la liste après suppression
    await store.fetchAchats()
  } catch (error) {
    alert(store.error || 'Erreur lors de la suppression de l\'entrée')
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 shadow-lg">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Mouvements d'entrées</h1>
              <p class="text-sm text-slate-600">
                Gérer les entrées en stock et les achats
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-2">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Entrées</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {{ store.totalCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Entrées en stock
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Quantité Totale</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ store.totalQuantity.toLocaleString('fr-FR') }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Unités entrées en stock
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Filtres de recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4 space-y-4">
        <!-- Ligne 1: Store et Produit -->
        <div class="grid grid-cols-1 gap-4" :class="shouldShowStoreSelector ? 'md:grid-cols-2' : 'md:grid-cols-1'">
          <div v-if="shouldShowStoreSelector" class="space-y-2">
            <Label for="store-select" class="text-sm font-medium text-slate-700">{{ getStoreLabel }}</Label>
            <select
              id="store-select"
              v-model="selectedStoreId"
              @change="handleStoreChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tous les points de vente</option>
              <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
                {{ storeItem.name }} ({{ storeItem.code }})
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="search" class="text-sm font-medium text-slate-700">Rechercher</Label>
            <Input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par référence, produit..."
              class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              @input="handleSearch"
            />
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
                class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                @change="() => loadAchats(1)"
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
                class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                @change="() => loadAchats(1)"
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

    <!-- Tableau des entrées -->
    <MouvementsEntreeTable
      :achats="paginatedAchats"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="store.totalCount"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette entrée de stock pour
            <span class="font-semibold">{{ achatToDelete?.product_name }}</span> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="store.loading"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="store.loading"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  </div>
</template>
