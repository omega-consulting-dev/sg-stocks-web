<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-red-500 to-rose-500 p-3 shadow-lg">
              <TrendingDown class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Statistiques des Charges</h1>
              <p class="text-sm text-slate-600">
                Analysez vos dépenses {{ groupByCategory ? 'par catégorie' : 'détaillées' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-4">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Entrées</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <Receipt class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {{ store.totalCharges }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ groupByCategory ? 'Catégories' : 'Dépenses' }}
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Montant Total</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-rose-500 p-2.5">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {{ formatCurrency(store.totalMontant) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              FCFA
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Montant Moyen</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2.5">
              <BarChart3 class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {{ formatCurrency(store.moyenneMontant) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Par {{ groupByCategory ? 'catégorie' : 'dépense' }}
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Nombre de Dépenses</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-rose-500 p-2.5">
              <FileText class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {{ store.totalDepenses }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Dépenses enregistrées
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
              class="border-slate-300 focus:border-red-500 focus:ring-red-500"
              @change="handleFilterChange"
            />
          </div>

          <div class="space-y-2">
            <Label for="date-to" class="text-sm font-medium text-slate-700">Date de fin</Label>
            <Input
              id="date-to"
              v-model="filters.date_to"
              type="date"
              :min="filters.date_from"
              class="border-slate-300 focus:border-red-500 focus:ring-red-500"
              @change="handleFilterChange"
            />
          </div>
        </div>

        <!-- Ligne 2: Type de regroupement et catégorie -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium text-slate-700">Type de regroupement</Label>
            <div class="flex gap-2">
              <Button
                :variant="!groupByCategory ? 'default' : 'outline'"
                @click="toggleGroupBy('expense')"
                class="flex-1"
              >
                Charge en masse
              </Button>
              <Button
                :variant="groupByCategory ? 'default' : 'outline'"
                @click="toggleGroupBy('category')"
                class="flex-1"
              >
                Par Nature/Catégorie
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="category" class="text-sm font-medium text-slate-700">Catégorie</Label>
            <select
              id="category"
              v-model="filters.category"
              @change="handleFilterChange"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in store.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
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

      <!-- Info Banner if category filtered -->
      <div v-if="selectedCategoryName" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-red-500 p-1">
            <Info class="h-4 w-4 text-white" />
          </div>
          <p class="text-sm font-medium text-red-900">
            Catégorie : <span class="font-bold">{{ selectedCategoryName }}</span>
            <span v-if="filters.date_from && filters.date_to" class="ml-2">
              | Période : {{ formatDate(filters.date_from) }} au {{ formatDate(filters.date_to) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Table -->
      <ChargesStatistiquesTable
        :charges="store.charges"
        :loading="store.loading"
        :group-by-category="groupByCategory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChargesStatistiquesStore, type ChargeFilters } from '@/stores/chargesStatistiques'
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
  TrendingDown,
  Receipt,
  DollarSign,
  BarChart3,
  FileText,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Info
} from 'lucide-vue-next'
import ChargesStatistiquesTable from '@/components/charges/ChargesStatistiquesTable.vue'

const store = useChargesStatistiquesStore()

const filters = ref<ChargeFilters>({
  date_from: '',
  date_to: '',
  category: '',
  group_by: 'category'
})

const groupByCategory = ref(true)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const selectedCategoryName = computed(() => {
  if (filters.value.category) {
    const cat = store.categories.find(c => c.id === Number(filters.value.category))
    return cat?.name
  }
  return null
})

const toggleGroupBy = (type: 'expense' | 'category') => {
  groupByCategory.value = type === 'category'
  filters.value.group_by = type
  filters.value.category = ''
  handleFilterChange()
}

const handleFilterChange = () => {
  const apiFilters: ChargeFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'category'

  store.fetchCharges(apiFilters)
}

const handleReset = () => {
  filters.value = {
    date_from: '',
    date_to: '',
    category: '',
    group_by: 'category'
  }
  groupByCategory.value = true
  store.fetchCharges({ group_by: 'category' })
}

const handleExportExcel = async () => {
  const apiFilters: ChargeFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'category'

  try {
    await store.exportExcel(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error)
    alert('Erreur lors de l\'export Excel')
  }
}

const handleExportPdf = async () => {
  const apiFilters: ChargeFilters = {}

  if (filters.value.date_from) {
    apiFilters.date_from = filters.value.date_from
  }

  if (filters.value.date_to) {
    apiFilters.date_to = filters.value.date_to
  }

  if (filters.value.category) {
    apiFilters.category = Number(filters.value.category)
  }

  // Set group_by parameter
  apiFilters.group_by = filters.value.group_by || 'category'

  try {
    await store.exportPdf(apiFilters)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    alert('Erreur lors de l\'export PDF')
  }
}

onMounted(() => {
  store.fetchCharges({ group_by: 'category' })
  store.fetchCategories()
})
</script>
