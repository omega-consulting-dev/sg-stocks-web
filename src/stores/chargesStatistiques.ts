import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Axios from '@/services/axios.service'

export interface ChargeStatistique {
  category_name?: string
  total_amount: number
  count: number
  description?: string
  expense_number?: string
  expense_date?: string
  beneficiary?: string
}

export interface ChargeFilters {
  date_from?: string
  date_to?: string
  category?: number
  group_by?: 'category' | 'expense'
}

export const useChargesStatistiquesStore = defineStore('chargesStatistiques', () => {
  const charges = ref<ChargeStatistique[]>([])
  const categories = ref<any[]>([])
  const loading = ref(false)

  const totalCharges = computed(() => charges.value.length)
  const totalMontant = computed(() =>
    charges.value.reduce((sum, charge) => sum + charge.total_amount, 0)
  )
  const moyenneMontant = computed(() =>
    totalCharges.value > 0 ? totalMontant.value / totalCharges.value : 0
  )
  const totalDepenses = computed(() =>
    charges.value.reduce((sum, charge) => sum + charge.count, 0)
  )

  const fetchCharges = async (filters: ChargeFilters = {}) => {
    loading.value = true
    try {
      const params = new URLSearchParams()

      if (filters.date_from) {
        params.append('date_from', filters.date_from)
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to)
      }
      if (filters.category) {
        params.append('category', String(filters.category))
      }
      if (filters.group_by) {
        params.append('group_by', filters.group_by)
      }

      const response = await Axios.get(`/expenses/expenses/stats/?${params.toString()}`)
      charges.value = response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des charges:', error)
      charges.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await Axios.get('/expenses/categories/')
      categories.value = response.data.results || response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      categories.value = []
    }
  }

  const exportExcel = async (filters: ChargeFilters = {}) => {
    try {
      const params = new URLSearchParams()

      if (filters.date_from) {
        params.append('date_from', filters.date_from)
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to)
      }
      if (filters.category) {
        params.append('category', String(filters.category))
      }
      if (filters.group_by) {
        params.append('group_by', filters.group_by)
      }

      const response = await Axios.get(`/expenses/expenses/stats/export_excel/?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `charges_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error)
      throw error
    }
  }

  const exportPdf = async (filters: ChargeFilters = {}) => {
    try {
      const params = new URLSearchParams()

      if (filters.date_from) {
        params.append('date_from', filters.date_from)
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to)
      }
      if (filters.category) {
        params.append('category', String(filters.category))
      }
      if (filters.group_by) {
        params.append('group_by', filters.group_by)
      }

      const response = await Axios.get(`/expenses/expenses/stats/export_pdf/?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `charges_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      throw error
    }
  }

  return {
    charges,
    categories,
    loading,
    totalCharges,
    totalMontant,
    moyenneMontant,
    totalDepenses,
    fetchCharges,
    fetchCategories,
    exportExcel,
    exportPdf
  }
})
