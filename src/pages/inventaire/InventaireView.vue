<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-lg">
              <Package class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">État des Stocks - Inventaire</h1>
              <p class="text-sm text-slate-600">
                Visualisez l'état actuel de vos stocks par produit et magasin
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-4">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Quantité Totale</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {{ store.totalQuantity }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Unités en stock
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Valeur Totale</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ formatCurrency(store.totalValue) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              FCFA
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Stocks Faibles</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-2.5">
              <AlertTriangle class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {{ store.lowStockCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Articles en alerte
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Ruptures</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-pink-500 p-2.5">
              <XCircle class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {{ store.outOfStockCount }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Articles épuisés
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Filtres de recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4 space-y-4">
        <!-- Ligne 1: Recherche, Magasin et Produit -->
        <div class="grid grid-cols-1 gap-4" :class="shouldShowStoreSelector ? 'md:grid-cols-3' : 'md:grid-cols-2'">
          <div class="space-y-2">
            <Label for="search" class="text-sm font-medium text-slate-700">Rechercher un produit</Label>
            <Input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Entrez le nom du produit..."
              class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              @input="handleSearch"
            />
          </div>

          <div v-if="shouldShowStoreSelector" class="space-y-2">
            <Label for="store" class="text-sm font-medium text-slate-700">{{ getStoreLabel }}</Label>
            <select
              id="store"
              v-model="filters.store"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tous les magasins</option>
              <option v-for="magasin in store.stores" :key="magasin.id" :value="magasin.id">
                {{ magasin.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="product" class="text-sm font-medium text-slate-700">Produit</Label>
            <select
              id="product"
              v-model="filters.product"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Tous les produits</option>
              <option v-for="product in store.products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Ligne 2: Période de l'inventaire -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="date-from" class="text-sm font-medium text-slate-700">Date du</Label>
            <Input
              id="date-from"
              v-model="filters.date_from"
              type="date"
              :max="today"
              class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              @change="handleFilterChange"
            />
            <p class="text-xs text-slate-500">
              Date de début de la période
            </p>
          </div>
          <div class="space-y-2">
            <Label for="date-to" class="text-sm font-medium text-slate-700">Date au</Label>
            <Input
              id="date-to"
              v-model="filters.date_to"
              type="date"
              :min="filters.date_from"
              :max="today"
              class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              @change="handleFilterChange"
            />
            <p class="text-xs text-slate-500">
              Date de fin de la période
            </p>
          </div>
        </div>

        <!-- Ligne 3: Actions -->
        <div class="flex items-center justify-between gap-4">
          <Button @click="handleReset" variant="outline" class="px-4">
            <RotateCcw class="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="px-4">
                <Download class="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="rounded-lg" align="end">
              <DropdownMenuItem @select="handleExportPdf">
                <FileText class="mr-2 h-4 w-4" />
                Document PDF
              </DropdownMenuItem>
              <DropdownMenuItem @select="handleExportExcel">
                <FileSpreadsheet class="mr-2 h-4 w-4" />
                Document Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Info Banner if product filtered -->
      <div v-if="filters.product" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-blue-500 p-1">
            <Info class="h-4 w-4 text-white" />
          </div>
          <p class="text-sm font-medium text-blue-900">
            Affichage du stock pour : <span class="font-bold">{{ getProductName(filters.product) }}</span>
          </p>
        </div>
      </div>

      <!-- Table -->
      <InventaireTable
        :stocks="store.stocks"
        :loading="store.loading"
        :current-page="store.currentPage"
        :total-pages="store.totalPages"
        :filtered-store-name="filters.store ? getStoreName(filters.store) : ''"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventaireStore } from '@/stores/inventaire'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Info
} from 'lucide-vue-next'
import InventaireTable from '@/components/inventaire/InventaireTable.vue'
import type { StockFilters } from '@/services/api/inventory.api'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CompanySettingsService } from '@/services/company-settings.service'

const store = useInventaireStore()
const { shouldShowStoreSelector, getDefaultStoreId, getStoreLabel } = useStoreAssignment()

const filters = ref({
  search: '',
  store: '',
  product: '',
  date_from: '', // Date de début de la période
  date_to: '' // Date de fin de la période
})

// Date du jour au format YYYY-MM-DD
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getProductName = (productId: string | number) => {
  const id = typeof productId === 'string' ? Number(productId) : productId
  const product = store.products.find(p => p.id === id)
  return product?.name || 'Inconnu'
}

const getStoreName = (storeId: string | number) => {
  const id = typeof storeId === 'string' ? Number(storeId) : storeId
  const magasin = store.stores.find(s => s.id === id)
  return magasin?.name || ''
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    handleFilterChange()
  }, 500)
}

