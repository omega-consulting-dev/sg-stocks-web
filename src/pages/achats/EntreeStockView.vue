<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAchatsStore, type Achat, type BonEntree } from '@/stores/achats'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { useAuthStore } from '@/stores/auth.store'
import AchatTable from '@/components/achats/AchatTable.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Package, Plus, Eye, FileText, Printer, Edit, Trash2 } from 'lucide-vue-next'
import { encaissementsApi } from '@/services/api/encaissements.api'
import { CompanySettingsService } from '@/services/company-settings.service'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const route = useRoute()
const store = useAchatsStore()
const fieldConfigStore = useFieldConfigStore()
const authStore = useAuthStore()

// Column configurations
const columnConfigs = computed(() => {
  const configs: Record<string, { visible: boolean; required: boolean }> = {}

  fieldConfigStore.configurations
    .filter(c => c.form_name === 'purchase_table')
    .forEach(config => {
      configs[config.field_name] = {
        visible: config.is_visible,
        required: config.is_required
      }
    })

  return configs
})

// Check if a column is visible
const isColumnVisible = (columnName: string): boolean => {
  return columnConfigs.value[columnName]?.visible ?? true
}

// État local
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const isDeleteDialogOpen = ref(false)
const achatToDelete = ref<Achat | null>(null)
const stores = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedStoreId = ref<number | string>('')
const selectedProductId = ref<number | string>('')
const selectedBon = ref<BonEntree | null>(null)
const isBonDetailOpen = ref(false)
const bonToDelete = ref<BonEntree | null>(null)
const isDeleteBonDialogOpen = ref(false)

const filters = ref({
  start_date: '',
  end_date: '',
  store: undefined as number | string | undefined,
  product: undefined as number | string | undefined,
})

// Computed
const filteredBons = computed(() => {
  let filtered = store.groupedByReceipt

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (bon) =>
        bon.receipt_number?.toLowerCase().includes(query) ||
        bon.reference?.toLowerCase().includes(query) ||
        bon.store_name?.toLowerCase().includes(query) ||
        bon.supplier_name?.toLowerCase().includes(query)
    )
  }

  // Filtrer par store si nécessaire
  if (filters.value.store) {
    filtered = filtered.filter(bon =>
      bon.products.some(p => p.store === filters.value.store)
    )
  }

  return filtered
})

const paginatedBons = computed(() => {
  // Paginer côté client après le regroupement
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredBons.value.slice(startIndex, endIndex)
})

// Nombre total de pages
const totalPages = computed(() => Math.ceil(filteredBons.value.length / pageSize.value))

// Fonctions pour la modale de détails du bon
const viewBonDetails = (bon: BonEntree) => {
  selectedBon.value = bon
  isBonDetailOpen.value = true
}

// Fonction pour éditer un bon
const handleEditBon = (bon: BonEntree) => {
  // Naviguer vers la page d'édition avec le numéro du bon
  if (bon.receipt_number) {
    router.push(`/achats/entree-stock/nouveau?receipt=${encodeURIComponent(bon.receipt_number)}`)
  }
}

// Fonction pour supprimer un bon
const handleDeleteBon = (bon: BonEntree) => {
  bonToDelete.value = bon
  isDeleteBonDialogOpen.value = true
}

