<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useServicesStore, type Service } from '@/stores/services'
import { useServiceFamiliesStore } from '@/stores/serviceFamilies'
import type { CreateServiceDto } from '@/services/api/services.api'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
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
const familiesStore = useServiceFamiliesStore()

const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
const selectedService = ref<Service | null>(null)
const serviceToDelete = ref<Service | null>(null)

// Computed
const filteredServices = computed(() => {
  if (!searchQuery.value) {
    return store.services
  }
  const query = searchQuery.value.toLowerCase()
  return store.services.filter(
    (service) =>
      service.reference.toLowerCase().includes(query) ||
      service.name.toLowerCase().includes(query) ||
      service.category_name.toLowerCase().includes(query)
  )
})

// Charger les données au montage
onMounted(() => {
  store.fetchServices()
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
  selectedService.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const result = await store.importExcel(file)
        successMessage.value = `Import terminé: ${result.created} créés, ${result.updated} mis à jour`
        isSuccessDialogOpen.value = true
      } catch (error) {
        successMessage.value = "Erreur lors de l'import du fichier"
        isSuccessDialogOpen.value = true
      }
    }
  }
  input.click()
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  if (!hasPermission('can_export_data') && !hasPermission('can_view_services')) {
    toast.error("Vous n'avez pas les droits nécessaires pour exporter les données. Veuillez contacter votre supérieur.", 'Accès refusé')
    return
  }
  try {
    await store.exportPdf()
    successMessage.value = 'Export PDF réussi !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    successMessage.value = "Erreur lors de l'export PDF"
    isSuccessDialogOpen.value = true
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  if (!hasPermission('can_export_data') && !hasPermission('can_view_services')) {
    toast.error("Vous n'avez pas les droits nécessaires pour exporter les données. Veuillez contacter votre supérieur.", 'Accès refusé')
    return
  }
  try {
    await store.exportExcel()
    successMessage.value = 'Export Excel réussi !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    successMessage.value = "Erreur lors de l'export Excel"
    isSuccessDialogOpen.value = true
  }
}

// Gestion de la modification
const handleEdit = (service: Service) => {
  if (!hasPermission('can_manage_services')) {
    toast.error(getPermissionErrorMessage('can_manage_services'), 'Accès refusé')
    return
  }
  selectedService.value = service
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (service: Service) => {
  if (!hasPermission('can_manage_services')) {
    toast.error(getPermissionErrorMessage('can_manage_services'), 'Accès refusé')
    return
  }
  serviceToDelete.value = service
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!serviceToDelete.value) return

  try {
    await store.deleteService(serviceToDelete.value.id)
    // Recharger les familles pour mettre à jour les compteurs
    await familiesStore.fetchFamilies()
    isDeleteDialogOpen.value = false
    serviceToDelete.value = null
    successMessage.value = 'Service supprimé avec succès !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    successMessage.value = 'Erreur lors de la suppression du service'
    isSuccessDialogOpen.value = true
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: CreateServiceDto) => {
  try {
    if (selectedService.value) {
      // Modification
      await store.updateService(selectedService.value.id, data)
      // Recharger la liste des services pour obtenir les données complètes du backend
      await store.fetchServices()
      // Recharger les familles pour mettre à jour les compteurs
      await familiesStore.fetchFamilies()
      isFormOpen.value = false
      selectedService.value = null
      successMessage.value = 'Service modifié avec succès !'
      isSuccessDialogOpen.value = true
    } else {
      // Ajout
      await store.addService(data)
      // Recharger la liste des services pour obtenir les données complètes du backend
      await store.fetchServices()
      // Recharger les familles pour mettre à jour les compteurs
      await familiesStore.fetchFamilies()
      isFormOpen.value = false
      selectedService.value = null
      successMessage.value = 'Service ajouté avec succès !'
      isSuccessDialogOpen.value = true
    }
  } catch (error) {
    successMessage.value = 'Erreur lors de l\'enregistrement du service'
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
          <BreadcrumbPage>Services</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <ServiceSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des services -->
    <ServiceTable
      :services="filteredServices"
      :loading="store.loading"
      :current-page="1"
      :page-size="8"
      :total="store.servicesCount"
      @edit="handleEdit"
      @delete="handleDelete"
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
            <span class="font-semibold">{{ serviceToDelete?.name }}</span> ?
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

    <!-- Dialog de succès -->
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
          <Button @click="isSuccessDialogOpen = false">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
