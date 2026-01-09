<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto">
      <!-- En-tête -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          🔍 Diagnostic de Cohérence des Stocks
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Vérifiez et corrigez les incohérences entre les mouvements de stock et les quantités enregistrées
        </p>
      </div>

      <!-- Boutons d'action -->
      <div class="flex gap-4 mb-6">
        <button
          @click="runDiagnostic"
          :disabled="loading"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Analyse en cours...' : 'Lancer le diagnostic' }}
        </button>

        <button
          v-if="issues.length > 0"
          @click="fixIssues"
          :disabled="fixing"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {{ fixing ? 'Correction en cours...' : `Corriger ${issues.length} incohérence(s)` }}
        </button>
      </div>

      <!-- Statistiques -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div class="text-sm text-blue-600 dark:text-blue-400">Total Mouvements</div>
          <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ stats.totalMovements }}</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div class="text-sm text-green-600 dark:text-green-400">Mouvements Actifs</div>
          <div class="text-2xl font-bold text-green-900 dark:text-green-100">{{ stats.activeMovements }}</div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div class="text-sm text-red-600 dark:text-red-400">Mouvements Supprimés</div>
          <div class="text-2xl font-bold text-red-900 dark:text-red-100">{{ stats.inactiveMovements }}</div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400">
        {{ errorMessage }}
      </div>

      <!-- Résultats -->
      <div v-if="diagnosticRun && issues.length === 0" class="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">✅ Aucune incohérence détectée</h3>
            <p class="text-green-700 dark:text-green-300">Tous les stocks sont cohérents avec les mouvements enregistrés.</p>
          </div>
        </div>
      </div>

      <!-- Tableau des incohérences -->
      <div v-if="issues.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            ❌ {{ issues.length }} Incohérence(s) Détectée(s)
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Magasin
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock Actuel
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock Théorique
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Différence
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(issue, index) in issues" :key="index">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ issue.product }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ issue.store }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                  {{ issue.stock_actuel }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                  {{ issue.stock_theorique }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span :class="issue.difference > 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                    {{ issue.difference > 0 ? '+' : '' }}{{ issue.difference }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                  E: {{ issue.entrees }} | S: {{ issue.sorties }} | T-out: {{ issue.transferts_out }} | T-in: {{ issue.transferts_in }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bons supprimés -->
      <div v-if="deletedReceipts.length > 0" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Bons d'Entrée Supprimés
          </h2>
        </div>

        <div class="p-6">
          <div class="space-y-2">
            <div v-for="receipt in deletedReceipts" :key="receipt.receipt_number" class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <span class="font-mono text-sm text-gray-900 dark:text-white">{{ receipt.receipt_number }}</span>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ receipt.count }} mouvement(s) | Quantité totale: {{ receipt.total_qty }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/config/axios'

interface Issue {
  product: string
  product_id: number
  store: string
  store_id: number
  stock_actuel: number
  stock_theorique: number
  difference: number
  entrees: number
  sorties: number
  transferts_out: number
  transferts_in: number
}

interface DeletedReceipt {
  receipt_number: string
  count: number
  total_qty: number
}

interface Stats {
  totalMovements: number
  activeMovements: number
  inactiveMovements: number
}

const loading = ref(false)
const fixing = ref(false)
const diagnosticRun = ref(false)
const issues = ref<Issue[]>([])
const deletedReceipts = ref<DeletedReceipt[]>([])
const stats = ref<Stats | null>(null)
const successMessage = ref('')
const errorMessage = ref('')

const runDiagnostic = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await axios.get('/inventory/stock-diagnostic/')

    stats.value = response.data.stats
    issues.value = response.data.issues || []
    deletedReceipts.value = response.data.deleted_receipts || []
    diagnosticRun.value = true

    if (issues.value.length === 0) {
      successMessage.value = 'Diagnostic terminé : aucune incohérence détectée !'
    }
  } catch (error: any) {
    console.error('Erreur lors du diagnostic:', error)
    errorMessage.value = error.response?.data?.detail || 'Erreur lors du diagnostic'
  } finally {
    loading.value = false
  }
}

const fixIssues = async () => {
  if (!confirm(`Voulez-vous vraiment corriger ${issues.value.length} incohérence(s) ?\n\nCela mettra à jour les stocks en base de données.`)) {
    return
  }

  fixing.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await axios.post('/inventory/stock-diagnostic/fix/')

    successMessage.value = `✅ ${response.data.corrected} stock(s) corrigé(s) avec succès !`

    // Recharger le diagnostic
    await runDiagnostic()
  } catch (error: any) {
    console.error('Erreur lors de la correction:', error)
    errorMessage.value = error.response?.data?.detail || 'Erreur lors de la correction'
  } finally {
    fixing.value = false
  }
}
</script>
