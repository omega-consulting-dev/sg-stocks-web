<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFournisseursStore, type Fournisseur } from '@/stores/fournisseurs'
import CompteSearchBar from '@/components/fournisseurs/CompteSearchBar.vue'
import FournisseurTable from '@/components/fournisseurs/FournisseurTable.vue'
import FournisseurForm from '@/components/fournisseurs/FournisseurForm.vue'
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

const store = useFournisseursStore()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedFournisseur = ref<Fournisseur | null>(null)
const fournisseurToDelete = ref<Fournisseur | null>(null)
const currentPage = ref(1)
const pageSize = 8

// Computed
const filteredFournisseurs = computed(() => {
  if (!searchQuery.value) {
    return store.fournisseurs
  }
  const query = searchQuery.value.toLowerCase()
  return store.fournisseurs.filter(
    (fournisseur) =>
      fournisseur.name.toLowerCase().includes(query) ||
      fournisseur.phone.toLowerCase().includes(query) ||
      fournisseur.email.toLowerCase().includes(query) ||
      fournisseur.location.toLowerCase().includes(query) ||
      fournisseur.legal_form.toLowerCase().includes(query)
  )
})

const paginatedFournisseurs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredFournisseurs.value.slice(start, end)
})

// Charger les données au montage
onMounted(() => {
  store.fetchFournisseurs()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedFournisseur.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  console.log('Import fournisseurs - À implémenter')
  alert('Fonctionnalité d\'import à venir')
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  console.log('Export PDF fournisseurs - À implémenter')
  alert('Fonctionnalité d\'export PDF à venir')
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  console.log('Export Excel fournisseurs - À implémenter')
  alert('Fonctionnalité d\'export Excel à venir')
}

// Gestion de la modification
const handleEdit = (fournisseur: Fournisseur) => {
  selectedFournisseur.value = fournisseur
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (fournisseur: Fournisseur) => {
  fournisseurToDelete.value = fournisseur
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!fournisseurToDelete.value) return

  try {
    await store.deleteFournisseur(fournisseurToDelete.value.id)
    isDeleteDialogOpen.value = false
    fournisseurToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Gestion de la pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Soumission du formulaire
const handleFormSubmit = async (data: Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    if (selectedFournisseur.value) {
      await store.updateFournisseur(selectedFournisseur.value.id, data)
    } else {
      await store.addFournisseur(data)
    }
    isFormOpen.value = false
    selectedFournisseur.value = null
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
  }
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
          <BreadcrumbLink href="/fournisseurs">Fournisseurs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Comptes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <CompteSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des fournisseurs -->
    <FournisseurTable
      :fournisseurs="paginatedFournisseurs"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredFournisseurs.length"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Formulaire d'ajout/modification -->
    <FournisseurForm
      v-model:open="isFormOpen"
      :fournisseur="selectedFournisseur"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le fournisseur
            <span class="font-semibold">{{ fournisseurToDelete?.name }}</span> ?
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
