import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { InvoiceServices } from '@/services'
import type { Invoice } from '@/types/invoice.types'

export interface Facturation {
  id: number
  intitule: string
  dateVente: string
  client: string
  produits?: string
  quantite: number
  montantFacture: number
  type: 'produit' | 'service'
  createdAt: string
  updatedAt: string
}

export const useFacturationsStore = defineStore('facturations', () => {
  const facturations = ref<Facturation[]>([])
  const invoices = ref<Invoice[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mapper Invoice vers Facturation pour compatibilité
  function mapInvoiceToFacturation(invoice: Invoice): Facturation {
    // Utiliser total_items si disponible, sinon calculer depuis les lignes
    const totalQuantity = invoice.total_items !== undefined
      ? Number(invoice.total_items)
      : invoice.lines?.reduce((sum, line) => sum + Number(line.quantity), 0) || 0

    // Déterminer le type en fonction de la première ligne
    const hasService = invoice.lines?.some(line => line.service !== undefined && line.service !== null)
    const type: 'produit' | 'service' = hasService ? 'service' : 'produit'

    // Extraire les noms de produits/services depuis les lignes
    const produits = invoice.lines
      ?.map(line => line.description || line.product_name || line.service_name)
      .filter(Boolean)
      .join(', ') || 'N/A'

    return {
      id: invoice.id,
      intitule: invoice.invoice_number,
      dateVente: invoice.invoice_date,
      client: invoice.customer_name,
      produits: produits,
      quantite: totalQuantity,
      montantFacture: Number(invoice.total_amount),
      type: type,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at || invoice.created_at
    }
  }

  // Computed properties
  const facturationsProduits = computed(() =>
    facturations.value.filter((f) => f.type === 'produit')
  )

  const facturationsServices = computed(() =>
    facturations.value.filter((f) => f.type === 'service')
  )

  const totalMontantProduits = computed(() =>
    facturationsProduits.value.reduce((sum, f) => sum + f.montantFacture, 0)
  )

  const totalMontantServices = computed(() =>
    facturationsServices.value.reduce((sum, f) => sum + f.montantFacture, 0)
  )

  const totalMontant = computed(() => totalMontantProduits.value + totalMontantServices.value)

  // Actions
  async function fetchFacturations() {
    loading.value = true
    error.value = null
    try {
      // Récupérer toutes les factures en gérant la pagination
      let allInvoices: Invoice[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await InvoiceServices.getInvoices({ page, page_size: 100 })
        allInvoices = [...allInvoices, ...response.data.results]

        // Vérifier s'il y a d'autres pages
        const totalCount = response.data.count
        hasMore = allInvoices.length < totalCount
        page++
      }

      invoices.value = allInvoices

      // Mapper les invoices vers le format Facturation
      facturations.value = invoices.value.map(mapInvoiceToFacturation)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
    } finally {
      loading.value = false
    }
  }

  async function addFacturation(facturation: Omit<Facturation, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      // TODO: Créer vraie facture via API
      // Pour l'instant, ajoute en local
      const newFacturation: Facturation = {
        ...facturation,
        id: Math.max(0, ...facturations.value.map((f) => f.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      facturations.value.push(newFacturation)
      return newFacturation
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateFacturation(id: number, data: Partial<Facturation>) {
    loading.value = true
    error.value = null
    try {
      await InvoiceServices.updateInvoice(id, {} as any)

      const index = facturations.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        facturations.value[index] = {
          ...facturations.value[index],
          ...data,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteFacturation(id: number) {
    loading.value = true
    error.value = null
    try {
      await InvoiceServices.deleteInvoice(id)

      const index = facturations.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        facturations.value.splice(index, 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Une erreur est survenue'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    facturations,
    invoices,
    facturationsProduits,
    facturationsServices,
    totalMontantProduits,
    totalMontantServices,
    totalMontant,
    loading,
    error,
    fetchFacturations,
    addFacturation,
    updateFacturation,
    deleteFacturation
  }
})
