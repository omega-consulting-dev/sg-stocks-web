l<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTransfersStore } from '@/stores/transfers.store'
import { useProductsStore } from '@/stores/products'
import { useStoresStore } from '@/stores/stores.store'
import { inventoryApi } from '@/services/api/inventory.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import Alert from '@/components/ui/alert/Alert.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Package, Plus, Eye, FileText, Edit, Trash2, ArrowRightLeft, Save, XCircle, Loader2 } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CompanySettingsService } from '@/services/company-settings.service'
import type { StockTransferDetail, TransferLine, CreateTransferData } from '@/services/api/transfers.api'

const router = useRouter()
const store = useTransfersStore()
const productsStore = useProductsStore()
const storesStore = useStoresStore()

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const selectedBon = ref<BonTransfert | null>(null)
const isBonDetailOpen = ref(false)
const bonToDelete = ref<BonTransfert | null>(null)
const isDeleteBonDialogOpen = ref(false)

// État pour la modale de création/édition
const isTransferModalOpen = ref(false)
const editingTransferNumber = ref<string | null>(null)
const editingTransfer = ref<BonTransfert | null>(null) // Stocker le transfert en cours d'édition
const transferNumber = ref('')
const transferReference = ref('')
const dateTransfert = ref(new Date().toISOString().split('T')[0])
const magasinSource = ref<string>('')
const magasinDestination = ref<string>('')
const notes = ref('')
const produitSelectionne = ref<string>('')
const quantiteTransfert = ref<number | null>(null)
const noteProduit = ref('')
const produitsTransferts = ref<ProduitTransfert[]>([])

// Stocks par produit dans le magasin source (Map: productId -> quantity)
const sourceStoreStocks = ref<Map<number, number>>(new Map())

// États d'ouverture des selects
const isSourceStoreOpen = ref(false)
const isDestinationStoreOpen = ref(false)
const isProductSelectorOpen = ref(false)

// Dialog de confirmation de succès
const isSuccessDialogOpen = ref(false)
const successTransferNumber = ref('')
const errorMessage = ref('')
const isSubmittingTransfer = ref(false) // État de chargement pour éviter les double-clics

interface ProduitTransfert {
  id: number
  product_id: number
  nom: string
  enStock: number
  quantiteTransfert: number
  total: number
  selected: boolean
  notes?: string
}

// Erreurs de validation
const transferErrors = ref({
  transferNumber: '',
  magasinSource: '',
  magasinDestination: '',
  produitsTransferts: ''
})

interface BonTransfert {
  transfer_number: string
  reference?: string
  transfer_date: string
  source_store_name: string
  destination_store_name: string
  status: string
  status_display: string
  notes: string
  total_quantity: number
  lines: TransferLine[]
  lines_count?: number
  created_at: string
}

