<script setup lang="ts">
import { computed } from 'vue'
import type { Mouvement } from '@/stores/mouvements'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2 } from 'lucide-vue-next'

// Props
interface Props {
  mouvements: Mouvement[]
  allMouvements?: Mouvement[]  // Tous les mouvements pour calculer le stock final correctement
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  showMovementTypeColumns?: boolean  // Afficher ou non les colonnes Entrées/Sorties
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  pageSize: 8,
  total: 0,
  allMouvements: () => [],
  showMovementTypeColumns: true,
})

// Emits
const emit = defineEmits<{
  delete: [mouvement: Mouvement]
  pageChange: [page: number]
}>()

// Computed - Calculer le stock progressif pour chaque mouvement
const displayedMouvements = computed(() => {
  // Utiliser tous les mouvements pour calculer le stock cumulatif correct
  const allMovs = props.allMouvements && props.allMouvements.length > 0 ? props.allMouvements : props.mouvements
  let stockCumulatif = 0

  // Calculer le stock final pour TOUS les mouvements
  const mouvementsAvecStock = allMovs.map(mouvement => {
    if (mouvement.movement_type === 'in') {
      stockCumulatif += Number(mouvement.quantity)
    } else if (mouvement.movement_type === 'out' || mouvement.movement_type === 'transfer') {
      stockCumulatif -= Number(mouvement.quantity)
    }

    return {
      ...mouvement,
      stock_final: stockCumulatif
    }
  })

  // Retourner uniquement les mouvements de la page actuelle avec leur stock final correct
  return mouvementsAvecStock.filter(m =>
    props.mouvements.some(pm => pm.id === m.id)
  )
})

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `Affichage de ${start} à ${end} sur ${props.total} mouvements`
})

// Formatage de date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Formatage de la quantité
const formatQuantity = (quantity: number) => {
  return quantity.toLocaleString('fr-FR')
}

// Pagination
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

// Handlers
const handleDelete = (mouvement: Mouvement) => {
  emit('delete', mouvement)
}
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
      <Table class="min-w-[800px]">
        <TableHeader>
          <TableRow class="border-b border-[#EEEEEE]">
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Date
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Désignation
            </TableHead>
            <template v-if="showMovementTypeColumns">
              <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
                Entrées
              </TableHead>
              <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
                Sorties
              </TableHead>
            </template>
            <TableHead v-else class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Quantité
            </TableHead>
            <TableHead v-if="showMovementTypeColumns" class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Stocks final
            </TableHead>
            <TableHead class="w-[80px] text-center font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in (pageSize || 8)" :key="i">
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <template v-if="showMovementTypeColumns">
                <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
                <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
                <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
              </template>
              <TableCell v-else class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedMouvements.length > 0">
            <TableRow
              v-for="mouvement in displayedMouvements"
              :key="mouvement.id"
              class="border-b border-[#EEEEEE] hover:bg-gray-50"
            >
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ formatDate(mouvement.date || mouvement.created_at) }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ mouvement.product_name }}
              </TableCell>
              <template v-if="showMovementTypeColumns">
                <TableCell class="text-[14px] font-bold text-green-600 text-center" style="font-family: Poppins">
                  {{ mouvement.movement_type === 'in' ? formatQuantity(mouvement.quantity) : '' }}
                </TableCell>
                <TableCell class="text-[14px] font-bold text-red-600 text-center" style="font-family: Poppins">
                  {{ mouvement.movement_type === 'out' || mouvement.movement_type === 'transfer' ? formatQuantity(mouvement.quantity) : '' }}
                </TableCell>
              </template>
              <TableCell v-else :class="['text-[14px] font-bold text-center', mouvement.movement_type === 'in' ? 'text-green-600' : 'text-red-600']" style="font-family: Poppins">
                {{ formatQuantity(mouvement.quantity) }}
              </TableCell>
              <TableCell v-if="showMovementTypeColumns" class="text-[14px] font-bold text-[#292D32] text-center" style="font-family: Poppins">
                {{ formatQuantity(mouvement.stock_final) }}
              </TableCell>
              <TableCell class="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  @click="handleDelete(mouvement)"
                >
                  <Trash2 class="h-4 w-4" />
                  <span class="sr-only">Supprimer</span>
                </Button>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="showMovementTypeColumns ? 6 : 4" class="text-center text-muted-foreground py-8">
                Aucun mouvement de stock trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="displayedMouvements.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-[38px] py-4 sm:py-[30px] border-t border-[#EEEEEE]">
      <p class="text-xs sm:text-[14px] font-medium text-[#B5B7C0]" style="font-family: Poppins">
        {{ paginationInfo }}
      </p>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          @click="() => emit('pageChange', props.currentPage - 1)"
          :disabled="props.currentPage === 1"
          class="h-[26px] w-[26px] p-0 rounded-[4px] border-[#EEEEEE] bg-[#F5F5F5]"
        >
          &lt;
        </Button>

        <template v-for="(page, index) in getPageNumbers()" :key="index">
          <span v-if="page === '...'" class="px-2 text-[12px] text-[#404B52]">...</span>
          <Button
            v-else
            variant="outline"
            size="sm"
            @click="() => emit('pageChange', page as number)"
            :class="[
              'h-[26px] w-[26px] p-0 rounded-[4px] text-[12px] font-medium',
              props.currentPage === page
                ? 'bg-[#5932EA] border-[#5932EA] text-white'
                : 'border-[#EEEEEE] bg-[#F5F5F5] text-[#404B52]'
            ]"
          >
            {{ page }}
          </Button>
        </template>

        <Button
          variant="outline"
          size="sm"
          @click="() => emit('pageChange', props.currentPage + 1)"
          :disabled="props.currentPage === totalPages"
          class="h-[26px] w-[26px] p-0 rounded-[4px] border-[#EEEEEE] bg-[#F5F5F5]"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
