<script setup lang="ts">
import { computed } from 'vue'
import type { Achat } from '@/stores/achats'
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
  achats: Achat[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  pageSize: 8,
  total: 0,
})

// Emits
const emit = defineEmits<{
  delete: [achat: Achat]
  pageChange: [page: number]
}>()

// Computed - Les données sont déjà paginées par le parent, pas de slice ici
const displayedAchats = computed(() => props.achats)

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `Affichage de ${start} à ${end} sur ${props.total} entrées`
})

// Formatage de date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
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
const handleDelete = (achat: Achat) => {
  emit('delete', achat)
}
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
      <Table class="min-w-[700px]">
        <TableHeader>
          <TableRow class="border-b border-[#EEEEEE]">
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              N° Pièce
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Référence
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Produit
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Fournisseur
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Magasin
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Quantité
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Date
            </TableHead>
            <TableHead class="w-[80px] text-center font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in (pageSize || 8)" :key="i">
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-20 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedAchats.length > 0">
            <TableRow
              v-for="achat in displayedAchats"
              :key="achat.id"
              class="border-b border-[#EEEEEE] hover:bg-gray-50"
            >
              <TableCell class="text-[14px] font-medium text-[#5932EA] text-center" style="font-family: Poppins">
                {{ achat.receipt_number || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ achat.reference || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ achat.product_name }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ achat.supplier_name || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ achat.store_name }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-green-600 text-center" style="font-family: Poppins">
                +{{ formatQuantity(achat.quantity) }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ formatDate(achat.date || achat.created_at) }}
              </TableCell>
              <TableCell class="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  @click="handleDelete(achat)"
                >
                  <Trash2 class="h-4 w-4" />
                  <span class="sr-only">Supprimer</span>
                </Button>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell colspan="8" class="text-center text-muted-foreground py-8">
                Aucune entrée de stock trouvée
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="displayedAchats.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-[38px] py-4 sm:py-[30px] border-t border-[#EEEEEE]">
      <p class="text-xs sm:text-[14px] font-medium text-[#B5B7C0]" style="font-family: Poppins">
        {{ paginationInfo }}
      </p>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', currentPage - 1)"
          :disabled="currentPage === 1"
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
            @click="emit('pageChange', page as number)"
            :class="[
              'h-[26px] w-[26px] p-0 rounded-[4px] text-[12px] font-medium',
              currentPage === page
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
          @click="emit('pageChange', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="h-[26px] w-[26px] p-0 rounded-[4px] border-[#EEEEEE] bg-[#F5F5F5]"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
