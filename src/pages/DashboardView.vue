<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
        Hello {{ userName }},
        Bienvenue<span class="inline-block ml-1">👋</span>
      </h1>
      <p class="text-sm md:text-base text-gray-600">Manipule tes données avec soine</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <!-- Total Dépenses -->
      <div class="border-2 border-green-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative rounded-xl p-4 md:p-6">
        <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="flex items-start justify-between mb-4 relative">
          <div>
            <p class="text-xs md:text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">Total dépenses</p>
            <h3 class="text-xl md:text-2xl lg:text-4xl font-extrabold text-green-700 group-hover:text-green-800 transition-colors">{{ formatNumber(stats.totalExpenses) }} <span class="text-base md:text-lg font-normal">fcfa</span></h3>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 p-3 md:p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs md:text-sm text-red-600 relative font-medium">-{{ stats.expensesChange }}% dépense en excès</p>
      </div>

      <!-- Chiffre d'affaire -->
      <div class="border-2 border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative rounded-xl p-4 md:p-6">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="flex items-start justify-between mb-4 relative">
          <div>
            <p class="text-xs md:text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">Chiffre d'affaire</p>
            <h3 class="text-xl md:text-2xl lg:text-4xl font-extrabold text-blue-700 group-hover:text-blue-800 transition-colors">{{ formatNumber(stats.revenue) }} <span class="text-base md:text-lg font-normal">fcfa</span></h3>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs md:text-sm text-gray-600 relative font-medium">en baisse</p>
      </div>

      <!-- Client -->
      <div class="border-2 border-pink-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative rounded-xl p-4 md:p-6">
        <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="flex items-start justify-between mb-4 relative">
          <div>
            <p class="text-xs md:text-sm font-semibold text-pink-600 mb-2 uppercase tracking-wide">Client</p>
            <h3 class="text-xl md:text-2xl lg:text-4xl font-extrabold text-pink-700 group-hover:text-pink-800 transition-colors">{{ formatNumber(stats.clients) }}</h3>
          </div>
          <div class="bg-gradient-to-br from-pink-500 to-pink-600 p-3 md:p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs md:text-sm text-green-600 relative font-medium">+{{ stats.clientsChange }}% en hausse</p>
      </div>

      <!-- Fournisseurs -->
      <div class="border-2 border-orange-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative rounded-xl p-4 md:p-6">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="flex items-start justify-between mb-4 relative">
          <div>
            <p class="text-xs md:text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">Fournisseurs</p>
            <h3 class="text-xl md:text-2xl lg:text-4xl font-extrabold text-orange-700 group-hover:text-orange-800 transition-colors">{{ formatNumber(stats.suppliers) }}</h3>
          </div>
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-3 md:p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs md:text-sm text-red-600 relative font-medium">-{{ stats.suppliersChange }}% de baisse</p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      <!-- Charges Section -->
      <div class="lg:col-span-1 bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-4">Charge</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Code</th>
                <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">date</th>
                <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 hidden sm:table-cell">Motif</th>
                <th class="text-right py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">montant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="charge in charges" :key="charge.code" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900">{{ charge.code }}</td>
                <td class="py-2 md:py-3 text-xs md:text-sm text-gray-600">{{ charge.date }}</td>
                <td class="py-2 md:py-3 text-xs md:text-sm text-gray-600 hidden sm:table-cell">{{ charge.motif }}</td>
                <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900 text-right font-medium">{{ formatNumber(charge.montant) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CA Chart Section -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg md:text-xl font-bold text-gray-900">CA</h2>
          <button class="text-xs md:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <!-- Donut Chart -->
          <div class="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
            <svg viewBox="0 0 200 200" class="transform -rotate-90">
              <!-- Background circle -->
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" stroke-width="30"></circle>
              <!-- Green arc (CA) -->
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                stroke-width="30"
                :stroke-dasharray="`${caPercentage * 5.02} 502`"
                stroke-linecap="round"
              ></circle>
              <!-- Red arc (Dépenses) -->
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#ef4444"
                stroke-width="30"
                :stroke-dasharray="`${expensesPercentage * 5.02} 502`"
                :stroke-dashoffset="`-${caPercentage * 5.02}`"
                stroke-linecap="round"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{{ formatNumber(stats.totalCA) }}</p>
              <p class="text-xs md:text-sm text-gray-600">fcfa</p>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-3 md:space-y-4">
            <div class="flex items-center gap-3">
              <div class="bg-green-500 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs md:text-sm text-gray-600">CA (chiffre d'affaire)</p>
                <p class="text-sm md:text-base lg:text-lg font-bold text-gray-900">{{ formatNumber(chartData.ca) }} fcfa</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="bg-red-500 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs md:text-sm text-gray-600">Dépenses</p>
                <p class="text-sm md:text-base lg:text-lg font-bold text-gray-900">{{ formatNumber(chartData.expenses) }} fcfa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Section -->
    <div class="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-4">Stock</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Code</th>
              <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Image</th>
              <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Product Name</th>
              <th class="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 hidden sm:table-cell">Category</th>
              <th class="text-right py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Stock</th>
              <th class="text-right py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.code" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900">{{ product.code }}</td>
              <td class="py-2 md:py-3">
                <div class="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                  <span v-else class="text-xl md:text-2xl">👕</span>
                </div>
              </td>
              <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900 font-medium">{{ product.name }}</td>
              <td class="py-2 md:py-3 text-xs md:text-sm text-gray-600 hidden sm:table-cell">{{ product.category }}</td>
              <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900 text-right">{{ product.stock }}</td>
              <td class="py-2 md:py-3 text-xs md:text-sm text-gray-900 text-right font-medium">{{ formatCurrency(product.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

// User name
const userName = computed(() => authStore.user?.first_name || 'Utilisateur')

// Statistics computed from real API data
const stats = computed(() => {
  const overview = dashboardStore.overview
  if (!overview) {
    return {
      totalExpenses: 0,
      expensesChange: 0,
      revenue: 0,
      clients: 0,
      clientsChange: 0,
      suppliers: 0,
      suppliersChange: 0,
      totalCA: 0
    }
  }

  return {
    totalExpenses: 0, // À implémenter si besoin
    expensesChange: 0,
    revenue: overview.sales.this_year.amount,
    clients: overview.customers.total,
    clientsChange: overview.customers.new_this_month,
    suppliers: 0, // À implémenter si besoin
    suppliersChange: 0,
    totalCA: overview.sales.this_year.amount
  }
})

// Charges data
const charges = ref([
  { code: '1', date: 'May 25, 2023', motif: 'Om probatan soo', montant: 10000 },
  { code: '2', date: 'Jun 20, 2023', motif: 'Nelison morolo', montant: 7500 },
  { code: '3', date: 'July 13, 2023', motif: 'Towesby priya', montant: 200 },
  { code: '4', date: 'Dec 26, 2023', motif: 'Messe hamney', montant: 10000 },
  { code: '5', date: 'Mar 15, 2024', motif: 'Sakumor nao', montant: 10000 }
])

// Chart data
const chartData = ref({
  ca: 3124213,
  expenses: 1823181
})

// Products data
const products = ref([
  { code: '281', image: null, name: 'Classic Polo Shirt', category: 'Classic Polo Shirt', stock: 384, price: 508.99 },
  { code: '150', image: null, name: 'Classic Polo Shirt', category: 'Fiore Summer Dress', stock: 101, price: 539.99 },
  { code: '210', image: null, name: 'Classic Polo Shirt', category: 'Slim Fit Jeans', stock: 320, price: 649.99 },
  { code: '340', image: null, name: 'Classic Polo Shirt', category: 'Polo T-Shirt', stock: 420, price: 587.99 }
])

// Computed values for chart
const caPercentage = computed(() => {
  const total = chartData.value.ca + chartData.value.expenses
  return (chartData.value.ca / total) * 100
})

const expensesPercentage = computed(() => {
  const total = chartData.value.ca + chartData.value.expenses
  return (chartData.value.expenses / total) * 100
})

// Utility functions
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num).replace('XOF', 'fcfa')
}

// Load data on mount
onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})
</script>

<style scoped>
/* Custom scrollbar for tables */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
