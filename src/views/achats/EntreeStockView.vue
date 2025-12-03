<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAchatsStore, type Achat } from '@/stores/achats'
import AchatSearchBar from '@/components/achats/AchatSearchBar.vue'
import AchatTable from '@/components/achats/AchatTable.vue'
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

const router = useRouter()
const store = useAchatsStore()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isDeleteDialogOpen = ref(false)
const achatToDelete = ref<Achat | null>(null)

// Computed
const filteredAchats = computed(() => {
  let filtered = store.achats

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (achat) =>
        achat.reference?.toLowerCase().includes(query) ||
        achat.product_name?.toLowerCase().includes(query) ||
        achat.store_name?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const paginatedAchats = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAchats.value.slice(start, end)
})

// Charger les données au montage
onMounted(() => {
  store.fetchAchats()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

// Gestion de l'ajout - Navigation vers la page dédiée
const handleAdd = () => {
  router.push('/achats/entree-stock/nouveau')
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  // TODO: Implémenter l'export PDF
  console.log('Export PDF')
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  // TODO: Implémenter l'export Excel
  console.log('Export Excel')
}

// Gestion de la modification - Navigation vers la page dédiée
const handleEdit = (achat: Achat) => {
  router.push(`/achats/entree-stock/nouveau?id=${achat.id}`)
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
  <div class="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Entrée en stock</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <AchatSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des entrées -->
    <AchatTable
      :achats="paginatedAchats"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredAchats.length"
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
</template>
