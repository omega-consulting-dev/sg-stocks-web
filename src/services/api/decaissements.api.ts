import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

export interface Decaissement {
  id: string
  code: string
  type: string
  date: string
  reference: string
  montant: number
  mode_paiement: string
  description: string
  created_at: string
}

export interface DecaissementsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Decaissement[]
}

export interface DecaissementsFilters {
  start_date?: string
  end_date?: string
  store?: number | string
  page?: number
  page_size?: number
}

export interface CreateDecaissementDto {
  amount: number
  payment_method: string
  reference?: string
  description: string
  notes?: string
  store_id: number
}

export const decaissementsApi = {
  async getDecaissements(filters: DecaissementsFilters = {}): Promise<DecaissementsResponse> {
    const response: AxiosResponse<DecaissementsResponse> = await Axios.get('/cashbox/decaissements/', {
      params: filters,
    })
    return response.data
  },

  async createDecaissement(data: CreateDecaissementDto): Promise<any> {
    try {
      // Récupérer la caisse du store
      const cashboxResponse: AxiosResponse<any> = await Axios.get('/cashbox/cashboxes/', {
        params: { store: data.store_id, is_active: true }
      })

      let cashboxId: number

      if (cashboxResponse.data.results && cashboxResponse.data.results.length > 0) {
        cashboxId = cashboxResponse.data.results[0].id
      } else {
        // Créer une caisse pour ce store si elle n'existe pas
        const timestamp = Date.now()
        const newCashbox: AxiosResponse<any> = await Axios.post('/cashbox/cashboxes/', {
          store: data.store_id,
          name: `Caisse principale`,
          code: `CASH-${data.store_id}-${timestamp}`,
          is_active: true
        })
        cashboxId = newCashbox.data.id
      }

      // Récupérer ou créer une session active pour cette caisse
      const sessionResponse: AxiosResponse<any> = await Axios.get('/cashbox/sessions/', {
        params: { cashbox: cashboxId, status: 'open' }
      })

      let sessionId: number

      if (sessionResponse.data.results && sessionResponse.data.results.length > 0) {
        sessionId = sessionResponse.data.results[0].id
      } else {
        // Créer une session si elle n'existe pas
        const newSession: AxiosResponse<any> = await Axios.post('/cashbox/sessions/open_session/', {
          cashbox: cashboxId,
          opening_balance: 0
        })
        sessionId = newSession.data.id
      }

      const movementData = {
        movement_type: 'out',
        category: 'bank_deposit',
        amount: data.amount,
        payment_method: data.payment_method,
        reference: data.reference || '',
        description: data.description || 'Approvisionnement bancaire',
        notes: data.notes || '',
        cashbox_session: sessionId
      }

      console.log('Movement data being sent:', movementData)

      const response: AxiosResponse<any> = await Axios.post('/cashbox/movements/', movementData)
      return response.data
    } catch (error: any) {
      console.error('Error creating decaissement:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async exportToExcel(filters: DecaissementsFilters = {}): Promise<Blob> {
    const response: AxiosResponse<Blob> = await Axios.get('/cashbox/decaissements/export/', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },
}
