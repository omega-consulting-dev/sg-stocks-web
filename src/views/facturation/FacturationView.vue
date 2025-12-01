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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const facturationsStore = useFacturationsStore()

const searchQuery = ref('')
const startDate = ref<Date | undefined>()
const endDate = ref<Date | undefined>()
const activeTab = ref('produit')

onMounted(() => {
  facturationsStore.fetchFacturations()
})

// Filtered facturations based on search and date range
const filteredFacturationsProduits = computed(() => {
  let result = facturationsStore.facturationsProduits

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

const filteredFacturationsServices = computed(() => {
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

function handleExportPdf(id: number) {
  console.log('Export PDF:', id)
  // TODO: Implement PDF export
}

function handleExportExcel(id: number) {
  console.log('Export Excel:', id)
  // TODO: Implement Excel export
}

function handleExportCsv(id: number) {
  console.log('Export CSV:', id)
  // TODO: Implement CSV export
}

function handleExportAll() {
  console.log('Export all facturations')
  // TODO: Implement export all
}

function handleNew() {
  console.log('New facturation')
  // TODO: Implement new facturation
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Facturations</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-2xl sm:text-[32px] font-bold text-[#003FD8] font-inter tracking-[-0.01em]">
        Facturations
      </h1>
      <p class="text-base sm:text-xl text-[#85878D] font-inter">Vos operation de vente</p>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" default-value="produit" class="w-full">
      <TabsList class="bg-transparent border-b border-gray-200 rounded-none h-auto p-0 gap-8">
        <TabsTrigger
          value="produit"
          class="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#003FD8] rounded-none pb-2 px-0 text-base font-semibold data-[state=active]:text-[#003FD8] text-[#0E1420] data-[state=active]:shadow-none"
        >
          Produit
        </TabsTrigger>
        <TabsTrigger
          value="service"
          class="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#003FD8] rounded-none pb-2 px-0 text-base font-semibold data-[state=active]:text-[#003FD8] text-[#0E1420] data-[state=active]:shadow-none"
        >
          Service
        </TabsTrigger>
      </TabsList>

      <!-- Produit Tab Content -->
      <TabsContent value="produit" class="mt-8 space-y-6">
        <FacturationSearchBar
          :on-export="handleExportAll"
          :on-new="handleNew"
          @search="handleSearch"
          @date-range-change="handleDateRangeChange"
        />

        <FacturationTable
          :facturations="filteredFacturationsProduits"
          @export-pdf="handleExportPdf"
          @export-excel="handleExportExcel"
          @export-csv="handleExportCsv"
        />
      </TabsContent>

      <!-- Service Tab Content -->
      <TabsContent value="service" class="mt-8 space-y-6">
        <FacturationSearchBar
          :on-export="handleExportAll"
          :on-new="handleNew"
          @search="handleSearch"
          @date-range-change="handleDateRangeChange"
        />

        <FacturationTable
          :facturations="filteredFacturationsServices"
          @export-pdf="handleExportPdf"
          @export-excel="handleExportExcel"
          @export-csv="handleExportCsv"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
