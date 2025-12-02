<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Package, Store as StoreIcon, Hash } from 'lucide-vue-next'
import type { Achat } from '@/stores/achats'
import type { CreateStockMovementDto } from '@/services/api/stockMovements.api'
import { useProductsStore } from '@/stores/products'
import { useAchatsStore } from '@/stores/achats'
import { useStoresStore } from '@/stores/stores'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  open: boolean
  achat?: Achat | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<CreateStockMovementDto, 'movement_type'>]
}>()

// Stores
const productsStore = useProductsStore()
const achatsStore = useAchatsStore()
const storesStore = useStoresStore()

const formData = ref({
  reference: '',
  product: 0,
  store: 0,
  quantity: 0,
  notes: '',
})

// Générer le prochain code séquentiel (ETN-001, ETN-002, etc.)
// Utilise la liste de toutes les références pour ne jamais réutiliser un code
const generateNextCode = (allReferences: string[]): string => {
  const existingCodes = allReferences
    .filter(ref => ref && ref.startsWith('ETN-'))
    .map(ref => parseInt(ref.replace('ETN-', '')) || 0)

  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
  const nextNumber = maxCode + 1
  return `ETN-${nextNumber.toString().padStart(3, '0')}`
}

// Obtenir le nom du produit sélectionné
const selectedProductName = computed(() => {
  const product = productsStore.products.find(p => p.id === formData.value.product)
  return product?.name || ''
})

const isEditing = ref(false)

// Charger les produits et magasins au montage
onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
  if (storesStore.stores.length === 0) {
    storesStore.fetchStores()
  }
})

watch(() => props.open, async (newValue) => {
  if (newValue) {
    if (props.achat) {
      isEditing.value = true
      formData.value = {
        reference: props.achat.reference,
        product: props.achat.product,
        store: props.achat.store,
        quantity: props.achat.quantity,
        notes: props.achat.notes || '',
      }
    } else {
      isEditing.value = false
      // Récupérer TOUTES les références pour générer un code unique
      const allReferences = await achatsStore.fetchAllReferences()
      formData.value = {
        reference: generateNextCode(allReferences),
        product: productsStore.products[0]?.id || 0,
        store: storesStore.stores[0]?.id || 0,
        quantity: 0,
        notes: '',
      }
    }
  }
})

const handleProductChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.product = parseInt(String(value))
  }
}

const handleStoreChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.store = parseInt(String(value))
  }
}

const handleSubmit = () => {
  if (!formData.value.product || !formData.value.store || !formData.value.quantity) {
    return
  }

  const data: Omit<CreateStockMovementDto, 'movement_type'> = {
    product: formData.value.product,
    store: formData.value.store,
    quantity: formData.value.quantity,
    reference: formData.value.reference,
    notes: formData.value.notes || '',
  }

  emit('submit', data)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[600px] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[90vh] overflow-y-auto">
      <div class="relative px-4 sm:px-[47px] pt-[27px] pb-[20px]">
        <div class="flex items-center gap-3 sm:gap-5 mb-4">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Package class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
            {{ isEditing ? 'Modifier l\'entrée' : 'Nouvelle entrée de stock' }}
          </h2>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Référence (auto-générée) -->
        <div class="mb-[10px]">
          <label for="reference" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Référence :
          </label>
          <div class="relative">
            <Hash class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="reference"
              v-model="formData.reference"
              :disabled="true"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] bg-gray-100 font-semibold"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Produit -->
        <div class="mb-[10px]">
          <label for="product" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Produit :
          </label>
          <Select
            :model-value="formData.product.toString()"
            @update:model-value="handleProductChange"
            :disabled="loading || productsStore.loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="product in productsStore.products"
                  :key="product.id"
                  :value="product.id.toString()"
                >
                  {{ product.reference }} - {{ product.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="selectedProductName" class="text-sm text-muted-foreground mt-1">
            Produit : <span class="font-medium text-[#0769CF]">{{ selectedProductName }}</span>
          </p>
        </div>

        <!-- Magasin -->
        <div class="mb-[10px]">
          <label for="store" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Magasin :
          </label>
          <Select
            :model-value="formData.store.toString()"
            @update:model-value="handleStoreChange"
            :disabled="loading || storesStore.loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <SelectValue placeholder="Sélectionner un magasin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="store in storesStore.stores"
                  :key="store.id"
                  :value="store.id.toString()"
                >
                  {{ store.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Quantité -->
        <div class="mb-[10px]">
          <label for="quantity" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Quantité :
          </label>
          <div class="relative">
            <Package class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="quantity"
              v-model.number="formData.quantity"
              type="number"
              min="1"
              step="1"
              placeholder="Ex : 100"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-[15px]">
          <label for="notes" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Notes :
          </label>
          <div class="relative">
            <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Notes optionnelles..."
              :disabled="loading"
              class="w-full min-h-[80px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.product || !formData.store || !formData.quantity"
            class="w-full h-[37px] bg-[#0769CF] hover:bg-[#0558b0] text-white rounded-[10px] text-[14.76px] font-bold uppercase"
            style="font-family: Montserrat"
          >
            {{ loading ? 'ENREGISTREMENT...' : 'SAUVER' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
