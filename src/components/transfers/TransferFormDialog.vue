<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Store } from 'lucide-vue-next'
import { useStoresStore } from '@/stores/stores.store'
import { useProductsStore } from '@/stores/products'
import { useTransfersStore } from '@/stores/transfers.store'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import type { CreateTransferData } from '@/services/api/transfers.api'

interface TransferLine {
  id: string
  product: number | null
  productName: string
  quantity: number | null
}

interface Props {
  open: boolean
  editData?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const storesStore = useStoresStore()
const productsStore = useProductsStore()

// Composable pour l'assignation de magasin
const { shouldShowStoreSelector, getDefaultStoreId, getDefaultStore } = useStoreAssignment()

// Form data
const formData = ref<CreateTransferData>({
  source_store: getDefaultStoreId.value || 0, // Auto-assigné pour utilisateurs restreints
  destination_store: 0,
  transfer_date: new Date().toISOString().split('T')[0],
  lines: [],
  notes: ''
})

const transferLines = ref<TransferLine[]>([
  { id: crypto.randomUUID(), product: null, productName: '', quantity: null }
])

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const isCancelHovered = ref(false)

// Computed
const isEditing = computed(() => !!props.editData)
const dialogTitle = computed(() =>
  isEditing.value ? 'Modifier le transfert' : 'Nouveau transfert'
)

const canSubmit = computed(() => {
  return (
    formData.value.source_store &&
    formData.value.destination_store &&
    formData.value.source_store !== formData.value.destination_store &&
    formData.value.transfer_date &&
    transferLines.value.length > 0 &&
    transferLines.value.every(line => line.product && line.quantity && line.quantity > 0)
  )
})

const availableSourceStores = computed(() =>
  storesStore.stores.filter(s => s.id !== formData.value.destination_store)
)

const availableDestinationStores = computed(() =>
  storesStore.activeStores.filter(s => s.id !== formData.value.source_store)
)

// Methods
const handleCancel = () => {
  emit('update:open', false)
  resetForm()
}

const removeLine = (id: string) => {
  if (transferLines.value.length > 1) {
    transferLines.value = transferLines.value.filter(line => line.id !== id)
  }
}

const updateLineProduct = (lineId: string, productId: number) => {
  const line = transferLines.value.find(l => l.id === lineId)
  if (line) {
    line.product = productId
    const product = productsStore.products.find(p => p.id === productId)
    line.productName = product?.name || ''
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.source_store) {
    errors.value.source_store = 'Sélectionnez le magasin source'
  }

  if (!formData.value.destination_store) {
    errors.value.destination_store = 'Sélectionnez le magasin de destination'
  }

  if (formData.value.source_store === formData.value.destination_store) {
    errors.value.stores = 'Les magasins source et destination doivent être différents'
  }

  if (!formData.value.transfer_date) {
    errors.value.transfer_date = 'Sélectionnez la date'
  }

  if (transferLines.value.length === 0) {
    errors.value.products = 'Ajoutez au moins un produit'
  }

  transferLines.value.forEach((line, index) => {
    if (!line.product) {
      errors.value[`product_${index}`] = 'Sélectionnez un produit'
    }
    if (!line.quantity || line.quantity <= 0) {
      errors.value[`quantity_${index}`] = 'Quantité invalide'
    }
  })

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async (shouldValidate: boolean = false) => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Prepare data
    const data: CreateTransferData = {
      source_store: formData.value.source_store,
      destination_store: formData.value.destination_store,
      transfer_date: formData.value.transfer_date,
      notes: formData.value.notes,
      lines: transferLines.value
        .filter(line => line.product && line.quantity)
        .map(line => ({
          product: line.product!,
          quantity_requested: line.quantity!
        }))
    }

    // Call store to create transfer
    const transfersStore = useTransfersStore()
    const newTransfer = await transfersStore.createTransfer(data)

    // If user wants to validate immediately
    if (shouldValidate && newTransfer.id) {
      await transfersStore.validateTransfer(newTransfer.id)
    }

    emit('saved')
    emit('update:open', false)
    resetForm()
  } catch (error: any) {
    errors.value.submit = error.message || 'Erreur lors de la sauvegarde'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    source_store: 0,
    destination_store: 0,
    transfer_date: new Date().toISOString().split('T')[0],
    lines: [],
    notes: ''
  }
  transferLines.value = [
    { id: crypto.randomUUID(), product: null, productName: '', quantity: null }
  ]
  errors.value = {}
}

// Watch for edit data
watch(() => props.editData, (data) => {
  if (data) {
    formData.value = {
      source_store: data.source_store?.id || data.source_store || 0,
      destination_store: data.destination_store?.id || data.destination_store || 0,
      transfer_date: data.transfer_date || new Date().toISOString().split('T')[0],
      lines: [],
      notes: data.notes || ''
    }

    if (data.lines && data.lines.length > 0) {
      transferLines.value = data.lines.map((p: any) => ({
        id: crypto.randomUUID(),
        product: p.product?.id || p.product,
        productName: p.product_name || '',
        quantity: p.quantity
      }))
    }
  }
}, { immediate: true })

// Watch for dialog close
watch(() => props.open, (isOpen) => {
  if (!isOpen && !isEditing.value) {
    resetForm()
  }
})

