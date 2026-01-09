import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { analyticsApi } from '@/services/api/analytics.api'
import { DollarSign, TrendingUp, Users, Building2 } from 'lucide-vue-next'
import type {
  DashboardOverview,
  SalesChartData,
  TopProduct,
  TopCustomer,
  CashFlowData,
  InventoryValue,
  FinancialSummary
} from '@/services/api/analytics.api'

export interface StatCard {
  id: number
  title: string
  value: string
  percentage: string
  trend: 'up' | 'down'
  iconComponent: any
  bgColor: string
  iconColor: string
}

export interface StockItem {
  id: number
  code: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Dashboard data
  const overview = ref<DashboardOverview | null>(null)
  const salesChart = ref<SalesChartData[]>([])
  const topProducts = ref<TopProduct[]>([])
  const topCustomers = ref<TopCustomer[]>([])
  const cashFlow = ref<CashFlowData[]>([])
  const inventoryValue = ref<InventoryValue[]>([])
  const financialSummary = ref<FinancialSummary | null>(null)

  // Computed stats cards from real data
  const stats = computed<StatCard[]>(() => {
    if (!overview.value) {
      return [
        {
          id: 1,
          title: 'Total dépenses',
          value: '0 fcfa',
          percentage: 'Chargement...',
          trend: 'down',
          iconComponent: DollarSign,
          bgColor: '#DCFFF4',
          iconColor: '#10B981',
        },
        {
          id: 2,
          title: "Chiffre d'affaire",
          value: '0 fcfa',
          percentage: 'Chargement...',
          trend: 'up',
          iconComponent: TrendingUp,
          bgColor: '#D1FAE5',
          iconColor: '#059669',
        },
        {
          id: 3,
          title: 'Clients',
          value: '0',
          percentage: 'Chargement...',
          trend: 'up',
          iconComponent: Users,
          bgColor: '#FEE2E2',
          iconColor: '#DC2626',
        },
        {
          id: 4,
          title: 'Caisse',
          value: '0 fcfa',
          percentage: 'Solde actuel',
          trend: 'up',
          iconComponent: Building2,
          bgColor: '#FEF3C7',
          iconColor: '#F59E0B',
        },
      ]
    }

    const data = overview.value
    const salesThisMonth = data.sales.this_month.amount
    const customersTotal = data.customers.total
    const cashBalance = data.cash.balance

    return [
      {
        id: 1,
        title: 'Ventes du Mois',
        value: formatCurrency(salesThisMonth),
        percentage: `${data.sales.this_month.count} ventes`,
        trend: 'up',
        iconComponent: DollarSign,
        bgColor: '#DCFFF4',
        iconColor: '#10B981',
      },
      {
        id: 2,
        title: "Chiffre d'affaire Annuel",
        value: formatCurrency(data.sales.this_year.amount),
        percentage: `${data.sales.this_year.count} ventes`,
        trend: 'up',
        iconComponent: TrendingUp,
        bgColor: '#D1FAE5',
        iconColor: '#059669',
      },
      {
        id: 3,
        title: 'Clients',
        value: customersTotal.toString(),
        percentage: `+${data.customers.new_this_month} ce mois`,
        trend: 'up',
        iconComponent: Users,
        bgColor: '#FEE2E2',
        iconColor: '#DC2626',
      },
      {
        id: 4,
        title: 'Montant en Caisse',
        value: formatCurrency(cashBalance),
        percentage: 'Solde actuel',
        trend: cashBalance >= 0 ? 'up' : 'down',
        iconComponent: Building2,
        bgColor: '#FEF3C7',
        iconColor: '#F59E0B',
      },
    ]
  })

  // Stock items (mock for now, can be replaced with real data)
  const stockItems = ref<StockItem[]>([
    { id: 1, code: '150' },
    { id: 2, code: '210' },
    { id: 3, code: '340' },
  ])

  // Helper to format currency
  function formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} fcfa`
  }

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null

    try {
      // Fetch overview data
      overview.value = await analyticsApi.getOverview()

      // Fetch additional data with individual error handling
      const results = await Promise.allSettled([
        analyticsApi.getSalesChart('week'),
        analyticsApi.getTopProducts(10),
        analyticsApi.getTopCustomers(10),
        analyticsApi.getCashFlow(30),
        analyticsApi.getInventoryValue(),
        analyticsApi.getFinancialSummary()
      ])

      // Extract successful results
      if (results[0].status === 'fulfilled') {
        salesChart.value = results[0].value
      } else {
        console.error('Error fetching sales chart:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        topProducts.value = results[1].value
        console.log('Top products loaded:', results[1].value)
      } else {
        console.error('Error fetching top products:', results[1].reason)
      }

      if (results[2].status === 'fulfilled') {
        topCustomers.value = results[2].value
      } else {
        console.error('Error fetching top customers:', results[2].reason)
        // Ne pas bloquer si top_customers échoue
      }

      if (results[3].status === 'fulfilled') {
        cashFlow.value = results[3].value
      } else {
        console.error('Error fetching cash flow:', results[3].reason)
      }

      if (results[4].status === 'fulfilled') {
        inventoryValue.value = results[4].value
      } else {
        console.error('Error fetching inventory value:', results[4].reason)
      }

      if (results[5].status === 'fulfilled') {
        financialSummary.value = results[5].value
      } else {
        console.error('Error fetching financial summary:', results[5].reason)
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching dashboard data:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch sales chart with specific period
  const fetchSalesChart = async (period: 'day' | 'week' | 'month' | 'year') => {
    try {
      salesChart.value = await analyticsApi.getSalesChart(period)
    } catch (err) {
      console.error('Error fetching sales chart:', err)
    }
  }

  return {
    // State
    loading,
    error,
    overview,
    salesChart,
    topProducts,
    topCustomers,
    cashFlow,
    inventoryValue,
    financialSummary,

    // Computed
    stats,
    stockItems,

    // Actions
    fetchDashboardData,
    fetchSalesChart,
  }
})
