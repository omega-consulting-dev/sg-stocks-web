<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-3 shadow-lg">
              <FileText class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Reporting Mensuel</h1>
              <p class="text-sm text-slate-600">
                Cet interface représente la liste des dépenses liée à votre entreprise
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid gap-6 md:grid-cols-3">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Fatures</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <FileText class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ stats.totalInvoices }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Factures émises
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Depense</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-rose-500 p-2.5">
              <TrendingDown class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {{ formatCurrency(stats.totalExpenses) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              FCFA
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Vente</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <ShoppingBag class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {{ formatCurrency(stats.totalSales) }}
            </div>
            <p class="mt-1 text-xs text-slate-500">
              FCFA
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Section de génération de rapport -->
      <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle class="text-xl font-bold text-slate-900">Générer un Rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Type de rapport -->
            <div class="space-y-2">
              <Label for="report-type" class="text-sm font-medium text-slate-700">Compte de resultat</Label>
              <select
                id="report-type"
                v-model="reportForm.type"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="profit_loss">Compte de resultat</option>
                <option value="sales">Point de vente</option>
                <option value="expenses">Dépenses</option>
                <option value="inventory">Inventaire</option>
              </select>
            </div>

            <!-- Période -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="date-debut" class="text-sm font-medium text-slate-700">Date début</Label>
                <Input
                  id="date-debut"
                  v-model="reportForm.date_from"
                  type="date"
                  :max="reportForm.date_to"
                  class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div class="space-y-2">
                <Label for="date-fin" class="text-sm font-medium text-slate-700">Date fin</Label>
                <Input
                  id="date-fin"
                  v-model="reportForm.date_to"
                  type="date"
                  :min="reportForm.date_from"
                  class="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Bouton de génération -->
            <div class="flex justify-end">
              <Button
                @click="generateReport"
                :disabled="isGenerating || !reportForm.date_from || !reportForm.date_to"
                class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 shadow-lg"
              >
                <FileDown v-if="!isGenerating" class="mr-2 h-4 w-4" />
                <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
                {{ isGenerating ? 'Génération...' : 'GENERER LE RAPPORT' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Report Preview Modal -->
      <div v-if="reportData" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeReport">
        <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">Rapport généré</h2>
            <div class="flex items-center gap-3">
              <button
                @click="printReport"
                class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <button
                @click="exportReport('pdf')"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter PDF
              </button>
              <button
                @click="exportReport('excel')"
                class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter Excel
              </button>
              <button
                @click="closeReport"
                class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div id="report-content" class="a4-document mx-auto bg-white" style="max-width: 1200px; padding: 40px;">
              
              <!-- En-tête Simple -->
              <div class="mb-10">
                <h1 class="text-5xl font-light text-gray-900 mb-2">Compte de Résultat</h1>
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <p class="text-sm text-gray-500">Période : {{ formatDate(reportForm.date_from) }} - {{ formatDate(reportForm.date_to) }}</p>
                  <p class="text-sm text-gray-400">Généré le {{ new Date().toLocaleDateString('fr-FR') }}</p>
                </div>
              </div>

              <!-- Résumé en haut -->
              <div class="grid grid-cols-3 gap-6 mb-12">
                <div class="text-center py-4 bg-gray-50 rounded-sm">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Produits</p>
                  <p class="text-xl font-light text-gray-900">{{ formatAmount(totalSales) }}</p>
                  <p class="text-xs text-gray-400 mt-1">FCFA</p>
                </div>
                <div class="text-center py-4 bg-gray-50 rounded-sm">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Charges</p>
                  <p class="text-xl font-light text-gray-900">{{ formatAmount(totalExpenses) }}</p>
                  <p class="text-xs text-gray-400 mt-1">FCFA</p>
                </div>
                <div class="text-center py-4 border-2 border-gray-900 rounded-sm">
                  <p class="text-xs text-gray-700 uppercase tracking-wider mb-1 font-medium">Résultat</p>
                  <p class="text-xl font-normal text-gray-900">{{ formatAmount(Math.abs(netProfit)) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ netProfit >= 0 ? 'Bénéfice' : 'Perte' }}</p>
                </div>
              </div>

              <!-- Tableau des Ventes -->
              <div class="mb-10">
                <h2 class="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                  Produits d'Exploitation
                </h2>
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-300">
                      <th class="py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Catégorie</th>
                      <th class="py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-40">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sale, index) in sales" :key="index" class="border-b border-gray-100">
                      <td class="py-4 text-gray-900 font-light">{{ sale.category }}</td>
                      <td class="py-4 text-right text-gray-900 text-lg font-light">{{ formatAmount(sale.amount) }}</td>
                    </tr>
                    <tr class="border-t-2 border-gray-900">
                      <td class="py-4 text-sm font-medium text-gray-900 uppercase tracking-wider">Total Produits</td>
                      <td class="py-4 text-right text-2xl font-normal text-gray-900">{{ formatAmount(totalSales) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Tableau des Charges -->
              <div class="mb-10">
                <h2 class="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-300">
                  Charges d'Exploitation
                </h2>
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-300">
                      <th class="py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Catégorie</th>
                      <th class="py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider w-40">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(expense, index) in expenses" :key="index" class="border-b border-gray-100">
                      <td class="py-4 text-gray-900 font-light">{{ expense.designation }}</td>
                      <td class="py-4 text-right text-gray-900 text-lg font-light">{{ formatAmount(expense.amount) }}</td>
                    </tr>
                    <tr class="border-t-2 border-gray-900">
                      <td class="py-4 text-sm font-medium text-gray-900 uppercase tracking-wider">Total Charges</td>
                      <td class="py-4 text-right text-2xl font-normal text-gray-900">{{ formatAmount(totalExpenses) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Statistiques finales -->
              <div class="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Catégories Produits</p>
                  <p class="text-3xl font-light text-gray-900">{{ sales.length }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Catégories Charges</p>
                  <p class="text-3xl font-light text-gray-900">{{ expenses.length }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Marge Nette</p>
                  <p class="text-3xl font-light text-gray-900">{{ totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0 }}%</p>
                </div>
              </div>

              <!-- Pied de page -->
              <div class="mt-12 pt-6 border-t border-gray-200 text-center">
                <p class="text-xs text-gray-400">Document généré le {{ new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  FileText,
  TrendingDown,
  ShoppingBag,
  FileDown,
  Loader2
} from 'lucide-vue-next'
import Axios from '@/services/axios.service'

const stats = ref({
  totalInvoices: 0,
  totalExpenses: 0,
  totalSales: 0
})

const reportForm = ref({
  type: 'profit_loss',
  date_from: '',
  date_to: ''
})

const reportData = ref(null)
const isGenerating = ref(false)

// Computed: données des charges REGROUPÉES PAR CATÉGORIE
const expenses = computed(() => {
  if (!reportData.value?.expenses) return []
  
  const groupedByCategory = reportData.value.expenses.reduce((acc: any, exp: any) => {
    const category = exp.category_name || exp.category || 'Charges diverses'
    if (!acc[category]) {
      acc[category] = {
        category: category,
        total: 0,
        count: 0
      }
    }
    acc[category].total += exp.amount || 0
    acc[category].count += 1
    return acc
  }, {})

  return Object.values(groupedByCategory).map((item: any) => ({
    designation: item.category,
    amount: item.total,
    count: item.count
  }))
})

// Computed: données des ventes REGROUPÉES PAR CATÉGORIE
const sales = computed(() => {
  if (!reportData.value?.sales) return []
  
  const groupedByCategory = reportData.value.sales.reduce((acc: any, sale: any) => {
    const category = sale.product_category || sale.category_name || 'Ventes diverses'
    if (!acc[category]) {
      acc[category] = {
        category: category,
        total: 0,
        count: 0
      }
    }
    acc[category].total += sale.total_amount || sale.amount || 0
    acc[category].count += 1
    return acc
  }, {})

  return Object.values(groupedByCategory).map((item: any) => ({
    category: item.category,
    amount: item.total,
    count: item.count
  }))
})

const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

const totalSales = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.amount, 0)
})

const netProfit = computed(() => {
  return totalSales.value - totalExpenses.value
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

onMounted(() => {
  fetchStats()
  const today = new Date()
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  reportForm.value.date_to = today.toISOString().split('T')[0]
  reportForm.value.date_from = lastWeek.toISOString().split('T')[0]
})

const fetchStats = async () => {
  try {
    const response = await Axios.get('/analytics/dashboard/reporting-stats/')
    stats.value = {
      totalInvoices: response.data.total_invoices || 0,
      totalExpenses: response.data.total_expenses || 0,
      totalSales: response.data.total_sales || 0
    }
  } catch (error) {
  }
}

const generateReport = async () => {
  if (!reportForm.value.date_from || !reportForm.value.date_to) {
    alert('Veuillez sélectionner une période')
    return
  }

  isGenerating.value = true

  try {
    const response = await Axios.get(`/analytics/dashboard/generate-report-data/`, {
      params: {
        type: reportForm.value.type,
        start_date: reportForm.value.date_from,
        end_date: reportForm.value.date_to
      }
    })

    reportData.value = response.data
  } catch (error: any) {
    alert('Erreur lors de la génération du rapport')
  } finally {
    isGenerating.value = false
  }
}

const closeReport = () => {
  reportData.value = null
}

const printReport = () => {
  window.print()
}

const exportReport = async (format: 'pdf' | 'excel') => {
  try {
    const response = await Axios.post('/analytics/dashboard/export-report/', {
      start_date: reportForm.value.date_from,
      end_date: reportForm.value.date_to,
      format: format,
      orientation: 'landscape',
      page_size: 'A4',
      group_by_category: true
    }, {
      responseType: 'blob'
    })

    const contentType = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf'

    const extension = format === 'excel' ? 'xlsx' : 'pdf'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport_${reportForm.value.date_from}_${reportForm.value.date_to}.${extension}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    alert('Erreur lors de l\'export du rapport')
  }
}
</script>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 15mm;
  }

  /* Masquer tout sauf le rapport */
  body {
    visibility: hidden !important;
    overflow: hidden !important;
  }

  body > *,
  #app,
  #app > * {
    visibility: hidden !important;
  }

  /* Afficher uniquement le rapport */
  #report-content,
  #report-content * {
    visibility: visible !important;
  }

  /* Positionner le rapport pour impression - FIXED pour éviter la duplication */
  #report-content {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 15mm !important;
    background: white !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    transform: scale(0.85) !important;
    transform-origin: top left !important;
  }

  /* Réduire les espacements pour tenir sur une page */
  #report-content h1 {
    font-size: 2rem !important;
    margin-bottom: 0.5rem !important;
  }

  #report-content .mb-10 {
    margin-bottom: 0.75rem !important;
  }

  #report-content .mb-12 {
    margin-bottom: 0.75rem !important;
  }

  #report-content .mt-12 {
    margin-top: 0.75rem !important;
  }

  #report-content .py-8 {
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
  }

  #report-content .pt-8 {
    padding-top: 0.5rem !important;
  }

  #report-content .pt-6 {
    padding-top: 0.5rem !important;
  }

  #report-content .gap-6,
  #report-content .gap-8 {
    gap: 0.5rem !important;
  }

  /* Réduire légèrement les tailles de police */
  #report-content .text-4xl {
    font-size: 1.75rem !important;
  }

  #report-content .text-3xl {
    font-size: 1.5rem !important;
  }

  #report-content .text-2xl {
    font-size: 1.25rem !important;
  }

  #report-content .py-4 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }

  /* Assurer que les tableaux s'affichent correctement */
  #report-content table {
    display: table !important;
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: auto !important;
  }

  #report-content thead {
    display: table-header-group !important;
  }

  #report-content tbody {
    display: table-row-group !important;
  }

  #report-content tr {
    display: table-row !important;
    page-break-inside: avoid !important;
  }

  #report-content td,
  #report-content th {
    display: table-cell !important;
  }

  /* Préserver les couleurs */
  #report-content * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Assurer que les grilles s'affichent */
  #report-content .grid {
    display: grid !important;
  }

  /* Masquer les éléments inutiles */
  button,
  .no-print {
    display: none !important;
  }
}

@media screen {
  #report-content {
    min-height: auto !important;
  }
}
</style>

<style scoped>
.a4-document {
  background: white;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.a4-document:hover {
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

table {
  border-collapse: collapse;
}

tbody tr {
  transition: background-color 0.15s ease;
}
</style>
