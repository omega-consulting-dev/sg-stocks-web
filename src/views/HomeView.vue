<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import StockPieChart from '@/components/dashboard/StockPieChart.vue'
import StockTable from '@/components/dashboard/StockTable.vue'

const store = useDashboardStore()

onMounted(() => {
  store.fetchDashboardData()
})
</script>

<template>
  <div class="flex-1 p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-[16.4px]">
    <!-- En-tête de bienvenue -->
    <div class="mb-6 sm:mb-8 lg:mb-12">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl xl:text-[48px] font-normal leading-tight text-[#0A1632] mb-3 sm:mb-4 lg:mb-6" style="font-family: Trispace">
        Salut Dannielle, Bienvenue
      </h1>
      <p class="text-sm sm:text-base lg:text-xl font-normal leading-relaxed text-[#4B5563]" style="font-family: Poppins">
        Manipule vos données avec soins et faciliter.
      </p>
    </div>

    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
      <StatCard
        v-for="stat in store.stats"
        :key="stat.id"
        :stat="stat"
      />
    </div>

    <!-- Section graphiques -->
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 lg:mb-10">
      <!-- Graphique principal -->
      <div class="w-full lg:flex-1">
        <DashboardChart />
      </div>

      <!-- Diagramme circulaire avec bordure -->
      <div class="w-full lg:w-auto lg:min-w-[300px] xl:min-w-[400px]">
        <div class="border border-[rgba(130,130,130,0.15)] rounded-xl p-4 sm:p-6 lg:p-8">
          <StockPieChart />
        </div>
      </div>
    </div>

    <!-- Tableau de stock -->
    <div class="mt-6 sm:mt-8 lg:mt-10 overflow-x-auto">
      <StockTable :items="store.stockItems" />
    </div>
  </div>
</template>
