<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers.store'
import type { Customer } from '@/services/api/customers.api'
import ClientSearchBar from '@/components/clients/ClientSearchBar.vue'
import ClientTable from '@/components/clients/ClientTable.vue'
import ClientForm from '@/components/clients/ClientForm.vue'
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
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useCustomersStore()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedClient = ref<Customer | null>(null)
const clientToDelete = ref<Customer | null>(null)
const currentPage = ref(1)
const pageSize = 8

// Computed
const filteredClients = computed(() => {
  if (!searchQuery.value) {
    return store.customers
  }
  const query = searchQuery.value.toLowerCase()
  return store.customers.filter(
    (client) =>
      client.name.toLowerCase().includes(query) ||
      (client.phone && client.phone.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query))
  )
})

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredClients.value.slice(start, end)
})

// Charger les données au montage
onMounted(() => {
  store.fetchCustomers()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedClient.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  console.log('Import clients - À implémenter')
  alert('Fonctionnalité d\'import à venir')
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  console.log('Export PDF clients - À implémenter')
  alert('Fonctionnalité d\'export PDF à venir')
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  console.log('Export Excel clients - À implémenter')
  alert('Fonctionnalité d\'export Excel à venir')
}

// Navigation vers comptes clients
const handleCompteClient = () => {
  router.push('/clients')
}

// Gestion de la modification
const handleEdit = (client: Customer) => {
  selectedClient.value = client
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (client: Customer) => {
  clientToDelete.value = client
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!clientToDelete.value) return

  try {
    await store.deleteCustomer(clientToDelete.value.id)
    isDeleteDialogOpen.value = false
    clientToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Suivi client - navigation vers comptes filtrés
const handleSuiviClient = (client: Customer) => {
  router.push({ path: '/clients', query: { clientId: client.id.toString() } })
}

// Gestion de la pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Soumission du formulaire
const handleFormSubmit = async (data: Partial<Customer>) => {
  try {
    if (selectedClient.value) {
      await store.updateCustomer(selectedClient.value.id, data)
    } else {
      await store.createCustomer(data)
    }
    isFormOpen.value = false
    selectedClient.value = null
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
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Comptes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <ClientSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
      @compte-client="handleCompteClient"
    />

    <!-- Tableau des clients -->
    <ClientTable
      :clients="paginatedClients"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredClients.length"
      @edit="handleEdit"
      @delete="handleDelete"
      @suivi-client="handleSuiviClient"
      @page-change="handlePageChange"
    />

    <!-- Formulaire d'ajout/modification -->
    <ClientForm
      v-model:open="isFormOpen"
      :client="selectedClient"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le client
            <span class="font-semibold">{{ clientToDelete?.name }}</span> ?
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
