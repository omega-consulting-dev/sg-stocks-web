<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 shadow-lg">
              <TrendingUp class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Statistiques des Ventes</h1>
              <p class="text-sm text-slate-600">
                Analysez les ventes par produit ou par catégorie
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-4">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Ventes</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <ShoppingCart class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {{ store.totalVentes }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ groupByCategory ? 'Catégories' : 'Produits' }} vendus
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Chiffre d'Affaires</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ formatCurrency(store.totalCA) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              FCFA
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">CA Moyen</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2.5">
              <BarChart3 class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {{ formatCurrency(store.moyenneCA) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Par {{ groupByCategory ? 'catégorie' : 'produit' }}
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Quantité Totale</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-2.5">
              <Package class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {{ store.totalQuantite }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Unités vendues
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Filtres de recherche -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4 space-y-4">
        <!-- Ligne 1: Période -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date-from" class="text-sm font-medium text-slate-700">Date de début</Label>
            <Input
              id="date-from"
              v-model="filters.date_from"
              type="date"
              class="border-slate-300 focus:border-green-500 focus:ring-green-500"
              @change="handleFilterChange"
            />
          </div>

          <div class="space-y-2">
            <Label for="date-to" class="text-sm font-medium text-slate-700">Date de fin</Label>
            <Input
              id="date-to"
              v-model="filters.date_to"
              type="date"
              class="border-slate-300 focus:border-green-500 focus:ring-green-500"
              @change="handleFilterChange"
            />
          </div>
        </div>

        <!-- Ligne 2: Type de recherche et filtre de type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium text-slate-700">Type de recherche</Label>
            <div class="flex gap-2">
              <Button
                :variant="!groupByCategory && filters.group_by !== 'service' ? 'default' : 'outline'"
                @click="toggleGroupBy('product')"
                class="flex-1"
              >
                Par Produit
              </Button>
              <Button
                :variant="groupByCategory ? 'default' : 'outline'"
                @click="toggleGroupBy('category')"
                class="flex-1"
              >
                Par Catégorie
              </Button>
              <Button
                :variant="filters.group_by === 'service' ? 'default' : 'outline'"
                @click="toggleGroupBy('service')"
                class="flex-1"
              >
                Par Service
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-sm font-medium text-slate-700">Filtrer par type</Label>
            <div class="flex gap-2">
              <Button
                :variant="!filters.line_type ? 'default' : 'outline'"
                @click="setLineType(undefined)"
                class="flex-1"
              >
                Tous
              </Button>
              <Button
                :variant="filters.line_type === 'product' ? 'default' : 'outline'"
                @click="setLineType('product')"
                class="flex-1"
              >
                Produits uniquement
              </Button>
              <Button
                :variant="filters.line_type === 'service' ? 'default' : 'outline'"
                @click="setLineType('service')"
                class="flex-1"
              >
                Services uniquement
              </Button>
            </div>
          </div>
        </div>

        <!-- Ligne 3: Filtres -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="store" class="text-sm font-medium text-slate-700">Magasin</Label>
            <select
              id="store"
              v-model="filters.store"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">Tous les magasins</option>
              <option v-for="storeItem in store.stores" :key="storeItem.id" :value="storeItem.id">
                {{ storeItem.name }}
              </option>
            </select>
          </div>

          <div v-if="!groupByCategory" class="space-y-2">
            <Label for="product" class="text-sm font-medium text-slate-700">Produit</Label>
            <select
              id="product"
              v-model="filters.product"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">Tous les produits</option>
              <option v-for="product in store.products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <div v-if="groupByCategory" class="space-y-2">
            <Label for="category" class="text-sm font-medium text-slate-700">Catégorie</Label>
            <select
              id="category"
              v-model="filters.category"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in store.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Ligne 4: Actions -->
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

      <!-- Info Banner if product/category filtered -->
      <div v-if="selectedName" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-blue-500 p-1">
            <Info class="h-4 w-4 text-white" />
          </div>
          <p class="text-sm font-medium text-blue-900">
            {{ groupByCategory ? 'Catégorie' : 'Produit' }} : <span class="font-bold">{{ selectedName }}</span>
            <span v-if="filters.date_from && filters.date_to" class="ml-2">
              | Période : {{ formatDate(filters.date_from) }} au {{ formatDate(filters.date_to) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Table -->
      <VentesStatistiquesTable
        :ventes="store.ventes"
        :loading="store.loading"
        :group-by="filters.group_by"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVentesStatistiquesStore, type VenteFilters } from '@/stores/ventesStatistiques'
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
  TrendingUp,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Package,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Info
} from 'lucide-vue-next'
import VentesStatistiquesTable from '@/components/ventes/VentesStatistiquesTable.vue'

const store = useVentesStatistiquesStore()

const filters = ref<VenteFilters>({
  date_from: '',
  date_to: '',
  product: '',
  category: '',
  store: '',
  group_by: 'product',
  line_type: undefined
})

const groupByCategory = ref(false)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const selectedName = computed(() => {
  if (groupByCategory.value && filters.value.category) {
    const cat = store.categories.find(c => c.id === Number(filters.value.category))
    return cat?.name
  } else if (!groupByCategory.value && filters.value.product) {
    const prod = store.products.find(p => p.id === Number(filters.value.product))
    return prod?.name
  }
  return null
})

const toggleGroupBy = (type: 'product' | 'category' | 'service') => {
  if (type === 'category') {
    groupByCategory.value = true
    filters.value.group_by = 'category'
  } else if (type === 'service') {
    groupByCategory.value = false
    filters.value.group_by = 'service'
  } else {
    groupByCategory.value = false
    filters.value.group_by = 'product'
  }
  // Reset filters when switching
  filters.value.product = ''
  filters.value.category = ''
  handleFilterChange()
}

const setLineType = (type: 'product' | 'service' | undefined) => {
  filters.value.line_type = type
  handleFilterChange()
}

const handleFilterChange = () => {
  const apiFilters: VenteFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'product'

  // Set line_type parameter
  if (filters.value.line_type) {
    apiFilters.line_type = filters.value.line_type
  }

  if (!groupByCategory.value && filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (groupByCategory.value && filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  store.fetchVentes(apiFilters)
}

const handleReset = () => {
  filters.value = {
    date_from: '',
    date_to: '',
    product: '',
    category: '',
    store: '',
    group_by: 'product',
    line_type: undefined
  }
  groupByCategory.value = false
  store.fetchVentes({ group_by: 'product' })
}

const handleExportExcel = async () => {
  const apiFilters: VenteFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'product'

  // Set line_type parameter
  if (filters.value.line_type) {
    apiFilters.line_type = filters.value.line_type
  }

  if (!groupByCategory.value && filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (groupByCategory.value && filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  try {
    await store.exportExcel(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error)
    alert('Erreur lors de l\'export Excel')
  }
}

const handleExportPdf = async () => {
  const apiFilters: VenteFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.store) {
    apiFilters.store = Number(filters.value.store)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'product'

  // Set line_type parameter
  if (filters.value.line_type) {
    apiFilters.line_type = filters.value.line_type
  }

  if (!groupByCategory.value && filters.value.product) {
    apiFilters.product = Number(filters.value.product)
  }

  if (groupByCategory.value && filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  try {
    await store.exportPdf(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    alert('Erreur lors de l\'export PDF')
  }
}

onMounted(() => {
  store.fetchVentes({ group_by: 'product' })
  store.fetchCategories()
  store.fetchProducts()
  store.fetchStores()
})
</script>
