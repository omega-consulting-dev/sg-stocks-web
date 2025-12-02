<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFournisseursStore, type CompteFournisseur, type Operation } from '@/stores/fournisseurs'
import FournisseurSearchBar from '@/components/fournisseurs/FournisseurSearchBar.vue'
import CompteFournisseurTable from '@/components/fournisseurs/CompteFournisseurTable.vue'
import ReglementForm from '@/components/fournisseurs/ReglementForm.vue'
import OperationForm from '@/components/fournisseurs/OperationForm.vue'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const store = useFournisseursStore()

// État local
const searchQuery = ref('')
const isReglementFormOpen = ref(false)
const isOperationFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isOperationsDialogOpen = ref(false)
const selectedCompte = ref<CompteFournisseur | null>(null)
const compteToDelete = ref<CompteFournisseur | null>(null)
const currentPage = ref(1)
const pageSize = 8

// Computed
const filteredComptes = computed(() => {
  if (!searchQuery.value) {
    return store.comptes
  }
  const query = searchQuery.value.toLowerCase()
  return store.comptes.filter(
    (compte) =>
      compte.fournisseur_name.toLowerCase().includes(query) ||
      compte.montant_facture.toString().includes(query) ||
      compte.montant_encaissement.toString().includes(query)
  )
})

const paginatedComptes = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredComptes.value.slice(start, end)
})

// Opérations pour le compte sélectionné
const compteOperations = computed(() => {
  if (!selectedCompte.value) return []
  return store.operations.filter(op => op.compte_id === selectedCompte.value?.id)
})

// Charger les données au montage
onMounted(() => {
  store.fetchFournisseurs()
  store.fetchComptes()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

// Gestion de l'ajout de règlement
const handleAdd = () => {
  isReglementFormOpen.value = true
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

// Voir les opérations d'un compte
const handleViewOperations = (compte: CompteFournisseur) => {
  selectedCompte.value = compte
  isOperationsDialogOpen.value = true
}

// Ajouter une opération
const handleAddOperation = (compte: CompteFournisseur) => {
  selectedCompte.value = compte
  isOperationFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (compte: CompteFournisseur) => {
  compteToDelete.value = compte
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!compteToDelete.value) return

  try {
    await store.deleteCompte(compteToDelete.value.id)
    isDeleteDialogOpen.value = false
    compteToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Gestion de la pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Soumission du formulaire de règlement
const handleReglementSubmit = async (data: Omit<Operation, 'id' | 'created_at'>) => {
  try {
    await store.addOperation(data)
    isReglementFormOpen.value = false
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du règlement:", error)
  }
}

// Soumission du formulaire d'opération
const handleOperationSubmit = async (data: Omit<Operation, 'id' | 'created_at'>) => {
  try {
    await store.addOperation(data)
    isOperationFormOpen.value = false
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'opération:", error)
  }
}

// Formatage de montant
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
}

// Formatage de date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
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
    <FournisseurSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des comptes fournisseurs -->
    <CompteFournisseurTable
      :comptes="paginatedComptes"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredComptes.length"
      @view-operations="handleViewOperations"
      @add-operation="handleAddOperation"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Formulaire de règlement -->
    <ReglementForm
      v-model:open="isReglementFormOpen"
      :loading="store.loading"
      @submit="handleReglementSubmit"
    />

    <!-- Formulaire d'opération -->
    <OperationForm
      v-model:open="isOperationFormOpen"
      :compte="selectedCompte"
      :loading="store.loading"
      @submit="handleOperationSubmit"
    />

    <!-- Dialog pour voir les opérations -->
    <Dialog v-model:open="isOperationsDialogOpen">
      <DialogContent class="max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle>Opérations</DialogTitle>
              <DialogDescription v-if="selectedCompte">
                Compte : {{ selectedCompte.fournisseur_name }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto">
          <Table v-if="compteOperations.length > 0">
            <TableHeader>
              <TableRow>
                <TableHead>Intitulé</TableHead>
                <TableHead class="text-right">Montant</TableHead>
                <TableHead>Date règlement</TableHead>
                <TableHead>Pièce jointe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="operation in compteOperations" :key="operation.id">
                <TableCell class="font-medium">{{ operation.intitule }}</TableCell>
                <TableCell class="text-right">{{ formatMontant(operation.montant) }}</TableCell>
                <TableCell>{{ formatDate(operation.date_reglement) }}</TableCell>
                <TableCell>
                  <span v-if="operation.piece_jointe" class="text-blue-600">
                    {{ operation.piece_jointe }}
                  </span>
                  <span v-else class="text-muted-foreground">-</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div v-else class="text-center py-8 text-muted-foreground">
            Aucune opération pour ce compte
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isOperationsDialogOpen = false">
            Fermer
          </Button>
          <Button @click="handleAddOperation(selectedCompte!)" v-if="selectedCompte">
            Ajouter une opération
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
            Êtes-vous sûr de vouloir supprimer le compte du fournisseur
            <span class="font-semibold">{{ compteToDelete?.fournisseur_name }}</span> ?
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
