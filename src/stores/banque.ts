import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as banqueApi from '@/services/api/banque.api'

export const useBanqueStore = defineStore('banque', () => {
  const transactions = ref<banqueApi.BankTransaction[]>([])
  const balance = ref(0)
  const totalDeposits = ref(0)
  const totalWithdrawals = ref(0)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const hasNext = ref(false)
  const hasPrevious = ref(false)
  const loading = ref(false)

  const fetchTransactions = async (filters?: banqueApi.BankFilters) => {
    loading.value = true
    try {
      const response = await banqueApi.getBankTransactions(filters)
      transactions.value = response.results
      balance.value = response.balance
      totalDeposits.value = response.total_deposits
      totalWithdrawals.value = response.total_withdrawals
      totalCount.value = response.count
      hasNext.value = !!response.next
      hasPrevious.value = !!response.previous
    } finally {
      loading.value = false
    }
  }

  const createWithdrawal = async (data: banqueApi.CreateWithdrawalData) => {
    await banqueApi.createBankWithdrawal(data)
    await fetchTransactions()
  }

  const createDeposit = async (data: banqueApi.CreateDepositData) => {
    await banqueApi.createBankDeposit(data)
    await fetchTransactions()
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

  const exportPDF = async (filters?: banqueApi.BankFilters) => {
    await banqueApi.exportBankTransactionsPDF(filters)
  }

  const exportExcel = async (filters?: banqueApi.BankFilters) => {
    await banqueApi.exportBankTransactionsExcel(filters)
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
    fetchTransactions,
    createWithdrawal,
    createDeposit,
    nextPage,
    previousPage,
    exportPDF,
    exportExcel
  }
})
