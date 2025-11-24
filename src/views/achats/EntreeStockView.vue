<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAchatsStore, type Achat } from '@/stores/achats'
import AchatSearchBar from '@/components/achats/AchatSearchBar.vue'
import AchatTable from '@/components/achats/AchatTable.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const router = useRouter()
const store = useAchatsStore()

// État local
const searchQuery = ref('')
const selectedPeriod = ref('mois-en-cours')
const selectedDate = ref(new Date())
const isDeleteDialogOpen = ref(false)
const achatToDelete = ref<Achat | null>(null)
const currentPage = ref(1)
const pageSize = 8

// Computed
const filteredAchats = computed(() => {
  if (!searchQuery.value) {
    return store.achats
  }
  const query = searchQuery.value.toLowerCase()
  return store.achats.filter(
    (achat) =>
      achat.intitule.toLowerCase().includes(query) ||
      achat.fournisseur.toLowerCase().includes(query)
  )
})

// Charger les données au montage
onMounted(() => {
  store.fetchAchats()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1 // Réinitialiser à la première page
}

// Gestion de la période
const handlePeriodChange = (period: string) => {
  selectedPeriod.value = period
  console.log('Période changée:', period)
}

// Gestion de la date
const handleDateChange = (date: Date) => {
  selectedDate.value = date
  console.log('Date changée:', date)
}

// Gestion de l'ajout
const handleAdd = () => {
  router.push('/achats/entree-stock/nouveau')
}

// Gestion de la consultation
const handleConsult = (achat: Achat) => {
  console.log('Consulter:', achat)
  // TODO: Ouvrir la vue détaillée
}

// Gestion de la modification
const handleEdit = (achat: Achat) => {
  console.log('Modifier:', achat)
  // TODO: Ouvrir le formulaire de modification
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
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Gestion de la pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Barre de recherche et filtres -->
    <AchatSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @period-change="handlePeriodChange"
      @date-change="handleDateChange"
    />

    <!-- Tableau des achats -->
    <AchatTable
      :achats="filteredAchats"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredAchats.length"
      @consult="handleConsult"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'achat
            <span class="font-semibold">{{ achatToDelete?.intitule }}</span> ?
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
