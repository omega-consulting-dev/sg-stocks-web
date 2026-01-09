<template>
  <div class="w-full">
    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead :class="groupBy === 'category' ? 'w-[80px]' : 'w-[100px]'">Réf.</TableHead>
                <TableHead :class="groupBy === 'category' ? 'text-center' : 'w-[250px]'">Désignation</TableHead>
                <TableHead v-if="groupBy !== 'category'" class="w-[90px]">Type</TableHead>
                <TableHead v-if="groupBy === 'product'" class="text-right w-[90px]">Quantité</TableHead>
                <TableHead v-if="groupBy !== 'product'" :class="groupBy === 'category' ? 'text-right w-[80px]' : 'text-right w-[120px]'">C. A.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody v-if="!loading">
              <TableRow v-if="ventes.length === 0">
                <TableCell :colspan="getColspan" class="text-center py-8 text-muted-foreground">
                  Aucune vente trouvée pour cette période
                </TableCell>
              </TableRow>
              <TableRow v-for="vente in ventes" :key="vente.reference" class="hover:bg-muted/50">
                <TableCell class="font-medium">
                  {{ vente.reference }}
                </TableCell>
                <TableCell :class="groupBy === 'category' ? 'text-center' : ''">
                  {{ vente.designation }}
                </TableCell>
                <TableCell v-if="groupBy !== 'category'">
                  <span v-if="vente.type === 'service'" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Service
                  </span>
                  <span v-else-if="vente.type === 'product'" class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Produit
                  </span>
                  <span v-else class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    -
                  </span>
                </TableCell>
                <TableCell v-if="groupBy === 'product'" class="text-right font-medium text-blue-600">
                  {{ vente.quantity || 0 }}
                </TableCell>
                <TableCell v-if="groupBy !== 'product'" class="text-right font-semibold text-green-600">
                  {{ formatCurrency(vente.ca) }} FCFA
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody v-else>
              <TableRow v-for="i in 5" :key="i">
                <TableCell v-for="j in getColspan" :key="j">
                  <Skeleton class="h-4 w-full" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { VenteStatistique } from '@/stores/ventesStatistiques'

interface Props {
  ventes: VenteStatistique[]
  loading?: boolean
  groupBy?: 'product' | 'category' | 'service'
}

const props = defineProps<Props>()

const getColspan = computed(() => {
  if (props.groupBy === 'category') return 3 // Réf, Désignation, C.A.
  if (props.groupBy === 'service') return 4 // Réf, Désignation, Type, C.A.
  return 4 // product: Réf, Désignation, Type, Quantité
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
</script>
