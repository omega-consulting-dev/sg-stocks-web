import { defineStore } from 'pinia'
import { ref } from 'vue'
import mobileMoneyApi from '@/services/api/mobile-money.api'
import type { MobileMoneyFilters, MobileMoneyTransaction } from '@/services/api/mobile-money.api'

export const useMobileMoneyStore = defineStore('mobileMoney', () => {
  const transactions = ref<MobileMoneyTransaction[]>([])
  const balance = ref(0)
  const totalDeposits = ref(0)
  const totalWithdrawals = ref(0)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const hasNext = ref(false)
  const hasPrevious = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBalance = async (storeId?: number) => {
    try {
      error.value = null
      const response = await mobileMoneyApi.getBalance(storeId)
      balance.value = response.balance || 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la récupération du solde'
      balance.value = 0
    }
  }

  const fetchTransactions = async (filters?: MobileMoneyFilters) => {
    loading.value = true
    error.value = null
    try {
      const response = await mobileMoneyApi.getTransactions(filters)
      // L'API retourne un tableau simple, pas un objet paginé
      if (Array.isArray(response)) {
        transactions.value = response
        totalCount.value = response.length
      } else {
        // Si l'API est mise à jour pour retourner un objet paginé
        transactions.value = response.results || []
        totalCount.value = response.count || 0
        hasNext.value = !!response.next
        hasPrevious.value = !!response.previous
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la récupération des transactions'
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  const createDeposit = async (data: { amount: number; description: string; date?: string }) => {
    await mobileMoneyApi.createDeposit(data)
    await fetchTransactions()
    await fetchBalance()
  }

  const createWithdrawal = async (data: { amount: number; description: string; date?: string }) => {
    await mobileMoneyApi.createWithdrawal(data)
    await fetchTransactions()
    await fetchBalance()
  }

  const nextPage = async () => {
    if (hasNext.value) {
      currentPage.value++
      await fetchTransactions({ page: currentPage.value })
    }
  }

  const previousPage = async () => {
    if (hasPrevious.value) {
      currentPage.value--
      await fetchTransactions({ page: currentPage.value })
    }
  }

  const exportPDF = async (filters?: MobileMoneyFilters) => {
    await mobileMoneyApi.exportPDF(filters)
  }

  const exportExcel = async (filters?: MobileMoneyFilters) => {
    await mobileMoneyApi.exportExcel(filters)
  }

  return {
    transactions,
    balance,
    totalDeposits,
    totalWithdrawals,
    totalCount,
    currentPage,
    hasNext,
    hasPrevious,
    loading,
    error,
    fetchBalance,
    fetchTransactions,
    createDeposit,
    createWithdrawal,
    nextPage,
    previousPage,
    exportPDF,
    exportExcel
  }
})
