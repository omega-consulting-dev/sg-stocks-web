<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Trash2, Store } from 'lucide-vue-next'
import { useSalesStore } from '@/stores/sales.store'
import { useProductsStore } from '@/stores/products'
import { useCustomersStore } from '@/stores/customers.store'
import { useStoresStore } from '@/stores/stores.store'
import { useUserStore } from '@/stores/user'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import { useToast } from '@/composables/useToast'
import { InvoiceServices } from '@/services/invoices.service'
import FacturationSearchBar from '@/components/facturation/FacturationSearchBar.vue'
import FacturationTable from '@/components/facturation/FacturationTable.vue'
import FacturationProduitDetailDialog from '@/components/facturation/FacturationProduitDetailDialog.vue'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { inventoryApi } from '@/services/api/inventory.api'
import type { SaleCreateData } from '@/services/sales.service'
import type { StockLevel } from '@/services/api/inventory.api'

const router = useRouter()
const salesStore = useSalesStore()
const productsStore = useProductsStore()
const customersStore = useCustomersStore()
const storesStore = useStoresStore()
const userStore = useUserStore()
const toast = useToast()

// Composable pour l'assignation de magasin
const { shouldShowStoreSelector, getDefaultStoreId, getDefaultStore } = useStoreAssignment()

const searchQuery = ref('')
const statusFilter = ref('')
const storeFilter = ref('') // Filtre par point de vente (superadmin seulement)
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
const showConfirmationModal = ref(false) // Modal de confirmation avant validation
const showAssignCustomerDialog = ref(false) // Dialog pour assigner un client
const saleWithoutCustomer = ref<number | null>(null) // ID de la vente sans client
const selectedCustomerForSale = ref('') // Client sélectionné pour la vente

// Line items for invoice
interface LineItem {
  id: string
  product: number
  productName: string
  quantity: number
  unitPrice: number
  stock: number
  totalStock: number
}

const lines = ref<LineItem[]>([])
const selectedProduct = ref('')
const selectedQuantity = ref(1)
const selectedStore = ref(getDefaultStoreId.value ? String(getDefaultStoreId.value) : '') // Magasin sélectionné (auto-assigné)
const storeStocks = ref<StockLevel[]>([]) // Stocks du magasin sélectionné
const productSearchQuery = ref('') // Recherche de produit

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
const stores = computed(() => storesStore.stores)
const customers = computed(() => customersStore.customers)
const isSuperAdmin = computed(() => userStore.user?.is_superuser || false)

// Filtrer les produits qui ont du stock dans le magasin sélectionné
const availableProducts = computed(() => {
  if (!selectedStore.value || storeStocks.value.length === 0) return []

  // Créer une map des stocks par produit
  const stockMap = new Map(storeStocks.value.map(stock => [stock.product, stock]))

  // Calculer les quantités déjà ajoutées dans le panier
  const cartQuantities = new Map<number, number>()
  lines.value.forEach(line => {
    const current = cartQuantities.get(line.product) || 0
    cartQuantities.set(line.product, current + line.quantity)
  })

  // Retourner les produits avec leur stock disponible (stock - quantité dans le panier)
  let products = productsStore.products
    .map(product => {
      const stock = stockMap.get(product.id)
      if (!stock) return null

      const quantityInCart = cartQuantities.get(product.id) || 0
      const availableStock = (stock.available_quantity || 0) - quantityInCart

      if (availableStock <= 0) return null

      return {
        ...product,
        current_stock: availableStock,
        original_stock: stock.available_quantity,
        stock_id: stock.id
      }
    })
    .filter(p => p !== null)

  // Filtrer par recherche si une query est entrée
  if (productSearchQuery.value) {
    const query = productSearchQuery.value.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.reference && p.reference.toLowerCase().includes(query))
    )
  }

  return products
})

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

const totalTTC = computed(() => {
  return Math.round((subtotal.value + taxAmount.value) * 100) / 100
})

const remainingBalance = computed(() => {
  return Math.max(0, Math.round((totalTTC.value - formData.value.amountPaid) * 100) / 100)
})

