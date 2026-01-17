<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFournisseursStore, type SupplierDebt } from '@/stores/fournisseurs'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
import FournisseurSearchBar from '@/components/fournisseurs/FournisseurSearchBar.vue'
import CompteFournisseurTable from '@/components/fournisseurs/CompteFournisseurTable.vue'
import ReglementForm from '@/components/fournisseurs/ReglementForm.vue'
import PaymentHistoryDialog from '@/components/fournisseurs/PaymentHistoryDialog.vue'
import SupplierDebtsListDialog from '@/components/fournisseurs/SupplierDebtsListDialog.vue'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

const store = useFournisseursStore()

const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

// État pour le formulaire de paiement
const isPaymentFormOpen = ref(false)
const selectedSupplier = ref<SupplierDebt | null>(null)
const selectedOrder = ref<any | null>(null)

// État pour l'historique des paiements
const isHistoryDialogOpen = ref(false)
const historySupplier = ref<SupplierDebt | null>(null)

// État pour la liste des dettes
const isDebtsListDialogOpen = ref(false)
const debtsListSupplier = ref<SupplierDebt | null>(null)

// Computed
const filteredDebts = computed(() => {
  if (!searchQuery.value) {
    return store.debts
  }
  const query = searchQuery.value.toLowerCase()
  return store.debts.filter(
    (debt) =>
      debt.name.toLowerCase().includes(query) ||
      debt.supplier_code.toLowerCase().includes(query) ||
      debt.email?.toLowerCase().includes(query) ||
      debt.phone?.toLowerCase().includes(query)
  )
})

const paginatedDebts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDebts.value.slice(start, end)
})

// Charger les données au montage
onMounted(() => {
  store.fetchDebts()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
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

// Ajouter un règlement (ouvre le formulaire sans fournisseur présélectionné)
const handleAddReglement = () => {
  // Si on a des dettes, on prend le premier fournisseur par défaut
  if (store.debts.length > 0) {
    selectedSupplier.value = store.debts[0]
    isPaymentFormOpen.value = true
  } else {
    alert('Aucun fournisseur avec dette à régler')
  }
}

// Voir les dettes d'un fournisseur
const handleViewDebts = (debt: SupplierDebt) => {
  debtsListSupplier.value = debt
  isDebtsListDialogOpen.value = true
}

// Payer une commande spécifique
const handlePayOrder = (order: any) => {
  selectedSupplier.value = debtsListSupplier.value
  selectedOrder.value = order
  isDebtsListDialogOpen.value = false
  isPaymentFormOpen.value = true
}

// Voir l'historique des paiements d'un fournisseur
const handleViewHistory = (debt: SupplierDebt) => {
  historySupplier.value = debt
  isHistoryDialogOpen.value = true
}

// Callback après succès du paiement
const handlePaymentSuccess = async () => {
  // Les dettes sont automatiquement rafraîchies par le store
  selectedSupplier.value = null
  selectedOrder.value = null
  await store.fetchDebts()
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
    <FournisseurSearchBar
      @search="handleSearch"
      @add="handleAddReglement"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des dettes fournisseurs -->
    <CompteFournisseurTable
      :debts="paginatedDebts"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredDebts.length"
      @view-history="handleViewHistory"
      @view-debts="handleViewDebts"
      @page-change="handlePageChange"
    />

    <!-- Formulaire de règlement -->
    <ReglementForm
      v-model:open="isPaymentFormOpen"
      :supplier="selectedSupplier"
      :order="selectedOrder"
      @success="handlePaymentSuccess"
    />

    <!-- Dialog historique des paiements -->
    <PaymentHistoryDialog
      v-model:open="isHistoryDialogOpen"
      :supplier="historySupplier"
    />

    <!-- Dialog liste des dettes -->
    <SupplierDebtsListDialog
      v-model:open="isDebtsListDialogOpen"
      :supplier="debtsListSupplier"
      @pay-order="handlePayOrder"
    />
  </div>
</template>
