<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

// Période sélectionnée
const selectedPeriod = ref<'week' | 'month' | 'year'>('week')

// Options de période
const periodOptions = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' }
]

// Fonction pour changer la période
const changePeriod = async (period: 'week' | 'month' | 'year') => {
  selectedPeriod.value = period
  await dashboardStore.fetchSalesChart(period)
}

interface ChartData {
  date: string
  sales: number
  expenses: number
}

// Transformer les données du backend pour le graphique
const chartData = computed<ChartData[]>(() => {
  const salesData = dashboardStore.salesChart
  const financialSummary = dashboardStore.financialSummary
  const totalExpensesAmount = financialSummary?.expenses.this_month || 0

  // Créer un tableau complet selon la période
  const today = new Date()
  let periodsCount = 7
  let dateGenerator: (index: number) => Date

  if (selectedPeriod.value === 'week') {
    periodsCount = 7
    dateGenerator = (index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      return date
    }
  } else if (selectedPeriod.value === 'month') {
    periodsCount = 30
    dateGenerator = (index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (29 - index))
      return date
    }
  } else { // year
    periodsCount = 12
    dateGenerator = (index) => {
      const date = new Date(today)
      date.setMonth(today.getMonth() - (11 - index))
      return date
    }
  }

  // Créer une map des données existantes
  const salesMap = new Map<string, number>()
  salesData.forEach(item => {
    const dateKey = new Date(item.period).toISOString().split('T')[0]
    salesMap.set(dateKey, item.total_amount)
  })

  // Calculer le total des ventes pour la répartition des dépenses
  const totalSalesAmount = Array.from(salesMap.values()).reduce((sum, val) => sum + val, 0)

  // Générer le tableau complet avec tous les points
  const result: ChartData[] = []
  for (let i = 0; i < periodsCount; i++) {
    const periodDate = dateGenerator(i)
    const dateKey = periodDate.toISOString().split('T')[0]
    const salesAmount = salesMap.get(dateKey) || 0

    // Répartir les dépenses proportionnellement au CA
    const expenseRatio = totalSalesAmount > 0 ? salesAmount / totalSalesAmount : 0
    const expenses = totalExpensesAmount * expenseRatio

    result.push({
      date: formatMonth(periodDate.toISOString()),
      sales: salesAmount,
      expenses
    })
  }

  return result
})

// Formater la date en fonction de la période
const formatMonth = (dateString: string): string => {
  const date = new Date(dateString)

  switch (selectedPeriod.value) {
    case 'week':
      // Format: "Lun", "Mar", "Mer", etc.
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      return days[date.getDay()]
    case 'month':
      // Format: "1", "2", "3"... "31" (jour du mois)
      return date.getDate().toString()
    case 'year':
      // Format: "Jan", "Fév", "Mars", etc.
      const months = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
      return months[date.getMonth()]
    default:
      return date.toLocaleDateString('fr-FR', { month: 'short' })
  }
}

// Fonction pour obtenir le numéro de semaine
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Calcul des statistiques totales
const totalSales = computed(() => {
  return chartData.value.reduce((sum, d) => sum + d.sales, 0)
})

const totalExpenses = computed(() => {
  // Utiliser directement les vraies dépenses du financial summary
  const financialSummary = dashboardStore.financialSummary
  return financialSummary?.expenses?.this_month || 0
})

// Calcul des points pour les courbes
const maxValue = computed(() => {
  if (chartData.value.length === 0) return 1
  const max = Math.max(
    ...chartData.value.map(d => Math.max(d.sales, d.expenses))
  )
  return max === 0 ? 1 : max
})

const chartHeight = 200
const chartWidth = 600
const padding = { top: 30, right: 20, bottom: 50, left: 60 }

// Calculs pour graphique à barres
const barWidth = computed(() => {
  if (chartData.value.length === 0) return 20
  const availableWidth = chartWidth - padding.left - padding.right
  const groupWidth = availableWidth / chartData.value.length
  return Math.min(groupWidth * 0.35, 30) // Largeur max de 30px
})

const groupSpacing = computed(() => {
  if (chartData.value.length === 0) return 0
  return (chartWidth - padding.left - padding.right) / chartData.value.length
})

const getBarHeight = (value: number): number => {
  if (maxValue.value === 0 || isNaN(value)) return 0
  return (value / maxValue.value) * (chartHeight - padding.top - padding.bottom)
}

