<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useServiceFamiliesStore, type ServiceFamily } from '@/stores/serviceFamilies'
import ServiceFamilySearchBar from '@/components/service-families/ServiceFamilySearchBar.vue'
import ServiceFamilyTable from '@/components/service-families/ServiceFamilyTable.vue'
import ServiceFamilyForm from '@/components/service-families/ServiceFamilyForm.vue'
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
import { Card, CardContent } from '@/components/ui/card'

const store = useServiceFamiliesStore()

// Etat local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedFamily = ref<ServiceFamily | null>(null)
const familyToDelete = ref<ServiceFamily | null>(null)

// Computed
const filteredFamilies = computed(() => {
  if (!searchQuery.value) {
    return store.families
  }
  const query = searchQuery.value.toLowerCase()
  return store.families.filter(
    (family) =>
      family.name.toLowerCase().includes(query) ||
      family.description.toLowerCase().includes(query)
  )
})

// Charger les donnees au montage
onMounted(() => {
  store.fetchFamilies()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedFamily.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = async () => {
  alert('Import des familles de services - Fonctionnalite a venir')
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  alert('Export PDF des familles de services - Fonctionnalite a venir')
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  alert('Export Excel des familles de services - Fonctionnalite a venir')
}

// Gestion de la selection
const handleSelectFamily = (family: ServiceFamily) => {
  console.log('Famille de service selectionnee:', family)
}

// Gestion de la modification
const handleEdit = (family: ServiceFamily) => {
  selectedFamily.value = family
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (family: ServiceFamily) => {
  familyToDelete.value = family
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!familyToDelete.value) return

  try {
    await store.deleteFamily(familyToDelete.value.id)
    isDeleteDialogOpen.value = false
    familyToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: { name: string; description: string }) => {
  try {
    if (selectedFamily.value) {
      await store.updateFamily(selectedFamily.value.id, data)
    } else {
      await store.addFamily(data)
    }
    isFormOpen.value = false
    selectedFamily.value = null
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
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
          <BreadcrumbLink href="/categories/services">Categories</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Famille de services</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <ServiceFamilySearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des familles -->
    <Card>
      <CardContent class="p-0">
        <ServiceFamilyTable
          :families="filteredFamilies"
          :loading="store.loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @select="handleSelectFamily"
        />
      </CardContent>
    </Card>

    <!-- Statistiques -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Total:</span>
      <span class="font-semibold text-[#003FD8]">{{ store.familiesCount }} famille(s)</span>
      <span v-if="searchQuery" class="ml-2">
        · {{ filteredFamilies.length }} resultat(s) filtre(s)
      </span>
    </div>

    <!-- Formulaire d'ajout/modification -->
    <ServiceFamilyForm
      v-model:open="isFormOpen"
      :family="selectedFamily"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Etes-vous sur de vouloir supprimer la famille
            <span class="font-semibold">{{ familyToDelete?.name }}</span> ?
            Cette action est irreversible.
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
