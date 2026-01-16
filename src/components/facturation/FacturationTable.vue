<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Eye, SquarePen } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { Sale } from '@/stores/sales.store'

interface Props {
  facturations: Sale[]
  currentPage?: number
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  pageSize: 10,
})

const emit = defineEmits<{
  generateInvoice: [id: number]
  viewDetails: [id: number]
  edit: [id: number]
  pageChange: [page: number]
}>()

// Pagination
const totalPages = computed(() => Math.ceil(props.facturations.length / props.pageSize))

const paginatedFacturations = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.facturations.slice(start, end)
})

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.facturations.length)
  return `Affichage de ${start} à ${end} sur ${props.facturations.length} facturations`
})

const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (props.currentPage > 3) pages.push('...')

    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(totalPages.value - 1, props.currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (props.currentPage < totalPages.value - 2) pages.push('...')
    if (totalPages.value > 1) pages.push(totalPages.value)
  }

  return pages
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre'
  ]
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function formatMontant(montant: number | undefined) {
  if (montant === undefined || montant === null) return '0'
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 0 })
}
</script>

<template>
  <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden rounded-lg">
    <div class="overflow-x-auto">
      <table class="w-full">
        <!-- Header -->
        <thead>
          <tr class="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Intitulé de l'opération
            </th>
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Date de vente
            </th>
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Client
            </th>
            <!-- <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Produits
            </th> -->
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Quantité
            </th>
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Montant Facture
            </th>
            <th class="px-6 py-4 text-left font-semibold text-slate-700">
              Action
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <tr
            v-for="facturation in paginatedFacturations"
            :key="facturation.id"
            class="border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-50/50"
          >
            <td class="px-6 py-4 text-sm font-medium text-slate-900">
              {{ facturation.sale_number }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">
              {{ formatDate(facturation.sale_date) }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">
              {{ facturation.customer?.name || 'Client de passage' }}
            </td>
            <!-- <td class="px-6 py-4 text-sm text-slate-600">
              <div class="max-w-xs truncate" :title="facturation.lines?.map(l => l.item_name || l.description || 'Produit').join(', ')">
                {{ facturation.lines?.map(l => l.item_name || l.description || 'Produit').slice(0, 2).join(', ') || 'N/A' }}
                <span v-if="(facturation.lines?.length || 0) > 2" class="text-slate-400">
                  +{{ (facturation.lines?.length || 0) - 2 }} autre(s)
                </span>
              </div>
            </td> -->
            <td class="px-6 py-4 text-sm text-slate-600">
              {{ facturation.lines?.reduce((sum, line) => sum + Number(line.quantity || 0), 0).toLocaleString('fr-FR') || 0 }}
            </td>
            <td class="px-6 py-4 text-sm font-bold text-blue-600">
              {{ formatMontant(facturation.total_amount) }} FCFA
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">

                <button
                  class="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                  @click="emit('generateInvoice', facturation.id)"
                  title="Générer la facture"
                >
                  <FileText class="w-5 h-5 text-white" />
                </button>
                <button
                  class="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                  @click="emit('viewDetails', facturation.id)"
                  title="Consulter les détails"
                >
                  <Eye class="w-5 h-5 text-white" />
                </button>
                 <button
                  class="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                  @click="emit('edit', facturation.id)"
                  title="Modifier la facture"
                >
                  <SquarePen class="w-5 h-5 text-white" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="facturations.length === 0"
        class="text-center py-12 text-slate-400"
      >
        <FileText class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p class="text-sm font-medium">Aucune facturation trouvée</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedFacturations.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200">
      <p class="text-xs sm:text-sm font-medium text-slate-600">
        {{ paginationInfo }}
      </p>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', currentPage - 1)"
          :disabled="currentPage === 1"
          class="h-[26px] w-[26px] p-0 rounded-[4px]"
        >
          &lt;
        </Button>

        <template v-for="(page, index) in getPageNumbers()" :key="index">
          <span v-if="page === '...'" class="px-2 text-[12px] text-slate-600">...</span>
          <Button
            v-else
            variant="outline"
            size="sm"
            @click="emit('pageChange', page as number)"
            :class="[
              'h-[26px] w-[26px] p-0 rounded-[4px] text-[12px] font-medium',
              currentPage === page
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                : 'hover:bg-slate-100'
            ]"
          >
            {{ page }}
          </Button>
        </template>

        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="h-[26px] w-[26px] p-0 rounded-[4px]"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
