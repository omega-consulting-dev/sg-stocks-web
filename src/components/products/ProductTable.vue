<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { MoreVertical, Edit, Trash2 } from 'lucide-vue-next'
import type { Product } from '@/stores/products'
import { useFieldConfigStore } from '@/stores/field-config.store'
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

const fieldConfigStore = useFieldConfigStore()

const props = defineProps<{
  products: Product[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
}>()

// Load field configurations on mount
onMounted(async () => {
  if (fieldConfigStore.configurations.length === 0) {
    await fieldConfigStore.fetchConfigurations()
  }
})

// Get column visibility configurations
const columnConfigs = computed(() => {
  const grouped = fieldConfigStore.getConfigsByForm()
  const configs = grouped['product_table'] || []
  const configMap: Record<string, { visible: boolean; required: boolean }> = {}

  configs.forEach(config => {
    configMap[config.field_name] = {
      visible: config.is_visible,
      required: config.is_required
    }
  })

  return configMap
})

const isColumnVisible = (columnName: string) => {
  return columnConfigs.value[columnName]?.visible ?? true
}

const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
}>()

const displayedProducts = computed(() => props.products)

const formatPrice = (price: number | null | undefined) => {
  const numericPrice = price ?? 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(numericPrice)
}

const formatNumber = (value: number | null | undefined) => {
  return value ?? 0
}

const handleEdit = (product: Product) => {
  console.log('ProductTable handleEdit appelé avec:', product)
  emit('edit', product)
}

const handleDelete = (product: Product) => {
  console.log('ProductTable handleDelete appelé avec:', product)
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
          <TableHead v-if="isColumnVisible('image')" class="w-[100px] font-semibold">Image</TableHead>
          <TableHead v-if="isColumnVisible('code')" class="w-[120px] font-semibold">Code</TableHead>
          <TableHead v-if="isColumnVisible('designation')" class="font-semibold">Désignation</TableHead>
          <TableHead v-if="isColumnVisible('family')" class="font-semibold">Famille</TableHead>
          <TableHead v-if="isColumnVisible('purchase_price')" class="text-right font-semibold">Prix Achat</TableHead>
          <TableHead v-if="isColumnVisible('sale_price')" class="text-right font-semibold">Prix Vente</TableHead>
          <TableHead v-if="isColumnVisible('minimum_stock')" class="text-right font-semibold">Stock Min</TableHead>
          <TableHead v-if="isColumnVisible('optimal_stock')" class="text-right font-semibold">Stock Opt</TableHead>
          <TableHead v-if="isColumnVisible('current_stock')" class="text-right font-semibold">Stock Actuel</TableHead>
          <TableHead class="w-[80px] text-center font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in (pageSize || 8)" :key="i">
            <TableCell v-if="isColumnVisible('image')"><Skeleton class="h-[32px] w-[32px] rounded" /></TableCell>
            <TableCell v-if="isColumnVisible('code')"><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell v-if="isColumnVisible('designation')"><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell v-if="isColumnVisible('family')"><Skeleton class="h-4 w-24" /></TableCell>
            <TableCell v-if="isColumnVisible('purchase_price')"><Skeleton class="h-4 w-20 ml-auto" /></TableCell>
            <TableCell v-if="isColumnVisible('sale_price')"><Skeleton class="h-4 w-20 ml-auto" /></TableCell>
            <TableCell v-if="isColumnVisible('minimum_stock')"><Skeleton class="h-4 w-16 ml-auto" /></TableCell>
            <TableCell v-if="isColumnVisible('optimal_stock')"><Skeleton class="h-4 w-16 ml-auto" /></TableCell>
            <TableCell v-if="isColumnVisible('current_stock')"><Skeleton class="h-4 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="displayedProducts.length > 0">
          <TableRow
            v-for="product in displayedProducts"
            :key="product.id"
            class="hover:bg-gray-50"
          >
            <TableCell v-if="isColumnVisible('image')">
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
            <TableCell v-if="isColumnVisible('code')" class="font-medium">{{ product.reference }}</TableCell>
            <TableCell v-if="isColumnVisible('designation')">{{ product.name }}</TableCell>
            <TableCell v-if="isColumnVisible('family')" class="text-muted-foreground">{{ product.category_name }}</TableCell>
            <TableCell v-if="isColumnVisible('purchase_price')" class="text-right text-muted-foreground text-sm">
              {{ formatPrice(product.cost_price) }}
            </TableCell>
            <TableCell v-if="isColumnVisible('sale_price')" class="text-right font-medium">
              {{ formatPrice(product.selling_price) }}
            </TableCell>
            <TableCell v-if="isColumnVisible('minimum_stock')" class="text-right text-muted-foreground">
              {{ formatNumber(product.minimum_stock) }}
            </TableCell>
            <TableCell v-if="isColumnVisible('optimal_stock')" class="text-right text-muted-foreground">
              {{ formatNumber(product.optimal_stock) }}
            </TableCell>
            <TableCell v-if="isColumnVisible('current_stock')" class="text-right">
              <span
                :class="[
                  'font-semibold',
                  product.is_low_stock || product.current_stock <= product.minimum_stock
                    ? 'text-red-600'
                    : 'text-green-600',
                ]"
              >
                {{ formatNumber(product.current_stock) }}
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
                  <DropdownMenuItem @click="handleEdit(product)" class="cursor-pointer">
                    <Edit class="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="handleDelete(product)"
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
