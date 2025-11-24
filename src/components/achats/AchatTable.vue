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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-vue-next'

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
  consult: [achat: Achat]
  edit: [achat: Achat]
  delete: [achat: Achat]
  pageChange: [page: number]
}>()

// Computed
const displayedAchats = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.achats.slice(start, end)
})

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

// Formatage de date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Formatage du montant
const formatMontant = (montant: number) => {
  return montant.toLocaleString('fr-FR')
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
    pages.push(totalPages.value)
  }

  return pages
}
</script>

<template>
  <div class="space-y-4">
    <!-- Table -->
    <div class="rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="border-b border-[#EEEEEE]">
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-10 py-4">
              Intitulé de l'opération
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-6 py-4">
              Date de l'achat
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-6 py-4">
              Montant facture
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-6 py-4">
              Nbre de produit
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-6 py-4">
              Fournisseur
            </TableHead>
            <TableHead class="font-bold text-[14.9px] text-[#B5B7C0] px-6 py-4 text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="achat in displayedAchats"
            :key="achat.id"
            class="border-b border-[#EEEEEE] hover:bg-gray-50/50"
          >
            <TableCell class="font-medium text-[14px] text-[#292D32] px-10 py-6">
              {{ achat.intitule }}
            </TableCell>
            <TableCell class="text-[14px] text-[#292D32] px-6 py-6">
              {{ formatDate(achat.dateAchat) }}
            </TableCell>
            <TableCell class="text-[14px] text-[#292D32] px-6 py-6">
              {{ formatMontant(achat.montantFacture) }}
            </TableCell>
            <TableCell class="text-[14px] text-[#292D32] px-6 py-6">
              {{ achat.nbreProduits }}
            </TableCell>
            <TableCell class="text-[14px] text-[#292D32] px-6 py-6">
              {{ achat.fournisseur }}
            </TableCell>
            <TableCell class="px-6 py-6 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:bg-gray-100"
                  >
                    <MoreHorizontal class="h-5 w-5 text-[#595959]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  class="w-[130px] rounded-[10px] shadow-[0px_5px_10px_5px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]"
                >
                  <DropdownMenuItem
                    @click="emit('consult', achat)"
                    class="cursor-pointer text-[14.9px] text-[#154BFF] font-medium py-2 flex items-center gap-2"
                  >
                    <Eye class="h-4 w-4" />
                    consulter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="emit('edit', achat)"
                    class="cursor-pointer text-[14.9px] text-[#3A3A3A] font-medium py-2 flex items-center gap-2"
                  >
                    <Pencil class="h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="emit('delete', achat)"
                    class="cursor-pointer text-[14.9px] text-[#F52F2F] font-medium py-2 flex items-center gap-2"
                  >
                    <Trash2 class="h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>

          <!-- État de chargement -->
          <TableRow v-if="loading">
            <TableCell colspan="6" class="text-center py-10">
              <div class="flex items-center justify-center gap-2">
                <div class="animate-spin h-5 w-5 border-2 border-[#0769CF] border-t-transparent rounded-full"></div>
                <span class="text-[#B5B7C0]">Chargement...</span>
              </div>
            </TableCell>
          </TableRow>

          <!-- Aucun résultat -->
          <TableRow v-if="!loading && displayedAchats.length === 0">
            <TableCell colspan="6" class="text-center py-10">
              <span class="text-[#B5B7C0]">Aucun achat trouvé</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Footer avec pagination et info -->
    <div class="flex items-center justify-between px-4">
      <!-- Info sur les entrées affichées -->
      <p class="text-[14px] text-[#B5B7C0] font-medium">
        Showing data {{ (currentPage - 1) * pageSize + 1 }} to
        {{ Math.min(currentPage * pageSize, total) }} of {{ total.toLocaleString() }} entries
      </p>

      <!-- Pagination -->
      <div class="flex items-center gap-2">
        <!-- Bouton Précédent -->
        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', currentPage - 1)"
          :disabled="currentPage === 1"
          class="h-[24px] px-2 rounded-[4px] border border-[#EEEEEE] bg-[#F5F5F5] text-[#404B52] text-[12px] font-medium disabled:opacity-50"
        >
          &lt;
        </Button>

        <!-- Numéros de page -->
        <template v-for="(page, index) in getPageNumbers()" :key="index">
          <span v-if="page === '...'" class="text-[12px] text-[#000000] font-medium">
            ...
          </span>
          <Button
            v-else
            variant="outline"
            size="sm"
            @click="emit('pageChange', page as number)"
            :class="[
              'h-[24px] px-2 min-w-[24px] rounded-[4px] border text-[12px] font-medium',
              currentPage === page
                ? 'bg-[#5932EA] border-[#5932EA] text-white'
                : 'border-[#EEEEEE] bg-[#F5F5F5] text-[#404B52]',
            ]"
          >
            {{ page }}
          </Button>
        </template>

        <!-- Bouton Suivant -->
        <Button
          variant="outline"
          size="sm"
          @click="emit('pageChange', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="h-[24px] px-2 rounded-[4px] border border-[#EEEEEE] bg-[#F5F5F5] text-[#404B52] text-[12px] font-medium disabled:opacity-50"
        >
          &gt;
        </Button>
      </div>
    </div>
  </div>
</template>
