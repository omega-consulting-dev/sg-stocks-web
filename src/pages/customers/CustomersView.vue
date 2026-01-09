<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerDebtsStore, type CustomerDebt } from '@/stores/customerDebts'
import CustomerSearchBar from '@/components/customers/CustomerSearchBar.vue'
import CompteCustomerTable from '@/components/customers/CompteCustomerTable.vue'
import CustomerReglementForm from '@/components/customers/CustomerReglementForm.vue'
import CustomerPaymentHistoryDialog from '@/components/customers/CustomerPaymentHistoryDialog.vue'
import CustomerDebtsListDialog from '@/components/customers/CustomerDebtsListDialog.vue'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

const store = useCustomerDebtsStore()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

const isPaymentFormOpen = ref(false)
const selectedCustomer = ref<CustomerDebt | null>(null)
const selectedInvoice = ref<any | null>(null)

const isHistoryDialogOpen = ref(false)
const historyCustomer = ref<CustomerDebt | null>(null)

const isDebtsListDialogOpen = ref(false)
const debtsListCustomer = ref<CustomerDebt | null>(null)

const filteredDebts = computed(() => {
  if (!searchQuery.value) return store.debts
  const query = searchQuery.value.toLowerCase()
  return store.debts.filter(debt =>
    debt.name.toLowerCase().includes(query) ||
    debt.customer_code.toLowerCase().includes(query) ||
    debt.email?.toLowerCase().includes(query) ||
    debt.phone?.toLowerCase().includes(query)
  )
})

const paginatedDebts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDebts.value.slice(start, end)
})

onMounted(() => {
  store.fetchDebts()
})

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleExportPdf = () => {
  alert('Fonctionnalité d\'export PDF à venir')
}

const handleExportExcel = () => {
  alert('Fonctionnalité d\'export Excel à venir')
}

const handleAddReglement = () => {
  if (store.debts.length > 0) {
    selectedCustomer.value = store.debts[0]
    isPaymentFormOpen.value = true
  } else {
    alert('Aucun client avec dette à régler')
  }
}

const handleViewHistory = (debt: CustomerDebt) => {
  historyCustomer.value = debt
  isHistoryDialogOpen.value = true
}

const handleViewDebts = (debt: CustomerDebt) => {
  debtsListCustomer.value = debt
  isDebtsListDialogOpen.value = true
}

const handlePayInvoice = (invoice: any) => {
  selectedCustomer.value = debtsListCustomer.value
  selectedInvoice.value = invoice
  isDebtsListDialogOpen.value = false
  isPaymentFormOpen.value = true
}

const handlePaymentSuccess = async () => {
  selectedCustomer.value = null
  selectedInvoice.value = null
  // Recharger les dettes pour voir les changements immédiatement
  await store.fetchDebts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Dettes Clients</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <CustomerSearchBar
      @search="handleSearch"
      @add="handleAddReglement"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <CompteCustomerTable
      :debts="paginatedDebts"
      :loading="store.loading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredDebts.length"
      @view-history="handleViewHistory"
      @view-debts="handleViewDebts"
      @page-change="handlePageChange"
    />

    <CustomerReglementForm
      v-model:open="isPaymentFormOpen"
      :customer="selectedCustomer"
      :invoice="selectedInvoice"
      @success="handlePaymentSuccess"
    />

    <CustomerPaymentHistoryDialog
      v-model:open="isHistoryDialogOpen"
      :customer="historyCustomer"
    />

    <CustomerDebtsListDialog
      v-model:open="isDebtsListDialogOpen"
      :customer="debtsListCustomer"
      @pay-invoice="handlePayInvoice"
    />
  </div>
</template>
