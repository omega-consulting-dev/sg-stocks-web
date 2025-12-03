<script setup lang="ts">
import { MoreVertical, Edit, Trash2, UserCheck } from 'lucide-vue-next'
import type { CompteClient } from '@/stores/clients'
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

defineProps<{
  comptes: CompteClient[]
  loading?: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  edit: [compte: CompteClient]
  delete: [compte: CompteClient]
  suiviClient: [compte: CompteClient]
  pageChange: [page: number]
}>()

// Formatage de montant avec espace comme séparateur de milliers
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant)
}

// Formatage de date JJ/MM/AAAA
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50 hover:bg-muted/50">
            <TableHead class="font-medium text-muted-foreground">Nom client</TableHead>
            <TableHead class="font-medium text-muted-foreground">Montant facture</TableHead>
            <TableHead class="font-medium text-muted-foreground">Date facture</TableHead>
            <TableHead class="font-medium text-muted-foreground">Montant encaissement</TableHead>
            <TableHead class="font-medium text-muted-foreground">Date</TableHead>
            <TableHead class="font-medium text-muted-foreground text-center w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading state -->
          <template v-if="loading">
            <TableRow v-for="i in pageSize" :key="i">
              <TableCell><Skeleton class="h-4 w-28" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>

          <!-- Data rows -->
          <template v-else-if="comptes.length > 0">
            <TableRow
              v-for="compte in comptes"
              :key="compte.id"
              class="hover:bg-muted/30 transition-colors"
            >
              <TableCell class="font-medium">{{ compte.client_name }}</TableCell>
              <TableCell>{{ formatMontant(compte.montant_facture) }}</TableCell>
              <TableCell>{{ formatDate(compte.date_facture) }}</TableCell>
              <TableCell>{{ formatMontant(compte.montant_encaissement) }}</TableCell>
              <TableCell>{{ formatDate(compte.date_encaissement) }}</TableCell>
              <TableCell class="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="rounded-lg">
                    <DropdownMenuItem @select="emit('edit', compte)">
                      <Edit class="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @select="emit('delete', compte)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @select="emit('suiviClient', compte)"
                      class="text-primary focus:text-primary"
                    >
                      <UserCheck class="mr-2 h-4 w-4" />
                      suivie client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty state -->
          <template v-else>
            <TableRow>
              <TableCell colspan="6" class="h-32 text-center text-muted-foreground">
                Aucun compte client trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Affichage {{ (currentPage - 1) * pageSize + 1 }} -
        {{ Math.min(currentPage * pageSize, total) }} sur {{ total }}
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="emit('pageChange', currentPage - 1)"
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage * pageSize >= total"
          @click="emit('pageChange', currentPage + 1)"
        >
          Suivant
        </Button>
      </div>
    </div>
  </div>
</template>
