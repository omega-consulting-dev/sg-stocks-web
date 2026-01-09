<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Eye, Trash2, Wallet } from 'lucide-vue-next'
import type { Encaissement } from '@/stores/encaissements'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  encaissements: Encaissement[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}>()

const emit = defineEmits<{
  view: [encaissement: Encaissement]
  delete: [encaissement: Encaissement]
  pageChange: [page: number]
}>()

const displayedEncaissements = computed(() => props.encaissements)

// Formatage de la date : "23 Janvier 2025"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('fr-FR', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
}

// Formatage du montant : "100 000 XAF"
const formatMontant = (montant: number): string => {
  return montant.toLocaleString('fr-FR') + ' XAF'
}

const paginationInfo = computed(() => {
  const start = ((props.currentPage || 1) - 1) * (props.pageSize || 8) + 1
  const end = Math.min(start + (props.pageSize || 8) - 1, props.total || props.encaissements.length)
  return `Affichage de ${start} à ${end} sur ${(props.total || props.encaissements.length).toLocaleString('fr-FR')} entrées`
})

const totalPages = computed(() => Math.ceil((props.total || props.encaissements.length) / (props.pageSize || 20)))

const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if ((props.currentPage || 1) > 3) pages.push('...')

    const start = Math.max(2, (props.currentPage || 1) - 1)
    const end = Math.min(totalPages.value - 1, (props.currentPage || 1) + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if ((props.currentPage || 1) < totalPages.value - 2) pages.push('...')
    if (totalPages.value > 1) pages.push(totalPages.value)
  }

  return pages
}
</script>

<template>
  <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden rounded-lg">
    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
            <TableHead class="font-semibold text-slate-700">Code</TableHead>
            <TableHead class="font-semibold text-slate-700">Date</TableHead>
            <TableHead class="font-semibold text-slate-700">Référence Facture</TableHead>
            <TableHead class="text-right font-semibold text-slate-700">Montant</TableHead>
            <TableHead class="text-center font-semibold text-slate-700">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in (pageSize || 8)" :key="i" class="hover:bg-slate-50/50">
              <TableCell><Skeleton class="h-4 w-full" /></TableCell>
              <TableCell><Skeleton class="h-4 w-full" /></TableCell>
              <TableCell><Skeleton class="h-4 w-full" /></TableCell>
              <TableCell><Skeleton class="h-4 w-full" /></TableCell>
              <TableCell><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedEncaissements.length === 0">
            <TableRow>
              <TableCell colspan="5" class="h-32 text-center">
                <div class="flex flex-col items-center justify-center text-slate-400">
                  <Wallet class="h-12 w-12 mb-2 opacity-50" />
                  <p class="text-sm font-medium">Aucun encaissement trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow
              v-for="encaissement in displayedEncaissements"
              :key="encaissement.id"
              class="transition-colors hover:bg-green-50/50"
            >
              <TableCell class="font-medium text-slate-900">{{ encaissement.code }}</TableCell>
              <TableCell class="text-slate-600">{{ formatDate(encaissement.date) }}</TableCell>
              <TableCell class="text-slate-600">{{ encaissement.reference_facture }}</TableCell>
              <TableCell class="text-right font-bold text-green-600">
                {{ formatMontant(encaissement.montant) }}
              </TableCell>
              <TableCell class="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4" />
                      <span class="sr-only">Ouvrir le menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[130px]">
                    <DropdownMenuItem @click="emit('view', encaissement)" class="cursor-pointer">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>Consulter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="emit('delete', encaissement)"
                      class="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200">
      <p class="text-xs sm:text-sm font-medium text-slate-600">
        {{ paginationInfo }}
      </p>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', (currentPage || 1) - 1)"
          :disabled="(currentPage || 1) === 1"
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
              (currentPage || 1) === page
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
          @click="emit('pageChange', (currentPage || 1) + 1)"
          :disabled="(currentPage || 1) === totalPages"
          class="h-[26px] w-[26px] p-0 rounded-[4px]"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
