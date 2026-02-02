<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAchatsStore } from '@/stores/achats'
import { useProductsStore } from '@/stores/products'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { useStoresStore } from '@/stores/stores.store'
import { useUserStore } from '@/stores/user'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Users, Package, Trash2, X, Store } from 'lucide-vue-next'
import FournisseurEditForm from '@/components/fournisseurs/FournisseurEditForm.vue'
import ProductForm from '@/components/products/ProductForm.vue'
import type { SupplierDetail } from '@/stores/fournisseurs'
import type { Product } from '@/stores/products'

interface ProduitAjoute {
  id: number
  product_id: number
  nom: string
  enStock: number
  quantiteAjoutee: number
  unitPriceInput: number | null
  total: number
  selected: boolean
}

const router = useRouter()
const route = useRoute()
const achatsStore = useAchatsStore()
const productsStore = useProductsStore()
const fournisseursStore = useFournisseursStore()
const storesStore = useStoresStore()
const userStore = useUserStore()
const fieldConfigStore = useFieldConfigStore()

// Messages de notification
const successMessage = ref('')
const errorMessage = ref('')

// Composable pour l'assignation de magasin
const { shouldShowStoreSelector, getDefaultStoreId, getDefaultStore } = useStoreAssignment()

const editingId = ref<number | null>(null)
const isEditMode = computed(() => editingId.value !== null)

const numeroPiece = ref('')
const intitule = ref('')
const dateAchat = ref(new Date().toISOString().split('T')[0])
const montantFacture = ref<number | null>(null)
const naturePayement = ref('')
const fournisseurId = ref<number | null>(null)
const montantVerse = ref<number>(0)
const dateLimiteReglement = ref('')
const storeId = ref<number | null>(getDefaultStoreId.value) // Magasin sélectionné (auto-assigné pour utilisateurs restreints)
const deliveryReference = ref('') // Référence du bon de livraison
const pieceJointeName = ref('')
const produitSelectionne = ref<number | null>(null)
const quantiteAjoutee = ref<number | null>(null)
const prixUnitaireProduit = ref<number | null>(null)
const produitsAjoutes = ref<ProduitAjoute[]>([])

// Dialog de confirmation
const isConfirmDialogOpen = ref(false)

// Modal states
const showFournisseurModal = ref(false)
const showProductModal = ref(false)

// Erreurs dynamiques pour tous les champs configurables
const fieldErrors = ref<Record<string, string>>({})

const clearFieldError = (fieldName: string) => {
  delete fieldErrors.value[fieldName]
}

const getFieldError = (fieldName: string) => fieldErrors.value[fieldName] || ''

const montantTotal = computed(() => montantFacture.value || 0)
const montantPaye = computed(() => montantVerse.value || 0)
const montantRestant = computed(() => montantTotal.value - montantPaye.value)
const hasSelectedProducts = computed(() => produitsAjoutes.value.some(p => p.selected))
const canAddProduct = computed(() => produitSelectionne.value !== null && quantiteAjoutee.value !== null && quantiteAjoutee.value > 0)

// Vérifier si le produit sélectionné a déjà un prix d'achat
const selectedProductHasPrice = computed(() => {
  if (!produitSelectionne.value) return false
  const product = productsStore.products.find(p => p.id === produitSelectionne.value)
  return product && product.purchase_price !== null && product.purchase_price !== undefined && product.purchase_price > 0
})

// Calculer automatiquement le montant total de la facture à partir des produits
const calculatedInvoiceAmount = computed(() => {
  let total = 0
  for (const p of produitsAjoutes.value) {
    if (p.unitPriceInput !== null && p.unitPriceInput !== undefined) {
      total += p.unitPriceInput * p.quantiteAjoutee
    }
  }
  return total > 0 ? total : null
})

// Field configuration helpers
const fieldConfigs = computed(() => {
  const configs: Record<string, { visible: boolean; required: boolean }> = {}

  fieldConfigStore.configurations
    .filter(c => c.form_name === 'purchase')
    .forEach(config => {
      configs[config.field_name] = {
        visible: config.is_visible,
        required: config.is_required
      }
    })

  return configs
})

const isFieldVisible = (fieldName: string): boolean => {
  return fieldConfigs.value[fieldName]?.visible ?? true
}

const isFieldRequired = (fieldName: string): boolean => {
  return fieldConfigs.value[fieldName]?.required ?? false
}

