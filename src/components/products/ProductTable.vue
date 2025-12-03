<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Edit, Trash2 } from 'lucide-vue-next'
import type { Product } from '@/stores/products'
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
  products: Product[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}>()

const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
}>()

const displayedProducts = computed(() => props.products)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(price)
}

const handleEdit = (product: Product) => {
  emit('edit', product)
}

const handleDelete = (product: Product) => {
  emit('delete', product)
}

const paginationInfo = computed(() => {
  const start = ((props.currentPage || 1) - 1) * (props.pageSize || 8) + 1
  const end = Math.min(start + (props.pageSize || 8) - 1, props.total || props.products.length)
  return `Showing data ${start} to ${end} of ${(props.total || props.products.length).toLocaleString('en-US')} entries`
})
</script>

<template>
  <div class="rounded-xl sm:rounded-[30px] bg-white shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] overflow-hidden">
    <div class="overflow-x-auto">
    <Table class="min-w-[800px]">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px] font-semibold">Image</TableHead>
          <TableHead class="w-[120px] font-semibold">Code</TableHead>
          <TableHead class="font-semibold">Désignation</TableHead>
          <TableHead class="font-semibold">Famille</TableHead>
          <TableHead class="text-right font-semibold">Prix Achat</TableHead>
          <TableHead class="text-right font-semibold">Prix Vente</TableHead>
          <TableHead class="text-right font-semibold">Stock</TableHead>
          <TableHead class="w-[80px] text-center font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in (pageSize || 8)" :key="i">
            <TableCell><Skeleton class="h-[32px] w-[32px] rounded" /></TableCell>
            <TableCell><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell><Skeleton class="h-4 w-24" /></TableCell>
            <TableCell><Skeleton class="h-4 w-20 ml-auto" /></TableCell>
            <TableCell><Skeleton class="h-4 w-20 ml-auto" /></TableCell>
            <TableCell><Skeleton class="h-4 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="displayedProducts.length > 0">
          <TableRow
            v-for="product in displayedProducts"
            :key="product.id"
            class="hover:bg-gray-50"
          >
            <TableCell>
              <div class="flex items-center justify-center">
                <img
                  v-if="product.primary_image"
                  :src="product.primary_image"
                  :alt="product.name"
                  class="h-[32px] w-[32px] rounded object-cover"
                />
                <div
                  v-else
                  class="h-[32px] w-[32px] rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500"
                >
                  N/A
                </div>
              </div>
            </TableCell>
            <TableCell class="font-medium">{{ product.reference }}</TableCell>
            <TableCell>{{ product.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ product.category_name }}</TableCell>
            <TableCell class="text-right text-muted-foreground text-sm">
              {{ formatPrice(product.cost_price) }}
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ formatPrice(product.selling_price) }}
            </TableCell>
            <TableCell class="text-right">
              <span
                :class="[
                  'font-medium',
                  product.is_low_stock || product.current_stock <= product.minimum_stock
                    ? 'text-red-600'
                    : 'text-green-600',
                ]"
              >
                {{ product.current_stock }}
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
                  <DropdownMenuItem @select="handleEdit(product)" class="cursor-pointer">
                    <Edit class="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @select="handleDelete(product)"
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
              Aucun produit trouvé
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
