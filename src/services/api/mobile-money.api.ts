import Axios from '../axios.service'

export interface MobileMoneyTransaction {
  id: string
  date: string
  type: 'depot' | 'retrait'
  amount: number
  description: string
  store_name: string
  balance_after: number
}

export interface MobileMoneyTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: MobileMoneyTransaction[]
  balance: number
  total_deposits: number
  total_withdrawals: number
}

export interface MobileMoneyBalance {
  balance: number
}

export interface MobileMoneyFilters {
  date_debut?: string
  date_fin?: string
  type?: string
  page?: number
  store?: number
}

export interface CreateDepositData {
  amount: number
  description: string
  date?: string
  store_id?: number
}

export interface CreateWithdrawalData {
  amount: number
  description: string
  date?: string
  store_id?: number
}

const mobileMoneyApi = {
  /**
   * Récupérer le solde Mobile Money
   */
  async getBalance(storeId?: number): Promise<MobileMoneyBalance> {
    const params = storeId ? { store: storeId } : {}
    const response = await Axios.get('/cashbox/mobile-money/balance/', { params })
    return response.data
  },

  /**
   * Récupérer les transactions Mobile Money
   */
  async getTransactions(filters?: MobileMoneyFilters): Promise<MobileMoneyTransaction[]> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.date_debut) params.append('start_date', filters.date_debut)
      if (filters.date_fin) params.append('end_date', filters.date_fin)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.store) params.append('store', filters.store.toString())
    }

    const response = await Axios.get(`/cashbox/mobile-money/transactions/?${params.toString()}`)
    return response.data
  },

  /**
   * Créer un dépôt Mobile Money depuis la caisse
   */
  async createDeposit(data: CreateDepositData): Promise<MobileMoneyTransaction> {
    const params = data.store_id ? { store: data.store_id } : {}
    const response = await Axios.post('/cashbox/mobile-money/deposit/', {
      amount: data.amount,
      motif: data.description,
      date: data.date
    }, { params })
    return response.data
  },

  /**
   * Créer un retrait Mobile Money vers la caisse
   */
  async createWithdrawal(data: CreateWithdrawalData): Promise<MobileMoneyTransaction> {
    const params = data.store_id ? { store: data.store_id } : {}
    const response = await Axios.post('/cashbox/mobile-money/withdraw/', {
      amount: data.amount,
      description: data.description,
      date: data.date
    }, { params })
    return response.data
  },

  /**
   * Exporter les transactions Mobile Money en PDF
   */
  async exportPDF(filters?: MobileMoneyFilters): Promise<void> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.date_debut) params.append('start_date', filters.date_debut)
      if (filters.date_fin) params.append('end_date', filters.date_fin)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.store) params.append('store', filters.store.toString())
    }

    const response = await Axios.get(`/cashbox/mobile-money/export-pdf/?${params.toString()}`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_mobile_money_${new Date().toISOString().split('T')[0]}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * Exporter les transactions Mobile Money en Excel
   */
  async exportExcel(filters?: MobileMoneyFilters): Promise<void> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.date_debut) params.append('start_date', filters.date_debut)
      if (filters.date_fin) params.append('end_date', filters.date_fin)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.store) params.append('store', filters.store.toString())
    }

    const response = await Axios.get(`/cashbox/mobile-money/export-excel/?${params.toString()}`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions_mobile_money_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}

export default mobileMoneyApi
