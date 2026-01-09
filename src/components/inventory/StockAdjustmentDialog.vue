<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStoresStore } from '@/stores/stores.store'
import { useProductsStore } from '@/stores/products'
import { useInventoryStore } from '@/stores/inventory.store'
import type { CreateStockAdjustmentData } from '@/services/api/inventory.api'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const storesStore = useStoresStore()
const productsStore = useProductsStore()
const inventoryStore = useInventoryStore()

// Form data
const formData = ref<CreateStockAdjustmentData>({
  store: 0,
  product: 0,
  quantity: 0,
  movement_type: 'adjustment_in',
  notes: ''
})

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// Computed
const canSubmit = computed(() => {
  return (
    formData.value.store > 0 &&
    formData.value.product > 0 &&
    formData.value.quantity > 0 &&
    formData.value.movement_type
  )
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.store) {
    errors.value.store = 'Sélectionnez un magasin'
  }

  if (!formData.value.product) {
    errors.value.product = 'Sélectionnez un produit'
  }

  if (!formData.value.quantity || formData.value.quantity <= 0) {
    errors.value.quantity = 'La quantité doit être supérieure à 0'
  }

  if (!formData.value.movement_type) {
    errors.value.movement_type = 'Sélectionnez le type d\'ajustement'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    await inventoryStore.createAdjustment(formData.value)

    emit('saved')
    emit('update:open', false)
    resetForm()
  } catch (error: any) {
    console.error('Error creating adjustment:', error)
    errors.value.submit = error.message || 'Erreur lors de la création de l\'ajustement'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    store: 0,
    product: 0,
    quantity: 0,
    movement_type: 'adjustment_in',
    notes: ''
  }
  errors.value = {}
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    storesStore.fetchStores(),
    productsStore.fetchProducts()
  ])
})
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogTitle>Ajustement de Stock</DialogTitle>
      <DialogDescription>
        Ajoutez ou retirez des quantités de stock pour un produit
      </DialogDescription>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Store Selection -->
        <div class="space-y-2">
          <Label for="store">Magasin *</Label>
          <SelectRoot v-model="formData.store">
            <SelectTrigger id="store" :class="{ 'border-red-500': errors.store }">
              <SelectValue placeholder="Sélectionner un magasin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="store in storesStore.stores"
                :key="store.id"
                :value="store.id"
              >
                {{ store.name }}
              </SelectItem>
            </SelectContent>
          </SelectRoot>
          <p v-if="errors.store" class="text-sm text-red-500">
            {{ errors.store }}
          </p>
        </div>

        <!-- Product Selection -->
        <div class="space-y-2">
          <Label for="product">Produit *</Label>
          <SelectRoot v-model="formData.product">
            <SelectTrigger id="product" :class="{ 'border-red-500': errors.product }">
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
          </SelectRoot>
          <p v-if="errors.product" class="text-sm text-red-500">
            {{ errors.product }}
          </p>
        </div>

        <!-- Movement Type -->
        <div class="space-y-2">
          <Label for="movement_type">Type d'ajustement *</Label>
          <SelectRoot v-model="formData.movement_type">
            <SelectTrigger id="movement_type" :class="{ 'border-red-500': errors.movement_type }">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adjustment_in">
                Ajout de stock (+)
              </SelectItem>
              <SelectItem value="adjustment_out">
                Retrait de stock (-)
              </SelectItem>
            </SelectContent>
          </SelectRoot>
          <p v-if="errors.movement_type" class="text-sm text-red-500">
            {{ errors.movement_type }}
          </p>
        </div>

        <!-- Quantity -->
        <div class="space-y-2">
          <Label for="quantity">Quantité *</Label>
          <Input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            :class="{ 'border-red-500': errors.quantity }"
          />
          <p v-if="errors.quantity" class="text-sm text-red-500">
            {{ errors.quantity }}
          </p>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Raison de l'ajustement..."
            rows="3"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errors.submit" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errors.submit }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <DialogClose as-child>
            <Button type="button" variant="outline" :disabled="isLoading">
              Annuler
            </Button>
          </DialogClose>

          <Button
            type="submit"
            :disabled="!canSubmit || isLoading"
          >
            <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Enregistrer l'ajustement
          </Button>
        </div>
      </form>
    </DialogContent>
  </DialogRoot>
</template>
