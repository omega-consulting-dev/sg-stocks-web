<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFournisseursStore, type SupplierDebt } from '@/stores/fournisseurs'
import FournisseurSearchBar from '@/components/fournisseurs/FournisseurSearchBar.vue'
import CompteFournisseurTable from '@/components/fournisseurs/CompteFournisseurTable.vue'
import ReglementForm from '@/components/fournisseurs/ReglementForm.vue'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

const store = useFournisseursStore()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

// État pour le formulaire de paiement
const isPaymentFormOpen = ref(false)
const selectedSupplier = ref<SupplierDebt | null>(null)

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

// Voir les détails d'un fournisseur (PurchaseOrders)
const handleViewDetails = (debt: SupplierDebt) => {
  console.log('Voir détails fournisseur:', debt)
  // TODO: Naviguer vers la page des bons de commande du fournisseur
  alert(`Détails de ${debt.name} - À implémenter`)
}

// Ajouter un paiement pour un fournisseur spécifique
const handleAddPayment = (debt: SupplierDebt) => {
  selectedSupplier.value = debt
  isPaymentFormOpen.value = true
}

// Callback après succès du paiement
const handlePaymentSuccess = () => {
  // Les dettes sont automatiquement rafraîchies par le store
  selectedSupplier.value = null
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
      @view-details="handleViewDetails"
      @add-payment="handleAddPayment"
      @page-change="handlePageChange"
    />

    <!-- Formulaire de règlement -->
    <ReglementForm
      v-model:open="isPaymentFormOpen"
      :supplier="selectedSupplier"
      @success="handlePaymentSuccess"
    />
  </div>
</template>
