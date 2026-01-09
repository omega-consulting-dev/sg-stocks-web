<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFournisseursStore, type Supplier } from '@/stores/fournisseurs'
import CompteSearchBar from '@/components/fournisseurs/CompteSearchBar.vue'
import FournisseurTable from '@/components/fournisseurs/FournisseurTable.vue'
import FournisseurForm from '@/components/fournisseurs/FournisseurForm.vue'
import FournisseurEditForm from '@/components/fournisseurs/FournisseurEditForm.vue'
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
import { CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-vue-next'

const store = useFournisseursStore()

// État local
const searchQuery = ref('')
const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isImportResultOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
const selectedFournisseur = ref<Supplier | null>(null)
const fournisseurToDelete = ref<Supplier | null>(null)
const currentPage = ref(1)
const pageSize = 8
const deleting = ref(false)

// Résultat de l'import
const importResult = ref<{
  success: boolean
  message: string
  created: number
  updated: number
  errors: string[]
} | null>(null)

// Computed
const filteredFournisseurs = computed(() => {
  if (!searchQuery.value) {
    return store.fournisseurs
  }
  const query = searchQuery.value.toLowerCase()
  return store.fournisseurs.filter(
    (fournisseur) =>
      fournisseur.name?.toLowerCase().includes(query) ||
      fournisseur.contact_person?.toLowerCase().includes(query) ||
      fournisseur.supplier_code?.toLowerCase().includes(query) ||
      fournisseur.phone?.toLowerCase().includes(query) ||
      fournisseur.email?.toLowerCase().includes(query)
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

// Gestion de la vue détaillée
const handleView = (fournisseur: Supplier) => {
  selectedFournisseur.value = fournisseur
  isDetailOpen.value = true
}

// Gestion de l'ajout d'un nouveau fournisseur
const handleAdd = () => {
  selectedFournisseur.value = null
  isEditOpen.value = true
}

// Gestion de l'édition
const handleEdit = (fournisseur: Supplier) => {
  selectedFournisseur.value = fournisseur
  isEditOpen.value = true
}

// Gestion de la sauvegarde (création ou modification)
const handleSaved = () => {
  const wasEditing = selectedFournisseur.value !== null
  isEditOpen.value = false
  selectedFournisseur.value = null
  if (wasEditing) {
    successMessage.value = 'Fournisseur modifié avec succès !'
  } else {
    successMessage.value = 'Fournisseur ajouté avec succès !'
  }
  isSuccessDialogOpen.value = true
}

// Gestion de la suppression - ouverture du dialog de confirmation
const handleDeleteRequest = (fournisseur: Supplier) => {
  fournisseurToDelete.value = fournisseur
  isDeleteOpen.value = true
}

// Confirmation de la suppression
const handleDeleteConfirm = async () => {
  if (!fournisseurToDelete.value) return

  deleting.value = true
  try {
    await store.deleteFournisseur(fournisseurToDelete.value.id)
    isDeleteOpen.value = false
    fournisseurToDelete.value = null
    successMessage.value = 'Fournisseur supprimé avec succès !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    console.error('Erreur suppression:', error)
    successMessage.value = 'Erreur lors de la suppression'
    isSuccessDialogOpen.value = true
  } finally {
    deleting.value = false
  }
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    await store.exportPdf()
  } catch (error) {
    console.error('Erreur export PDF:', error)
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    await store.exportExcel()
  } catch (error) {
    console.error('Erreur export Excel:', error)
  }
}

// Gestion de l'import Excel
const handleImportExcel = async (file: File) => {
  try {
    const result = await store.importExcel(file)
    importResult.value = result
    isImportResultOpen.value = true
  } catch (error) {
    console.error('Erreur import Excel:', error)
    importResult.value = {
      success: false,
      message: "Erreur lors de l'import",
      created: 0,
      updated: 0,
      errors: [(error as Error).message]
    }
    isImportResultOpen.value = true
  }
}

// Télécharger le template
const handleDownloadTemplate = async () => {
  try {
    await store.downloadTemplate()
  } catch (error) {
    console.error('Erreur téléchargement template:', error)
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
          <BreadcrumbPage>Fournisseurs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <CompteSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
      @import-excel="handleImportExcel"
      @download-template="handleDownloadTemplate"
    />

    <!-- Tableau des fournisseurs -->
    <FournisseurTable
      :fournisseurs="paginatedFournisseurs"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredFournisseurs.length"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDeleteRequest"
      @page-change="handlePageChange"
    />

    <!-- Dialog de détail du fournisseur (lecture seule) -->
    <FournisseurForm
      v-model:open="isDetailOpen"
      :fournisseur="selectedFournisseur"
    />

    <!-- Dialog de création/édition -->
    <FournisseurEditForm
      v-model:open="isEditOpen"
      :fournisseur="selectedFournisseur"
      @saved="handleSaved"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteOpen">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-red-600">
            <Trash2 class="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription v-if="fournisseurToDelete" class="pt-2">
            Êtes-vous sûr de vouloir supprimer le fournisseur
            <strong>{{ fournisseurToDelete.name || fournisseurToDelete.contact_person }}</strong> ?
            <br />
            <span class="text-sm text-gray-500">Cette action est irréversible.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            variant="outline"
            @click="isDeleteOpen = false"
            :disabled="deleting"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="handleDeleteConfirm"
            :disabled="deleting"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog résultat de l'import -->
    <Dialog v-model:open="isImportResultOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <CheckCircle2 v-if="importResult?.success && importResult.errors.length === 0" class="h-5 w-5 text-green-600" />
            <AlertCircle v-else-if="importResult?.success && importResult.errors.length > 0" class="h-5 w-5 text-amber-600" />
            <XCircle v-else class="h-5 w-5 text-red-600" />
            Résultat de l'import
          </DialogTitle>
          <DialogDescription v-if="importResult" class="space-y-3">
            <p>{{ importResult.message }}</p>

            <div class="flex gap-4 text-sm">
              <span class="text-green-600">
                <strong>{{ importResult.created }}</strong> créé(s)
              </span>
              <span class="text-blue-600">
                <strong>{{ importResult.updated }}</strong> mis à jour
              </span>
            </div>

            <div v-if="importResult.errors.length > 0" class="mt-3">
              <p class="text-sm font-medium text-red-600 mb-1">Erreurs :</p>
              <ul class="text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                <li v-for="(error, index) in importResult.errors" :key="index">
                  {{ error }}
                </li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isImportResultOpen = false">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Success Dialog -->
    <Dialog v-model:open="isSuccessDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <span v-if="successMessage.includes('Erreur')" class="text-red-600">❌</span>
            <span v-else class="text-green-600">✅</span>
            {{ successMessage.includes('Erreur') ? 'Erreur' : 'Succès' }}
          </DialogTitle>
          <DialogDescription>
            {{ successMessage }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isSuccessDialogOpen = false">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
