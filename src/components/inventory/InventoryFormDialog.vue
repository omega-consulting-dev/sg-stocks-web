<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
import { Store } from 'lucide-vue-next'
import { useStoresStore } from '@/stores/stores.store'
import { useInventoryStore } from '@/stores/inventory.store'
import { useStoreAssignment } from '@/composables/useStoreAssignment'

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
const inventoryStore = useInventoryStore()

// Composable pour l'assignation de magasin
const { shouldShowStoreSelector, getDefaultStoreId, getDefaultStore } = useStoreAssignment()

const formData = ref({
  store: getDefaultStoreId.value || 0, // Auto-assigné pour utilisateurs restreints
  inventory_date: new Date().toISOString().split('T')[0],
  notes: ''
})

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.store) {
    errors.value.store = 'Sélectionnez un magasin'
  }

  if (!formData.value.inventory_date) {
    errors.value.inventory_date = 'Sélectionnez une date'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // Create empty inventory - products will be added in detail view
    await inventoryStore.createInventory({
      store: formData.value.store,
      inventory_date: formData.value.inventory_date,
      notes: formData.value.notes,
      lines: []
    })

    emit('saved')
    emit('update:open', false)
    resetForm()
  } catch (error: any) {
    console.error('Error creating inventory:', error)
    errors.value.submit = error.message || 'Erreur lors de la création'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    store: 0,
    inventory_date: new Date().toISOString().split('T')[0],
    notes: ''
  }
  errors.value = {}
}

onMounted(async () => {
  await storesStore.fetchStores()
})
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogTitle>Nouvel Inventaire Physique</DialogTitle>
      <DialogDescription>
        Créez un inventaire pour compter les produits d'un magasin
      </DialogDescription>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="store">Magasin *</Label>

          <!-- Admin: Sélecteur complet -->
          <SelectRoot v-if="shouldShowStoreSelector" v-model="formData.store">
            <SelectTrigger id="store" :class="{ 'border-red-500': errors.store }">
              <SelectValue placeholder="Sélectionner..." />
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

          <!-- Utilisateur restreint: Badge informatif -->
          <div v-else class="flex items-center gap-2 h-10 px-3 bg-blue-50 border border-blue-200 rounded-md">
            <Store class="w-4 h-4 text-blue-600" />
            <span class="text-sm font-medium text-blue-900">{{ getDefaultStore?.name || 'Aucun magasin' }}</span>
          </div>

          <p v-if="errors.store" class="text-sm text-red-500">{{ errors.store }}</p>
        </div>

        <div class="space-y-2">
          <Label for="inventory_date">Date d'inventaire *</Label>
          <Input
            id="inventory_date"
            v-model="formData.inventory_date"
            type="date"
            :class="{ 'border-red-500': errors.inventory_date }"
          />
          <p v-if="errors.inventory_date" class="text-sm text-red-500">{{ errors.inventory_date }}</p>
        </div>

        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes sur l'inventaire..."
            rows="3"
          />
        </div>

        <div v-if="errors.submit" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errors.submit }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <DialogClose as-child>
            <Button type="button" variant="outline" :disabled="isLoading">
              Annuler
            </Button>
          </DialogClose>

          <Button type="submit" :disabled="isLoading">
            <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Créer l'inventaire
          </Button>
        </div>
      </form>
    </DialogContent>
  </DialogRoot>
</template>
