<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, XCircle, Info } from 'lucide-vue-next'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

// Données du graphique depuis le backend
const ca = computed(() => {
  return dashboardStore.overview?.sales.this_month.amount || 0
})

const depenses = computed(() => {
  // Calculer les dépenses depuis le financial summary si disponible
  return dashboardStore.financialSummary?.expenses.this_month || 0
})

const total = computed(() => ca.value + depenses.value)

// Calcul des pourcentages pour le SVG
const caPercentage = computed(() => {
  if (total.value === 0) return 0
  return (ca.value / total.value) * 100
})
const depensesPercentage = computed(() => {
  if (total.value === 0) return 0
  return (depenses.value / total.value) * 100
})

// Calcul des angles pour le SVG (arc)
const caAngle = computed(() => (caPercentage.value / 100) * 360)
const depensesAngle = computed(() => (depensesPercentage.value / 100) * 360)

// Fonction pour convertir angle en coordonnées
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

// Fonction pour créer le path d'un arc
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num)
}
</script>

<template>
  <div class="w-full">
    <!-- En-tête avec titre -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">CA</h2>
        <Info class="w-4 h-4 text-gray-400" />
      </div>
      <!-- Indicateur données réelles -->
      <div v-if="dashboardStore.overview" class="text-xs text-emerald-600 flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span>Live</span>
      </div>
    </div>

    <div class="flex flex-col md:flex-row items-center justify-between gap-8">
      <!-- Graphique circulaire -->
      <div class="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          <!-- Cercle de fond -->
          <circle cx="100" cy="100" r="70" fill="none" stroke="#f3f4f6" stroke-width="16" />

          <!-- Arc vert (CA) - Afficher un cercle complet si 100% -->
          <template v-if="caPercentage >= 99.9">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#10B981" stroke-width="16" />
          </template>
          <template v-else-if="caAngle > 0">
            <path
              :d="describeArc(100, 100, 70, 0, caAngle)"
              fill="none"
              stroke="#10B981"
              stroke-width="16"
              stroke-linecap="round"
            />
          </template>

          <!-- Arc rouge (Dépenses) - Afficher un cercle complet si 100% -->
          <template v-if="depensesPercentage >= 99.9">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#EF4444" stroke-width="16" />
          </template>
          <template v-else-if="depensesAngle > 0">
            <path
              :d="describeArc(100, 100, 70, caAngle, caAngle + depensesAngle)"
              fill="none"
              stroke="#EF4444"
              stroke-width="16"
              stroke-linecap="round"
            />
          </template>
        </svg>

        <!-- Texte au centre -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <p class="text-xl font-bold text-gray-900">{{ formatNumber(total) }}</p>
          <p class="text-xs text-gray-500">fcfa</p>
        </div>
      </div>

      <!-- Légende -->
      <div class="flex flex-col gap-4">
        <!-- CA -->
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0" style="box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.35);">
            <TrendingUp class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">CA (Chiffre d'affaire)</p>
            <p class="text-base font-semibold text-gray-900">{{ formatNumber(ca) }} fcfa</p>
          </div>
        </div>

        <!-- Dépenses -->
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0" style="box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.35);">
            <XCircle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">Dépenses</p>
            <p class="text-base font-semibold text-gray-900">{{ formatNumber(depenses) }} fcfa</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