// Validate only visible and required fields
const isFormValid = computed(() => {
  // receipt_number est toujours requis
  if (isFieldVisible('receipt_number') && isFieldRequired('receipt_number') && !numeroPiece.value) {
    return false
  }

  // store est toujours requis
  if (isFieldVisible('store') && isFieldRequired('store') && !storeId.value) {
    return false
  }

  // supplier si visible et requis
  if (isFieldVisible('supplier') && isFieldRequired('supplier') && !fournisseurId.value) {
    return false
  }

  // date si visible et requis
  if (isFieldVisible('date') && isFieldRequired('date') && !dateAchat.value) {
    return false
  }

  // Vérifier qu'au moins un produit est ajouté
  if (produitsAjoutes.value.length === 0) {
    return false
  }

  return true
})

onMounted(async () => {
  // Always fetch fresh configurations to ensure we have the latest
  await fieldConfigStore.fetchConfigurations()

  if (productsStore.products.length === 0) await productsStore.fetchProducts()
  if (fournisseursStore.fournisseurs.length === 0) await fournisseursStore.fetchFournisseurs()
  if (storesStore.stores.length === 0) await storesStore.fetchStores()

  // Vérifier si on est en mode édition
  const id = route.query.id
  const receiptNumber = route.query.receipt
  if (receiptNumber) {
    // Édition d'un bon complet (plusieurs produits)
    await loadBonData(receiptNumber as string)
  } else if (id) {
    // Édition d'un achat individuel
    editingId.value = Number(id)
    await loadAchatData(editingId.value)
  } else {
    // Générer un nouveau numéro de pièce depuis le backend
    try {
      numeroPiece.value = await achatsStore.getNextReceiptNumber()
    } catch (error) {
      // Fallback: générer localement si l'API échoue
      const receiptNumbers = await achatsStore.fetchAllReferences()
      const existingNumbers = receiptNumbers
        .filter(r => r?.startsWith('RECEIPT-'))
        .map(r => parseInt(r.replace('RECEIPT-', '')) || 0)
      const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
      numeroPiece.value = `RECEIPT-${(maxNumber + 1).toString().padStart(3, '0')}`
    }
  }
})

// Charger les données d'un bon complet (tous les produits)
const loadBonData = async (receiptNumber: string) => {
  try {
    // Récupérer tous les achats avec ce numéro de bon
    const achatsWithReceipt = achatsStore.achats.filter(a => a.receipt_number === receiptNumber)

    if (achatsWithReceipt.length === 0) {
      await achatsStore.fetchAchats()
      const foundAchats = achatsStore.achats.filter(a => a.receipt_number === receiptNumber)
      if (foundAchats.length === 0) {
        alert('Bon d\'entrée non trouvé')
        router.back()
        return
      }
      fillFormWithBon(foundAchats)
    } else {
      fillFormWithBon(achatsWithReceipt)
    }
  } catch (error) {
    alert('Erreur lors du chargement des données')
    router.back()
  }
}

// Charger les données d'une entrée existante
const loadAchatData = async (id: number) => {
  try {
    const achat = achatsStore.achats.find(a => a.id === id)
    if (!achat) {
      await achatsStore.fetchAchats()
      const foundAchat = achatsStore.achats.find(a => a.id === id)
      if (!foundAchat) {
        alert('Entrée non trouvée')
        router.back()
        return
      }
      fillFormWithAchat(foundAchat)
    } else {
      fillFormWithAchat(achat)
    }
  } catch (error) {
    alert('Erreur lors du chargement des données')
    router.back()
  }
}

// Remplir le formulaire avec tous les produits d'un bon
const fillFormWithBon = (achats: any[]) => {
  if (achats.length === 0) return

  const firstAchat = achats[0]

  // Remplir les champs communs depuis le premier produit
  numeroPiece.value = firstAchat.receipt_number || ''
  storeId.value = firstAchat.store
  deliveryReference.value = firstAchat.reference || ''
  intitule.value = firstAchat.notes || ''
  dateAchat.value = firstAchat.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  fournisseurId.value = firstAchat.supplier || null

  // Calculer le montant total de la facture (somme de tous les invoice_amount)
  const totalInvoiceAmount = achats.reduce((sum, a) => sum + (a.invoice_amount || 0), 0)
  montantFacture.value = totalInvoiceAmount > 0 ? totalInvoiceAmount : null

  // Remplir les informations de paiement si disponibles
  if (firstAchat.payment_info) {
    montantVerse.value = firstAchat.payment_info.payment_amount || null
    dateLimiteReglement.value = firstAchat.payment_info.due_date || ''
    naturePayement.value = firstAchat.payment_info.payment_method || ''
    if (firstAchat.payment_info.payment_date) {
      dateAchat.value = firstAchat.payment_info.payment_date
    }
  }

  // Charger tous les produits du bon
  produitsAjoutes.value = []
  achats.forEach(achat => {
    const product = productsStore.products.find(p => p.id === achat.product)
    if (product) {
      // Le stock actuel inclut déjà la quantité ajoutée, donc on la soustrait pour avoir le stock AVANT l'entrée
      const stockActuel = Number(product.current_stock || 0)
      const quantiteAjoutee = Number(achat.quantity)
      const stockAvant = stockActuel - quantiteAjoutee

      produitsAjoutes.value.push({
        id: achat.id || Date.now() + Math.random(),
        product_id: product.id,
        nom: product.name,
        enStock: stockAvant,
        quantiteAjoutee: quantiteAjoutee,
        unitPriceInput: achat.unit_cost || null,
        total: stockActuel,
        selected: false,
      })
    }
  })
}