const confirmDeleteBon = async () => {
  if (!bonToDelete.value) return

  try {
    // Supprimer tous les produits du bon
    for (const product of bonToDelete.value.products) {
      await store.deleteAchat(product.id)
    }

    isDeleteBonDialogOpen.value = false
    bonToDelete.value = null

    // Recharger la liste
    await store.fetchAchats()
  } catch (error) {
    alert(store.error || 'Erreur lors de la suppression du bon')
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
    doc.text('BON D\'ENTREE EN STOCK', 105, 20, { align: 'center' })

    // Informations du bon
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° Bon: ${bon.receipt_number}`, 20, 35)
    doc.text(`Date: ${new Date(bon.date).toLocaleDateString('fr-FR')}`, 20, 42)
    doc.text(`Magasin: ${bon.store_name}`, 20, 49)
    if (bon.supplier_name) {
      doc.text(`Fournisseur: ${bon.supplier_name}`, 20, 56)
    }
    if (bon.reference) {
      doc.text(`Référence: ${bon.reference}`, 20, 63)
    }

    // Notes si disponibles
    if (bon.notes) {
      doc.setFont('helvetica', 'italic')
      doc.text(`Notes: ${bon.notes}`, 20, 70)
    }

    // Vérifier si l'utilisateur peut voir les prix
    const canViewPrices = authStore.isAdmin || authStore.isAccountant

    // Tableau des produits - seulement produit et quantité (pas de prix unitaire)
    const tableData = bon.products.map(p => {
      return [
        p.product_name || '',
        String(p.quantity)
      ]
    })

    // Calculer les totaux exacts
    const totalQuantite = bon.products.reduce((sum, p) => sum + Number(p.quantity), 0)
    const totalMontant = bon.total_amount || bon.products.reduce((sum, p) => sum + Number(p.invoice_amount || 0), 0)

    // En-têtes de colonnes - juste Produit et Quantité
    const headColumns = [['Produit', 'Quantité']]

    // Ligne de total avec le montant si l'utilisateur a la permission
    const footRow = canViewPrices
      ? [['TOTAL', String(totalQuantite), Math.round(totalMontant) + ' FCFA']]
      : [['TOTAL', String(totalQuantite)]]

    autoTable(doc, {
      startY: bon.notes ? 78 : 70,
      head: headColumns,
      body: tableData,
      foot: footRow,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: canViewPrices ? {
        0: { cellWidth: 100 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' }
      } : {
        0: { cellWidth: 130 },
        1: { cellWidth: 60, halign: 'right' }
      },
      margin: { bottom: 50 } // Espace pour le pied de page
    })

    // Pied de page avec informations de l'entreprise
    if (companyInfo) {
      const pageHeight = doc.internal.pageSize.getHeight()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40)

      // Informations de l'entreprise
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')

      // Fonction pour vérifier si une valeur est un placeholder ou vide
      const isValidValue = (value: string | null | undefined): boolean => {
        if (!value || value.trim() === '') return false
        // Vérifier si c'est un placeholder (contient XXX ou est une valeur par défaut)
        if (value.includes('XXX') || value.includes('xxx')) return false
        if (value === 'N/A' || value === 'n/a') return false
        return true
      }

      // Nom de l'entreprise (toujours affiché s'il existe)
      if (isValidValue(companyInfo.company_name)) {
        doc.text(companyInfo.company_name, pageWidth / 2, pageHeight - 35, { align: 'center' })
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      let currentY = pageHeight - 30

      // Ligne 1: Adresse
      if (isValidValue(companyInfo.company_address)) {
        doc.text(companyInfo.company_address, pageWidth / 2, currentY, { align: 'center' })
        currentY += 5
      }

      // Ligne 2: Téléphone et Email
      const contactInfo = []
      if (isValidValue(companyInfo.company_phone)) contactInfo.push(`Tél: ${companyInfo.company_phone}`)
      if (isValidValue(companyInfo.company_email)) contactInfo.push(`Email: ${companyInfo.company_email}`)
      if (contactInfo.length > 0) {
        doc.text(contactInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' })
        currentY += 5
      }

      // Ligne 3: Site web et Numéro fiscal
      const additionalInfo = []
      if (isValidValue(companyInfo.company_website)) additionalInfo.push(companyInfo.company_website)
      if (isValidValue(companyInfo.tax_id)) additionalInfo.push(`N° Fiscal: ${companyInfo.tax_id}`)
      if (additionalInfo.length > 0) {
        doc.text(additionalInfo.join(' | '), pageWidth / 2, currentY, { align: 'center' })
      }
    }

    // Sauvegarder le PDF
    doc.save(`bon-entree-${bon.receipt_number}.pdf`)
  } catch (error) {
    alert('Erreur lors de l\'export PDF')
  }
}

// Charger les données au montage
onMounted(async () => {
  // Always fetch fresh configurations to ensure we have the latest
  await fieldConfigStore.fetchConfigurations()

  // Charger la liste des stores
  stores.value = await encaissementsApi.getStores()

  loadAchats()
})

// Recharger les données à chaque fois qu'on navigue vers cette page
watch(() => route.path, (newPath) => {
  if (newPath === '/achats/entree-stock') {
    loadAchats()
  }
}, { immediate: false })

// Charger les données avec filtres
const loadAchats = async (page: number = 1) => {
  const apiFilters: Record<string, string | number> = {}
  if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
  if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
  if (filters.value.store) apiFilters.store = filters.value.store
  if (filters.value.product) apiFilters.product = filters.value.product
  await store.fetchAchats(apiFilters, page, pageSize.value)
  currentPage.value = page
}

// Gestion du changement de store
const handleStoreChange = () => {
  filters.value.store = selectedStoreId.value === '' ? undefined : selectedStoreId.value
  currentPage.value = 1
  loadAchats(1)
}

// Gestion du changement de dates
const handleDateChange = () => {
  currentPage.value = 1
  loadAchats(1)
}


// Gestion de l'ajout - Navigation vers la page dédiée
const handleAdd = () => {
  router.push('/achats/entree-stock/nouveau')
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    const apiFilters: Record<string, string | number> = {}
    if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
    if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
    if (filters.value.store) apiFilters.store = filters.value.store
    if (filters.value.product) apiFilters.product = filters.value.product
    if (searchQuery.value) apiFilters.search = searchQuery.value
    await store.exportPdf(apiFilters)
  } catch (error) {
    alert('Erreur lors de l\'export PDF')
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    const apiFilters: Record<string, string | number> = {}
    if (filters.value.start_date) apiFilters.date_from = filters.value.start_date
    if (filters.value.end_date) apiFilters.date_to = filters.value.end_date
    if (filters.value.store) apiFilters.store = filters.value.store
    if (filters.value.product) apiFilters.product = filters.value.product
    if (searchQuery.value) apiFilters.search = searchQuery.value
    await store.exportExcel(apiFilters)
  } catch (error) {
    alert('Erreur lors de l\'export Excel')
  }
}

// Gestion de la modification - Navigation vers la page dédiée
const handleEdit = (achat: Achat) => {
  router.push(`/achats/entree-stock/nouveau?id=${achat.id}`)
}

// Gestion de la suppression
const handleDelete = (achat: Achat) => {
  achatToDelete.value = achat
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!achatToDelete.value) return

  try {
    await store.deleteAchat(achatToDelete.value.id)
    isDeleteDialogOpen.value = false
    achatToDelete.value = null
    // Recharger la liste après suppression
    await store.fetchAchats()
  } catch (error) {
    alert(store.error || 'Erreur lors de la suppression de l\'entrée')
  }
}

// Gestion de la pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 shadow-lg">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Entrées en stock</h1>
              <p class="text-sm text-slate-600">
                Gérer les entrées en stock et les achats
              </p>
            </div>
          </div>
        </div>
        <Button
          @click="handleAdd"
          class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
        >
          <Plus class="mr-2 h-4 w-4" />
          Nouvelle entrée
        </Button>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-2">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Entrées</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {{ store.totalCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Bons d'entrée
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Valeur Totale</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ filteredBons.reduce((sum, b) => sum + Number(b.total_amount || 0), 0).toLocaleString('fr-FR') }} FCFA
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Montant total des bons
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Filtres de recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4 space-y-4">
        <!-- Ligne 1: Store et Produit -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="store-select" class="text-sm font-medium text-slate-700">Point de Vente</Label>
            <select
              id="store-select"
              v-model="selectedStoreId"
              @change="handleStoreChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Tous les points de vente</option>
              <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
                {{ storeItem.name }} ({{ storeItem.code }})
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="search" class="text-sm font-medium text-slate-700">Rechercher</Label>
            <Input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par référence, produit..."
              class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>

        <!-- Ligne 2: Dates et Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="start-date" class="text-sm font-medium text-slate-700">Du</Label>
            <Input
              id="start-date"
              v-model="filters.start_date"
              type="date"
              class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              @change="handleDateChange"
            />
          </div>
          <div class="space-y-2">
            <Label for="end-date" class="text-sm font-medium text-slate-700">Au</Label>
            <Input
              id="end-date"
              v-model="filters.end_date"
              type="date"
              :min="filters.start_date"
              class="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>

    <!-- Tableau des bons d'entrée -->
    <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm">
      <CardContent class="p-3 sm:p-6">
        <div class="rounded-lg border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto -mx-3 sm:mx-0">
            <table class="w-full min-w-[800px]">
              <thead class="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <th v-if="isColumnVisible('receipt_number')" class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    N° Bon
                  </th>
                  <th v-if="isColumnVisible('created_at')" class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th v-if="isColumnVisible('store_name')" class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Point de vente
                  </th>
                  <th v-if="isColumnVisible('supplier_name')" class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th v-if="isColumnVisible('product_name')" class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Produits
                  </th>
                  <th v-if="isColumnVisible('quantity')" class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Qté totale
                  </th>
                  <th v-if="isColumnVisible('invoice_amount')" class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Montant
                  </th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                <tr v-if="store.loading" class="hover:bg-slate-50">
                  <td colspan="8" class="px-6 py-12 text-center text-slate-500">
                    Chargement...
                  </td>
                </tr>
                <tr v-else-if="paginatedBons.length === 0" class="hover:bg-slate-50">
                  <td colspan="8" class="px-6 py-12 text-center text-slate-500">
                    Aucun bon d'entrée trouvé
                  </td>
                </tr>
                <tr
                  v-for="bon in paginatedBons"
                  :key="bon.receipt_number"
                  class="hover:bg-amber-50/50 transition-colors"
                >
                  <td v-if="isColumnVisible('receipt_number')" class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <FileText class="h-5 w-5 text-white" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-semibold text-slate-900">
                          {{ bon.receipt_number }}
                        </div>
                        <div class="text-xs text-slate-500">
                          {{ bon.reference || '-' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td v-if="isColumnVisible('created_at')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ new Date(bon.date).toLocaleDateString('fr-FR') }}
                  </td>
                  <td v-if="isColumnVisible('store_name')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ bon.store_name }}
                  </td>
                  <td v-if="isColumnVisible('supplier_name')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ bon.supplier_name || '-' }}
                  </td>
                  <td v-if="isColumnVisible('product_name')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-700">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ bon.products.length }} produit{{ bon.products.length > 1 ? 's' : '' }}
                    </span>
                  </td>
                  <td v-if="isColumnVisible('quantity')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                    {{ bon.total_quantity.toLocaleString('fr-FR') }}
                  </td>
                  <td v-if="isColumnVisible('invoice_amount')" class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-semibold text-slate-900">
                    {{ bon.total_amount.toLocaleString('fr-FR') }} FCFA
                  </td>
                  <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="viewBonDetails(bon)"
                        class="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Consulter"
                      >
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleEditBon(bon)"
                        class="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Modifier"
                      >
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleDeleteBon(bon)"
                        class="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="store.totalCount > pageSize" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
          <div class="text-sm text-slate-700 text-center sm:text-left">
            Affichage de {{ (currentPage - 1) * pageSize + 1 }} à
            {{ Math.min(currentPage * pageSize, filteredBons.length) }} sur
            {{ filteredBons.length }} bons
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="handlePageChange(currentPage - 1)"
              class="flex-1 sm:flex-none"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="handlePageChange(currentPage + 1)"
              class="flex-1 sm:flex-none"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Modale de détails du bon -->
    <Dialog :open="isBonDetailOpen" @update:open="isBonDetailOpen = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-3 text-2xl">
            <div class="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
              <FileText class="h-6 w-6 text-white" />
            </div>
            Bon d'entrée {{ selectedBon?.receipt_number }}
          </DialogTitle>
          <DialogDescription>
            Détails complets du bon d'entrée
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedBon" class="space-y-6">
          <!-- Informations du bon -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <div class="text-xs text-slate-500 font-medium">Date</div>
              <div class="text-sm font-semibold text-slate-900">
                {{ new Date(selectedBon.date).toLocaleDateString('fr-FR') }}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-medium">Point de vente</div>
              <div class="text-sm font-semibold text-slate-900">
                {{ selectedBon.store_name }}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-medium">Fournisseur</div>
              <div class="text-sm font-semibold text-slate-900">
                {{ selectedBon.supplier_name || '-' }}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-medium">Référence</div>
              <div class="text-sm font-semibold text-slate-900">
                {{ selectedBon.reference || '-' }}
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedBon.notes" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="text-xs text-blue-700 font-medium mb-1">Notes</div>
            <div class="text-sm text-blue-900">{{ selectedBon.notes }}</div>
          </div>

          <!-- Liste des produits -->
          <div class="border border-slate-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Produit
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                    Quantité
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                <tr
                  v-for="product in selectedBon.products"
                  :key="product.id"
                  class="hover:bg-slate-50"
                >
                  <td class="px-4 py-3 text-sm text-slate-900">
                    {{ product.product_name }}
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-medium text-slate-900">
                    {{ product.quantity.toLocaleString('fr-FR') }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gradient-to-r from-amber-50 to-orange-50">
                <tr>
                  <td class="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                    TOTAL
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    {{ selectedBon.total_amount.toLocaleString('fr-FR') }} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Résumé -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
            <div class="text-center">
              <div class="text-xs text-slate-600 font-medium mb-1">Total produits</div>
              <div class="text-2xl font-bold text-amber-600">
                {{ selectedBon.products.length }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-slate-600 font-medium mb-1">Quantité totale</div>
              <div class="text-2xl font-bold text-orange-600">
                {{ selectedBon.total_quantity.toLocaleString('fr-FR') }}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 mt-6">
          <Button
            variant="outline"
            @click="isBonDetailOpen = false"
          >
            Fermer
          </Button>
          <Button
            @click="exportBonToPdf"
            class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Printer class="h-4 w-4 mr-2" />
            Exporter en PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de confirmation de suppression (conservé pour compatibilité) -->
    <Dialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette entrée de stock pour
            <span class="font-semibold">{{ achatToDelete?.product_name }}</span> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="store.loading"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="store.loading"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de confirmation de suppression de bon -->
    <Dialog :open="isDeleteBonDialogOpen" @update:open="isDeleteBonDialogOpen = $event">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Supprimer le bon <span class="font-semibold">{{ bonToDelete?.receipt_number }}</span> ?
            <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-xs text-amber-900 font-medium mb-2">Cette action supprimera :</p>
              <ul class="text-xs text-amber-800 space-y-1">
                <li>• {{ bonToDelete?.products.length }} produit(s)</li>
                <li>• Qté : {{ bonToDelete?.total_quantity }}</li>
                <li>• {{ bonToDelete?.total_amount.toLocaleString('fr-FR') }} FCFA</li>
              </ul>
            </div>
            <p class="mt-3 text-xs text-red-600 font-semibold">⚠️ Action irréversible</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="isDeleteBonDialogOpen = false"
            :disabled="store.loading"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDeleteBon"
            :disabled="store.loading"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer le bon' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  </div>
</template>
