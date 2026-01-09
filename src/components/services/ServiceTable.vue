<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Edit, Trash2 } from 'lucide-vue-next'
import type { Service } from '@/stores/services'
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
  services: Service[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}>()

const emit = defineEmits<{
  edit: [service: Service]
  delete: [service: Service]
  pageChange: [page: number]
}>()

const displayedServices = computed(() => props.services)

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const handleEdit = (service: Service) => {
  emit('edit', service)
}

const handleDelete = (service: Service) => {
  emit('delete', service)
}

const paginationInfo = computed(() => {
  const total = props.total || props.services.length
  if (total === 0) return 'Aucune entrée'
  const start = ((props.currentPage || 1) - 1) * (props.pageSize || 8) + 1
  const end = Math.min(start + (props.pageSize || 8) - 1, total)
  return `Affichage de ${start} à ${end} sur ${total} entrées`
})

// Pagination
const totalPages = computed(() =>
  Math.ceil((props.total || props.services.length) / (props.pageSize || 8))
)

const paginationPages = computed(() => {
  const currentPage = props.currentPage || 1
  const total = totalPages.value
  const pages: (number | string)[] = []

  if (total === 0) return pages

  pages.push(1)

  if (total > 5) {
    if (currentPage <= 3) {
      pages.push(2, 3, 4, '...', total)
    } else if (currentPage >= total - 2) {
      pages.push('...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', total)
    }
  } else {
    for (let i = 2; i <= total; i++) {
      pages.push(i)
    }
  }

  return pages
})

const changePage = (page: number | string) => {
  if (typeof page === 'number') {
    emit('pageChange', page)
  }
}

const goToPreviousPage = () => {
  if ((props.currentPage || 1) > 1) {
    emit('pageChange', (props.currentPage || 1) - 1)
  }
}

const goToNextPage = () => {
  if ((props.currentPage || 1) < totalPages.value) {
    emit('pageChange', (props.currentPage || 1) + 1)
  }
}
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
    <Table class="min-w-[700px]">
      <TableHeader>
        <TableRow class="border-b border-[#EEEEEE]">
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
            Référence
          </TableHead>
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
            Désignation
          </TableHead>
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
            Description
          </TableHead>
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
            Catégorie
          </TableHead>
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-right" style="font-family: Inter">
            Prix unitaire
          </TableHead>
          <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
            Statut
          </TableHead>
          <TableHead class="w-[80px] text-center font-bold text-[14.9px] text-[#B5B7C0]" style="font-family: Inter">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in (pageSize || 8)" :key="i">
            <TableCell><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell><Skeleton class="h-4 w-40" /></TableCell>
            <TableCell><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell><Skeleton class="h-4 w-24" /></TableCell>
            <TableCell><Skeleton class="h-4 w-24 ml-auto" /></TableCell>
            <TableCell><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
            <TableCell><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="displayedServices.length > 0">
          <TableRow
            v-for="service in displayedServices"
            :key="service.id"
            class="border-b border-[#EEEEEE] hover:bg-gray-50"
          >
            <TableCell class="text-[14px] font-medium text-[#5932EA]" style="font-family: Poppins">
              {{ service.reference }}
            </TableCell>
            <TableCell class="text-[14px] font-medium text-[#292D32]" style="font-family: Poppins">
              {{ service.name }}
            </TableCell>
            <TableCell class="text-[14px] text-[#292D32] max-w-xs truncate" style="font-family: Poppins" :title="service.description || 'Aucune description'">
              {{ service.description || '-' }}
            </TableCell>
            <TableCell class="text-[14px] font-medium text-[#292D32]" style="font-family: Poppins">
              {{ service.category_name }}
            </TableCell>
            <TableCell class="text-[14px] font-medium text-[#292D32] text-right" style="font-family: Poppins">
              {{ formatAmount(service.unit_price) }} FCFA
            </TableCell>
            <TableCell class="text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  service.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ service.is_active ? 'Actif' : 'Inactif' }}
              </span>
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
                  <DropdownMenuItem @click="handleEdit(service)" class="cursor-pointer">
                    <Edit class="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="handleDelete(service)"
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
        <template v-else>
          <TableRow>
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">
              Aucun service trouvé
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
    </div>

    <!-- Pagination info et contrôles -->
    <div v-if="displayedServices.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-[38px] py-4 sm:py-[30px] border-t border-[#EEEEEE]">
      <!-- Info pagination -->
      <p class="text-xs sm:text-[14px] font-medium text-[#B5B7C0]" style="font-family: Poppins">
        {{ paginationInfo }}
      </p>

      <!-- Contrôles pagination -->
      <div class="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          class="h-6 px-2 rounded border-[#EEEEEE] bg-[#F5F5F5] text-[12px] font-medium text-[#404B52]"
          :disabled="(currentPage || 1) === 1"
          @click="goToPreviousPage"
        >
          &lt;
        </Button>

        <template v-for="page in paginationPages" :key="page">
          <span v-if="page === '...'" class="text-[12px] font-medium text-[#000000]">...</span>
          <Button
            v-else
            variant="outline"
            size="sm"
            :class="[
              'h-6 px-2 rounded text-[12px] font-medium',
              page === (currentPage || 1)
                ? 'bg-[#5932EA] border-[#5932EA] text-white'
                : 'bg-[#F5F5F5] border-[#EEEEEE] text-[#404B52]'
            ]"
            @click="changePage(page)"
          >
            {{ page }}
          </Button>
        </template>

        <Button
          variant="outline"
          size="sm"
          class="h-6 px-2 rounded border-[#EEEEEE] bg-[#F5F5F5] text-[12px] font-medium text-[#404B52]"
          :disabled="(currentPage || 1) === totalPages"
          @click="goToNextPage"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
