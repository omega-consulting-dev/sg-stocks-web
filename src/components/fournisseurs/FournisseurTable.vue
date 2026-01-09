<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Pencil, Trash2, Eye } from 'lucide-vue-next'
import type { Supplier } from '@/stores/fournisseurs'
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

// Props
interface Props {
  fournisseurs: Supplier[]
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
  view: [fournisseur: Supplier]
  edit: [fournisseur: Supplier]
  delete: [fournisseur: Supplier]
  pageChange: [page: number]
}>()

// Computed
const displayedFournisseurs = computed(() => props.fournisseurs)

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const paginationInfo = computed(() => {
  if (props.total === 0) return 'Aucun fournisseur'
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `Affichage de ${start} à ${end} sur ${props.total} entrées`
})

// Helper pour afficher le nom du fournisseur
const getDisplayName = (fournisseur: Supplier): string => {
  // Priorité : contact_person > name
  if (fournisseur.contact_person) return fournisseur.contact_person
  return fournisseur.name
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
const handleView = (fournisseur: Supplier) => {
  emit('view', fournisseur)
}

const handleEdit = (fournisseur: Supplier) => {
  emit('edit', fournisseur)
}

const handleDelete = (fournisseur: Supplier) => {
  emit('delete', fournisseur)
}
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
      <Table class="min-w-[800px]">
        <TableHeader>
          <TableRow class="border-b border-[#EEEEEE]">
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Code
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Nom entreprise
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Nom du fournisseur
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Téléphone
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              E-mail
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] text-center" style="font-family: Inter">
              Ville
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
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-36 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-16 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedFournisseurs.length > 0">
            <TableRow
              v-for="fournisseur in displayedFournisseurs"
              :key="fournisseur.id"
              class="border-b border-[#EEEEEE] hover:bg-gray-50"
            >
              <TableCell class="text-[14px] font-medium text-[#0769CF] text-center" style="font-family: Poppins">
                {{ fournisseur.supplier_code || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ fournisseur.name || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ fournisseur.contact_person || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ fournisseur.phone || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#5932EA] text-center" style="font-family: Poppins">
                {{ fournisseur.email || '-' }}
              </TableCell>
              <TableCell class="text-[14px] font-medium text-[#292D32] text-center" style="font-family: Poppins">
                {{ fournisseur.city || '-' }}
              </TableCell>
              <TableCell class="text-center">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    fournisseur.is_active
                      ? 'bg-[#E6F9F0] text-[#16A34A]'
                      : 'bg-[#FEE2E2] text-[#DC2626]'
                  ]"
                >
                  {{ fournisseur.is_active ? 'Actif' : 'Inactif' }}
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
                  <DropdownMenuContent align="end" class="w-[160px]">
                    <DropdownMenuItem @click="handleView(fournisseur)" class="cursor-pointer">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>Voir détails</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleEdit(fournisseur)" class="cursor-pointer">
                      <Edit class="mr-2 h-4 w-4" />
                      <span>Modifier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="handleDelete(fournisseur)"
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
              <TableCell colspan="8" class="text-center text-muted-foreground py-8">
                Aucun fournisseur trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="displayedFournisseurs.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-[38px] py-4 sm:py-[30px] border-t border-[#EEEEEE]">
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

        <template v-for="(page, index) in getPageNumbers()">
          <span v-if="page === '...'" :key="`ellipsis-${index}`" class="px-2 text-[12px] text-[#404B52]">...</span>
          <Button
            v-else
            :key="`page-${index}`"
            variant="outline"
            size="sm"
            @click="emit('pageChange', Number(page))"
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
