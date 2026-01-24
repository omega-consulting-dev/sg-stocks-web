<script setup lang="ts">
import { computed } from 'vue'
import type { Decaissement } from '@/services/api/decaissements.api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Pencil, Trash2 } from 'lucide-vue-next'

interface Props {
  decaissements: Decaissement[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [decaissement: Decaissement]
  delete: [id: number]
}>()

const formattedDecaissements = computed(() => {
  return props.decaissements.map((dec) => ({
    ...dec,
    dateFormatted: new Date(dec.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    montantFormatted: dec.montant.toLocaleString('fr-FR'),
  }))
})

const getTypeBadgeVariant = (type: string) => {
  if (type === 'Approvisionnement Bancaire') return 'default'
  return 'secondary'
}
</script>

<template>
  <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden">
    <CardContent class="p-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <TableHead class="font-semibold text-slate-700">Code</TableHead>
              <TableHead class="font-semibold text-slate-700">Type</TableHead>
              <TableHead class="font-semibold text-slate-700">Date</TableHead>
              <TableHead class="font-semibold text-slate-700">Référence</TableHead>
              <TableHead class="text-right font-semibold text-slate-700">Montant</TableHead>
              <TableHead class="font-semibold text-slate-700">Mode de paiement</TableHead>
              <TableHead class="font-semibold text-slate-700">Description</TableHead>
              <TableHead class="text-center font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="i in 5" :key="i" class="hover:bg-slate-50/50">
                <TableCell v-for="j in 8" :key="j">
                  <Skeleton class="h-4 w-full" />
                </TableCell>
              </TableRow>
            </template>

            <template v-else-if="formattedDecaissements.length === 0">
              <TableRow>
                <TableCell colspan="8" class="h-32 text-center">
                  <div class="flex flex-col items-center justify-center text-slate-400">
                    <DollarSign class="h-12 w-12 mb-2 opacity-50" />
                    <p class="text-sm font-medium">Aucun décaissement trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            </template>

            <template v-else>
              <TableRow
                v-for="dec in formattedDecaissements"
                :key="dec.id"
                class="transition-colors hover:bg-red-50/50"
              >
                <TableCell class="font-medium text-slate-900">{{ dec.code }}</TableCell>
                <TableCell>
                  <Badge
                    :variant="getTypeBadgeVariant(dec.type)"
                    class="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none"
                  >
                    {{ dec.type }}
                  </Badge>
                </TableCell>
                <TableCell class="text-slate-600">{{ dec.dateFormatted }}</TableCell>
                <TableCell class="text-slate-600">{{ dec.reference }}</TableCell>
                <TableCell class="text-right font-bold text-red-600">
                  {{ dec.montantFormatted }} FCFA
                </TableCell>
                <TableCell>
                  <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {{ dec.mode_paiement }}
                  </span>
                </TableCell>
                <TableCell class="max-w-xs truncate text-slate-600">
                  {{ dec.description || '-' }}
                </TableCell>
                <TableCell class="text-center">
                  <div class="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      class="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      @click="emit('edit', dec)"
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      class="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      @click="emit('delete', dec.id)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
