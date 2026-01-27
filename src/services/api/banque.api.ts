import Axios from '../axios.service'

export interface BankTransaction {
  id: number
  date: string
  type: 'depot' | 'retrait'
  amount: number
  description: string
  store_name: string
  balance_after: number
}

export interface BankTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BankTransaction[]
  balance: number
  total_deposits: number
  total_withdrawals: number
}

export interface CreateWithdrawalData {
  amount: number
  description: string
  store_id: number
}

export interface BankFilters {
  date_debut?: string
  date_fin?: string
  type?: string
  page?: number
}

export const getBankTransactions = async (filters?: BankFilters): Promise<BankTransactionsResponse> => {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.date_debut) params.append('date_debut', filters.date_debut)
    if (filters.date_fin) params.append('date_fin', filters.date_fin)
    if (filters.type && filters.type !== 'all') params.append('type', filters.type)
    if (filters.page) params.append('page', filters.page.toString())
  }

  const response = await Axios.get(`/cashbox/bank-transactions/?${params.toString()}`)
  return response.data
}

export const createBankWithdrawal = async (data: CreateWithdrawalData): Promise<BankTransaction> => {
  const response = await Axios.post('/cashbox/bank-transactions/withdraw/', data)
  return response.data
}

export const exportBankTransactionsPDF = async (filters?: BankFilters): Promise<void> => {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.date_debut) params.append('date_debut', filters.date_debut)
    if (filters.date_fin) params.append('date_fin', filters.date_fin)
    if (filters.type && filters.type !== 'all') params.append('type', filters.type)
  }

  const response = await Axios.get(`/cashbox/bank-transactions/export-pdf/?${params.toString()}`, {
    responseType: 'blob'
  })
  
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `transactions_bancaires_${new Date().toISOString().split('T')[0]}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const exportBankTransactionsExcel = async (filters?: BankFilters): Promise<void> => {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.date_debut) params.append('date_debut', filters.date_debut)
    if (filters.date_fin) params.append('date_fin', filters.date_fin)
    if (filters.type && filters.type !== 'all') params.append('type', filters.type)
  }

  const response = await Axios.get(`/cashbox/bank-transactions/export-excel/?${params.toString()}`, {
    responseType: 'blob'
  })
  
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `transactions_bancaires_${new Date().toISOString().split('T')[0]}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
