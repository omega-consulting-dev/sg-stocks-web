import { ref } from 'vue'
import { defineStore } from 'pinia'
import { customersApi, type Customer } from '@/services/api/customers.api'

export type { Customer }

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCustomers = async () => {
    if (customers.value.length > 0) return // Cache

    loading.value = true
    error.value = null
    try {
      customers.value = await customersApi.fetchAll()
    } catch (e) {
      error.value = 'Erreur lors du chargement des clients'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const getCustomerById = (id: number) => {
    return customers.value.find((c) => c.id === id)
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomerById,
  }
})