// Remplir le formulaire avec les données existantes
const fillFormWithAchat = (achat: any) => {
  numeroPiece.value = achat.receipt_number || achat.reference || ''
  storeId.value = achat.store
  deliveryReference.value = achat.reference || ''
  intitule.value = achat.notes || ''
  dateAchat.value = achat.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  fournisseurId.value = achat.supplier || null

  // Remplir le montant de la facture depuis le champ invoice_amount
  montantFacture.value = achat.invoice_amount || null

  // Remplir les informations de paiement si disponibles
  if (achat.payment_info) {
    montantVerse.value = achat.payment_info.payment_amount || null
    dateLimiteReglement.value = achat.payment_info.due_date || ''
    naturePayement.value = achat.payment_info.payment_method || ''
    if (achat.payment_info.payment_date) {
      dateAchat.value = achat.payment_info.payment_date
    }
  }

  // Ajouter le produit à la liste
  const product = productsStore.products.find(p => p.id === achat.product)
  if (product) {
    // Le stock actuel inclut déjà la quantité ajoutée, donc on la soustrait pour avoir le stock AVANT l'entrée
    const stockActuel = Number(product.current_stock || 0)
    const quantiteAjoutee = Number(achat.quantity)
    const stockAvant = stockActuel - quantiteAjoutee

    produitsAjoutes.value = [{
      id: Date.now(),
      product_id: product.id,
      nom: product.name,
      enStock: stockAvant,
      quantiteAjoutee: quantiteAjoutee,
      unitPriceInput: achat.unit_cost || null,
      total: stockActuel,
      selected: false,
    }]
  }
}

// Handle fournisseur creation
const handleFournisseurCreated = async (fournisseur: SupplierDetail) => {
  await fournisseursStore.fetchFournisseurs()
  fournisseurId.value = fournisseur.id
  showFournisseurModal.value = false
}

// Handle product creation
const handleProductCreated = async (product: Product) => {
  await productsStore.fetchProducts()
  produitSelectionne.value = product.id
  showProductModal.value = false
}

const ajouterProduit = () => {
  if (!canAddProduct.value) return
  const product = productsStore.products.find(p => p.id === produitSelectionne.value)
  if (!product) return

  // Déterminer le prix unitaire à utiliser
  let prixUnitaire: number | null = null
  if (product.purchase_price !== null && product.purchase_price !== undefined && product.purchase_price > 0) {
    // Utiliser le prix d'achat du produit
    prixUnitaire = product.purchase_price
  } else if (prixUnitaireProduit.value !== null) {
    // Utiliser le prix saisi manuellement
    prixUnitaire = prixUnitaireProduit.value
  }

  const existing = produitsAjoutes.value.find(p => p.product_id === product.id)
  if (existing) {
    existing.quantiteAjoutee = Number(existing.quantiteAjoutee) + Number(quantiteAjoutee.value!)
    existing.total = Number(existing.enStock) + Number(existing.quantiteAjoutee)
    // Mettre à jour le prix unitaire si fourni
    if (prixUnitaire !== null) {
      existing.unitPriceInput = prixUnitaire
    }
  } else {
    const stockActuel = Number(product.current_stock || 0)
    const quantite = Number(quantiteAjoutee.value!)

    produitsAjoutes.value.push({
      id: Date.now(),
      product_id: product.id,
      nom: product.name,
      enStock: stockActuel,
      quantiteAjoutee: quantite,
      unitPriceInput: prixUnitaire,
      total: stockActuel + quantite,
      selected: false,
    })
  }

  // Mettre à jour automatiquement le montant de la facture si tous les produits ont un prix
  if (calculatedInvoiceAmount.value !== null && montantFacture.value === null) {
    montantFacture.value = calculatedInvoiceAmount.value
  } else if (calculatedInvoiceAmount.value !== null) {
    // Recalculer automatiquement si le montant n'a pas été modifié manuellement
    montantFacture.value = calculatedInvoiceAmount.value
  }

  produitSelectionne.value = null
  quantiteAjoutee.value = null
  prixUnitaireProduit.value = null
}

