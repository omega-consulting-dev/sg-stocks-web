<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Eye, Trash2 } from 'lucide-vue-next'
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
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
      <Table class="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px] text-center font-semibold">Code</TableHead>
            <TableHead class="text-center font-semibold">Date</TableHead>
            <TableHead class="text-center font-semibold">Référence Facture</TableHead>
            <TableHead class="text-center font-semibold">Montant</TableHead>
            <TableHead class="w-[100px] text-center font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in (pageSize || 8)" :key="i">
              <TableCell class="text-center"><Skeleton class="h-4 w-12 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-32 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-28 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-4 w-24 mx-auto" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else-if="displayedEncaissements.length > 0">
            <TableRow
              v-for="encaissement in displayedEncaissements"
              :key="encaissement.id"
              class="hover:bg-gray-50"
            >
              <TableCell class="text-center font-medium">{{ encaissement.code }}</TableCell>
              <TableCell class="text-center text-muted-foreground">{{ formatDate(encaissement.date) }}</TableCell>
              <TableCell class="text-center text-muted-foreground">{{ encaissement.referenceFacture }}</TableCell>
              <TableCell class="text-center font-medium text-green-600">
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
                    <DropdownMenuItem @select="emit('view', encaissement)" class="cursor-pointer">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>Consulter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @select="emit('delete', encaissement)"
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
              <TableCell colspan="5" class="text-center text-muted-foreground py-8">
                Aucun encaissement trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination info -->
    <div class="px-4 sm:px-[38px] py-4 sm:py-[30px] border-t">
      <p class="text-xs sm:text-[14px] font-medium text-[#B5B7C0]" style="font-family: Poppins">
        {{ paginationInfo }}
      </p>
    </div>
  </div>
</template>
