import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface StatCard {
  id: number
  title: string
  value: string
  percentage: string
  trend: 'up' | 'down'
  icon: string
  gradientColors: string[]
  iconColor: string
}

export interface StockItem {
  id: number
  code: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Données mock pour les cartes statistiques
  const stats = ref<StatCard[]>([
    {
      id: 1,
      title: 'Total depenses',
      value: '4425 fcfa',
      percentage: '-15% depense en exces',
      trend: 'down',
      icon: 'building',
      gradientColors: ['rgba(202, 241, 255, 1)', 'rgba(205, 244, 255, 1)'],
      iconColor: '#0F5FC2',
    },
    {
      id: 2,
      title: "Chiffre d'affaire",
      value: '4.424 fcfa',
      percentage: '-15% en baisse',
      trend: 'down',
      icon: 'money',
      gradientColors: ['rgba(220, 255, 236, 1)', 'rgba(215, 255, 234, 1)'],
      iconColor: '#2F3ECB',
    },
    {
      id: 3,
      title: 'Client',
      value: '1.236',
      percentage: '+17% en hausse',
      trend: 'up',
      icon: 'chart',
      gradientColors: ['rgba(255, 220, 220, 1)', 'rgba(255, 215, 215, 1)'],
      iconColor: '#0093CD',
    },
    {
      id: 4,
      title: 'Fournisseurs',
      value: '984',
      percentage: '-15% de baisses',
      trend: 'down',
      icon: 'users',
      gradientColors: ['rgba(255, 243, 220, 1)', 'rgba(255, 238, 215, 1)'],
      iconColor: '#141211',
    },
  ])

  // Données mock pour le tableau de stock
  const stockItems = ref<StockItem[]>([
    { id: 1, code: '150' },
    { id: 2, code: '210' },
    { id: 3, code: '340' },
  ])

  // Fonction pour charger les données
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Les données sont déjà définies dans les refs
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    stockItems,
    loading,
    error,
    fetchDashboardData,
  }
})
