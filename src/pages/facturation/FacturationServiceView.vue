<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Trash2, Store } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales.store'
import { useServicesStore } from '@/stores/services'
import { useCustomersStore } from '@/stores/customers.store'
import { useStoresStore } from '@/stores/stores.store'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import FacturationSearchBar from '@/components/facturation/FacturationSearchBar.vue'
import FacturationTable from '@/components/facturation/FacturationTable.vue'
import FacturationServiceDetailDialog from '@/components/facturation/FacturationServiceDetailDialog.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import SearchableSelect from '@/components/ui/searchable-select.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceServices } from '@/services/invoices.service'
import type { SaleCreateData } from '@/services/sales.service'

const router = useRouter()
const salesStore = useSalesStore()
const servicesStore = useServicesStore()
const customersStore = useCustomersStore()
const storesStore = useStoresStore()

// Composable pour l'assignation de magasin
const { shouldShowStoreSelector, getDefaultStoreId, getDefaultStore } = useStoreAssignment()

const searchQuery = ref('')
const startDate = ref<Date | undefined>()
const endDate = ref<Date | undefined>()
const currentPage = ref(1)
const pageSize = ref(10)

// Modal state
const isModalOpen = ref(false)
const modalStep = ref(1)
const isSubmitting = ref(false)
const isDetailOpen = ref(false)
const selectedFactureId = ref<number | null>(null)
const isLoadingModal = ref(false)

// Line items for invoice
interface LineItem {
  id: string
  service: number
  serviceName: string
  quantity: number
  unitPrice: number
}

const lines = ref<LineItem[]>([])
const selectedService = ref('')
const selectedQuantity = ref(1)
const selectedStore = ref(getDefaultStoreId.value ? String(getDefaultStoreId.value) : '') // Magasin auto-assigné

// Form data for step 2
const formData = ref({
  customer: '',
  paymentMethod: 'cash',
  paymentTerm: 'immediate',
  amountPaid: 0,
  tax: 19.25,
  acompte: 0,
  notes: '',
  dueDate: ''
})

// Computed
const services = computed(() => servicesStore.services)
const customers = computed(() => customersStore.customers)
const stores = computed(() => storesStore.stores)

const subtotal = computed(() => {
  return Math.round(lines.value.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0) * 100) / 100
})

const taxAmount = computed(() => {
  return Math.round(subtotal.value * (formData.value.tax / 100) * 100) / 100
})

const totalAmount = computed(() => {
  return Math.round((subtotal.value + taxAmount.value - formData.value.acompte) * 100) / 100
})

const balanceDue = computed(() => {
  return Math.max(0, Math.round((totalAmount.value - formData.value.amountPaid) * 100) / 100)
})

const isCreditSale = computed(() => {
  return balanceDue.value > 0
})

onMounted(async () => {
  try {
    isLoadingModal.value = true
    await Promise.all([
      salesStore.fetchSales(),
      servicesStore.fetchServices(),
      customersStore.fetchCustomers(),
      storesStore.fetchStores()
    ])
  } catch (error: unknown) {
    console.error('Erreur lors du chargement des données:', error)
    const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
    alert(`Erreur lors du chargement des données: ${errorMsg}`)
  } finally {
    isLoadingModal.value = false
  }
})

// Filtered sales based on search and date range (filter only service sales)
const filteredFacturations = computed(() => {
  // Filter to get only service sales (lines with line_type='service')
  let result = salesStore.sales.filter(sale =>
    sale.lines && sale.lines.some(line => line.line_type === 'service')
  )

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.sale_number.toLowerCase().includes(query) ||
        s.customer.name.toLowerCase().includes(query) ||
        s.total_amount.toString().includes(query)
    )
  }

  if (startDate.value || endDate.value) {
    result = result.filter((s) => {
      const saleDate = new Date(s.sale_date)
      if (startDate.value && saleDate < startDate.value) return false
      if (endDate.value && saleDate > endDate.value) return false
      return true
    })
  }

  return result
})

