import { ref } from 'vue'
import { defineStore } from 'pinia'
import { customersApi, type Customer, type CreateCustomerData, type UpdateCustomerData, type CustomerFilters } from '@/services/api/customers.api'
import { customerAccountsApi, type CustomerDebt, type CustomerPayment, type CreateCustomerPaymentDto } from '@/services/api/customer-accounts.api'

export const useCustomersStore = defineStore('customers', () => {
  // State
  const customers = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)

  /**
   * Fetch all customers
   */
  const fetchCustomers = async (filters?: CustomerFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await customersApi.getCustomers(filters)
      customers.value = response.results
      totalCount.value = response.count
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des clients'
      console.error('Error fetching customers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch customer by ID
   */
  const fetchCustomer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const customer = await customersApi.getCustomer(id)
      currentCustomer.value = customer
      return customer
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement du client'
      console.error('Error fetching customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new customer
   */
  const createCustomer = async (data: CreateCustomerData) => {
    loading.value = true
    error.value = null

    try {
      const customer = await customersApi.createCustomer(data)
      customers.value.unshift(customer)
      totalCount.value++
      return customer
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création du client'
      console.error('Error creating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update customer
   */
  const updateCustomer = async (id: number, data: UpdateCustomerData) => {
    loading.value = true
    error.value = null

    try {
      const customer = await customersApi.updateCustomer(id, data)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = customer
      }
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = customer
      }
      return customer
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du client'
      console.error('Error updating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete customer (soft delete)
   */
  const deleteCustomer = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await customersApi.deleteCustomer(id)
      customers.value = customers.value.filter(c => c.id !== id)
      totalCount.value--
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression du client'
      console.error('Error deleting customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Export customers to Excel
   */
  const exportExcel = async (filters?: CustomerFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await customersApi.exportExcel(filters)

      // Créer un blob et télécharger
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clients_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'export Excel'
      console.error('Error exporting Excel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear current customer
   */
  const clearCurrentCustomer = () => {
    currentCustomer.value = null
  }

  // --- Customer Accounts (Debts & Payments) ---

  const debts = ref<CustomerDebt[]>([])
  const payments = ref<CustomerPayment[]>([])

  /**
   * Fetch customer debts
   */
  const fetchDebts = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await customerAccountsApi.getDebts()
      debts.value = data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des dettes'
      console.error('Error fetching debts:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch payment history for a customer
   */
  const fetchPaymentHistory = async (customerId: number) => {
    loading.value = true
    error.value = null

    try {
      const data = await customerAccountsApi.getPaymentHistory(customerId)
      payments.value = data
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique'
      console.error('Error fetching payment history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a payment for a customer
   */
  const createPayment = async (customerId: number, paymentData: CreateCustomerPaymentDto) => {
    loading.value = true
    error.value = null

    try {
      const result = await customerAccountsApi.createPayment(customerId, paymentData)
      // Refresh debts after payment
      await fetchDebts()
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création du paiement'
      console.error('Error creating payment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    customers,
    currentCustomer,
    loading,
    error,
    totalCount,
    currentPage,
    debts,
    payments,

    // Actions
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    exportExcel,
    clearCurrentCustomer,
    fetchDebts,
    fetchPaymentHistory,
    createPayment
  }
})
