<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomersStore } from '@/stores/customers.store'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
import CustomersSearchBar from '@/components/clients/CustomersSearchBar.vue'
import CustomersTable from '@/components/clients/CustomersTable.vue'
import CustomerFormDialog from '@/components/clients/CustomerFormDialog.vue'
import type { Customer } from '@/services/api/customers.api'
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

const store = useCustomersStore()

const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

// État pour le formulaire
const isFormDialogOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

// État pour la suppression
const isDeleteDialogOpen = ref(false)
const customerToDelete = ref<Customer | null>(null)

// Computed
const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return store.customers
  }
  const query = searchQuery.value.toLowerCase()
  return store.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.customer_code.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.city?.toLowerCase().includes(query)
  )
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredCustomers.value.slice(start, end)
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

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    await store.exportExcel({ search: searchQuery.value })
  } catch (error) {
    alert('Erreur lors de l\'export Excel')
  }
}

// Ouvrir le formulaire pour un nouveau client
const handleAdd = () => {
  if (!hasPermission('can_manage_customers')) {
    toast.error(getPermissionErrorMessage('can_manage_customers'), 'Accès refusé')
    return
  }
  selectedCustomer.value = null
  isFormDialogOpen.value = true
}

// Gestion de la modification
const handleEdit = (customer: Customer) => {
  if (!hasPermission('can_manage_customers')) {
    toast.error(getPermissionErrorMessage('can_manage_customers'), 'Accès refusé')
    return
  }
  selectedCustomer.value = customer
  isFormDialogOpen.value = true
}

// Gestion de la suppression
const handleDelete = (customer: Customer) => {
  if (!hasPermission('can_manage_customers')) {
    toast.error(getPermissionErrorMessage('can_manage_customers'), 'Accès refusé')
    return
  }
  customerToDelete.value = customer
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!customerToDelete.value) return

  try {
    await store.deleteCustomer(customerToDelete.value.id)
    isDeleteDialogOpen.value = false
    customerToDelete.value = null
  } catch (error) {
    alert(store.error || 'Erreur lors de la suppression du client')
  }
}

// Callback après succès de la sauvegarde
const handleSaved = async () => {
  // Recharger les clients
  await store.fetchCustomers()
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
          <BreadcrumbPage>Clients</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions -->
    <CustomersSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des clients -->
    <CustomersTable
      :customers="paginatedCustomers"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredCustomers.length"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />

    <!-- Formulaire de client -->
    <CustomerFormDialog
      v-model:open="isFormDialogOpen"
      :customer="selectedCustomer"
      @saved="handleSaved"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le client
            <strong>{{ customerToDelete?.name }}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isDeleteDialogOpen = false">
            Annuler
          </Button>
          <Button type="button" variant="destructive" @click="confirmDelete">
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