const supprimerProduit = (id: number) => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => p.id !== id)
  // Recalculer le montant de la facture
  if (calculatedInvoiceAmount.value !== null) {
    montantFacture.value = calculatedInvoiceAmount.value
  } else {
    montantFacture.value = null
  }
}

const supprimerSelectionnes = () => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => !p.selected)
}

const toggleProduitSelection = (id: number, checked: boolean) => {
  const p = produitsAjoutes.value.find(p => p.id === id)
  if (p) p.selected = checked
}

// Réinitialiser le formulaire
const resetForm = async () => {
  // Réinitialiser tous les champs
  intitule.value = ''
  montantFacture.value = null
  naturePayement.value = ''
  fournisseurId.value = null
  montantVerse.value = 0
  dateLimiteReglement.value = ''
  dateAchat.value = new Date().toISOString().split('T')[0]
  deliveryReference.value = ''
  produitsAjoutes.value = []
  produitSelectionne.value = null
  quantiteAjoutee.value = null

  // Réinitialiser les erreurs
  fieldErrors.value = {}

  // Générer un nouveau numéro de pièce
  try {
    numeroPiece.value = await achatsStore.getNextReceiptNumber()
  } catch (error) {
    const receiptNumbers = await achatsStore.fetchAllReferences()
    const existingNumbers = receiptNumbers
      .filter(r => r?.startsWith('RECEIPT-'))
      .map(r => parseInt(r.replace('RECEIPT-', '')) || 0)
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
    numeroPiece.value = `RECEIPT-${(maxNumber + 1).toString().padStart(3, '0')}`
  }
}

const handleSubmit = async () => {
  // Réinitialiser les erreurs
  fieldErrors.value = {}
  errorMessage.value = ''

  let hasError = false

  // Mapping des champs configurables avec leurs valeurs
  const fieldMapping: Record<string, { value: any; label: string }> = {
    'receipt_number': { value: numeroPiece.value?.trim(), label: 'N° de pièce' },
    'store': { value: storeId.value, label: 'Magasin' },
    'supplier': { value: fournisseurId.value, label: 'Fournisseur' },
    'reference': { value: deliveryReference.value?.trim(), label: 'Référence du bon de livraison' },
    'date': { value: dateAchat.value, label: 'Date de réalisation' },
    'notes': { value: intitule.value?.trim(), label: 'Intitulé de l\'opération' },
    'invoice_amount': { value: montantFacture.value, label: 'Montant de la facture' },
    'payment_amount': { value: montantVerse.value, label: 'Montant versé' },
    'payment_method': { value: naturePayement.value, label: 'Nature du paiement' },
    'due_date': { value: dateLimiteReglement.value, label: 'Date limite de règlement' },
  }

  // Vérifier tous les champs configurés comme obligatoires
  for (const [fieldName, fieldData] of Object.entries(fieldMapping)) {
    const isVisible = isFieldVisible(fieldName)
    const isRequired = isFieldRequired(fieldName)

    if (isVisible && isRequired && !fieldData.value) {
      fieldErrors.value[fieldName] = `Le champ "${fieldData.label}" est obligatoire`
      hasError = true
    }
  }

  // Vérification spécifique : au moins un produit
  if (produitsAjoutes.value.length === 0) {
    fieldErrors.value.produitsAjoutes = 'Veuillez ajouter au moins un produit'
    hasError = true
  }

  // Si montant facture est renseigné et qu'il y a un paiement, certains champs deviennent obligatoires
  if (montantFacture.value !== null && montantFacture.value > 0) {
    // La nature du paiement est obligatoire seulement si un montant est versé
    if (montantVerse.value !== null && montantVerse.value > 0 && !naturePayement.value && !fieldErrors.value['payment_method']) {
      fieldErrors.value['payment_method'] = 'La nature du paiement est obligatoire lorsqu\'un montant est versé'
      hasError = true
    }
    // La date limite de règlement est obligatoire en cas de crédit
    if (!dateLimiteReglement.value && montantRestant.value > 0 && !fieldErrors.value['due_date']) {
      fieldErrors.value['due_date'] = 'La date limite de règlement est obligatoire en cas de crédit (montant restant > 0)'
      hasError = true
    }
  }

  // Si des erreurs, ne pas continuer
  if (hasError) {
    return
  }

  // Ouvrir le dialog de confirmation
  isConfirmDialogOpen.value = true
}

