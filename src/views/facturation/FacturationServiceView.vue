<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFacturationsStore } from '@/stores/facturations'
import FacturationSearchBar from '@/components/facturation/FacturationSearchBar.vue'
import FacturationTable from '@/components/facturation/FacturationTable.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const facturationsStore = useFacturationsStore()

const searchQuery = ref('')
const startDate = ref<Date | undefined>()
const endDate = ref<Date | undefined>()

onMounted(() => {
  facturationsStore.fetchFacturations()
})

// Filtered facturations based on search and date range
const filteredFacturations = computed(() => {
  let result = facturationsStore.facturationsServices

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (f) =>
        f.intitule.toLowerCase().includes(query) ||
        f.client.toLowerCase().includes(query) ||
        f.montantFacture.toString().includes(query)
    )
  }

  if (startDate.value || endDate.value) {
    result = result.filter((f) => {
      const factDate = new Date(f.dateVente)
      if (startDate.value && factDate < startDate.value) return false
      if (endDate.value && factDate > endDate.value) return false
      return true
    })
  }

  return result
})

function handleSearch(query: string) {
  searchQuery.value = query
}

function handleDateRangeChange(start: Date | undefined, end: Date | undefined) {
  startDate.value = start
  endDate.value = end
}

function handleGenerateInvoice(id: number) {
  console.log('Générer facture:', id)
  // TODO: Implement invoice generation
}

function handleViewDetails(id: number) {
  console.log('Consulter détails:', id)
  // TODO: Implement view details
}

function handleExportAll() {
  console.log('Export all facturations service')
  // TODO: Implement export all
}

function handleNew() {
  console.log('New facturation service')
  // TODO: Implement new facturation
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 bg-[#F5F6FA] min-h-screen">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/facturation/service">Facturation</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Service</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-[32px] font-bold text-[#003FD8] font-inter leading-[38.73px] tracking-[-0.01em]">
        Facturations
      </h1>
      <p class="text-[20px] font-normal text-[#85878D] font-inter leading-[24.2px]">
        Vos operation de vente
      </p>
    </div>

    <!-- Search Bar -->
    <FacturationSearchBar
      :on-export="handleExportAll"
      :on-new="handleNew"
      @search="handleSearch"
      @date-range-change="handleDateRangeChange"
    />

    <!-- Table -->
    <FacturationTable
      :facturations="filteredFacturations"
      @generate-invoice="handleGenerateInvoice"
      @view-details="handleViewDetails"
    />
  </div>
</template>
