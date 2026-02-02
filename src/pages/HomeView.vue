<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useUserStore } from '@/stores/user'
import { useStoresStore } from '@/stores/stores.store'
import { UserCircle, Store } from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import DashboardChart from '@/components/dashboard/DashboardChart.vue'
import StockPieChart from '@/components/dashboard/StockPieChart.vue'
import StockTable from '@/components/dashboard/StockTable.vue'

const dashboardStore = useDashboardStore()
const userStore = useUserStore()
const storesStore = useStoresStore()

const selectedStoreId = ref<number | string>('')

const userName = computed(() => {
  if (!userStore.user) return 'Administrateur'
  return userStore.user.first_name || userStore.user.username || 'Administrateur'
})

const userRole = computed(() => {
  if (!userStore.user?.role) return 'Utilisateur'
  // Gestion du role qui peut être soit un objet soit une string
  if (typeof userStore.user.role === 'string') {
    return userStore.user.role
  }
  return userStore.user.role.display_name || userStore.user.role.name || 'Utilisateur'
})

const handleStoreChange = async () => {
  const storeId = selectedStoreId.value === '' ? null : Number(selectedStoreId.value)
  dashboardStore.selectedStoreId = storeId
  await dashboardStore.fetchDashboardData(storeId)
}

onMounted(async () => {
  // Charger les stores
  await storesStore.fetchStores()
  // Charger les données du dashboard
  await dashboardStore.fetchDashboardData()
})
</script>

<template>
  <div class="flex-1 p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-[16.4px]">
    <!-- En-tête de bienvenue -->
    <div class="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-white mb-2" style="font-family: Trispace">
            Tableau de Bord
          </h1>
          <p class="text-sm sm:text-base text-indigo-100" style="font-family: Poppins">
            Bienvenue dans votre espace d'administration
          </p>
        </div>
        <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          <UserCircle class="w-8 h-8 text-white" />
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-white">{{ userName }}</p>
            <p class="text-xs text-indigo-200">{{ userRole }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtre par point de vente -->
    <div class="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div class="flex items-center gap-4">
        <Store class="w-5 h-5 text-indigo-600" />
        <label class="text-sm font-medium text-gray-700">Point de vente :</label>
        <select
          v-model="selectedStoreId"
          @change="handleStoreChange"
          class="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          <option value="">Tous les points de vente</option>
          <option
            v-for="store in storesStore.stores"
            :key="store.id"
            :value="store.id"
          >
            {{ store.name }} {{ store.code ? `(${store.code})` : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Message d'erreur si échec du chargement -->
    <div v-if="dashboardStore.error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
        <p class="text-sm text-red-700 mt-1">{{ dashboardStore.error }}</p>
      </div>
      <button @click="dashboardStore.fetchDashboardData()" class="flex-shrink-0 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
        Réessayer
      </button>
    </div>

    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
      <!-- Skeleton loader pendant le chargement -->
      <template v-if="dashboardStore.loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </template>

      <!-- Données réelles -->
      <template v-else>
        <StatCard
          v-for="stat in dashboardStore.stats"
          :key="stat.id"
          :stat="stat"
        />
      </template>
    </div>

    <!-- Section graphiques -->
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 lg:mb-10">
      <!-- Graphique principal -->
      <div class="w-full lg:flex-1">
        <!-- Loader -->
        <div v-if="dashboardStore.loading" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 shadow-lg border border-blue-100 h-64 flex items-center justify-center">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p class="text-sm text-gray-600">Chargement des produits...</p>
          </div>
        </div>
        <!-- Données réelles -->
        <DashboardChart v-else />
      </div>

      <!-- Diagramme circulaire avec bordure -->
      <div class="w-full lg:w-auto lg:min-w-[300px] xl:min-w-[400px]">
        <div class="border border-[rgba(130,130,130,0.15)] rounded-xl p-4 sm:p-6 lg:p-8">
          <!-- Loader -->
          <div v-if="dashboardStore.loading" class="flex items-center justify-center h-64">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
              <p class="text-sm text-gray-600">Chargement du CA...</p>
            </div>
          </div>
          <!-- Données réelles -->
          <StockPieChart v-else />
        </div>
      </div>
    </div>

    <!-- Tableau de stock -->
    <div class="mt-6 sm:mt-8 lg:mt-10">
      <!-- Loader -->
      <div v-if="dashboardStore.loading" class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-96 flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
          <p class="text-sm text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
      <!-- Données réelles -->
      <StockTable v-else />
    </div>
  </div>
</template>