const confirmSubmit = async () => {
  isConfirmDialogOpen.value = false

  try {
    // Mode édition : mise à jour
    if (isEditMode.value && editingId.value) {
      const p = produitsAjoutes.value[0] // Pour l'instant, on gère un seul produit
      const payload = {
        product: p.product_id,
        store: storeId.value,
        quantity: p.quantiteAjoutee,
        receipt_number: numeroPiece.value,
        reference: deliveryReference.value,
        notes: intitule.value,
        supplier: fournisseurId.value || undefined,
        unit_cost: p.unitPriceInput || undefined,
        invoice_amount: montantFacture.value || undefined,
        movement_type: 'in',
        date: dateAchat.value,
        is_debt: montantRestant.value > 0,
        due_date: dateLimiteReglement.value || undefined,
        payment_amount: Number(montantVerse.value) || 0,
        payment_date: dateAchat.value,
        payment_method: naturePayement.value || undefined,
      }

      await achatsStore.updateAchat(editingId.value, payload)
      router.push('/achats/entree-stock')
      // Alerte après redirection
      setTimeout(() => {
        alert('✅ Entrée en stock modifiée avec succès !')
      }, 100)
      return
    }

    // Mode création
    for (let i = 0; i < produitsAjoutes.value.length; i++) {
      const p = produitsAjoutes.value[i]
      const payload = {
        product: p.product_id,
        store: storeId.value || getDefaultStoreId.value,
        quantity: p.quantiteAjoutee,
        receipt_number: numeroPiece.value,  // Même numéro pour tout le bon
        reference: deliveryReference.value,
        notes: intitule.value,
        supplier: fournisseurId.value || undefined,
        unit_cost: p.unitPriceInput || undefined,
        // Stocker le montant de la facture SEULEMENT sur la première ligne
        // pour l'afficher au niveau du bon (pas réparti sur chaque produit)
        invoice_amount: (i === 0 && montantFacture.value) ? montantFacture.value : undefined,
        movement_type: 'in',
        date: dateAchat.value,
        // Gestion du paiement
        is_debt: montantRestant.value > 0,
        due_date: dateLimiteReglement.value || undefined,
        payment_amount: Number(montantVerse.value) || 0,
        payment_date: dateAchat.value,
        payment_method: naturePayement.value || undefined,
      }
      await achatsStore.addAchat(payload)
    }

    // Réinitialiser le formulaire après succès
    await resetForm()

    // Message de succès
    successMessage.value = `✅ ${produitsAjoutes.value.length} entrée(s) en stock créée(s) avec succès !`
    setTimeout(() => {
      successMessage.value = ''
      router.push('/achats/entree-stock')
    }, 2000)
  } catch (error: any) {
    if (error.response?.data) {
      // Vérifier si c'est HTML (erreur Django)
      if (typeof error.response.data === 'string' && error.response.data.includes('<html>')) {
        errorMessage.value = `Erreur serveur (${error.response.status}): Vérifiez les champs du formulaire`
      } else if (typeof error.response.data === 'object') {
        // Extraire les erreurs de champs et les placer dans fieldErrors
        Object.entries(error.response.data).forEach(([field, msgs]: [string, any]) => {
          const errorText = Array.isArray(msgs) ? msgs.join(', ') : msgs

          // Mapper les noms de champs du backend vers les noms utilisés dans le frontend
          const fieldMapping: Record<string, string> = {
            'store': 'store',
            'supplier': 'supplier',
            'date': 'date',
            'receipt_number': 'receipt_number',
            'notes': 'notes',
            'invoice_amount': 'invoice_amount',
            'payment_amount': 'payment_amount',
            'payment_method': 'payment_method',
            'due_date': 'due_date',
            'reference': 'reference'
          }

          const frontendField = fieldMapping[field] || field
          fieldErrors.value[frontendField] = errorText
        })

        // Créer aussi un message global si nécessaire
        const messages = Object.entries(error.response.data)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(', ')
        errorMessage.value = `Veuillez corriger les erreurs dans le formulaire`
      } else {
        errorMessage.value = `Erreur serveur: ${error.response.data}`
      }
    } else {
      errorMessage.value = error.message || 'Erreur inconnue lors de l\'enregistrement'
    }
  }
}

