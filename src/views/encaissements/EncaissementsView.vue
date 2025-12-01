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
const pageSize = ref(8)
const isDeleteDialogOpen = ref(false)
const encaissementToDelete = ref<Encaissement | null>(null)

// Computed
const filteredEncaissements = computed(() => {
  let filtered = store.encaissements

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.code.toLowerCase().includes(query) ||
        e.referenceFacture.toLowerCase().includes(query)
    )
  }

  // Filtre par date
  if (startDate.value || endDate.value) {
    filtered = filtered.filter((e) => {
      const encDate = new Date(e.date)
      if (startDate.value && encDate < startDate.value) return false
      if (endDate.value && encDate > endDate.value) return false
      return true
    })
  }

  return filtered
})

const paginatedEncaissements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEncaissements.value.slice(start, end)
})

const totalCaisse = computed(() => {
  return filteredEncaissements.value.reduce((sum, e) => sum + e.montant, 0)
})

const formatMontant = (montant: number): string => {
  return montant.toLocaleString('fr-FR')
}

// Charger les données au montage
onMounted(() => {
  store.fetchEncaissements()
})

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
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  console.log('Export PDF')
  // TODO: Implémenter l'export PDF
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  console.log('Export Excel')
  // TODO: Implémenter l'export Excel
}

// Gestion de la consultation
const handleView = (encaissement: Encaissement) => {
  console.log('Consulter:', encaissement)
  // TODO: Ouvrir la vue détaillée
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
    console.error('Erreur lors de la suppression:', error)
  }
}

// Gestion du changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
    <!-- Titre principal ENCAISSEMENT + Carte Caisse -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <!-- Titre + Statut actuel à gauche -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Encaissement</h1>
        <h2 class="text-base sm:text-lg font-semibold text-primary mt-1">Statut actuel</h2>
        <p class="text-xs sm:text-sm text-muted-foreground">Aujourd'hui</p>
      </div>

      <!-- Carte Montant Caisse -->
      <div class="w-full sm:w-auto sm:min-w-[280px] rounded-xl bg-green-500 p-5 text-white">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Wallet class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm text-white/80">Montant actuel</p>
            <p class="text-lg font-semibold">Caisse</p>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold">{{ formatMontant(totalCaisse) }}</span>
          <span class="text-lg font-medium">XAF</span>
        </div>
      </div>
    </div>

    <!-- Barre de recherche et actions -->
    <EncaissementSearchBar
      @search="handleSearch"
      @export-pdf="handleExportPdf"
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
</template>
