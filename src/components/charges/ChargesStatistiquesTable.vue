<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
        <p class="mt-2 text-sm text-slate-600">Chargement des données...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="charges.length === 0" class="p-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 text-slate-400">
          <svg
            class="h-full w-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-slate-900">Aucune donnée</h3>
        <p class="mt-1 text-sm text-slate-500">Aucune charge trouvée pour les filtres sélectionnés.</p>
      </div>
    </div>

    <!-- Table with Data -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-red-500 to-rose-500">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-white">
              ID
            </th>
            <th v-if="groupByCategory" class="px-6 py-4 text-left text-sm font-semibold text-white">
              Catégorie
            </th>
            <th v-else class="px-6 py-4 text-left text-sm font-semibold text-white">
              Description
            </th>
            <th v-if="groupByCategory" class="px-6 py-4 text-right text-sm font-semibold text-white">
              Nombre de Dépenses
            </th>
            <th v-else class="px-6 py-4 text-left text-sm font-semibold text-white">
              Bénéficiaire
            </th>
            <th class="px-6 py-4 text-right text-sm font-semibold text-white">
              Montant Total
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr
            v-for="(charge, index) in charges"
            :key="index"
            class="transition-colors hover:bg-slate-50"
          >
            <td class="px-6 py-4">
              <div class="text-sm font-mono font-semibold text-slate-600">
                {{ groupByCategory ? '#' + String(index + 1).padStart(3, '0') : charge.expense_number || '#' + String(index + 1).padStart(3, '0') }}
              </div>
            </td>
            <td v-if="groupByCategory" class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
                  <span class="text-sm font-semibold text-red-600">
                    {{ charge.category_name?.charAt(0)?.toUpperCase() || 'D' }}
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-slate-900">
                    {{ charge.category_name || 'Non catégorisé' }}
                  </div>
                </div>
              </div>
            </td>
            <td v-else class="px-6 py-4">
              <div class="text-sm text-slate-900">
                {{ charge.description || 'N/A' }}
              </div>
            </td>
            <td v-if="groupByCategory" class="px-6 py-4 text-right">
              <div class="text-sm font-medium text-slate-900">
                {{ charge.count }}
              </div>
            </td>
            <td v-else class="px-6 py-4">
              <div class="text-sm text-slate-900">
                {{ charge.beneficiary || 'N/A' }}
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="text-sm font-bold text-red-600">
                {{ formatCurrency(charge.total_amount) }} FCFA
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChargeStatistique } from '@/stores/chargesStatistiques'

interface Props {
  charges: ChargeStatistique[]
  loading: boolean
  groupByCategory: boolean
}

defineProps<Props>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>
