<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useServicesStore, type Service } from '@/stores/services'
import ServiceSearchBar from '@/components/services/ServiceSearchBar.vue'
import ServiceTable from '@/components/services/ServiceTable.vue'
import ServiceForm from '@/components/services/ServiceForm.vue'
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

const store = useServicesStore()

// État local
const searchQuery = ref('')
const familyFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedService = ref<Service | null>(null)
const serviceToDelete = ref<Service | null>(null)

// Computed
const filteredServices = computed(() => {
  let filtered = store.services

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (service) =>
        service.intitule.toLowerCase().includes(query) ||
        service.client.toLowerCase().includes(query) ||
        service.familleLibelle.toLowerCase().includes(query)
    )
  }

  // Filtre par famille
  if (familyFilter.value) {
    filtered = filtered.filter(
      (service) => service.familleLibelle === familyFilter.value
    )
  }

  return filtered
})

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredServices.value.slice(start, end)
})

// Charger les données au montage
onMounted(() => {
  store.fetchServices()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1 // Reset pagination
}

// Gestion du filtre famille
const handleFamilyFilter = (family: string) => {
  familyFilter.value = family
  currentPage.value = 1 // Reset pagination
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedService.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  console.log('Import clicked')
  // TODO: Implémenter l'import de données
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  console.log('Export PDF clicked')
  // TODO: Implémenter l'export PDF
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  console.log('Export Excel clicked')
  // TODO: Implémenter l'export Excel
}

// Gestion de la modification
const handleEdit = (service: Service) => {
  selectedService.value = service
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (service: Service) => {
  serviceToDelete.value = service
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!serviceToDelete.value) return

  try {
    await store.deleteService(serviceToDelete.value.id)
    isDeleteDialogOpen.value = false
    serviceToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: Partial<Service>) => {
  try {
    if (selectedService.value) {
      // Modification
      await store.updateService(selectedService.value.id, data)
    } else {
      // Ajout
      await store.addService(data as Omit<Service, 'id' | 'createdAt' | 'updatedAt'>)
    }
    isFormOpen.value = false
    selectedService.value = null
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
  }
}

// Gestion du changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex-1 space-y-6 p-6">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Services</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <ServiceSearchBar
      @search="handleSearch"
      @family-filter="handleFamilyFilter"
      @add="handleAdd"
      @import="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des services -->
    <ServiceTable
      :services="paginatedServices"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredServices.length"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Formulaire d'ajout/modification -->
    <ServiceForm
      v-model:open="isFormOpen"
      :service="selectedService"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le service
            <span class="font-semibold">{{ serviceToDelete?.intitule }}</span> ?
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