const handleFilterChange = () => {
  const apiFilters: StockFilters = {}

  if (filters.value.search) {
    apiFilters.search = filters.value.search
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  if (filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }
  store.fetchStocks(apiFilters, 1)
}

const handleReset = () => {
  filters.value = {
    search: '',
    store: '',
    product: '',
    date_from: '',
    date_to: ''
  }
  store.fetchStocks({}, 1)
}

const handlePageChange = (page: number) => {
  const apiFilters: StockFilters = {}

  if (filters.value.search) {
    apiFilters.search = filters.value.search
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  if (filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (filters.value.date) {
    apiFilters.date_to = filters.value.date
  }

  store.fetchStocks(apiFilters, page)
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  const apiFilters: StockFilters = {}

  if (filters.value.search) {
    apiFilters.search = filters.value.search
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  if (filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  try {
    await store.exportExcel(apiFilters)
  } catch (error) {
    alert('Erreur lors de l\'export Excel')
  }
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    // Récupérer les informations de l'entreprise
    let companyInfo = null
    try {
      const response = await CompanySettingsService.getSettings()
      companyInfo = response.data
    } catch (error) {
    }

    const doc = new jsPDF()

    // En-tête
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('État d\'inventaire', 105, 20, { align: 'center' })

    // Date d'export
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35)

    // Filtres appliqués
    let yPos = 42
    if (filters.value.date_from || filters.value.date_to) {
      doc.setFont('helvetica', 'bold')
      if (filters.value.date_from && filters.value.date_to) {
        doc.text(`Période: du ${new Date(filters.value.date_from).toLocaleDateString('fr-FR')} au ${new Date(filters.value.date_to).toLocaleDateString('fr-FR')}`, 20, yPos)
      } else if (filters.value.date_from) {
        doc.text(`Période: à partir du ${new Date(filters.value.date_from).toLocaleDateString('fr-FR')}`, 20, yPos)
      } else if (filters.value.date_to) {
        doc.text(`Période: jusqu'au ${new Date(filters.value.date_to).toLocaleDateString('fr-FR')}`, 20, yPos)
      }
      doc.setFont('helvetica', 'normal')
      yPos += 7
    }
    if (filters.value.search) {
      doc.text(`Recherche: ${filters.value.search}`, 20, yPos)
      yPos += 7
    }
    if (filters.value.store) {
      const storeData = store.stores.find(s => s.id === Number(filters.value.store))
      const storeName = storeData?.name || 'Inconnu'
      const storeType = storeData?.store_type || 'retail'

      // Déterminer le libellé selon le type de magasin
      let storeLabel = 'Magasin'
      if (storeType === 'warehouse') {
        storeLabel = 'Entrepôt'
      } else if (storeType === 'retail') {
        storeLabel = 'Point de vente'
      }

      doc.text(`${storeLabel}: ${storeName}`, 20, yPos)
      yPos += 7
    }
    if (filters.value.product) {
      const productName = store.products.find(p => p.id === Number(filters.value.product))?.name || 'Inconnu'
      doc.text(`Produit: ${productName}`, 20, yPos)
      yPos += 7
    }

    // Tableau des stocks avec toutes les colonnes
    const tableData = store.stocks.map((stock) => [
      stock.product_reference || '-',
      stock.product_name || '-',
      stock.store_name || '-',
      String(stock.quantity || 0),
      '', // Stock physique (colonne vide pour saisie manuelle)
      ''  // Ecart (colonne vide pour calcul manuel)
    ])

    const pageWidth = doc.internal.pageSize.getWidth()
    const tableWidth = pageWidth - 40 // 20mm de marge de chaque côté
    const startX = (pageWidth - tableWidth) / 2

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Référence', 'Produit / Désignation', 'Magasin', 'Stock théorique', 'Stock physique', 'Ecart']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' },    // Référence
        1: { cellWidth: 50, halign: 'left' },    // Produit / Désignation
        2: { cellWidth: 30, halign: 'left' },    // Magasin
        3: { cellWidth: 28, halign: 'center' },  // Stock théorique
        4: { cellWidth: 28, halign: 'center' },  // Stock physique
        5: { cellWidth: 28, halign: 'center' }   // Ecart
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

    // Télécharger le PDF
    doc.save(`inventaire_${new Date().toISOString().split('T')[0]}.pdf`)

  } catch (error) {
    alert('Erreur lors de l\'export PDF')
  }
}

onMounted(() => {
  // Si l'utilisateur a un magasin par défaut, le sélectionner automatiquement
  if (getDefaultStoreId.value) {
    filters.value.store = String(getDefaultStoreId.value)
    const apiFilters: StockFilters = {
      store: getDefaultStoreId.value
    }
    store.fetchStocks(apiFilters, 1)
  } else {
    store.fetchStocks()
  }

  store.fetchStores()
  store.fetchProducts()
})
</script>
