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
  <div class="flex-1 p-[30px] bg-white rounded-[16.4px]">
    <!-- En-tête de bienvenue -->
    <div class="mb-[50px]">
      <h1 class="text-[48px] font-normal leading-[1em] text-[#0A1632] mb-[56px]" style="font-family: Trispace">
        Salut Dannielle, Bienvenue👌
      </h1>
      <p class="text-[20px] font-normal leading-[1.4em] text-[#4B5563]" style="font-family: Poppins">
        Manipule vos données avec soins et faciliter.
      </p>
    </div>

    <!-- Cartes statistiques -->
    <div class="flex gap-[23px] mb-[29px]">
      <StatCard
        v-for="stat in store.stats"
        :key="stat.id"
        :stat="stat"
      />
    </div>

    <!-- Section graphiques -->
    <div class="flex gap-[46px] mb-[42px]">
      <!-- Graphique principal -->
      <DashboardChart />

      <!-- Diagramme circulaire avec bordure -->
      <div class="relative">
        <div class="absolute inset-0 border border-[rgba(130,130,130,0.15)] rounded-[12px] w-[443px] h-[298px]"></div>
        <div class="pt-[43px] pl-[121px]">
          <StockPieChart />
        </div>
      </div>
    </div>

    <!-- Tableau de stock -->
    <div class="mt-[42px]">
      <StockTable :items="store.stockItems" />
    </div>
  </div>
</template>