const isCreditSale = computed(() => {
  return balanceDue.value > 0
})

onMounted(async () => {
  try {
    isLoadingModal.value = true
    await Promise.all([
      salesStore.fetchSales(),
      productsStore.fetchProducts(),
      customersStore.fetchCustomers(),
      storesStore.fetchStores()
    ])

    // Charger les stocks automatiquement si un store est déjà sélectionné
    if (selectedStore.value) {
      await loadStoreStocks(selectedStore.value)
    }
  } catch (error: any) {
    console.error('Erreur lors du chargement des données:', error)
    const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue'
    toast.error(`Erreur lors du chargement des données: ${errorMsg}`, 'Erreur')
  } finally {
    isLoadingModal.value = false
  }
})

// Filtered facturations based on search and date range (now using sales)
const filteredFacturations = computed(() => {
  let result = salesStore.sales

  // Filter only sales with products (exclude service-only sales)
  result = result.filter((s) => {
    // Check if sale has at least one product line (not service)
    return s && s.lines && Array.isArray(s.lines) && s.lines.some(line => line.line_type === 'product')
  })

  // Filter by store if selected (superadmin only)
  if (storeFilter.value && isSuperAdmin.value) {
    result = result.filter((s) => {
      const storeId = typeof s.store === 'object' ? String(s.store.id) : String(s.store)
      return storeId === storeFilter.value
    })
  }

  // Filter by status if selected
  if (statusFilter.value) {
    result = result.filter((s) => {
      if (statusFilter.value === 'paid') {
        return s.payment_status === 'paid'
      } else if (statusFilter.value === 'partial') {
        return s.payment_status === 'partial'
      } else if (statusFilter.value === 'pending') {
        return s.payment_status === 'pending'
      }
      return true
    })
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.sale_number.toLowerCase().includes(query) ||
        (s.customer?.name?.toLowerCase().includes(query) ?? false) ||
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

const getProductStock = (productId: string) => {
  if (!productId) return 0
  // Chercher dans availableProducts qui contient le stock du magasin sélectionné
  const product = availableProducts.value.find(p => String(p.id) === productId)
  return product?.current_stock || 0
}

const getProductPrice = (productId: string) => {
  if (!productId) return 0
  const product = availableProducts.value.find(p => String(p.id) === productId)
  return product?.selling_price || 0
}

const formatCurrencyShort = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Charger les stocks du magasin sélectionné
const loadStoreStocks = async (storeId: string) => {
  if (!storeId) {
    storeStocks.value = []
    return
  }

  try {
    isLoadingModal.value = true
    const response = await inventoryApi.getStockLevels({ store: parseInt(storeId) })
    storeStocks.value = response.results
  } catch (error: any) {
    console.error('Erreur lors du chargement des stocks:', error)
    storeStocks.value = []
    const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue'
    toast.error(`Erreur lors du chargement des stocks: ${errorMsg}`, 'Erreur de chargement')
  } finally {
    isLoadingModal.value = false
  }
}

// Watcher pour charger les stocks quand le magasin change
watch(selectedStore, (newStoreId) => {
  if (newStoreId) {
    loadStoreStocks(newStoreId)
  } else {
    storeStocks.value = []
  }
  // Réinitialiser le produit sélectionné et la recherche quand on change de magasin
  selectedProduct.value = ''
  productSearchQuery.value = ''
}, { immediate: true })

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
    toast.error('Impossible d\'ouvrir le formulaire de facturation', 'Erreur')
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

// Créer ou récupérer le client "No Name"
const getOrCreateNoNameCustomer = async (): Promise<number | null> => {
  try {
    // Chercher si un client "No Name" existe déjà
    const noNameCustomer = customers.value.find(c =>
      c.name.toLowerCase() === 'client no name' ||
      c.name.toLowerCase() === 'no name' ||
      c.name.toLowerCase() === 'client de passage'
    )

    if (noNameCustomer) {
      return noNameCustomer.id
    }

    // Créer le client "No Name" s'il n'existe pas
    const newCustomer = await customersStore.createCustomer({
      name: 'Client No Name',
      phone: '000000000'
    })

    // Recharger la liste des clients
    await customersStore.fetchCustomers()

    return newCustomer.id
  } catch (error: any) {
    console.error('Erreur lors de la création du client No Name:', error)
    return null
  }
}

const goToStep2 = () => {
  if (lines.value.length === 0) {
    toast.warning('Veuillez ajouter au moins un produit à la facture', 'Produit requis')
    return
  }
  modalStep.value = 2
}

const goToStep1 = () => {
  modalStep.value = 1
}

const resetForm = () => {
  lines.value = []
  selectedProduct.value = ''
  selectedQuantity.value = 1
  // Ne pas réinitialiser le store pour les utilisateurs restreints (caissier/magasinier)
  // Les admin peuvent changer le store librement
  if (shouldShowStoreSelector.value) {
    selectedStore.value = ''
  } else {
    selectedStore.value = getDefaultStoreId.value ? String(getDefaultStoreId.value) : ''
  }
  productSearchQuery.value = ''
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

// Product management
const addProduct = () => {
  if (!selectedStore.value) {
    toast.warning('Veuillez d\'abord sélectionner un point de vente', 'Magasin requis')
    return
  }

  if (!selectedProduct.value || !selectedQuantity.value) {
    toast.warning('Veuillez sélectionner un produit et saisir une quantité', 'Informations manquantes')
    return
  }

  if (selectedQuantity.value <= 0) {
    toast.error('La quantité doit être supérieure à 0', 'Quantité invalide')
    return
  }

  // Récupérer le produit depuis availableProducts qui contient le stock calculé
  const product = availableProducts.value.find(p => String(p.id) === selectedProduct.value)
  if (!product) {
    toast.error('Le produit sélectionné est introuvable', 'Produit introuvable')
    return
  }

  // Calculer la quantité déjà ajoutée pour ce produit
  const alreadyAdded = lines.value
    .filter(line => line.product === product.id)
    .reduce((sum, line) => sum + line.quantity, 0)

  const totalRequested = alreadyAdded + selectedQuantity.value

  // Vérifier si le total demandé dépasse le stock disponible
  if (totalRequested > product.current_stock) {
    const remaining = product.current_stock - alreadyAdded
    if (remaining <= 0) {
      toast.error(`Ce produit a déjà été ajouté en totalité. Stock total: ${product.original_stock} unité(s)`, 'Stock épuisé')
    } else {
      toast.warning(`Vous avez déjà ajouté ${alreadyAdded} unité(s). Il reste seulement ${remaining} unité(s) disponible(s) sur un stock total de ${product.original_stock}`, 'Stock insuffisant')
    }
    return
  }

  const newLine: LineItem = {
    id: Date.now().toString(),
    product: product.id,
    productName: product.name,
    quantity: selectedQuantity.value,
    unitPrice: product.selling_price,
    stock: product.current_stock - selectedQuantity.value,
    totalStock: product.original_stock || 0
  }

  lines.value.push(newLine)
  selectedProduct.value = ''
  selectedQuantity.value = 1
}

const removeLine = (lineId: string) => {
  lines.value = lines.value.filter(l => l.id !== lineId)
}

// Submit sale (create as draft)
const submitSale = async () => {
  if (!selectedStore.value) {
    toast.warning('Veuillez sélectionner un point de vente pour continuer', 'Point de vente requis')
    return
  }

  if (lines.value.length === 0) {
    toast.warning('Veuillez ajouter au moins un produit à la facture', 'Produit requis')
    return
  }

  // Vérifier si c'est une vente à crédit et si la date d'échéance est renseignée
  if (isCreditSale.value && !formData.value.dueDate) {
    toast.warning('Veuillez sélectionner une date d\'échéance pour cette vente à crédit', 'Date d\'échéance requise')
    return
  }

  // Afficher le modal de confirmation avant de créer la vente
  showConfirmationModal.value = true
}

const confirmAndCreateSale = async () => {
  showConfirmationModal.value = false
  isSubmitting.value = true

  try {
    // Si aucun client n'est sélectionné, assigner automatiquement "Client No Name"
    let customerId = formData.value.customer ? parseInt(formData.value.customer) : null

    if (!customerId) {
      const noNameCustomerId = await getOrCreateNoNameCustomer()
      if (!noNameCustomerId) {
        toast.error('Erreur lors de la création du client par défaut', 'Erreur')
        isSubmitting.value = false
        return
      }
      customerId = noNameCustomerId
      toast.info('Client "No Name" assigné automatiquement', 'Client de passage')
    }

    const saleData: SaleCreateData = {
      customer: customerId,
      store: parseInt(selectedStore.value),
      sale_date: new Date().toISOString().split('T')[0],
      notes: formData.value.notes,
      paid_amount: formData.value.amountPaid,
      due_date: formData.value.dueDate || undefined, // Ajouter la date d'échéance si définie
      lines: lines.value.map(line => ({
        line_type: 'product',
        product: line.product,
        description: line.productName,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        tax_rate: formData.value.tax,
        discount_percentage: 0
      }))
    }

    const newSale = await salesStore.createSale(saleData)

    if (!newSale || !newSale.id) {
      throw new Error('La vente a été créée mais aucun ID n\'a été retourné')
    }

    // Automatically confirm the sale (decrement stock + generate invoice)
    await salesStore.confirmSale(newSale.id)

    // Attendre un court instant pour que le backend soit prêt
    await new Promise(resolve => setTimeout(resolve, 500))

    // Recharger les ventes AVANT de fermer la modale
    await salesStore.fetchSales()

    // Recharger les produits et les stocks du magasin pour avoir les nouvelles quantités
    await productsStore.fetchProducts()
    if (selectedStore.value) {
      await loadStoreStocks(selectedStore.value)
    }

    closeModal()
    toast.success('La facture a été générée automatiquement avec succès !', 'Vente confirmée')

  } catch (error: unknown) {
    const axiosError = error as { config?: { url?: string; data?: string }; response?: { status?: number; data?: unknown }; message?: string }
    console.error('Erreur lors de la création de la vente:', error)
    console.error('URL appelée:', axiosError?.config?.url)
    console.error('Données envoyées:', axiosError?.config?.data)
    console.error('Statut:', axiosError?.response?.status)
    console.error('Réponse:', axiosError?.response?.data)

    let errorMessage = 'Erreur inconnue'
    if (axiosError?.response?.data) {
      const backendErrors = axiosError.response.data as { detail?: string; error?: string; [key: string]: any }

      // Si c'est une erreur de stock insuffisant
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

    toast.error(errorMessage, 'Erreur lors de la création de la vente', 8000)
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

// Assigner un client à une vente
async function assignCustomerToSale() {
  if (!saleWithoutCustomer.value || !selectedCustomerForSale.value) {
    toast.warning('Veuillez sélectionner un client', 'Client requis')
    return
  }

  try {
    isSubmitting.value = true

    // Mettre à jour la vente avec le client sélectionné
    await salesStore.updateSale(saleWithoutCustomer.value, {
      customer: parseInt(selectedCustomerForSale.value)
    })

    toast.success('Client assigné avec succès', 'Succès')
    showAssignCustomerDialog.value = false

    // Réessayer de télécharger la facture
    await handleGenerateInvoice(saleWithoutCustomer.value)

  } catch (error: any) {
    console.error('Erreur lors de l\'assignation du client:', error)
    toast.error('Erreur lors de l\'assignation du client', 'Erreur')
  } finally {
    isSubmitting.value = false
  }
}

async function handleGenerateInvoice(id: number) {
  try {
    // Trouver la vente dans la liste des ventes
    const sale = salesStore.sales.find(s => s.id === id)

    if (!sale) {
      toast.error('La vente demandée est introuvable', 'Vente introuvable')
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
          toast.warning('Cette vente est encore en brouillon. Veuillez la confirmer d\'abord.', 'Vente non confirmée')
          return
        }

        // Tenter de générer la facture automatiquement
        toast.info('Génération de la facture en cours...', 'Facture manquante détectée')
        try {
          const result = await salesStore.generateInvoice(id)
          if (result && result.invoice) {
            invoiceId = result.invoice.id
            saleNumber = detailedSale.sale_number
            toast.success('Facture générée avec succès', 'Succès')
          } else {
            toast.error('Impossible de générer la facture. Veuillez contacter l\'administrateur.', 'Erreur de génération', 8000)
            return
          }
        } catch (generateError: any) {
          console.error('Erreur lors de la génération de la facture:', generateError)

          // Vérifier si c'est un problème de client manquant
          if (generateError.message && generateError.message.includes('without a customer')) {
            // Proposer d'assigner un client directement
            saleWithoutCustomer.value = id
            selectedCustomerForSale.value = ''
            showAssignCustomerDialog.value = true
            return
          }

          let errorMessage = generateError.message || 'Erreur lors de la génération de la facture.'
          toast.error(errorMessage, 'Erreur de génération', 10000)
          return
        }
      } else {
        invoiceId = detailedSale.invoice_id
        saleNumber = detailedSale.sale_number
      }
    } else {
      invoiceId = sale.invoice_id
      saleNumber = sale.sale_number
    }

    const res = await InvoiceServices.exportPdf(invoiceId)

    // Vérifier si on a bien reçu des données
    if (!res.data) {
      throw new Error('Aucune donnée reçue du serveur')
    }

    // Créer le blob avec le bon type MIME
    const blob = new Blob([res.data], { type: 'application/pdf' })

    // Vérifier que le blob n'est pas vide
    if (blob.size === 0) {
      throw new Error('Le fichier PDF est vide')
    }

    // Créer l'URL et télécharger
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-${saleNumber}.pdf`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // Nettoyer après un court délai
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

  } catch (err: unknown) {
    const error = err as { message?: string; response?: { status?: number; data?: unknown } }
    console.error('Erreur lors du téléchargement de la facture:', error)
    console.error('Détails de l\'erreur:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })

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

    toast.error(errorMessage + ' Merci de réessayer.', 'Erreur de téléchargement', 7000)
  }
}

function handleViewDetails(id: number) {
  selectedFactureId.value = id
  isDetailOpen.value = true
}

function handleExportAll() {
  console.log('Export all facturations produit to Excel')

  // Importer l'utilitaire Excel
  import('@/utils/excelExporter').then(({ ExcelExporter }) => {
    // Préparer les données pour Excel
    const columns = [
      { header: 'Numéro Vente', key: 'sale_number', width: 15 },
      { header: 'Date', key: 'sale_date', width: 12 },
      { header: 'Client', key: 'customer_name', width: 25 },
      // { header: 'Produits', key: 'products', width: 40 },
      { header: 'Quantité Total', key: 'total_qty', width: 12 },
      { header: 'Montant Total (XOF)', key: 'total_amount', width: 18 }
    ]

    const data = filteredFacturations.value.map(sale => ({
      sale_number: sale.sale_number,
      sale_date: new Date(sale.sale_date).toLocaleDateString('fr-FR'),
      customer_name: sale.customer?.name || 'Client de passage',
      // products: sale.lines?.map(l => l.item_name || l.description || 'Produit').join(' | ') || 'N/A',
      total_qty: sale.lines?.reduce((sum, line) => sum + Number(line.quantity || 0), 0) || 0,
      total_amount: sale.total_amount
    }))

    // Exporter vers Excel
    ExcelExporter.exportToExcel(
      data,
      columns,
      `facturations_produit_${new Date().toISOString().split('T')[0]}`,
      'Facturations Produit'
    )
  })
}

async function handleNew() {
  await openModal()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Breadcrumb -->
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/facturation/produit">Facturation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Produit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- Header avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-3 shadow-lg">
              <Plus class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Facturations Produits</h1>
              <p class="text-sm text-slate-600">
                Gérer vos opérations de vente de produits
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

      <!-- Filtre par statut -->
      <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div class="flex items-center gap-4">
          <Label class="text-sm font-medium">Filtrer par statut :</Label>
          <select
            v-model="statusFilter"
            class="w-64 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Toutes les factures</option>
            <option value="paid">Payées</option>
            <option value="partial">Partiellement payées (Dettes)</option>
            <option value="pending">En attente</option>
          </select>

          <!-- Filtre par point de vente (superadmin seulement) -->
          <template v-if="isSuperAdmin">
            <Label class="text-sm font-medium ml-6">Filtrer par point de vente :</Label>
            <select
              v-model="storeFilter"
              class="w-64 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tous les points de vente</option>
              <option v-for="store in stores" :key="store.id" :value="String(store.id)">
                {{ store.name }}
              </option>
            </select>
          </template>
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

      <FacturationProduitDetailDialog
        :open="isDetailOpen"
        :facture-id="selectedFactureId"
        @update:open="isDetailOpen = $event"
      />

      <!-- Dialog pour assigner un client -->
      <Dialog :open="showAssignCustomerDialog" @update:open="showAssignCustomerDialog = $event">
        <DialogContent class="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigner un client</DialogTitle>
            <DialogDescription>
              Sélectionnez un client pour générer la facture de cette vente.
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <p class="text-sm text-gray-600">
              Cette vente n'a pas de client assigné. Pour générer une facture, veuillez sélectionner un client.
            </p>

            <div class="space-y-2">
              <Label for="customer-select">Client <span class="text-red-500">*</span></Label>
              <Select v-model="selectedCustomerForSale">
                <SelectTrigger id="customer-select">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="customer in customers"
                    :key="customer.id"
                    :value="String(customer.id)"
                  >
                    {{ customer.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button
              variant="outline"
              @click="showAssignCustomerDialog = false"
              :disabled="isSubmitting"
            >
              Annuler
            </Button>
            <Button
              @click="assignCustomerToSale"
              :disabled="isSubmitting || !selectedCustomerForSale"
            >
              {{ isSubmitting ? 'Assignation...' : 'Assigner et générer la facture' }}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Modal 2 étapes -->
      <Dialog :open="isModalOpen" @update:open="updateModalOpen">
      <DialogContent class="modal-facturation sm:max-w-[98vw] md:max-w-[90vw] lg:max-w-[1300px] w-full p-2 sm:p-4 md:p-6 max-h-[85vh]">
        <!-- En-tête du modal -->
        <DialogHeader>
          <DialogTitle class="modal-title">
            {{ modalStep === 1 ? 'Nouvelle opération de vente' : 'Informations supplémentaires' }}
          </DialogTitle>
          <DialogDescription>
            {{ modalStep === 1 ? 'Sélectionnez les produits et renseignez les quantités' : 'Complétez les informations de la vente' }}
          </DialogDescription>
        </DialogHeader>

        <!-- Étape 1: Sélection des produits -->
        <div v-if="modalStep === 1" class="modal-step-1">
          <div class="step-1-container">
            <!-- Colonne gauche: Formulaire -->
            <div class="left-column">
              <h3 class="section-title">Contenue de la vente</h3>

              <!-- Sélection du magasin - Conditionnel -->
              <div class="form-group-vertical">
                <Label class="form-label">Magasin (Obligatoire) :</Label>

                <!-- Admin: Sélecteur complet -->
                <Select v-if="shouldShowStoreSelector" :model-value="selectedStore" @update:model-value="selectedStore = $event">
                  <SelectTrigger class="select-trigger">
                    <SelectValue placeholder="Sélectionner un magasin" />
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
                v-model="selectedProduct"
                :items="availableProducts"
                label="Choix du produit (Obligatoire)"
                :placeholder="selectedStore ? 'Rechercher un produit...' : 'Sélectionnez d\'abord un magasin'"
                :disabled="!selectedStore"
              />
              <div class="stock-display" v-if="selectedProduct">
                <div class="stock-number">{{ getProductStock(selectedProduct) }}</div>
                <div class="stock-label">en stock</div>
              </div>

              <div class="form-group-vertical" v-if="selectedProduct">
                <Label class="form-label">Prix unitaire : {{ formatCurrency(getProductPrice(selectedProduct)) }}</Label>
              </div>

              <div class="form-group-vertical">
                <Label class="form-label">Quantité ajoutée :</Label>
                <Input
                  v-model.number="selectedQuantity"
                  type="number"
                  min="1"
                  placeholder="Ex : 50"
                  class="quantity-input"
                />
              </div>

              <Button @click="addProduct" class="btn-ajouter" :disabled="!selectedProduct || !selectedQuantity">
                AJOUTER
              </Button>
            </div>

            <!-- Colonne droite: Liste des ventes -->
            <div class="right-column">
              <h3 class="section-title">Liste des ventes</h3>

              <div class="table-wrapper-step1">
                <table class="ventes-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>En stock</th>
                      <th>Ajoutée</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in lines" :key="line.id">
                      <td>{{ line.productName }}</td>
                      <td>{{ line.stock }}</td>
                      <td>{{ line.quantity }}</td>
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

          <!-- Boutons étape 1 -->
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
            <!-- Colonne gauche: Formulaire client et paiement -->
            <div class="left-column">


              <!-- Nom du client -->
              <SearchableSelect
                v-model="formData.customer"
                :items="customers"
                label="Nom du client (Optionnel - Client de passage)"
                placeholder="Rechercher un client ou laisser vide pour client de passage..."
                :show-add-button="true"
                @add-new="handleAddCustomer"
              />

              <!-- Mode de paiement -->
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

              <!-- Terme de paiement -->
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

              <!-- TVA -->
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

              <!-- Montant payé -->
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

              <!-- Acompte -->
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

              <!-- Notes -->
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

            <!-- Colonne droite: Panier et résumé (même position qu'étape 1) -->
            <div class="right-column">
              <h3 class="section-title">Liste des ventes</h3>

              <div class="table-wrapper-step1">
                <table class="ventes-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>En stock</th>
                      <th>Ajoutée</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in lines" :key="line.id">
                      <td>{{ line.productName }}</td>
                      <td>{{ line.stock }}</td>
                      <td>{{ line.quantity }}</td>
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

          <!-- Boutons étape 2 -->
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

    <!-- Modal de confirmation avant la création de la vente -->
    <Dialog :open="showConfirmationModal" @update:open="showConfirmationModal = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-blue-600">
            🔔 Confirmer la vente
          </DialogTitle>
          <DialogDescription>
            Vérifiez les informations avant de créer la vente.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <!-- Récapitulatif de la vente -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold text-slate-700 mb-3">Récapitulatif de la vente :</h3>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Client :</span>
                <span class="font-medium">{{ formData.customer ? customers.find(c => String(c.id) === formData.customer)?.name : 'Client de passage' }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Point de vente :</span>
                <span class="font-medium">{{ stores.find((s: any) => String(s.id) === selectedStore)?.name || 'N/A' }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Nombre de produits :</span>
                <span class="font-medium">{{ lines.length }}</span>
              </div>

              <div class="border-t border-blue-200 my-2 pt-2">
                <div class="flex justify-between text-base font-bold">
                  <span>Montant total TTC :</span>
                  <span class="text-blue-600">{{ totalTTC.toLocaleString('fr-FR') }} XAF</span>
                </div>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Montant payé :</span>
                <span class="font-medium text-green-600">{{ formData.amountPaid.toLocaleString('fr-FR') }} XAF</span>
              </div>

              <div class="flex justify-between" v-if="remainingBalance > 0">
                <span class="text-slate-600">Reste à payer :</span>
                <span class="font-medium text-orange-600">{{ remainingBalance.toLocaleString('fr-FR') }} XAF</span>
              </div>
            </div>
          </div>

          <!-- Avertissement pour client de passage avec crédit -->
          <div v-if="!formData.customer && remainingBalance > 0" class="bg-red-50 border border-red-300 rounded-lg p-4">
            <p class="text-sm text-red-800 font-semibold">
              ❌ <strong>Erreur :</strong> Les clients de passage doivent payer la totalité !
            </p>
            <p class="text-sm text-red-700 mt-2">
              Le paiement actuel est insuffisant. Veuillez :
            </p>
            <ul class="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
              <li>Sélectionner un client pour autoriser le crédit</li>
              <li>OU payer le montant total de {{ totalTTC.toLocaleString('fr-FR') }} XAF</li>
            </ul>
          </div>

          <!-- Message d'avertissement -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
              ⚠️ <strong>Attention :</strong> En confirmant, cette vente sera automatiquement :
            </p>
            <ul class="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>Confirmée dans le système</li>
              <li>Le stock sera décrémenté</li>
              <li>Une facture sera générée automatiquement</li>
            </ul>
          </div>

          <!-- Liste des produits -->
          <div class="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            <h4 class="font-semibold text-slate-700 mb-2 text-sm">Produits :</h4>
            <div class="space-y-2">
              <div
                v-for="line in lines"
                :key="line.id"
                class="flex justify-between items-center text-sm bg-slate-50 p-2 rounded"
              >
                <div class="flex-1">
                  <div class="font-medium">{{ line.productName }}</div>
                  <div class="text-xs text-slate-500">
                    {{ line.quantity }} × {{ line.unitPrice.toLocaleString('fr-FR') }} XAF
                  </div>
                </div>
                <div class="font-semibold text-blue-600">
                  {{ (line.quantity * line.unitPrice).toLocaleString('fr-FR') }} XAF
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            @click="showConfirmationModal = false"
            :disabled="isSubmitting"
          >
            Annuler
          </Button>
          <Button
            @click="confirmAndCreateSale"
            :disabled="isSubmitting || (!formData.customer && remainingBalance > 0)"
            class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            :class="{ 'opacity-50 cursor-not-allowed': !formData.customer && remainingBalance > 0 }"
          >
            {{ isSubmitting ? 'Création en cours...' : '✓ Confirmer et Facturer' }}
          </Button>
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

.stock-display {
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .stock-display {
    padding: 0.5rem;
    margin: 0.25rem 0;
  }
}

.stock-number {
  font-size: 2rem;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}

.stock-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
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

.piece-jointe-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-upload-placeholder {
  height: 80px;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Résumé des montants */
.amounts-summary {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
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
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.modal-footer-step1 {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 0;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0; /* Empêche les boutons de rétrécir */
}

.btn-retour,
.btn-retour-step1 {
  width: 150px;
  font-weight: 600;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
}

.btn-retour:hover,
.btn-retour-step1:hover {
  background-color: #d1d5db;
}

.btn-suivant,
.btn-suivant-step1,
.btn-valider {
  width: 150px;
  background-color: #1e73be;
  color: white;
  font-weight: 600;
}

/* Responsive - Tablettes */
@media (max-width: 1024px) {
  .section-title {
    font-size: 0.875rem;
  }

  .stock-number {
    font-size: 1.5rem;
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
  .modal-footer,
  .modal-footer-step1 {
    flex-direction: column;
  }

  .btn-retour,
  .btn-retour-step1,
  .btn-suivant,
  .btn-suivant-step1,
  .btn-valider {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 0.8rem;
  }

  .stock-display {
    padding: 0.5rem;
  }

  .stock-number {
    font-size: 1.125rem;
  }

  .stock-label {
    font-size: 0.7rem;
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

  .amounts-summary,
  .amounts-summary-step2 {
    padding: 0.5rem;
  }

  .file-upload-placeholder {
    height: 50px;
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

  .ventes-table th:nth-child(2),
  .ventes-table td:nth-child(2) {
    display: none;
  }

  .btn-ajouter {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .stock-number {
    font-size: 1rem;
  }

  .ventes-table th,
  .ventes-table td {
    padding: 0.25rem 0.15rem;
  }
}

.btn-suivant:hover:not(:disabled),
.btn-suivant-step1:hover:not(:disabled),
.btn-valider:hover:not(:disabled) {
  background-color: #155a8a;
}

.btn-suivant:disabled,
.btn-suivant-step1:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