const formatMontant = (n: number) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n)
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : ''
const handleFileUpload = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) document.getElementById('file-upload')?.setAttribute('value', f.name)
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <Package class="w-4 h-4 text-slate-600" />
          </div>
          <h1 class="text-base font-semibold text-slate-900">
            {{ isEditMode ? 'Modifier l\'Entrée en Stock' : 'Nouvelle Entrée en Stock' }}
          </h1>
        </div>
        <button @click="router.back()" class="text-slate-400 hover:text-slate-600 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages de notification -->
      <div v-if="successMessage" class="mx-5 mt-4 mb-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
        <div class="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
        <p class="text-sm text-emerald-800 flex-1">{{ successMessage }}</p>
        <button @click="successMessage = ''" class="text-emerald-600 hover:text-emerald-800">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div v-if="errorMessage" class="mx-5 mt-4 mb-2 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <div class="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
        <p class="text-sm text-red-800 flex-1">{{ errorMessage }}</p>
        <button @click="errorMessage = ''" class="text-red-600 hover:text-red-800">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-5 space-y-4">
        <!-- Section 1: Informations principales -->
        <div class="grid grid-cols-3 gap-3">
          <div v-if="isFieldVisible('receipt_number')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              N° de la piece <span v-if="isFieldRequired('receipt_number')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model="numeroPiece"
              placeholder="No reference"
              :class="['h-9 text-xs w-full bg-slate-50', getFieldError('receipt_number') ? 'border-red-500' : 'border-slate-300']"
              readonly
            />
            <p v-if="getFieldError('receipt_number')" class="text-red-500 text-xs mt-1">{{ getFieldError('receipt_number') }}</p>
          </div>
          <div v-if="isFieldVisible('notes')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Intitulé de l'opération <span v-if="isFieldRequired('notes')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model="intitule"
              @input="clearFieldError('notes')"
              placeholder="Ex : Achat de Merchandises"
              :class="['h-9 text-xs w-full', getFieldError('notes') ? 'border-red-500' : 'border-slate-300']"
            />
            <p v-if="getFieldError('notes')" class="text-red-500 text-xs mt-1">{{ getFieldError('notes') }}</p>
          </div>
          <div v-if="isFieldVisible('date')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Date de réalisation de l'achat <span v-if="isFieldRequired('date')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span>
            </label>
            <Input
              v-model="dateAchat"
              @input="clearFieldError('date')"
              type="date"
              :class="['h-9 text-xs w-full', getFieldError('date') ? 'border-red-500' : 'border-slate-300']"
            />
            <p v-if="getFieldError('date')" class="text-red-500 text-xs mt-1">{{ getFieldError('date') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div v-if="isFieldVisible('invoice_amount')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Montant de la facture <span v-if="isFieldRequired('invoice_amount')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model.number="montantFacture"
              @input="clearFieldError('invoice_amount')"
              type="number"
              placeholder="Ex : 50000"
              :class="['h-9 text-xs w-full', getFieldError('invoice_amount') ? 'border-red-500' : 'border-slate-300']"
              :disabled="calculatedInvoiceAmount !== null"
            />
            <p v-if="calculatedInvoiceAmount !== null" class="text-green-600 text-xs mt-1">Calcul automatique à partir des produits</p>
            <p v-if="getFieldError('invoice_amount')" class="text-red-500 text-xs mt-1">{{ getFieldError('invoice_amount') }}</p>
          </div>
          <div v-if="isFieldVisible('payment_method')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Nature du paiement <span v-if="isFieldRequired('payment_method')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Select v-model="naturePayement" @update:modelValue="clearFieldError('naturePayement')">
              <SelectTrigger class="h-9 text-xs border-slate-300 w-full">
                <SelectValue placeholder="Sélectionner une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="carte">Carte</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="getFieldError('payment_method')" class="text-red-500 text-xs mt-1">{{ getFieldError('payment_method') }}</p>
          </div>
          <div v-if="isFieldVisible('supplier')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Sélectionner le Fournisseur <span v-if="isFieldRequired('supplier')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Select v-model="fournisseurId" @update:modelValue="clearFieldError('supplier')">
              <SelectTrigger :class="['h-9 text-xs w-full', getFieldError('supplier') ? 'border-red-500' : 'border-slate-300']">
                <SelectValue placeholder="Liste des Fournisseurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="f in fournisseursStore.fournisseurs" :key="f.id" :value="f.id">
                  {{ f.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="getFieldError('supplier')" class="text-red-500 text-xs mt-1">{{ getFieldError('supplier') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div v-if="isFieldVisible('payment_amount')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Montant Versé <span v-if="isFieldRequired('payment_amount')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model.number="montantVerse"
              @input="clearFieldError('payment_amount')"
              type="number"
              placeholder="Ex : 30000"
              :class="['h-9 text-xs w-full', getFieldError('payment_amount') ? 'border-red-500' : 'border-slate-300']"
            />
            <p v-if="getFieldError('payment_amount')" class="text-red-500 text-xs mt-1">{{ getFieldError('payment_amount') }}</p>
          </div>
          <div v-if="isFieldVisible('due_date')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Date limite de règlement <span v-if="isFieldRequired('due_date')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model="dateLimiteReglement"
              @input="clearFieldError('due_date')"
              type="date"
              placeholder="JJ/mm/aaaa"
              :class="['h-9 text-xs w-full', getFieldError('due_date') ? 'border-red-500' : 'border-slate-300']"
            />
            <p v-if="getFieldError('due_date')" class="text-red-500 text-xs mt-1">{{ getFieldError('due_date') }}</p>
          </div>
          <div v-if="isFieldVisible('supplier')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">Le fournisseur n'existe pas encore ?</label>
            <Button @click="showFournisseurModal = true" type="button" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-medium">
              Créer ici
            </Button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Afficher le sélecteur uniquement pour les admin/superadmin -->
          <div v-if="shouldShowStoreSelector">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Sélectionner le Store (magasin ou point de vente) <span v-if="isFieldRequired('store')" class="text-red-500">*</span> :
            </label>
            <Select v-model="storeId" @update:modelValue="clearFieldError('store')">
              <SelectTrigger :class="['h-9 text-xs w-full', getFieldError('store') ? 'border-red-500' : 'border-slate-300']">
                <SelectValue placeholder="Liste des stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="store in storesStore.activeStores" :key="store.id" :value="store.id">
                  {{ store.name }} - {{ store.store_type === 'retail' ? 'Point de vente' : store.store_type === 'warehouse' ? 'Entrepôt' : 'Mixte' }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="getFieldError('store')" class="text-red-500 text-xs mt-1">{{ getFieldError('store') }}</p>
          </div>

          <!-- Badge informatif pour les utilisateurs restreints -->
          <div v-else>
            <label class="block text-xs font-medium text-slate-700 mb-1.5">Magasin assigné :</label>
            <div class="flex items-center gap-2 h-9 px-3 bg-blue-50 border border-blue-200 rounded-md">
              <Store class="w-4 h-4 text-blue-600" />
              <span class="text-xs font-medium text-blue-900">{{ getDefaultStore?.name || 'Aucun magasin assigné' }}</span>
            </div>
          </div>

          <div v-if="isFieldVisible('reference')">
            <label class="block text-xs font-medium text-slate-700 mb-1.5">
              Référence du bon de livraison <span v-if="isFieldRequired('reference')">(Obligatoire)</span><span v-else class="text-slate-400">(Facultatif)</span> :
            </label>
            <Input
              v-model="deliveryReference"
              @input="clearFieldError('reference')"
              type="text"
              placeholder="Ex: BL-DELL-2025-001"
              :class="['h-9 text-xs w-full', getFieldError('reference') ? 'border-red-500' : 'border-slate-300']"
            />
            <p v-if="getFieldError('reference')" class="text-red-500 text-xs mt-1">{{ getFieldError('reference') }}</p>
          </div>
        </div>

        <!-- Separator -->
        <div class="border-t border-slate-200 pt-4 mt-4">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <Package class="w-4 h-4 text-slate-600" />
            </div>
            <h2 class="text-base font-semibold text-slate-900">Contenue de l'achat</h2>
            <button @click="router.back()" class="ml-auto text-slate-400 hover:text-slate-600">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Add Product Section -->
          <div class="space-y-3 mb-4">
            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">Produit :</label>
                <Select v-model="produitSelectionne">
                  <SelectTrigger class="h-9 text-xs border-slate-300 w-full">
                    <SelectValue placeholder="Liste des produits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="p in productsStore.products" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div v-if="!selectedProductHasPrice">
                <label class="block text-xs font-medium text-slate-700 mb-1.5">Prix unitaire :</label>
                <Input v-model.number="prixUnitaireProduit" type="number" placeholder="Ex : 1000" class="h-9 text-xs border-slate-300 w-full" min="0" step="0.01" />
              </div>
              <div v-else>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">Prix unitaire :</label>
                <div class="h-9 px-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                  <span class="text-xs font-medium text-green-900">
                    {{ productsStore.products.find(p => p.id === produitSelectionne)?.purchase_price?.toLocaleString() }} FCFA (automatique)
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">Quantité ajoutée :</label>
                <Input v-model.number="quantiteAjoutee" type="number" placeholder="Ex : 50" class="h-9 text-xs border-slate-300 w-full" min="1" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">Le produit n'existe pas encore ?</label>
                <Button @click="showProductModal = true" type="button" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-medium">
                  Créer ici
                </Button>
              </div>
            </div>
            <div class="flex justify-end">
              <Button @click="ajouterProduit" :disabled="!canAddProduct" class="bg-slate-800 hover:bg-slate-900 text-white h-9 px-8 text-xs font-semibold uppercase">
                Ajouter
              </Button>
            </div>
          </div>

          <!-- Products Table -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-semibold text-slate-900">Liste des produits achetés</h3>
              <button v-if="hasSelectedProducts" @click="supprimerSelectionnes" class="text-xs text-blue-600 hover:text-blue-800 underline">
                Supprimer
              </button>
            </div>
            <p v-if="fieldErrors.produitsAjoutes" class="text-red-500 text-xs mb-2">{{ fieldErrors.produitsAjoutes }}</p>
            <div class="border border-slate-200 rounded overflow-hidden">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-blue-600 text-white">
                    <th class="px-3 py-2 text-left text-[11px] font-semibold w-10">
                      <Checkbox class="border-white" />
                    </th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-32">N° Pièce</th>
                    <th class="px-3 py-2 text-left text-[11px] font-semibold">Produit</th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-24">Prix unitaire</th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-20">En stock</th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-20">Ajoutée</th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-20">Total</th>
                    <th class="px-3 py-2 text-center text-[11px] font-semibold w-16">Action</th>
                  </tr>
                </thead>
                <tbody class="bg-slate-50">
                  <tr v-if="produitsAjoutes.length === 0">
                    <td colspan="8" class="px-3 py-6 text-center text-slate-500 text-xs">
                      Aucun produit ajouté
                    </td>
                  </tr>
                  <tr v-for="p in produitsAjoutes" :key="p.id" class="border-b border-slate-200 hover:bg-white transition-colors">
                    <td class="px-3 py-2">
                      <Checkbox :checked="p.selected" @update:checked="(c) => toggleProduitSelection(p.id, c === true)" />
                    </td>
                    <td class="px-3 py-2 text-center text-blue-600 font-mono text-[11px] font-semibold">{{ numeroPiece }}</td>
                    <td class="px-3 py-2 font-medium text-slate-900">{{ p.nom }}</td>
                    <td class="px-3 py-2 text-center text-slate-600">{{ p.unitPriceInput !== null ? p.unitPriceInput.toLocaleString() + ' FCFA' : '-' }}</td>
                    <td class="px-3 py-2 text-center text-slate-600">{{ p.enStock }}</td>
                    <td class="px-3 py-2 text-center font-semibold text-slate-900">{{ p.quantiteAjoutee }}</td>
                    <td class="px-3 py-2 text-center font-semibold text-slate-900">{{ p.total }}</td>
                    <td class="px-3 py-2 text-center">
                      <button @click="supprimerProduit(p.id)" class="text-red-500 hover:text-red-700 inline-flex items-center justify-center w-6 h-6">
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="border-t border-slate-200 pt-4 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-slate-900">Montant Total:</span>
            <span class="text-lg font-bold text-emerald-600">{{ formatMontant(montantTotal) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-slate-700">Montant payé:</span>
            <span class="text-lg font-semibold text-slate-600">{{ formatMontant(montantPaye) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-slate-900">Montant Restant:</span>
            <span class="text-lg font-bold text-red-600">{{ formatMontant(montantRestant) }}</span>
          </div>
          <p class="text-[10px] text-center text-slate-500 pt-1">avant le {{ formatDate(dateLimiteReglement || '04/06/2025') }}</p>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end pt-3 border-t border-slate-200">
          <Button @click="handleSubmit" :disabled="achatsStore.loading" class="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 text-sm font-semibold uppercase">
            {{ achatsStore.loading ? (isEditMode ? 'Modification...' : 'Validation...') : (isEditMode ? 'Modifier' : 'Valider') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialog de confirmation -->
    <Dialog v-model:open="isConfirmDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? 'Confirmer la modification' : 'Confirmer la validation' }}</DialogTitle>
          <DialogDescription class="space-y-2 pt-2">
            <span v-if="isEditMode">
              Modifier cette entrée en stock ?
            </span>
            <span v-else>
              Valider cette entrée en stock ?
            </span>
            <div class="bg-slate-50 p-3 rounded-md space-y-1.5 text-xs mt-2">
              <div class="flex justify-between">
                <span class="text-slate-600">N° Pièce:</span>
                <span class="font-semibold text-slate-900">{{ numeroPiece }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Produits:</span>
                <span class="font-semibold text-slate-900">{{ produitsAjoutes.length }}</span>
              </div>
              <div v-if="montantFacture" class="flex justify-between">
                <span class="text-slate-600">Montant:</span>
                <span class="font-semibold text-slate-900">{{ montantFacture?.toLocaleString('fr-FR') }} FCFA</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="isConfirmDialogOpen = false"
            :disabled="achatsStore.loading"
          >
            Annuler
          </Button>
          <Button
            @click="confirmSubmit"
            :disabled="achatsStore.loading"
            class="bg-blue-600 hover:bg-blue-700"
          >
            {{ achatsStore.loading ? (isEditMode ? 'Modification...' : 'Validation...') : (isEditMode ? 'Modifier' : 'Valider') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Modal Fournisseur -->
    <FournisseurEditForm
      :open="showFournisseurModal"
      @update:open="showFournisseurModal = $event"
      @saved="handleFournisseurCreated"
    />

    <ProductForm
      :open="showProductModal"
      @update:open="showProductModal = $event"
      @submit="handleProductCreated"
    />
  </div>
</template>
