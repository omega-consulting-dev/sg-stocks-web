<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { Customer } from '@/services/api/customers.api'
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
import { Badge } from '@/components/ui/badge'

// Props
interface Props {
  customers: Customer[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// Emits
const emit = defineEmits<{
  edit: [customer: Customer]
  delete: [customer: Customer]
  pageChange: [page: number]
}>()

// Computed
const displayedCustomers = computed(() => props.customers)

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const paginationInfo = computed(() => {
  if (props.total === 0) return 'Aucun client'
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `Affichage de ${start} à ${end} sur ${props.total} entrées`
})

// Formatage de montant
const formatMontant = (montant: number | undefined) => {
  if (!montant) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
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
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
      <Table class="min-w-[900px]">
        <TableHeader>
          <TableRow class="border-b border-[#EEEEEE]">
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Code
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Nom
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Contact
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Ville
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Conditions paiement
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Limite crédit
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Solde
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
            <TableRow v-for="i in (pageSize || 10)" :key="i">
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedCustomers.length > 0">
            <TableRow
              v-for="customer in displayedCustomers"
              :key="customer.id"
              class="border-b border-[#EEEEEE] hover:bg-gray-50"
            >
              <TableCell class="text-[14px] font-medium text-[#0769CF] text-center" style="font-family: Poppins">
                {{ customer.customer_code }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ customer.name }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                <div class="flex flex-col">
                  <span v-if="customer.email" class="text-[#5932EA]">{{ customer.email }}</span>
                  <span v-if="customer.phone" class="text-xs text-muted-foreground">{{ customer.phone }}</span>
                  <span v-if="!customer.email && !customer.phone">-</span>
                </div>
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ customer.city || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ customer.payment_term_display || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ formatMontant(customer.credit_limit) }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-center" style="font-family: Poppins">
                <span :class="(customer.balance || 0) > 0 ? 'text-red-600 font-semibold' : 'text-green-600'">
                  {{ formatMontant(customer.balance || 0) }}
                </span>
              </TableCell>
              <TableCell class="text-center">
                <Badge :class="customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ customer.is_active ? 'Actif' : 'Inactif' }}
                </Badge>
              </TableCell>
              <TableCell class="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4" />
                      <span class="sr-only">Ouvrir le menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[180px]">
                    <DropdownMenuItem @click="emit('edit', customer)" class="cursor-pointer">
                      <Pencil class="mr-2 h-4 w-4" />
                      <span>Modifier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="emit('delete', customer)" class="cursor-pointer text-red-600">
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
              <TableCell colspan="9" class="text-center text-muted-foreground py-8">
                Aucun client trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="displayedCustomers.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-[38px] py-4 sm:py-[30px] border-t border-[#EEEEEE]">
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
          :disabled="currentPage === totalPages || totalPages === 0"
          class="h-[26px] w-[26px] p-0 rounded-[4px] border-[#EEEEEE] bg-[#F5F5F5]"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
