<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useServiceFamiliesStore, type ServiceFamily } from '@/stores/serviceFamilies'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
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

const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// Etat local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
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
  if (!hasPermission('can_manage_services')) {
    toast.error(getPermissionErrorMessage('can_manage_services'), 'Accès refusé')
    return
  }
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
  if (!hasPermission('can_manage_services')) {
    toast.error(getPermissionErrorMessage('can_manage_services'), 'Accès refusé')
    return
  }
  selectedFamily.value = family
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (family: ServiceFamily) => {
  if (!hasPermission('can_manage_services')) {
    toast.error(getPermissionErrorMessage('can_manage_services'), 'Accès refusé')
    return
  }
  familyToDelete.value = family
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!familyToDelete.value) return

  try {
    await store.deleteFamily(familyToDelete.value.id)
    isDeleteDialogOpen.value = false
    familyToDelete.value = null
    successMessage.value = 'Famille de services supprimée avec succès !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    successMessage.value = 'Erreur lors de la suppression'
    isSuccessDialogOpen.value = true
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: { name: string; description: string }) => {
  try {
    if (selectedFamily.value) {
      await store.updateFamily(selectedFamily.value.id, data)
      isFormOpen.value = false
      selectedFamily.value = null
      successMessage.value = 'Famille de services modifiée avec succès !'
      isSuccessDialogOpen.value = true
    } else {
      await store.addFamily(data)
      isFormOpen.value = false
      selectedFamily.value = null
      successMessage.value = 'Famille de services ajoutée avec succès !'
      isSuccessDialogOpen.value = true
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    successMessage.value = 'Erreur lors de l\'enregistrement'
    isSuccessDialogOpen.value = true
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
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg">Confirmer la suppression</DialogTitle>
          <DialogDescription class="text-sm">
            Supprimer <span class="font-semibold text-gray-900">{{ familyToDelete?.name }}</span> ?
            <br>
            <span class="text-xs text-red-600">Action irréversible.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-2">
          <Button
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="store.loading"
            class="text-sm"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="store.loading"
            class="text-sm"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer' }}
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