// Handler pour le changement de page
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' XOF'
}

const getServicePrice = (serviceId: string) => {
  if (!serviceId) return 0
  const service = services.value.find(s => String(s.id) === serviceId)
  return service?.unit_price || 0
}

const formatCurrencyShort = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Modal functions
const openModal = async () => {
  console.log('openModal: Début')
  try {
    console.log('openModal: Ouverture du modal...')
    isModalOpen.value = true
    modalStep.value = 1
    resetForm()
    console.log('openModal: Modal ouvert, isModalOpen =', isModalOpen.value)
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du modal:', error)
    alert('Erreur lors de l\'ouverture du formulaire')
  }
}

const closeModal = () => {
  isModalOpen.value = false
  modalStep.value = 1
  resetForm()
}

const updateModalOpen = (open: boolean) => {
  isModalOpen.value = open
  if (!open) {
    modalStep.value = 1
    resetForm()
  }
}

// Handle customer creation
const handleAddCustomer = () => {
  router.push('/clients')
}

const goToStep2 = () => {
  if (lines.value.length === 0) {
    alert('Veuillez ajouter au moins un service')
    return
  }
  modalStep.value = 2
}

const goToStep1 = () => {
  modalStep.value = 1
}

const resetForm = () => {
  lines.value = []
  selectedService.value = ''
  selectedQuantity.value = 1
  selectedStore.value = ''
  formData.value = {
    customer: '',
    paymentMethod: 'cash',
    paymentTerm: 'immediate',
    amountPaid: 0,
    tax: 19.25,
    acompte: 0,
    notes: '',
    dueDate: ''
  }
}

// Service management
const addService = () => {
  if (!selectedStore.value) {
    alert('Veuillez d\'abord sélectionner un point de vente')
    return
  }

  if (!selectedService.value || !selectedQuantity.value) {
    alert('Veuillez sélectionner un service et une quantité')
    return
  }

  if (selectedQuantity.value <= 0) {
    alert('La quantité doit être supérieure à 0')
    return
  }

  const service = services.value.find(s => String(s.id) === selectedService.value)
  if (!service) {
    alert('Service non trouvé')
    return
  }

  const newLine: LineItem = {
    id: Date.now().toString(),
    service: service.id,
    serviceName: service.name,
    quantity: selectedQuantity.value,
    unitPrice: service.unit_price
  }

  lines.value.push(newLine)
  selectedService.value = ''
  selectedQuantity.value = 1
}

const removeLine = (lineId: string) => {
  lines.value = lines.value.filter(l => l.id !== lineId)
}

