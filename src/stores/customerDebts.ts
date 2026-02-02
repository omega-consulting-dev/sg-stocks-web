import { defineStore } from 'pinia'
import { ref } from 'vue'
import Axios from '@/services/axios.service'

export interface CustomerDebt {
  id: number
  customer_code: string
  name: string
  email?: string
  phone?: string
  total_invoiced: number
  total_paid: number
  balance: number
  user_id: number | null
}

export interface CustomerPayment {
  id: number
  payment_number: string
  invoice_number: string
  payment_date: string
  amount: number
  payment_method: string
  payment_method_display: string
  status?: string
  status_display?: string
  reference?: string
  notes?: string
}

export interface CustomerInvoice {
  id: number
  invoice_number: string
  invoice_date: string
  total_amount: number
  paid_amount: number
  balance_due: number
  status: string
}

export const useCustomerDebtsStore = defineStore('customerDebts', () => {
  const debts = ref<CustomerDebt[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Récupérer les dettes clients
  async function fetchDebts(force = false) {
    // Éviter les appels multiples simultanés (sauf si force=true)
    if (loading.value && !force) return

    loading.value = true
    error.value = null
    try {
      // Ajouter un timestamp pour éviter le cache
      const timestamp = new Date().getTime()
      const response = await Axios.get(`/customers/customers/debts/?_t=${timestamp}`)
      debts.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des dettes'
    } finally {
      loading.value = false
    }
  }

  // Récupérer l'historique des paiements d'un client
  async function fetchCustomerPayments(customerId: number): Promise<CustomerPayment[]> {
    try {
      const response = await Axios.get(`/customers/customers/${customerId}/payment_history/`)
      // Trier par numéro de paiement (ordre croissant)
      const payments = response.data
      return payments.sort((a: CustomerPayment, b: CustomerPayment) => {
        return a.payment_number.localeCompare(b.payment_number, undefined, { numeric: true })
      })
    } catch (err: any) {
      throw err
    }
  }

  // Récupérer les factures impayées d'un client
  async function fetchCustomerInvoices(customerId: number): Promise<CustomerInvoice[]> {
    try {
      const response = await Axios.get(`/invoicing/invoices/?customer=${customerId}`)
      // Filtrer les factures avec balance_due > 0
      const invoices = response.data.results || response.data
      return invoices.filter((inv: CustomerInvoice) => inv.balance_due > 0)
    } catch (err: any) {
      throw err
    }
  }

  // Créer un paiement pour un client
  async function createPayment(customerId: number, paymentData: {
    invoice_id?: number
    amount: number
    payment_method: string
    payment_date?: string
    reference?: string
    notes?: string
  }) {
    try {
      const response = await Axios.post(
        `/customers/customers/${customerId}/create-payment/`,
        paymentData
      )

      // Attendre 1 seconde pour que le backend mette à jour les totaux
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Forcer le rafraîchissement complet des dettes
      debts.value = [] // Vider le cache
      loading.value = false // Reset loading
      await fetchDebts(true) // Force refresh avec timestamp

      return response.data
    } catch (err: any) {
      throw err
    }
  }

  return {
    debts,
    loading,
    error,
    fetchDebts,
    fetchCustomerPayments,
    fetchCustomerInvoices,
    createPayment,
  }
})