// Load data on mount
onMounted(async () => {
  await Promise.all([
    storesStore.fetchAllStoresForTransfers(),
    productsStore.fetchProducts()
  ])
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogTitle>{{ dialogTitle }}</DialogTitle>
      <DialogDescription>
        {{ isEditing ? 'Modifiez les détails du transfert' : 'Créez un nouveau transfert de stock entre magasins' }}
      </DialogDescription>

      <form @submit.prevent="handleSubmit(false)" class="space-y-6">
        <!-- Stores Selection -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Magasin source - Conditionnel selon le rôle -->
          <div class="space-y-2">
            <Label for="source_store">Magasin source *</Label>

            <!-- Admin: Sélecteur complet -->
            <Select
              v-if="shouldShowStoreSelector"
              v-model="formData.source_store"
              :disabled="isEditing"
            >
              <SelectTrigger id="source_store" :class="{ 'border-red-500': errors.source_store }">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="store in availableSourceStores"
                  :key="store.id"
                  :value="store.id"
                >
                  {{ store.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Utilisateur restreint: Badge informatif -->
            <div v-else class="flex items-center gap-2 h-10 px-3 bg-blue-50 border border-blue-200 rounded-md">
              <Store class="w-4 h-4 text-blue-600" />
              <span class="text-sm font-medium text-blue-900">{{ getDefaultStore?.name || 'Aucun magasin' }}</span>
            </div>

            <p v-if="errors.source_store" class="text-sm text-red-500">
              {{ errors.source_store }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="destination_store">Magasin destination *</Label>
            <Select
              v-model="formData.destination_store"
              :disabled="isEditing"
            >
              <SelectTrigger id="destination_store" :class="{ 'border-red-500': errors.destination_store }">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="store in availableDestinationStores"
                  :key="store.id"
                  :value="store.id"
                >
                  {{ store.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.destination_store" class="text-sm text-red-500">
              {{ errors.destination_store }}
            </p>
          </div>
        </div>

        <p v-if="errors.stores" class="text-sm text-red-500">
          {{ errors.stores }}
        </p>

        <!-- Transfer Date -->
        <div class="space-y-2">
          <Label for="transfer_date">Date de transfert *</Label>
          <Input
            id="transfer_date"
            v-model="formData.transfer_date"
            type="date"
            :class="{ 'border-red-500': errors.transfer_date }"
            :disabled="isEditing"
          />
          <p v-if="errors.transfer_date" class="text-sm text-red-500">
            {{ errors.transfer_date }}
          </p>
        </div>

        <!-- Products -->
        <div class="space-y-4">
          <Label>Produits à transférer *</Label>

          <p v-if="errors.products" class="text-sm text-red-500">
            {{ errors.products }}
          </p>

          <div class="space-y-3">
            <div
              v-for="(line, index) in transferLines"
              :key="line.id"
              class="flex items-start gap-3 p-3 border rounded-lg"
            >
              <div class="flex-1 space-y-3">
                <div class="grid grid-cols-3 gap-3">
                  <div class="col-span-2 space-y-1">
                    <Label :for="`product_${index}`">Produit</Label>
                    <Select
                      :model-value="line.product"
                      @update:model-value="updateLineProduct(line.id, $event)"
                      :disabled="isEditing"
                    >
                      <SelectTrigger :id="`product_${index}`" :class="{ 'border-red-500': errors[`product_${index}`] }">
                        <SelectValue placeholder="Sélectionner un produit..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="product in productsStore.products"
                          :key="product.id"
                          :value="product.id"
                        >
                          {{ product.name }} - {{ product.reference }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p v-if="errors[`product_${index}`]" class="text-sm text-red-500">
                      {{ errors[`product_${index}`] }}
                    </p>
                  </div>

                  <div class="space-y-1">
                    <Label :for="`quantity_${index}`">Quantité</Label>
                    <Input
                      :id="`quantity_${index}`"
                      v-model.number="line.quantity"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      :class="{ 'border-red-500': errors[`quantity_${index}`] }"
                      :disabled="isEditing"
                    />
                    <p v-if="errors[`quantity_${index}`]" class="text-sm text-red-500">
                      {{ errors[`quantity_${index}`] }}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                v-if="transferLines.length > 1 && !isEditing"
                type="button"
                variant="ghost"
                size="icon"
                class="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                @click="removeLine(line.id)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes sur le transfert..."
            rows="3"
            :disabled="isEditing"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errors.submit" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errors.submit }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="handleCancel"
            @mouseenter="isCancelHovered = true"
            @mouseleave="isCancelHovered = false"
            :class="{
              'bg-red-50 border-red-500 text-red-600 hover:bg-red-500': isCancelHovered,
              'transition-colors duration-200': true
            }"
          >
            Annuler
          </Button>

          <Button
            v-if="!isEditing"
            type="button"
            variant="outline"
            :disabled="!canSubmit || isLoading"
            @click="handleSubmit(false)"
          >
            <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sauvegarder brouillon
          </Button>

          <Button
            v-if="!isEditing"
            type="button"
            :disabled="!canSubmit || isLoading"
            @click="handleSubmit(true)"
          >
            <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sauvegarder et valider
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