const getBarX = (index: number, barIndex: number): number => {
  const groupCenter = padding.left + (index + 0.5) * groupSpacing.value
  const offset = barIndex === 0 ? -barWidth.value * 0.6 : barWidth.value * 0.6
  return groupCenter + offset - barWidth.value / 2
}

const getBarY = (value: number): number => {
  return chartHeight - padding.bottom - getBarHeight(value)
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value) + ' fcfa'
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-gray-800">Variation des Ventes & Dépenses</h3>
      <div class="flex items-center gap-4">
        <!-- Filtre de période -->
        <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <label class="text-xs font-medium text-gray-600">Période:</label>
          <select
            v-model="selectedPeriod"
            @change="changePeriod(selectedPeriod)"
            class="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option v-for="option in periodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Indicateur données réelles -->
        <div v-if="dashboardStore.salesChart.length > 0" class="text-xs text-indigo-600 flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span>Données réelles</span>
        </div>

        <!-- Légende -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span class="text-sm text-gray-600">Ventes</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-sm text-gray-600">Dépenses</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphique à barres -->
    <div class="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
      <svg :width="chartWidth" :height="chartHeight" class="w-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
        <!-- Grille horizontale avec labels -->
        <g v-for="i in 5" :key="i">
          <line
            :x1="padding.left"
            :y1="padding.top + (i - 1) * (chartHeight - padding.top - padding.bottom) / 4"
            :x2="chartWidth - padding.right"
            :y2="padding.top + (i - 1) * (chartHeight - padding.top - padding.bottom) / 4"
            stroke="#E5E7EB"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <!-- Labels de l'axe Y (ordonnée) -->
          <text
            :x="padding.left - 10"
            :y="padding.top + (i - 1) * (chartHeight - padding.top - padding.bottom) / 4 + 4"
            text-anchor="end"
            class="text-[10px] fill-gray-500 font-medium"
            style="font-family: Poppins"
          >
            {{ Math.round(maxValue * (5 - i) / 4).toLocaleString('fr-FR') }}
          </text>
        </g>

        <!-- Titre de l'axe Y -->
        <text
          :x="15"
          :y="chartHeight / 2"
          text-anchor="middle"
          transform="rotate(-90 15 100)"
          class="text-[11px] fill-gray-600 font-semibold"
          style="font-family: Poppins"
        >
          Montant (FCFA)
        </text>

        <!-- Barres pour chaque période -->
        <g v-for="(data, index) in chartData" :key="index">
          <!-- Barre Ventes (vert) -->
          <rect
            :x="getBarX(index, 0)"
            :y="getBarY(data.sales)"
            :width="barWidth"
            :height="getBarHeight(data.sales)"
            fill="url(#gradientGreen)"
            class="cursor-pointer hover:opacity-80 transition-opacity"
            rx="4"
          >
            <title>Ventes {{ data.date }}: {{ formatNumber(data.sales) }}</title>
          </rect>

          <!-- Barre Dépenses (rouge) -->
          <rect
            :x="getBarX(index, 1)"
            :y="getBarY(data.expenses)"
            :width="barWidth"
            :height="getBarHeight(data.expenses)"
            fill="url(#gradientRed)"
            class="cursor-pointer hover:opacity-80 transition-opacity"
            rx="4"
          >
            <title>Dépenses {{ data.date }}: {{ formatNumber(data.expenses) }}</title>
          </rect>

          <!-- Label de la période -->
          <text
            v-if="selectedPeriod === 'month' ? index % 3 === 0 : true"
            :x="padding.left + (index + 0.5) * groupSpacing"
            :y="chartHeight - 15"
            text-anchor="middle"
            class="text-xs fill-gray-700 font-medium"
            style="font-family: Poppins"
          >
            {{ data.date }}
          </text>
        </g>

        <!-- Gradients pour les barres -->
        <defs>
          <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="gradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#DC2626;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
      <div class="bg-emerald-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-600 mb-1">Total Ventes</p>
            <p class="text-lg font-bold text-emerald-600">{{ formatNumber(totalSales) }}</p>
          </div>
          <TrendingUp class="w-8 h-8 text-emerald-500" />
        </div>
      </div>
      <div class="bg-red-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-600 mb-1">Total Dépenses</p>
            <p class="text-lg font-bold text-red-600">{{ formatNumber(totalExpenses) }}</p>
          </div>
          <TrendingDown class="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>
  </div>
</template>