// Computed
const groupedByTransferNumber = computed((): BonTransfert[] => {
  const grouped = new Map<string, any[]>()

  store.transfers.forEach(transfer => {
    const key = transfer.transfer_number || `UNGROUPED-${transfer.id}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(transfer)
  })

  return Array.from(grouped.entries()).map(([transfer_number, transfers]) => {
    const first = transfers[0]

    // Pour la vue liste, utiliser lines_count du premier transfert
    // La quantité totale sera calculée à partir des détails chargés
    const lines_count = (first as any).lines_count || 0

    // Pour la vue liste, on utilise les données de base
    // Les lignes complètes et la quantité totale seront chargées à la demande dans viewBonDetails
    let lines: TransferLine[] = []
    let total_quantity = 0

    // Si le transfert a déjà les lignes chargées (StockTransferDetail)
    if ((first as StockTransferDetail).lines && Array.isArray((first as StockTransferDetail).lines)) {
      lines = (first as StockTransferDetail).lines
      total_quantity = lines.reduce((sum, line) => sum + Number(line.quantity_requested || 0), 0)
    }

    return {
      transfer_number,
      reference: first.reference || '',
      transfer_date: first.transfer_date,
      source_store_name: first.source_store_name || '',
      destination_store_name: first.destination_store_name || '',
      status: first.status,
      status_display: first.status_display || '',
      notes: first.notes || '',
      total_quantity,
      lines: lines,
      lines_count,
      created_at: first.created_at
    }
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

const filteredBons = computed(() => {
  let filtered = groupedByTransferNumber.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (bon) =>
        bon.transfer_number?.toLowerCase().includes(query) ||
        bon.source_store_name?.toLowerCase().includes(query) ||
        bon.destination_store_name?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const paginatedBons = computed(() => {
  // Utiliser directement les bons filtrés (pagination gérée par l'API)
  return filteredBons.value
})

const totalPages = computed(() => Math.ceil(store.totalCount / pageSize.value))

// Fonctions pour la modale de détails du bon
const viewBonDetails = async (bon: BonTransfert) => {
  // Charger les détails complets avec toutes les lignes
  try {
    // Trouver l'ID du premier transfert avec ce numéro
    const transfer = store.transfers.find(t => t.transfer_number === bon.transfer_number)
    if (transfer) {
      const fullDetails = await store.fetchTransfer(transfer.id)
      selectedBon.value = {
        transfer_number: fullDetails.transfer_number || '',
        transfer_date: fullDetails.transfer_date,
        source_store_name: fullDetails.source_store_name || '',
        destination_store_name: fullDetails.destination_store_name || '',
        status: fullDetails.status,
        status_display: fullDetails.status_display || '',
        notes: fullDetails.notes || '',
        total_quantity: fullDetails.lines?.reduce((sum, line) => sum + Number(line.quantity_requested || 0), 0) || 0,
        lines: fullDetails.lines || [],
        created_at: fullDetails.created_at
      }
    } else {
      selectedBon.value = bon
    }
  } catch (error) {
    selectedBon.value = bon
  }
  isBonDetailOpen.value = true
}

// Fonction pour éditer un bon
const handleEditBon = (bon: BonTransfert) => {
  // Vérifier le statut avant d'autoriser la modification
  if (bon.status !== 'draft') {
    alert(`❌ Modification impossible\n\nCe transfert ne peut plus être modifié car son statut est "${bon.status_display}".\n\nPour le modifier :\n1. Annulez ce transfert\n2. Créez un nouveau transfert avec les bonnes données`)
    return
  }
  openEditTransferModal(bon)
}

// Fonction pour supprimer un bon
const handleDeleteBon = (bon: BonTransfert) => {
  bonToDelete.value = bon
  isDeleteBonDialogOpen.value = true
}

const confirmDeleteBon = async () => {
  if (!bonToDelete.value) return

  try {
    // Récupérer tous les transferts avec ce numéro et les supprimer
    const transfersToDelete = store.transfers.filter(
      t => t.transfer_number === bonToDelete.value!.transfer_number
    )

    for (const transfer of transfersToDelete) {
      await store.deleteTransfer(transfer.id)
    }

    isDeleteBonDialogOpen.value = false
    bonToDelete.value = null

    // Recharger la liste
    await store.fetchTransfers({}, currentPage.value)
  } catch (error) {
    alert(store.error || 'Erreur lors de la suppression du bon')
  }
}

// Fonction pour annuler un transfert
const handleCancelTransfer = async (bon: BonTransfert) => {
  // Message de confirmation différent selon le statut
  let confirmMessage = ''

  if (bon.status === 'in_transit') {
    confirmMessage = `⚠️ ANNULATION DE TRANSFERT EN TRANSIT\n\nTransfert: ${bon.transfer_number}\nSource: ${bon.source_store_name}\nDestination: ${bon.destination_store_name}\n\n🔄 Cette action va :\n• Remettre les produits au stock SOURCE\n• Supprimer les mouvements de sortie\n\nVoulez-vous continuer ?`
  } else if (bon.status === 'received') {
    confirmMessage = `🚨 ATTENTION - ANNULATION DE TRANSFERT REÇU\n\nTransfert: ${bon.transfer_number}\nSource: ${bon.source_store_name}\nDestination: ${bon.destination_store_name}\n\n⚠️ Cette action va :\n• RETIRER les produits du stock DESTINATION\n• REMETTRE les produits au stock SOURCE\n• Supprimer TOUS les mouvements\n\nCette opération peut échouer si le stock destination est insuffisant.\n\nÊtes-vous ABSOLUMENT SÛR de vouloir continuer ?`
  } else {
    confirmMessage = `Voulez-vous annuler le transfert ${bon.transfer_number} ?`
  }

  if (!confirm(confirmMessage)) return

  try {
    // Récupérer l'ID du premier transfert avec ce numéro
    const transfer = store.transfers.find(t => t.transfer_number === bon.transfer_number)
    if (!transfer) {
      throw new Error('Transfert introuvable')
    }

    // Appeler l'API d'annulation
    await store.cancelTransfer(transfer.id)

    // Recharger la liste et les stats
    await store.fetchTransfers({}, currentPage.value)
    await productsStore.fetchProducts() // Recharger les stocks

    // Message de succès
    alert(`✅ Transfert annulé avec succès !\n\nLes stocks ont été restaurés correctement.`)
  } catch (error: any) {

    // Afficher l'erreur détaillée si disponible
    if (error.response?.data?.detail) {
      alert(`❌ Erreur d'annulation\n\n${error.response.data.error}\n\n${error.response.data.detail}`)
    } else if (error.response?.data?.error) {
      alert(`❌ ${error.response.data.error}`)
    } else {
      alert('❌ Erreur lors de l\'annulation du transfert')
    }
  }
}

// Fonction pour exporter un bon en PDF
const exportBonToPdf = async () => {
  if (!selectedBon.value) return

  try {
    // Récupérer les informations de l'entreprise
    let companyInfo = null
    try {
      const response = await CompanySettingsService.getSettings()
      companyInfo = response.data
    } catch (error) {
    }

    const doc = new jsPDF()
    const bon = selectedBon.value

    // En-tête
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('BON DE TRANSFERT DE STOCK', 105, 20, { align: 'center' })

    // Informations du bon
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° Transfert: ${bon.transfer_number}`, 20, 35)
    doc.text(`Date: ${new Date(bon.transfer_date).toLocaleDateString('fr-FR')}`, 20, 42)
    doc.text(`De: ${bon.source_store_name}`, 20, 49)
    doc.text(`Vers: ${bon.destination_store_name}`, 20, 56)
    doc.text(`Statut: ${bon.status_display}`, 20, 63)

    // Notes si disponibles
    if (bon.notes) {
      doc.setFont('helvetica', 'italic')
      doc.text(`Notes: ${bon.notes}`, 20, 70)
    }

    // Tableau des produits
    const tableData = bon.lines.map((line, index) => [
      String(index + 1),
      line.product_name || '',
      String(line.quantity_requested || 0)
    ])

    // Calculer le total
    const totalQuantite = bon.lines.reduce((sum, line) => sum + Number(line.quantity_requested || 0), 0)

    const pageWidth = doc.internal.pageSize.getWidth()
    const tableWidth = pageWidth - 40 // 20mm de marge de chaque côté
    const startX = (pageWidth - tableWidth) / 2

    autoTable(doc, {
      startY: bon.notes ? 78 : 70,
      head: [['N°', 'Produit', 'Quantité transférée']],
      body: tableData,
      foot: [['', 'TOTAL', String(totalQuantite)]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'center' },
      footStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: tableWidth - 70 },
        2: { cellWidth: 50, halign: 'right' }
      },
      margin: { left: startX, right: startX, bottom: 50 },
      tableWidth: tableWidth
    })

    // Pied de page avec informations de l'entreprise
    if (companyInfo) {
      const pageHeight = doc.internal.pageSize.getHeight()
      const pageWidth = doc.internal.pageSize.getWidth()

      const isValidValue = (value: string | null | undefined): boolean => {
        if (!value || value.trim() === '') return false
        if (value.includes('XXX') || value.includes('xxx')) return false
        if (value === 'N/A' || value === 'n/a') return false
        return true
      }

      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')

      if (isValidValue(companyInfo.company_name)) {
        doc.text(companyInfo.company_name, pageWidth / 2, pageHeight - 35, { align: 'center' })
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      let currentY = pageHeight - 30

      if (isValidValue(companyInfo.company_address)) {
        doc.text(companyInfo.company_address, pageWidth / 2, currentY, { align: 'center' })
        currentY += 5
      }

      const contactInfo = []
      if (isValidValue(companyInfo.company_phone)) contactInfo.push(`Tél: ${companyInfo.company_phone}`)
      if (isValidValue(companyInfo.company_email)) contactInfo.push(`Email: ${companyInfo.company_email}`)
      if (contactInfo.length > 0) {
        doc.text(contactInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' })
        currentY += 5
      }

      const additionalInfo = []
      if (isValidValue(companyInfo.company_website)) additionalInfo.push(companyInfo.company_website)
      if (isValidValue(companyInfo.tax_id)) additionalInfo.push(`N° Fiscal: ${companyInfo.tax_id}`)
      if (additionalInfo.length > 0) {
        doc.text(additionalInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' })
      }
    }

    doc.save(`bon-transfert-${bon.transfer_number}.pdf`)
  } catch (error) {
    alert('Erreur lors de l\'export PDF')
  }
}

// Computed pour vérifier si on peut ajouter un produit
const canAddProduct = computed(() => {
  if (!produitSelectionne.value || !quantiteTransfert.value || quantiteTransfert.value <= 0) {
    return false
  }

  const productId = parseInt(produitSelectionne.value)
  const stockActuel = getAvailableStock(productId)
  return quantiteTransfert.value <= stockActuel
})

const stockAvailable = computed(() => {
  if (!produitSelectionne.value) return 0
  const productId = parseInt(produitSelectionne.value)
  return getAvailableStock(productId)
})

const hasSelectedTransferProducts = computed(() => produitsTransferts.value.some(p => p.selected))

// Vérifier si le transfert peut être modifié (seulement en mode "draft")
const isTransferEditable = computed(() => {
  return !editingTransfer.value || editingTransfer.value.status === 'draft'
})

// Calculer le stock disponible en tenant compte des produits déjà ajoutés au transfert
const getAvailableStock = (productId: number): number => {
  // Utiliser le stock du magasin source spécifique, pas le stock global
  const stockActuel = sourceStoreStocks.value.get(productId) || 0

  // Calculer la quantité déjà ajoutée dans le tableau de transfert
  const dejaAjoute = produitsTransferts.value
    .filter(p => p.product_id === productId)
    .reduce((sum, p) => sum + p.quantiteTransfert, 0)

  return stockActuel - dejaAjoute
}

// Filtrer les magasins de destination (exclure le magasin source)
const availableDestinationStores = computed(() => {
  if (!magasinSource.value) return storesStore.activeStores
  return storesStore.activeStores.filter(store => store.id !== parseInt(magasinSource.value))
})

// Charger les stocks du magasin source pour tous les produits
const loadSourceStoreStocks = async () => {
  if (!magasinSource.value) {
    sourceStoreStocks.value.clear()
    return
  }

  const storeId = parseInt(magasinSource.value)

  try {
    // Récupérer tous les stocks du magasin source (utiliser la pagination pour récupérer beaucoup de résultats)
    const response = await inventoryApi.getStockLevels({ store: storeId }, 1)

    // Créer une Map productId -> quantity
    const stocksMap = new Map<number, number>()
    response.results.forEach(stock => {
      const productId = typeof stock.product === 'number' ? stock.product : stock.product.id
      stocksMap.set(productId, stock.quantity)
    })

    sourceStoreStocks.value = stocksMap
  } catch (error) {
    sourceStoreStocks.value.clear()
  }
}

// Watcher pour recharger les stocks quand le magasin source change
watch(magasinSource, async (newValue) => {
  if (newValue) {
    await loadSourceStoreStocks()
  } else {
    sourceStoreStocks.value.clear()
  }
})

// Ouvrir la modale de création
const openNewTransferModal = async () => {
  editingTransferNumber.value = null
  editingTransfer.value = null // Réinitialiser le transfert en édition
  await resetTransferForm()
  isTransferModalOpen.value = true
}

// Fermer la modale et réinitialiser
const closeTransferModal = async () => {
  isTransferModalOpen.value = false
  await resetTransferForm()
  editingTransfer.value = null // Réinitialiser
  isSubmittingTransfer.value = false // Réinitialiser l'état de chargement
}

// Ouvrir la modale d'édition
const openEditTransferModal = async (bon: BonTransfert) => {
  editingTransferNumber.value = bon.transfer_number
  editingTransfer.value = bon // Stocker le transfert complet
  await loadTransferDataInModal(bon)
  isTransferModalOpen.value = true
}

// Générer un numéro de transfert
const generateTransferNumber = async () => {
  try {
    // Récupérer TOUS les transferts pour calculer le bon numéro (sans pagination)
    await store.fetchTransfers({ page_size: 1000 }, 1)

    // Utiliser le format TR + ANNÉE + numéro séquentiel (ex: TR202600001)
    const currentYear = new Date().getFullYear()
    const yearPrefix = `TR${currentYear}`

    const existingNumbers = store.transfers
      .map(t => t.transfer_number)
      .filter(n => n && n.startsWith(yearPrefix))
      .map(n => parseInt(n!.replace(yearPrefix, '')) || 0)

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
    transferNumber.value = `${yearPrefix}${(maxNumber + 1).toString().padStart(4, '0')}`
  } catch (error) {
    const currentYear = new Date().getFullYear()
    transferNumber.value = `TR${currentYear}${Date.now().toString().slice(-4)}`
  }
}

// Charger les données d'un transfert dans la modale
const loadTransferDataInModal = async (bon: BonTransfert) => {
  transferNumber.value = bon.transfer_number
  dateTransfert.value = bon.transfer_date
  const sourceStore = bon.source_store_name ? storesStore.stores.find(s => s.name === bon.source_store_name) : null
  const destStore = bon.destination_store_name ? storesStore.stores.find(s => s.name === bon.destination_store_name) : null
  magasinSource.value = sourceStore?.id?.toString() || ''
  magasinDestination.value = destStore?.id?.toString() || ''
  notes.value = bon.notes || ''

  // Charger les stocks du magasin source avant de mapper les produits
  await loadSourceStoreStocks()

  produitsTransferts.value = bon.lines.map(line => {
    const product = productsStore.products.find(p => p.id === line.product)
    const stockActuel = sourceStoreStocks.value.get(line.product) || 0
    const quantite = Number(line.quantity_requested || 0)

    return {
      id: line.id || Date.now() + Math.random(),
      product_id: line.product,
      nom: line.product_name || product?.name || '',
      enStock: stockActuel + quantite,
      quantiteTransfert: quantite,
      total: stockActuel,
      selected: false,
      notes: line.notes
    }
  })
}

// Ajouter un produit
const ajouterProduitTransfert = () => {
  if (!canAddProduct.value) return

  const productId = parseInt(produitSelectionne.value)
  const product = productsStore.products.find(p => p.id === productId)
  if (!product) return

  const stockActuelProduit = sourceStoreStocks.value.get(productId) || 0
  const quantite = Number(quantiteTransfert.value!)

  // Vérifier le stock disponible (en tenant compte des ajouts précédents)
  const stockDisponible = getAvailableStock(productId)
  if (quantite > stockDisponible) {
    alert(`Stock insuffisant. Disponible: ${stockDisponible}`)
    return
  }

  const existing = produitsTransferts.value.find(p => p.product_id === product.id)
  if (existing) {
    // Mettre à jour la quantité
    const nouvelleQuantite = Number(existing.quantiteTransfert) + quantite
    existing.quantiteTransfert = nouvelleQuantite
    existing.total = stockActuelProduit - nouvelleQuantite
  } else {
    produitsTransferts.value.push({
      id: Date.now(),
      product_id: product.id,
      nom: product.name,
      enStock: stockActuelProduit,
      quantiteTransfert: quantite,
      total: stockActuelProduit - quantite,
      selected: false,
      notes: noteProduit.value || undefined
    })
  }

  produitSelectionne.value = ''
  quantiteTransfert.value = null
  noteProduit.value = ''
  transferErrors.value.produitsTransferts = ''
}

// Supprimer un produit
const supprimerProduitTransfert = (id: number) => {
  produitsTransferts.value = produitsTransferts.value.filter(p => p.id !== id)
}

// Supprimer les produits sélectionnés
const supprimerProduitsSelectionnes = () => {
  produitsTransferts.value = produitsTransferts.value.filter(p => !p.selected)
}

// Toggle sélection
const toggleProduitTransfertSelection = (id: number, checked: boolean) => {
  const p = produitsTransferts.value.find(p => p.id === id)
  if (p) p.selected = checked
}

// Réinitialiser le formulaire
const resetTransferForm = async () => {
  notes.value = ''
  transferReference.value = ''
  magasinSource.value = ''
  magasinDestination.value = ''
  produitsTransferts.value = []
  produitSelectionne.value = ''
  quantiteTransfert.value = null
  noteProduit.value = ''

  Object.keys(transferErrors.value).forEach(key => {
    transferErrors.value[key as keyof typeof transferErrors.value] = ''
  })

  await generateTransferNumber()
}

// Validation du formulaire
const validateTransferForm = (): boolean => {
  let isValid = true

  Object.keys(transferErrors.value).forEach(key => {
    transferErrors.value[key as keyof typeof transferErrors.value] = ''
  })

  if (!transferNumber.value.trim()) {
    transferErrors.value.transferNumber = 'Le numéro de transfert est requis'
    isValid = false
  }

  if (!magasinSource.value || magasinSource.value === '') {
    transferErrors.value.magasinSource = 'Le magasin source est requis'
    isValid = false
  }

  if (!magasinDestination.value || magasinDestination.value === '') {
    transferErrors.value.magasinDestination = 'Le magasin destination est requis'
    isValid = false
  }

  if (magasinSource.value === magasinDestination.value) {
    transferErrors.value.magasinDestination = 'Les magasins source et destination doivent être différents'
    isValid = false
  }

  if (produitsTransferts.value.length === 0) {
    transferErrors.value.produitsTransferts = 'Ajoutez au moins un produit au transfert'
    isValid = false
  }

  return isValid
}

// Soumettre le transfert
const handleSubmitTransfer = async () => {
  // Empêcher les double-clics
  if (isSubmittingTransfer.value) {
    return
  }

  if (!validateTransferForm()) {
    errorMessage.value = 'Veuillez corriger les erreurs avant de soumettre'
    setTimeout(() => errorMessage.value = '', 3000)
    return
  }

  // Activer l'état de chargement
  isSubmittingTransfer.value = true

  try {
    const transferData: CreateTransferData = {
      transfer_number: transferNumber.value,
      reference: transferReference.value || undefined,
      transfer_date: dateTransfert.value,
      source_store: parseInt(magasinSource.value),
      destination_store: parseInt(magasinDestination.value),
      status: 'draft',  // Créer en draft d'abord
      notes: notes.value || undefined,
      lines: produitsTransferts.value.map(p => ({
        product: p.product_id,
        quantity_requested: p.quantiteTransfert,
        notes: p.notes
      }))
    }

    if (editingTransferNumber.value) {
      const oldTransfers = store.transfers.filter(
        t => t.transfer_number === editingTransferNumber.value
      )
      for (const t of oldTransfers) {
        await store.deleteTransfer(t.id)
      }
    }

    // Créer le transfert en draft
    const newTransfer = await store.createTransfer(transferData)

    // Valider immédiatement le transfert (cela créera les StockMovement de sortie)
    if (newTransfer && newTransfer.id) {
      try {
        await store.validateTransfer(newTransfer.id)

        // Recevoir automatiquement le transfert (cela créera les StockMovement d'entrée)
        await store.receiveTransfer(newTransfer.id)

      } catch (validationError: any) {

        // Afficher l'erreur à l'utilisateur
        const errorMsg = validationError.response?.data?.error ||
                        validationError.response?.data?.message ||
                        validationError.message ||
                        'Erreur lors de la validation du transfert'

        errorMessage.value = `Transfert créé mais non validé: ${errorMsg}`
        setTimeout(() => errorMessage.value = '', 10000)

        // Désactiver le chargement même en cas d'erreur
        isSubmittingTransfer.value = false
        return
      }
    } else {
      errorMessage.value = 'Transfert créé mais impossible de le valider (pas d\'ID)'
      setTimeout(() => errorMessage.value = '', 10000)
      isSubmittingTransfer.value = false
      return
    }

    // Afficher le dialogue de succès avec le numéro du transfert créé
    successTransferNumber.value = newTransfer.transfer_number || transferNumber.value
    isTransferModalOpen.value = false
    isSuccessDialogOpen.value = true

    await store.fetchTransfers({}, currentPage.value)

  } catch (error: any) {
    errorMessage.value = error.message || 'Erreur lors de l\'enregistrement'
    setTimeout(() => errorMessage.value = '', 5000)
  } finally {
    // Désactiver l'état de chargement dans tous les cas
    isSubmittingTransfer.value = false
  }
}

// Fermer le dialogue de succès
const handleCloseSuccessDialog = () => {
  isSuccessDialogOpen.value = false
  successTransferNumber.value = ''
}

// Handlers pour les sélecteurs
const handleSourceStoreChange = async (value: string) => {
  magasinSource.value = value
  isSourceStoreOpen.value = false
  clearTransferError('magasinSource')
  // Les stocks seront chargés automatiquement par le watcher
}

const handleDestinationStoreChange = (value: string) => {
  magasinDestination.value = value
  isDestinationStoreOpen.value = false
  clearTransferError('magasinDestination')
}

const handleProductChange = (value: string) => {
  produitSelectionne.value = value
  isProductSelectorOpen.value = false
}

const clearTransferError = (field: keyof typeof transferErrors.value) => {
  transferErrors.value[field] = ''
}

// Charger les données au montage
onMounted(async () => {
  await store.fetchTransfers({}, 1)
  if (productsStore.products.length === 0) await productsStore.fetchProducts()
  if (storesStore.stores.length === 0) await storesStore.fetchAllStoresForTransfers()
})

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
    in_transit: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-3 shadow-lg">
              <ArrowRightLeft class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Transferts de Stock</h1>
              <p class="text-sm text-slate-600">
                Gérer les transferts de produits entre magasins
              </p>
            </div>
          </div>
        </div>
        <Button
          @click="openNewTransferModal"
          class="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
        >
          <Plus class="mr-2 h-4 w-4" />
          Nouveau Transfert
        </Button>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-2">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Bons</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ store.totalCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">Bons de transfert</p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Reçus</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ store.stats.received }}
            </div>
            <p class="mt-1 text-xs text-slate-500">Transferts reçus</p>
          </CardContent>
        </Card>
      </div>

      <!-- Recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-6">
        <div class="space-y-2">
          <Label for="search" class="text-sm font-medium text-slate-700">Rechercher</Label>
          <Input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par numéro, magasin source ou destination..."
            class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Liste des bons -->
      <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader class="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <CardTitle class="text-xl font-bold text-slate-900">Liste des Bons de Transfert</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50/50">
                  <th class="text-left p-4 font-semibold text-slate-700">N° Transfert</th>
                  <th class="text-left p-4 font-semibold text-slate-700">Référence</th>
                  <th class="text-left p-4 font-semibold text-slate-700">Date</th>
                  <th class="text-left p-4 font-semibold text-slate-700">Entrepôt / Magasin</th>
                  <th class="text-left p-4 font-semibold text-slate-700">Point de vente</th>
                  <th class="text-left p-4 font-semibold text-slate-700">Produits</th>
                  <th class="text-right p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedBons.length === 0">
                  <td colspan="7" class="text-center p-8 text-slate-400">
                    <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p class="text-sm font-medium">Aucun transfert trouvé</p>
                  </td>
                </tr>
                <tr v-for="bon in paginatedBons" :key="bon.transfer_number"
                    :class="[
                      'border-b border-slate-100 last:border-0 transition-colors',
                      bon.status === 'cancelled'
                        ? 'bg-red-50/40 hover:bg-red-50/60 opacity-75'
                        : 'hover:bg-blue-50/30'
                    ]"
                >
                  <td class="p-4 font-medium" :class="bon.status === 'cancelled' ? 'text-red-400 line-through' : 'text-blue-600'">
                    {{ bon.transfer_number }}
                  </td>
                  <td class="p-4 italic" :class="bon.status === 'cancelled' ? 'text-slate-400' : 'text-slate-600'">
                    {{ bon.reference || '-' }}
                  </td>
                  <td class="p-4" :class="bon.status === 'cancelled' ? 'text-slate-400' : 'text-slate-700'">
                    {{ new Date(bon.transfer_date).toLocaleDateString('fr-FR') }}
                  </td>
                  <td class="p-4" :class="bon.status === 'cancelled' ? 'text-slate-400' : 'text-slate-700'">
                    {{ bon.source_store_name }}
                  </td>
                  <td class="p-4" :class="bon.status === 'cancelled' ? 'text-slate-400' : 'text-slate-700'">
                    {{ bon.destination_store_name }}
                  </td>
                  <td class="p-4" :class="bon.status === 'cancelled' ? 'text-slate-400' : 'text-slate-700'">
                    {{ bon.lines_count || bon.lines.length }} produit(s)
                  </td>
                  <td class="p-4">
                    <div class="flex justify-end gap-2">
                      <button
                        class="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                        @click="viewBonDetails(bon)"
                        title="Consulter les détails"
                      >
                        <Eye class="h-4 w-4 text-white" />
                      </button>
                      <!-- Bouton Modifier - Uniquement pour les brouillons -->
                      <button
                        v-if="bon.status === 'draft'"
                        class="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                        @click="handleEditBon(bon)"
                        title="Modifier (brouillon uniquement)"
                      >
                        <Edit class="h-4 w-4 text-white" />
                      </button>
                      <!-- Bouton Annuler - Pour tous sauf cancelled -->
                      <button
                        v-if="bon.status !== 'cancelled' && bon.status !== 'draft'"
                        class="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-sm"
                        @click="handleCancelTransfer(bon)"
                        title="Annuler le transfert"
                      >
                        <XCircle class="h-4 w-4 text-white" />
                      </button>
                      <!-- Bouton Supprimer - Uniquement pour les brouillons -->
                      <button
                        v-if="bon.status === 'draft'"
                        class="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-sm"
                        @click="handleDeleteBon(bon)"
                        title="Supprimer (brouillon uniquement)"
                      >
                        <Trash2 class="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/30">
            <p class="text-sm text-slate-600">
              Page {{ currentPage }} sur {{ totalPages }}
            </p>
            <div class="flex gap-2">
              <Button
                @click="async () => { currentPage--; await store.fetchTransfers({}, currentPage) }"
                :disabled="currentPage === 1"
                variant="outline"
                size="sm"
                class="border-slate-300"
              >
                Précédent
              </Button>
              <Button
                @click="async () => { currentPage++; await store.fetchTransfers({}, currentPage) }"
                :disabled="currentPage === totalPages"
                variant="outline"
                size="sm"
                class="border-slate-300"
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modale de détails du bon -->
    <Dialog :open="isBonDetailOpen" @update:open="isBonDetailOpen = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-2xl flex items-center gap-3">
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
              <FileText class="h-6 w-6 text-white" />
            </div>
            Détails du Transfert {{ selectedBon?.transfer_number }}
          </DialogTitle>
          <DialogDescription>
            Transfert du {{ selectedBon && new Date(selectedBon.transfer_date).toLocaleDateString('fr-FR') }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedBon" class="space-y-6">
          <!-- Informations générales -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p class="text-xs text-slate-500 font-medium">Magasin source</p>
              <p class="font-semibold text-slate-900 mt-1">{{ selectedBon.source_store_name }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">Magasin destination</p>
              <p class="font-semibold text-slate-900 mt-1">{{ selectedBon.destination_store_name }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">Statut</p>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium mt-1 inline-block', getStatusBadgeClass(selectedBon.status)]">
                {{ selectedBon.status_display }}
              </span>
            </div>
            <div v-if="selectedBon.notes">
              <p class="text-xs text-slate-500 font-medium">Notes</p>
              <p class="text-sm text-slate-700 mt-1">{{ selectedBon.notes }}</p>
            </div>
          </div>

          <!-- Liste des produits -->
          <div>
            <h4 class="font-semibold text-slate-900 mb-3 text-lg">Produits transférés</h4>
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-slate-700 uppercase">N°</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase">Produit</th>
                    <th class="text-right px-4 py-3 text-xs font-semibold text-slate-700 uppercase">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, index) in selectedBon.lines" :key="line.id" class="border-t border-slate-200 hover:bg-slate-50">
                    <td class="px-4 py-3 text-center text-sm text-slate-700">{{ index + 1 }}</td>
                    <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ line.product_name }}</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-900 font-medium">{{ line.quantity_requested }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colspan="2" class="px-4 py-3 font-bold text-slate-900">TOTAL</td>
                    <td class="px-4 py-3 text-right font-bold text-slate-900">{{ selectedBon.total_quantity }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 flex justify-end">
          <Button @click="exportBonToPdf" variant="outline" class="gap-2">
            <FileText class="h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button @click="isBonDetailOpen = false" class="bg-slate-900 hover:bg-slate-800">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Modale de confirmation de suppression -->
    <Dialog :open="isDeleteBonDialogOpen" @update:open="isDeleteBonDialogOpen = $event">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le transfert {{ bonToDelete?.transfer_number }} ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteBonDialogOpen = false" variant="outline" class="cursor-pointer hover:bg-gray-100">Annuler</Button>
          <Button @click="confirmDeleteBon" variant="destructive" class="cursor-pointer hover:bg-red-700">Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Modale de création/édition de transfert -->
    <Dialog :open="isTransferModalOpen" @update:open="isTransferModalOpen = $event">
      <DialogContent class="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <!-- En-tête sobre et professionnel -->
        <div class="sticky top-0 z-10 bg-blue-600 text-white px-6 py-5 border-b border-blue-500">
          <DialogHeader>
            <div class="flex items-center gap-3">
              <div class="bg-blue-500 p-2.5 rounded-lg">
                <ArrowRightLeft class="h-5 w-5" />
              </div>
              <div>
                <DialogTitle class="text-lg font-semibold text-white">
                  {{ editingTransferNumber ? 'Modifier le Transfert' : 'Nouveau Transfert de Stock' }}
                </DialogTitle>
                <DialogDescription class="text-blue-100 mt-0.5 text-sm">
                  Transférer des produits entre vos magasins
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div class="px-6 py-6 space-y-6 bg-gray-50">
          <!-- Alerte si le transfert n'est pas en brouillon -->
          <Alert
            v-if="editingTransfer && editingTransfer.status !== 'draft'"
            variant="error"
            title="⚠️ Modification Impossible"
            dismissible
            class="border-2"
          >
            <div class="space-y-2">
              <p class="mb-2">Ce transfert ne peut plus être modifié car son statut est <strong>"{{ editingTransfer.status_display }}"</strong>.</p>
              <p class="font-semibold">Pour modifier ce transfert :</p>
              <ol class="list-decimal list-inside ml-2 mt-1 space-y-1">
                <li>Fermez cette fenêtre</li>
                <li>Cliquez sur le bouton "Annuler" du transfert</li>
                <li>Créez un nouveau transfert avec les bonnes données</li>
              </ol>
            </div>
          </Alert>

          <!-- Informations générales -->
          <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Package class="h-5 w-5 text-gray-700" />
              <h3 class="font-semibold text-gray-900">Informations du Transfert</h3>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="modal-transferNumber" class="text-gray-700 font-medium">
                  N° Transfert *
                </Label>
                <div class="relative mt-1.5">
                  <Input
                    id="modal-transferNumber"
                    v-model="transferNumber"
                    :class="{ 'border-red-500': transferErrors.transferNumber }"
                    disabled
                    class="bg-white/80 font-mono font-semibold"
                  />
                </div>
                <p v-if="transferErrors.transferNumber" class="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <span class="text-xs">⚠️</span> {{ transferErrors.transferNumber }}
                </p>
              </div>

              <div>
                <Label htmlFor="modal-reference" class="text-gray-700 font-medium">
                  Référence
                  <span class="text-gray-500 text-xs ml-1">(facultatif)</span>
                </Label>
                <div class="relative mt-1.5">
                  <Input
                    id="modal-reference"
                    v-model="transferReference"
                    placeholder="Ex: BON-2024-001, REF-XXX..."
                    :disabled="!isTransferEditable"
                    class="bg-white/80"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Référence personnalisée pour ce transfert
                </p>
              </div>

              <div>
                <Label htmlFor="modal-dateTransfert" class="text-gray-700 font-medium">
                  Date du transfert
                </Label>
                <div class="relative mt-1.5">
                  <Input
                    id="modal-dateTransfert"
                    v-model="dateTransfert"
                    type="date"
                    :disabled="!isTransferEditable"
                    class="bg-white/80"
                  />
                </div>
              </div>

              <div class="md:col-span-2 border-t border-gray-200 my-2"></div>

              <div>
                <Label htmlFor="modal-magasinSource" class="text-gray-700 font-medium">
                  Magasin source *
                </Label>
                <div class="relative mt-1.5">
                  <Select v-model="magasinSource" :open="isSourceStoreOpen" @update:open="isSourceStoreOpen = $event" @update:modelValue="handleSourceStoreChange" :disabled="!isTransferEditable">
                    <SelectTrigger :class="['bg-white/80', { 'border-red-500': transferErrors.magasinSource }]" :disabled="!isTransferEditable">
                      <SelectValue placeholder="🏪 Sélectionner le magasin d'origine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="store in storesStore.stores"
                        :key="store.id"
                        :value="store.id.toString()"
                      >
                        🏪 {{ store.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p v-if="transferErrors.magasinSource" class="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <span class="text-xs">⚠️</span> {{ transferErrors.magasinSource }}
                </p>
              </div>

              <div>
                <Label htmlFor="modal-magasinDestination" class="text-gray-700 font-medium">
                  Magasin destination *
                </Label>
                <div class="relative mt-1.5">
                  <Select v-model="magasinDestination" :open="isDestinationStoreOpen" @update:open="isDestinationStoreOpen = $event" @update:modelValue="handleDestinationStoreChange" :disabled="!isTransferEditable">
                    <SelectTrigger :class="['bg-white/80', { 'border-red-500': transferErrors.magasinDestination }]" :disabled="!isTransferEditable">
                      <SelectValue placeholder="📍 Sélectionner la destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="store in availableDestinationStores"
                        :key="store.id"
                        :value="store.id.toString()"
                      >
                        📍 {{ store.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p v-if="transferErrors.magasinDestination" class="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <span class="text-xs">⚠️</span> {{ transferErrors.magasinDestination }}
                </p>
              </div>
            </div>
          </div>

          <!-- Ajout de produit -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-gray-100 px-5 py-3.5 border-b border-gray-200">
              <div class="flex items-center gap-2 text-gray-900">
                <Plus class="h-5 w-5" />
                <h3 class="font-semibold">Ajouter des Produits</h3>
              </div>
            </div>

            <div class="p-5 space-y-4">
              <div class="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="modal-produit" class="text-gray-700 font-medium">
                    Produit
                  </Label>
                  <Select v-model="produitSelectionne" :open="isProductSelectorOpen" @update:open="isProductSelectorOpen = $event" @update:modelValue="handleProductChange" :disabled="!isTransferEditable" class="mt-1.5">
                    <SelectTrigger class="bg-white" :disabled="!isTransferEditable">
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="product in productsStore.products"
                        :key="product.id"
                        :value="product.id.toString()"
                      >
                        <div class="flex items-center justify-between gap-2 w-full">
                          <span>{{ product.name }}</span>
                          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Dispo: {{ getAvailableStock(product.id) }}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="produitSelectionne" class="text-sm text-green-700 mt-1.5 font-medium flex items-center gap-1">
                    📦 Stock disponible: {{ stockAvailable }} unités
                  </p>
                </div>

                <div>
                  <Label htmlFor="modal-quantite" class="text-gray-700 font-medium">
                    Quantité à transférer
                  </Label>
                  <Input
                    id="modal-quantite"
                    v-model.number="quantiteTransfert"
                    type="number"
                    min="1"
                    :max="stockAvailable"
                    placeholder="Ex: 50"
                    :disabled="!isTransferEditable"
                    class="mt-1.5 bg-white"
                  />
                  <p v-if="quantiteTransfert && quantiteTransfert > stockAvailable" class="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                    <span class="text-xs">⚠️</span> Stock insuffisant
                  </p>
                </div>

                <div>
                  <Label htmlFor="modal-noteProduit" class="text-gray-700 font-medium">
                    Note (optionnel)
                  </Label>
                  <Input
                    id="modal-noteProduit"
                    v-model="noteProduit"
                    placeholder="Remarque sur ce produit..."
                    :disabled="!isTransferEditable"
                    class="mt-1.5 bg-white"
                  />
                </div>
              </div>

              <Button
                @click="ajouterProduitTransfert"
                :disabled="!canAddProduct || !isTransferEditable"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-5 shadow-sm hover:shadow-md transition-all"
              >
                <Plus class="mr-2 h-5 w-5" />
                Ajouter le produit au transfert
              </Button>
            </div>
          </div>

          <!-- Liste des produits -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-gray-100 px-5 py-3.5 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    {{ produitsTransferts.length }}
                  </div>
                  <h4 class="font-semibold text-gray-900">Produits à transférer</h4>
                </div>
                <Button
                  v-if="hasSelectedTransferProducts && isTransferEditable"
                  @click="supprimerProduitsSelectionnes"
                  variant="destructive"
                  size="sm"
                  class="shadow-sm"
                >
                  <Trash2 class="mr-2 h-4 w-4" />
                  Supprimer sélectionnés
                </Button>
              </div>
            </div>

            <div class="p-5">
              <div v-if="transferErrors.produitsTransferts" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
                <span class="text-xl">⚠️</span>
                <span>{{ transferErrors.produitsTransferts }}</span>
              </div>

              <div v-if="produitsTransferts.length === 0" class="text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-gray-500 font-medium">Aucun produit ajouté</p>
                <p class="text-sm text-gray-400 mt-1">Utilisez le formulaire ci-dessus pour ajouter des produits</p>
              </div>

              <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th class="p-3 text-left w-12">
                        <Checkbox class="border-white" />
                      </th>
                      <th class="p-3 text-left font-semibold">Produit</th>
                      <th class="p-3 text-right font-semibold">En stock</th>
                      <th class="p-3 text-right font-semibold">À transférer</th>
                      <th class="p-3 text-right font-semibold">Stock restant</th>
                      <th class="p-3 text-center font-semibold w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr
                      v-for="produit in produitsTransferts"
                      :key="produit.id"
                      class="hover:bg-blue-50 transition-colors"
                    >
                      <td class="p-3">
                        <Checkbox
                          :checked="produit.selected"
                          @update:checked="toggleProduitTransfertSelection(produit.id, $event)"
                          :disabled="!isTransferEditable"
                        />
                      </td>
                      <td class="p-3">
                        <div class="font-medium text-gray-900">{{ produit.nom }}</div>
                        <div v-if="produit.notes" class="text-xs text-gray-500 mt-1">💬 {{ produit.notes }}</div>
                      </td>
                      <td class="p-3 text-right">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {{ produit.enStock }}
                        </span>
                      </td>
                      <td class="p-3 text-right">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                          {{ produit.quantiteTransfert }}
                        </span>
                      </td>
                      <td class="p-3 text-right">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                          {{ produit.total }}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <Button
                          v-if="isTransferEditable"
                          @click="supprimerProduitTransfert(produit.id)"
                          variant="ghost"
                          size="sm"
                          class="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-300">
                    <tr>
                      <td colspan="3" class="p-4">
                        <span class="font-bold text-gray-900 text-lg">TOTAL</span>
                      </td>
                      <td class="p-4 text-right">
                        <span class="inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold bg-orange-500 text-white shadow-md">
                          {{ produitsTransferts.reduce((sum, p) => sum + p.quantiteTransfert, 0) }}
                        </span>
                      </td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <Label htmlFor="modal-notes" class="text-gray-700 font-medium flex items-center gap-2">
              <span>📝</span> Notes et Commentaires
            </Label>
            <Textarea
              id="modal-notes"
              v-model="notes"
              placeholder="Ajoutez des notes ou commentaires sur ce transfert..."
              rows="3"
              :disabled="!isTransferEditable"
              class="mt-2 bg-white"
            />
          </div>
        </div>

        <!-- Pied avec actions -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <DialogFooter class="flex items-center justify-between sm:justify-between">
            <div class="text-sm text-gray-600">
              <span v-if="produitsTransferts.length > 0" class="font-medium">
                ✓ {{ produitsTransferts.length }} produit(s) prêt(s) à transférer
              </span>
            </div>
            <div class="flex gap-3">
              <Button @click="closeTransferModal" variant="outline" class="min-w-[120px] border-gray-300 hover:bg-gray-50" :disabled="isSubmittingTransfer">
                Annuler
              </Button>
              <Button
                @click="handleSubmitTransfer"
                :disabled="produitsTransferts.length === 0 || !isTransferEditable || isSubmittingTransfer"
                class="min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="isSubmittingTransfer" class="mr-2 h-4 w-4 animate-spin" />
                <Save v-else class="mr-2 h-4 w-4" />
                {{ isSubmittingTransfer ? 'Enregistrement...' : (editingTransferNumber ? 'Mettre à jour' : 'Enregistrer le transfert') }}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Dialogue de confirmation de succès -->
    <Dialog :open="isSuccessDialogOpen" @update:open="isSuccessDialogOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <DialogTitle class="text-xl">Transfert Enregistré !</DialogTitle>
          </div>
          <DialogDescription class="text-base">
            Le transfert <span class="font-bold text-blue-600">{{ successTransferNumber }}</span> a été envoyé avec succès vers le magasin de destination.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button @click="handleCloseSuccessDialog" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
