import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Axios from '@/services/axios.service'

export interface VenteStatistique {
  reference: string
  designation: string
  ca: number // Chiffre d'affaires
  quantity?: number
  type?: 'product' | 'service' // Type de vente
}

export interface VenteFilters {
  date_from?: string
  date_to?: string
  product?: number | string
  category?: number | string
  store?: number | string
  group_by?: 'product' | 'category' | 'service'
  line_type?: 'product' | 'service' // Filtrer par type
}

export const useVentesStatistiquesStore = defineStore('ventesStatistiques', () => {
  // State
  const ventes = ref<VenteStatistique[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const categories = ref<Array<{ id: number; name: string }>>([])
  const products = ref<Array<{ id: number; name: string }>>([])
  const stores = ref<Array<{ id: number; name: string; code: string }>>([])

  // Computed
  const totalCA = computed(() => 
    ventes.value.reduce((sum, vente) => sum + Number(vente.ca), 0)
  )

  const totalVentes = computed(() => ventes.value.length)

  const moyenneCA = computed(() => 
    ventes.value.length > 0 ? totalCA.value / ventes.value.length : 0
  )

  const totalQuantite = computed(() => 
    ventes.value.reduce((sum, vente) => sum + Number(vente.quantity || 0), 0)
  )

  // Actions
  const fetchVentes = async (filters?: VenteFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      
      if (filters?.date_from) params.date_from = filters.date_from
      if (filters?.date_to) params.date_to = filters.date_to
      if (filters?.product) params.product = filters.product
      if (filters?.category) params.category = filters.category
      if (filters?.store) params.store = filters.store
      if (filters?.group_by) params.group_by = filters.group_by
      if (filters?.line_type) params.line_type = filters.line_type

      const response = await Axios.get('/sales/sales/stats/', { params })
      ventes.value = response.data
    } catch (err) {
      error.value = 'Erreur lors de la récupération des statistiques'
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await Axios.get('/products/categories/')
      categories.value = response.data.results || response.data
    } catch (err) {
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await Axios.get('/products/products/', { params: { page_size: 1000 } })
      products.value = response.data.results || response.data
    } catch (err) {
    }
  }

  const fetchStores = async () => {
    try {
      const response = await Axios.get('/cashbox/stores/')
      stores.value = response.data.results || response.data
    } catch (err) {
    }
  }

  const exportExcel = async (filters?: VenteFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      
      if (filters?.date_from) params.date_from = filters.date_from
      if (filters?.date_to) params.date_to = filters.date_to
      if (filters?.product) params.product = filters.product
      if (filters?.category) params.category = filters.category
      if (filters?.store) params.store = filters.store
      if (filters?.group_by) params.group_by = filters.group_by
      if (filters?.line_type) params.line_type = filters.line_type

      const response = await Axios.get('/sales/sales/export_statistics_excel/', {
        params,
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `statistiques_ventes_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'Erreur lors de l\'export Excel'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportPdf = async (filters?: VenteFilters) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      
      if (filters?.date_from) params.date_from = filters.date_from
      if (filters?.date_to) params.date_to = filters.date_to
      if (filters?.product) params.product = filters.product
      if (filters?.category) params.category = filters.category
      if (filters?.store) params.store = filters.store
      if (filters?.group_by) params.group_by = filters.group_by
      if (filters?.line_type) params.line_type = filters.line_type

      const response = await Axios.get('/sales/sales/export_statistics_pdf/', {
        params,
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `statistiques_ventes_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = 'Erreur lors de l\'export PDF'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    ventes,
    loading,
    error,
    categories,
    products,
    stores,
    totalCA,
    totalVentes,
    moyenneCA,
    totalQuantite,
    fetchVentes,
    fetchCategories,
    fetchProducts,
    fetchStores,
    exportExcel,
    exportPdf
  }
})
