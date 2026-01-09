<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEncaissementsStore, type Encaissement } from '@/stores/encaissements'
import EncaissementSearchBar from '@/components/encaissements/EncaissementSearchBar.vue'
import EncaissementTable from '@/components/encaissements/EncaissementTable.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-vue-next'

const store = useEncaissementsStore()

// État local
const searchQuery = ref('')
const startDate = ref<Date>()
const endDate = ref<Date>()
const currentPage = ref(1)
const pageSize = ref(10) // 10 encaissements par page
const isDeleteDialogOpen = ref(false)
const isViewDialogOpen = ref(false)
const selectedEncaissement = ref<Encaissement | null>(null)
const encaissementToDelete = ref<Encaissement | null>(null)
const stores = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedStoreId = ref<number | string>('')

// Computed
const filteredEncaissements = computed(() => {
  let filtered = store.encaissements

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.code.toLowerCase().includes(query) ||
        e.reference_facture.toLowerCase().includes(query) ||
        e.client.toLowerCase().includes(query)
    )
  }

  // Trier du plus ancien au plus récent (créer une copie pour ne pas modifier l'original)
  return [...filtered].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()

    // Si les dates sont différentes, trier par date
    if (dateA !== dateB) {
      return dateA - dateB // Ordre croissant (ancien → récent)
    }

    // Si les dates sont identiques, trier par code (ordre alphabétique croissant)
    return a.code.localeCompare(b.code)
  })
})

const paginatedEncaissements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEncaissements.value.slice(start, end)
})

const formatMontant = (montant: number): string => {
  return montant.toLocaleString('fr-FR')
}

// Charger les données au montage
onMounted(async () => {
  // Charger la liste des stores
  const storesData = await store.fetchStores()
  stores.value = storesData

  store.fetchEncaissements()
  store.fetchCaisseSolde()
})

// Gestion du changement de store
const handleStoreChange = () => {
  currentPage.value = 1

  const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value

  // Recharger les données avec le filtre store
  store.fetchEncaissements({
    start_date: startDate.value ? startDate.value.toISOString().split('T')[0] : undefined,
    end_date: endDate.value ? endDate.value.toISOString().split('T')[0] : undefined,
    store: storeFilter,
  })

  store.fetchCaisseSolde(storeFilter)
}

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

// Gestion des filtres de date
const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
  startDate.value = start
  endDate.value = end
  currentPage.value = 1

  const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value

  // Recharger les données avec les nouveaux filtres
  store.fetchEncaissements({
    start_date: start ? start.toISOString().split('T')[0] : undefined,
    end_date: end ? end.toISOString().split('T')[0] : undefined,
    store: storeFilter,
  })
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value

    await store.exportToExcel({
      start_date: startDate.value ? startDate.value.toISOString().split('T')[0] : undefined,
      end_date: endDate.value ? endDate.value.toISOString().split('T')[0] : undefined,
      store: storeFilter,
    })
  } catch (error) {
    alert('Une erreur est survenue lors de l\'export du fichier')
    console.error('Export error:', error)
  }
}

// Gestion de la consultation
const handleView = (encaissement: Encaissement) => {
  selectedEncaissement.value = encaissement
  isViewDialogOpen.value = true
}

// Gestion de la suppression
const handleDelete = (encaissement: Encaissement) => {
  encaissementToDelete.value = encaissement
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!encaissementToDelete.value) return

  try {
    await store.deleteEncaissement(encaissementToDelete.value.id)
    isDeleteDialogOpen.value = false
    encaissementToDelete.value = null
  } catch (error) {
    alert('Une erreur est survenue lors de la suppression')
    console.error('Delete error:', error)
  }
}

// Gestion du changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 shadow-lg">
              <Wallet class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Encaissements</h1>
              <p class="text-sm text-slate-600">
                Gérer les entrées de caisse et paiements
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtre par point de vente -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4">
        <label for="store-select" class="block text-sm font-medium text-slate-700 mb-2">
          Point de Vente
        </label>
        <select
          id="store-select"
          v-model="selectedStoreId"
          @change="handleStoreChange"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="">Tous les points de vente</option>
          <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
            {{ storeItem.name }} ({{ storeItem.code }})
          </option>
        </select>
      </div>

      <!-- Statistiques avec design amélioré -->
      <div class="grid gap-6 md:grid-cols-2">
        <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl rounded-lg p-6">
          <div class="flex flex-row items-center justify-between space-y-0 pb-3">
            <div class="text-sm font-medium text-slate-600">Montant en Caisse</div>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <Wallet class="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ formatMontant(store.soldeCaisse) }} XAF
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Solde actuel de la caisse
            </p>
          </div>
        </div>

        <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl rounded-lg p-6">
          <div class="flex flex-row items-center justify-between space-y-0 pb-3">
            <div class="text-sm font-medium text-slate-600">Total Encaissements</div>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5">
              <Wallet class="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ filteredEncaissements.reduce((sum, e) => sum + e.montant, 0).toLocaleString('fr-FR') }} XAF
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ filteredEncaissements.length }} encaissement(s)
            </p>
          </div>
        </div>
      </div>

      <!-- Barre de recherche et actions -->
      <EncaissementSearchBar
        @search="handleSearch"
        @export-excel="handleExportExcel"
        @date-range-change="handleDateRangeChange"
      />

      <!-- Tableau des encaissements -->
      <EncaissementTable
        :encaissements="paginatedEncaissements"
        :loading="store.loading"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredEncaissements.length"
        @view="handleView"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />

      <!-- Dialog de détails de l'encaissement -->
      <Dialog v-model:open="isViewDialogOpen">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle class="text-2xl font-bold">Détails de l'encaissement</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'encaissement
            </DialogDescription>
          </DialogHeader>

          <div v-if="selectedEncaissement" class="space-y-6">
            <!-- Informations principales -->
            <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-slate-500">Code</p>
                <p class="text-lg font-bold text-slate-900">{{ selectedEncaissement.code }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-500">Date</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ new Date(selectedEncaissement.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) }}
                </p>
              </div>
            </div>

            <!-- Montant -->
            <div class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p class="text-sm font-medium text-green-700 mb-1">Montant encaissé</p>
              <p class="text-3xl font-bold text-green-600">
                {{ selectedEncaissement.montant.toLocaleString('fr-FR') }} XAF
              </p>
            </div>

            <!-- Informations facture et client -->
            <div class="grid grid-cols-1 gap-4">
              <div class="p-4 border border-slate-200 rounded-lg">
                <p class="text-sm font-medium text-slate-500 mb-1">Référence Facture</p>
                <p class="text-base font-semibold text-slate-900">{{ selectedEncaissement.reference_facture }}</p>
              </div>

              <div class="p-4 border border-slate-200 rounded-lg">
                <p class="text-sm font-medium text-slate-500 mb-1">Client</p>
                <p class="text-base font-semibold text-slate-900">{{ selectedEncaissement.client }}</p>
              </div>

              <div v-if="selectedEncaissement.notes" class="p-4 border border-slate-200 rounded-lg">
                <p class="text-sm font-medium text-slate-500 mb-1">Notes</p>
                <p class="text-base text-slate-700">{{ selectedEncaissement.notes }}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="isViewDialogOpen = false">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Dialog de confirmation de suppression -->
      <Dialog v-model:open="isDeleteDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'encaissement
              <span class="font-semibold">{{ encaissementToDelete?.code }}</span> ?
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
