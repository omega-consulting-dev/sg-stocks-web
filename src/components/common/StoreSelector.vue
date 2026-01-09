<script setup lang="ts">
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useStoresStore } from '@/stores/stores.store'

interface Props {
  modelValue?: number | null
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Point de vente',
  placeholder: 'Tous les points de vente',
  required: false,
  disabled: false
})

const emit = defineEmits<Emits>()

const storesStore = useStoresStore()

// Charger les stores si pas déjà chargé
if (storesStore.stores.length === 0) {
  storesStore.fetchStores()
}

const selectedValue = computed({
  get: () => props.modelValue?.toString() || 'all',
  set: (value: string) => {
    if (value === 'all') {
      emit('update:modelValue', null)
    } else {
      emit('update:modelValue', parseInt(value, 10))
    }
  }
})
</script>

<template>
  <div class="space-y-2">
    <Label v-if="label" :for="`store-selector-${label}`">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </Label>
    <Select v-model="selectedValue" :disabled="disabled">
      <SelectTrigger :id="`store-selector-${label}`">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-if="!required" value="all">
          {{ placeholder }}
        </SelectItem>
        <SelectItem
          v-for="store in storesStore.stores"
          :key="store.id"
          :value="store.id.toString()"
        >
          {{ store.code }} - {{ store.name }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
