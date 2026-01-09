<template>
  <div class="w-full">
    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <!-- Ligne de destination si un magasin est filtré -->
              <TableRow v-if="filteredStoreName" class="bg-blue-50 border-b-2 border-blue-200">
                <TableCell colspan="6" class="py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-blue-900">Destination :</span>
                    <span class="font-bold text-blue-700">{{ filteredStoreName }}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead class="w-[150px] border-r">Référence</TableHead>
                <TableHead class="w-[250px] border-r">Produit / Désignation</TableHead>
                <TableHead v-if="!filteredStoreName" class="w-[150px] border-r">Magasin</TableHead>
                <TableHead class="text-center w-[120px] border-r">Stock théorique</TableHead>
                <TableHead class="text-center w-[120px] border-r">Stock physique</TableHead>
                <TableHead class="text-center w-[120px]">Ecart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody v-if="!loading">
              <TableRow v-if="stocks.length === 0">
                <TableCell :colspan="filteredStoreName ? 5 : 6" class="text-center py-8 text-muted-foreground">
                  Aucun stock trouvé
                </TableCell>
              </TableRow>
              <TableRow v-for="stock in stocks" :key="stock.id" class="hover:bg-muted/50">
                <TableCell class="text-muted-foreground border-r">
                  {{ stock.product_reference || '-' }}
                </TableCell>
                <TableCell class="font-medium border-r">
                  {{ stock.product_name }}
                </TableCell>
                <TableCell v-if="!filteredStoreName" class="border-r">
                  {{ stock.store_name }}
                </TableCell>
                <TableCell class="text-center font-semibold border-r">
                  {{ stock.quantity }}
                </TableCell>
                <TableCell class="text-center border-r">
                  <!-- Stock physique - vide pour saisie manuelle -->
                </TableCell>
                <TableCell class="text-center">
                  <!-- Ecart - vide pour saisie manuelle -->
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody v-else>
              <TableRow v-for="i in 5" :key="i">
                <TableCell v-for="j in (filteredStoreName ? 5 : 6)" :key="j">
                  <Skeleton class="h-4 w-full" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
      <div class="text-sm text-muted-foreground">
        Page {{ currentPage }} sur {{ totalPages }}
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="$emit('pageChange', currentPage - 1)"
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="$emit('pageChange', currentPage + 1)"
        >
          Suivant
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { StockLevel } from '@/services/api/inventory.api'

interface Props {
  stocks: StockLevel[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  filteredStoreName?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  totalPages: 1,
  filteredStoreName: ''
})

defineEmits<{
  pageChange: [page: number]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getProductPrice = (stock: StockLevel): number => {
  if (typeof stock.product === 'object' && stock.product.price) {
    return stock.product.price
  }
  return 0
}

const getStatusVariant = (stock: StockLevel): 'destructive' | 'warning' | 'default' => {
  if (stock.quantity === 0) {
    return 'destructive'
  } else if (stock.quantity < (stock.minimum_stock || 0)) {
    return 'warning'
  }
  return 'default'
}

const getStatusLabel = (stock: StockLevel): string => {
  if (stock.quantity === 0) {
    return 'Rupture'
  } else if (stock.quantity < (stock.minimum_stock || 0)) {
    return 'Faible'
  }
  return 'Normal'
}
</script>