// Submit sale (create as draft, then auto-confirm)
const submitSale = async () => {
  if (!formData.value.customer || !selectedStore.value) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  if (lines.value.length === 0) {
    alert('Veuillez ajouter au moins un service')
    return
  }

  // Vérifier si c'est une vente à crédit et si la date d'échéance est renseignée
  if (isCreditSale.value && !formData.value.dueDate) {
    alert('Veuillez sélectionner une date d\'échéance pour cette vente à crédit')
    return
  }

  isSubmitting.value = true

  try {
    const saleData: SaleCreateData = {
      customer: parseInt(formData.value.customer),
      store: parseInt(selectedStore.value),
      sale_date: new Date().toISOString().split('T')[0],
      notes: formData.value.notes,
      paid_amount: formData.value.amountPaid,
      due_date: formData.value.dueDate || undefined, // Ajouter la date d'échéance si définie
      lines: lines.value.map(line => ({
        line_type: 'service',
        service: line.service,
        description: line.serviceName,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        tax_rate: formData.value.tax,
        discount_percentage: 0
      }))
    }

    console.log('Création de la vente service avec les données:', saleData)
    const newSale = await salesStore.createSale(saleData)
    console.log('Vente service créée:', newSale)

    if (!newSale || !newSale.id) {
      throw new Error('La vente a été créée mais aucun ID n\'a été retourné')
    }

    // Automatically confirm the sale (generate invoice)
    console.log('Confirmation de la vente service ID:', newSale.id)
    const confirmedSale = await salesStore.confirmSale(newSale.id)
    console.log('Vente confirmée, données retournées:', confirmedSale)
    console.log('Invoice info après confirmation:', confirmedSale?.sale?.invoice || 'Aucune facture')

    alert('Vente service créée et confirmée avec succès! La facture a été générée automatiquement.')

    // Reload services and sales
    await servicesStore.fetchServices()
    closeModal()
    await salesStore.fetchSales()

  } catch (error: unknown) {
    const axiosError = error as { config?: { url?: string; data?: string }; response?: { status?: number; data?: unknown }; message?: string }
    console.error('Erreur lors de la création de la vente service:', error)
    console.error('URL appelée:', axiosError?.config?.url)
    console.error('Données envoyées:', axiosError?.config?.data)
    console.error('Statut:', axiosError?.response?.status)
    console.error('Réponse:', axiosError?.response?.data)

    let errorMessage = 'Erreur inconnue'
    if (axiosError?.response?.data) {
      const backendErrors = axiosError.response.data as { detail?: string; error?: string; [key: string]: unknown }

      if (backendErrors.error) {
        errorMessage = backendErrors.error
      } else if (backendErrors.detail) {
        errorMessage = backendErrors.detail
      } else {
        errorMessage = JSON.stringify(backendErrors, null, 2)
      }
    } else if (axiosError?.message) {
      errorMessage = axiosError.message
    }

    alert('Erreur lors de la création de la vente service:\n' + errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  currentPage.value = 1
}

function handleDateRangeChange(start: Date | undefined, end: Date | undefined) {
  startDate.value = start
  endDate.value = end
  currentPage.value = 1
}

async function handleGenerateInvoice(id: number) {
  try {
    // Trouver la vente dans la liste des ventes
    const sale = salesStore.sales.find(s => s.id === id)

    if (!sale) {
      alert('Vente introuvable.')
      return
    }

    let invoiceId: number
    let saleNumber: string

    // Si invoice_id n'existe pas dans la liste, récupérer les détails complets
    if (!sale.invoice_id) {
      console.log('invoice_id non trouvé dans la liste, récupération des détails...')
      const detailedSale = await salesStore.fetchSale(id)
      if (!detailedSale.invoice_id) {
        // Essayer de confirmer la vente pour générer la facture
        if (detailedSale.status === 'draft') {
          alert('Cette vente est encore en brouillon. Veuillez la confirmer d\'abord.')
          return
        }
        alert('Cette vente confirmée n\'a pas de facture. Cela peut être une vente créée avant la mise en place du système de facturation automatique. Veuillez contacter l\'administrateur.')
        return
      }
      invoiceId = detailedSale.invoice_id
      saleNumber = detailedSale.sale_number
    } else {
      invoiceId = sale.invoice_id
      saleNumber = sale.sale_number
    }

    const res = await InvoiceServices.exportPdf(invoiceId)

    if (!res.data) {
      throw new Error('Aucune donnée reçue du serveur')
    }

    const blob = new Blob([res.data], { type: 'application/pdf' })

    if (blob.size === 0) {
      throw new Error('Le fichier PDF est vide')
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-service-${saleNumber}.pdf`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

  } catch (err: unknown) {
    const error = err as { message?: string; response?: { status?: number; data?: unknown } }
    console.error('Erreur lors du téléchargement de la facture:', error)

    let errorMessage = 'Impossible de télécharger la facture.'

    if (error.response?.status === 404) {
      errorMessage = 'Facture introuvable.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions pour télécharger cette facture.'
    } else if (error.response?.status === 500) {
      errorMessage = 'Erreur serveur lors de la génération du PDF.'
    } else if (error.message) {
      errorMessage += ' ' + error.message
    }

    alert(errorMessage + ' Merci de réessayer.')
  }
}

function handleViewDetails(id: number) {
  selectedFactureId.value = id
  isDetailOpen.value = true
}

function handleExportAll() {
  console.log('Export all facturations service to Excel')

  // Importer l'utilitaire Excel
  import('@/utils/excelExporter').then(({ ExcelExporter }) => {
    // Préparer les données pour Excel
    const columns = [
      { header: 'Numéro Vente', key: 'sale_number', width: 15 },
      { header: 'Date', key: 'sale_date', width: 12 },
      { header: 'Client', key: 'customer_name', width: 25 },
      { header: 'Services', key: 'services', width: 40 },
      { header: 'Quantité Total', key: 'total_qty', width: 12 },
      { header: 'Montant Total (XOF)', key: 'total_amount', width: 18 }
    ]

    const data = filteredFacturations.value.map(sale => ({
      sale_number: sale.sale_number,
      sale_date: new Date(sale.sale_date).toLocaleDateString('fr-FR'),
      customer_name: sale.customer.name,
      services: sale.lines?.filter(l => l.service).map(l => l.description || 'Service').join(' | ') || 'N/A',
      total_qty: sale.lines?.reduce((sum, line) => sum + (line.quantity || 0), 0) || 0,
      total_amount: sale.total_amount
    }))

    // Exporter vers Excel
    ExcelExporter.exportToExcel(
      data,
      columns,
      `facturations_service_${new Date().toISOString().split('T')[0]}`,
      'Facturations Service'
    )
  })
}

async function handleNew() {
  console.log('FacturationServiceView: handleNew appelé')
  await openModal()
  console.log('FacturationServiceView: openModal terminé, isModalOpen =', isModalOpen.value)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Breadcrumb -->
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/facturation/service">Facturation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Service</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- Header avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg">
              <Plus class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Facturations Services</h1>
              <p class="text-sm text-slate-600">
                Gérer vos opérations de vente de services
              </p>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex gap-3">
          <Button
            @click="handleExportAll"
            variant="outline"
            class="shadow-md"
          >
            Exporter
          </Button>
          <Button
            @click="handleNew"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            <Plus class="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      <!-- Search Bar -->
      <FacturationSearchBar
        @search="handleSearch"
        @date-range-change="handleDateRangeChange"
      />

      <!-- Table -->
      <FacturationTable
        :facturations="filteredFacturations"
        :current-page="currentPage"
        :page-size="pageSize"
        @generate-invoice="handleGenerateInvoice"
        @view-details="handleViewDetails"
        @page-change="handlePageChange"
      />

      <FacturationServiceDetailDialog
        :open="isDetailOpen"
        :facture-id="selectedFactureId"
        @update:open="isDetailOpen = $event"
      />

      <!-- Modal 2 étapes -->
      <Dialog :open="isModalOpen" @update:open="updateModalOpen">
      <DialogContent class="modal-facturation sm:max-w-[98vw] md:max-w-[90vw] lg:max-w-[1100px] w-full p-2 sm:p-4 md:p-6 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle class="modal-title">
            {{ modalStep === 1 ? 'Nouvelle opération de vente (Service)' : 'Informations supplémentaires' }}
          </DialogTitle>
        </DialogHeader>

        <!-- Étape 1: Sélection des services -->
        <div v-if="modalStep === 1" class="modal-step-1">
          <div class="step-1-container">
            <div class="left-column">
              <h3 class="section-title">Contenu de la vente</h3>

              <!-- Sélection du magasin - Conditionnel -->
              <div class="form-group-vertical">
                <Label class="form-label">Point de vente (Obligatoire) :</Label>

                <!-- Admin: Sélecteur complet -->
                <Select v-if="shouldShowStoreSelector" :model-value="selectedStore" @update:model-value="selectedStore = $event">
                  <SelectTrigger class="select-trigger">
                    <SelectValue placeholder="Sélectionner un point de vente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="store in stores"
                      :key="store.id"
                      :value="String(store.id)"
                    >
                      {{ store.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <!-- Utilisateur restreint: Badge informatif -->
                <div v-else class="flex items-center gap-2 h-10 px-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Store class="w-4 h-4 text-blue-600" />
                  <span class="text-sm font-medium text-blue-900">{{ getDefaultStore?.name || 'Aucun magasin' }}</span>
                </div>
              </div>

              <SearchableSelect
                v-model="selectedService"
                :items="services"
                label="Choix du service (Obligatoire)"
                placeholder="Rechercher un service..."
              />

              <div class="form-group-vertical" v-if="selectedService">
                <Label class="form-label">Prix unitaire : {{ formatCurrency(getServicePrice(selectedService)) }}</Label>
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Quantité ajoutée :</Label>
                <Input
                  v-model.number="selectedQuantity"
                  type="number"
                  min="1"
                  placeholder="Ex : 1"
                  class="quantity-input"
                />
              </div>

              <Button @click="addService" class="btn-ajouter" :disabled="!selectedService || !selectedQuantity">
                AJOUTER
              </Button>
            </div>

            <div class="right-column">
              <h3 class="section-title">Liste des ventes</h3>

              <div class="table-wrapper-step1">
                <table class="ventes-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Quantité</th>
                      <th>Prix Unit.</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in lines" :key="line.id">
                      <td>{{ line.serviceName }}</td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ formatCurrencyShort(line.unitPrice) }}</td>
                      <td>{{ formatCurrencyShort(line.quantity * line.unitPrice) }}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="removeLine(line.id)"
                          class="delete-btn"
                        >
                          <Trash2 class="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr v-if="lines.length === 0">
                      <td colspan="5" class="text-center text-gray-400 py-6 text-sm">
                        Aucune vente ajoutée
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="montant-total-section">
                <span class="montant-label">Montant Total:</span>
                <span class="montant-value">{{ formatCurrencyShort(subtotal) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer-step1">
            <Button variant="outline" @click="closeModal" class="btn-retour-step1">
              RETOUR
            </Button>
            <Button
              @click="goToStep2"
              class="btn-suivant-step1"
              :disabled="lines.length === 0"
            >
              SUIVANT
            </Button>
          </div>
        </div>

        <!-- Étape 2: Informations client et paiement -->
        <div v-if="modalStep === 2" class="modal-step-2">
          <div class="step-1-container">
            <div class="left-column">
              <h3 class="section-title">Informations supplémentaires</h3>

              <!-- Nom du client -->
              <SearchableSelect
                v-model="formData.customer"
                :items="customers"
                label="Nom du client (Obligatoire)"
                placeholder="Rechercher un client..."
                :show-add-button="true"
                @add-new="handleAddCustomer"
              />

              <div class="form-group-vertical">
                <Label class="form-label">Mode de paiement :</Label>
                <Select :model-value="formData.paymentMethod" @update:model-value="formData.paymentMethod = $event">
                  <SelectTrigger class="select-trigger">
                    <SelectValue placeholder="Mode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="card">Carte</SelectItem>
                    <SelectItem value="transfer">Virement</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="check">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Terme de paiement :</Label>
                <Select :model-value="formData.paymentTerm" @update:model-value="formData.paymentTerm = $event">
                  <SelectTrigger class="select-trigger">
                    <SelectValue placeholder="Terme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immédiat</SelectItem>
                    <SelectItem value="15_days">15 jours</SelectItem>
                    <SelectItem value="30_days">30 jours</SelectItem>
                    <SelectItem value="60_days">60 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">TVA (%) :</Label>
                <Input
                  v-model.number="formData.tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="19.25"
                  class="quantity-input"
                />
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Montant payé (XOF) :</Label>
                <Input
                  v-model.number="formData.amountPaid"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="quantity-input"
                />
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Acompte (XOF) :</Label>
                <Input
                  v-model.number="formData.acompte"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="quantity-input"
                />
              </div>

              <!-- Date d'échéance (seulement pour vente à crédit) -->
              <div v-if="isCreditSale" class="form-group-vertical">
                <Label class="form-label">Date d'échéance (Obligatoire pour crédit) :</Label>
                <Input
                  v-model="formData.dueDate"
                  type="date"
                  class="quantity-input"
                  :min="new Date().toISOString().split('T')[0]"
                />
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Notes :</Label>
                <Textarea
                  v-model="formData.notes"
                  placeholder="Notes additionnelles..."
                  rows="3"
                  class="quantity-input"
                />
              </div>
            </div>

            <div class="right-column">
              <h3 class="section-title">Liste des ventes</h3>

              <div class="table-wrapper-step1">
                <table class="ventes-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Quantité</th>
                      <th>Prix Unit.</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in lines" :key="line.id">
                      <td>{{ line.serviceName }}</td>
                      <td>{{ line.quantity }}</td>
                      <td>{{ formatCurrencyShort(line.unitPrice) }}</td>
                      <td>{{ formatCurrencyShort(line.quantity * line.unitPrice) }}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="removeLine(line.id)"
                          class="delete-btn"
                        >
                          <Trash2 class="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="montant-total-section">
                <span class="montant-label">Sous-total HT:</span>
                <span class="montant-value">{{ formatCurrencyShort(subtotal) }}</span>
              </div>

              <div class="amounts-summary-step2">
                <div class="amount-row">
                  <span class="label">TVA ({{ formData.tax }}%):</span>
                  <span class="value">{{ formatCurrencyShort(taxAmount) }}</span>
                </div>
                <div class="amount-row">
                  <span class="label">Acompte:</span>
                  <span class="value">-{{ formatCurrencyShort(formData.acompte) }}</span>
                </div>
                <div class="amount-row total">
                  <span class="label">Total TTC:</span>
                  <span class="value total-value">{{ formatCurrencyShort(totalAmount) }}</span>
                </div>
                <div class="amount-row">
                  <span class="label">Montant payé:</span>
                  <span class="value">{{ formatCurrencyShort(formData.amountPaid) }}</span>
                </div>
                <div class="amount-row balance">
                  <span class="label">Reste à payer:</span>
                  <span class="value">{{ formatCurrencyShort(balanceDue) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-step1">
            <Button variant="outline" @click="goToStep1" class="btn-retour-step1">
              RETOUR
            </Button>
            <Button @click="submitSale" class="btn-valider" :disabled="isSubmitting">
              {{ isSubmitting ? 'CRÉATION...' : 'VALIDER' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  </div>
</template>

<style scoped>
/* Modal styles - Responsive */
.modal-facturation {
  max-height: 85vh;
  overflow-y: auto;
  width: 100%;
  max-width: 100%;
}

.modal-facturation :deep(.max-w-lg) {
  max-width: none !important;
}

.modal-facturation :deep([class*="max-w-"]) {
  max-width: none !important;
}

/* Étape 1 */
.modal-step-1 {
  padding: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(85vh - 80px); /* Hauteur du modal moins l'en-tête */
}

.step-1-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
  width: 100%;
  overflow-y: auto;
  flex: 1;
}

/* Responsive - Tablettes et petits écrans */
@media (max-width: 1024px) {
  .modal-facturation {
    max-height: 95vh;
  }

  .modal-step-1 {
    padding: 0.75rem;
  }

  .step-1-container {
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .modal-facturation {
    max-height: 98vh;
    padding: 0.25rem;
  }

  .modal-step-1 {
    padding: 0.25rem;
  }

  .step-1-container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .left-column {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 0.5rem;
    gap: 0.5rem;
  }

  .right-column {
    gap: 0.5rem;
  }
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 1rem;
  border-right: 1px solid #e5e7eb;
}

/* Scroll pour l'étape 2 */
.modal-step-2 .left-column {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
}

.form-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

@media (max-width: 768px) {
  .form-group-vertical {
    gap: 0.25rem;
  }

  .form-label {
    font-size: 0.75rem;
  }
}

.select-trigger {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
}

.quantity-input {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
}

.btn-ajouter {
  background-color: #374151;
  color: white;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  margin-top: 0.5rem;
}

.btn-ajouter:hover:not(:disabled) {
  background-color: #1f2937;
}

.btn-ajouter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Table Liste des ventes */
.table-wrapper-step1 {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  max-height: 250px;
  overflow-y: auto;
}

.ventes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.ventes-table thead {
  background-color: #1e73be;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.ventes-table th {
  padding: 0.65rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
}

.ventes-table td {
  padding: 0.65rem 0.75rem;
  border-top: 1px solid #e5e7eb;
  color: #374151;
}

.ventes-table tbody tr:hover {
  background-color: #f9fafb;
}

.delete-btn {
  color: #374151;
  padding: 0.25rem;
}

.delete-btn:hover {
  color: #dc2626;
}

.montant-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.montant-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.montant-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #22c55e;
}

.full-width {
  grid-column: 1 / -1;
}

/* Étape 2 */
.modal-step-2 {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  max-height: calc(85vh - 80px); /* Hauteur du modal moins l'en-tête */
}

.modal-step-2 .step-1-container {
  overflow-y: auto;
  flex: 1;
  margin-bottom: 0;
}

/* Résumé des montants */
.amounts-summary-step2 {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.amount-row.total {
  border-top: 2px solid #22c55e;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.amount-row.balance {
  color: #dc2626;
  font-weight: 500;
}

.total-value {
  color: #22c55e;
  font-size: 1.25rem;
}

/* Footer buttons */
.modal-footer-step1 {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 0;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0; /* Empêche les boutons de rétrécir */
}

.btn-retour-step1 {
  width: 150px;
  font-weight: 600;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
}

.btn-retour-step1:hover {
  background-color: #d1d5db;
}

.btn-suivant-step1,
.btn-valider {
  width: 150px;
  background-color: #1e73be;
  color: white;
  font-weight: 600;
}

.btn-suivant-step1:hover:not(:disabled),
.btn-valider:hover:not(:disabled) {
  background-color: #155a8a;
}

.btn-suivant-step1:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive - Tablettes */
@media (max-width: 1024px) {
  .section-title {
    font-size: 0.875rem;
  }

  .montant-value {
    font-size: 1.25rem;
  }

  .ventes-table {
    font-size: 0.8rem;
  }

  .ventes-table th,
  .ventes-table td {
    padding: 0.5rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .modal-footer-step1 {
    flex-direction: column;
  }

  .btn-retour-step1,
  .btn-suivant-step1,
  .btn-valider {
    width: 100%;
  }

  .section-title {
    font-size: 0.8rem;
  }

  .montant-total-section {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
    padding: 0.5rem;
  }

  .montant-label {
    font-size: 0.8rem;
  }

  .montant-value {
    font-size: 1rem;
  }

  .table-wrapper-step1 {
    max-height: 180px;
  }

  .ventes-table {
    font-size: 0.7rem;
  }

  .ventes-table th,
  .ventes-table td {
    padding: 0.3rem 0.2rem;
  }

  .ventes-table th {
    font-size: 0.65rem;
  }

  .amount-row {
    font-size: 0.75rem;
    padding: 0.25rem 0;
  }

  .amount-row.total {
    font-size: 0.85rem;
  }

  .amounts-summary-step2 {
    padding: 0.5rem;
  }
}

/* Responsive - Très petits écrans */
@media (max-width: 480px) {
  .modal-facturation {
    padding: 0.125rem;
  }

  .modal-step-1 {
    padding: 0.125rem;
  }

  .step-1-container {
    gap: 0.375rem;
  }

  .left-column,
  .right-column {
    gap: 0.375rem;
  }

  .btn-ajouter {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .ventes-table th,
  .ventes-table td {
    padding: 0.25rem 0.15rem;
  }
}
</style>
