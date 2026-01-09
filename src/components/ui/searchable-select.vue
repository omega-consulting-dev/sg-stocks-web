<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Search } from 'lucide-vue-next'

interface SelectItem {
  id: number
  name: string
  [key: string]: any
}

interface Props {
  modelValue: string
  items: SelectItem[]
  label: string
  placeholder?: string
  disabled?: boolean
  showAddButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher...',
  disabled: false,
  showAddButton: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'add-new': []
}>()

const searchQuery = ref('')
const isOpen = ref(false)
const selectedItem = ref<SelectItem | null>(null)
const searchInput = ref<InstanceType<typeof Input> | null>(null)

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

// Update selected item when modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedItem.value = props.items.find(item => String(item.id) === newValue) || null
  } else {
    selectedItem.value = null
  }
}, { immediate: true })

const selectItem = (item: SelectItem) => {
  selectedItem.value = item
  emit('update:modelValue', String(item.id))
  isOpen.value = false
  searchQuery.value = ''
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      searchQuery.value = ''
      // Focus the search input after the dropdown opens
      setTimeout(() => {
        const inputElement = searchInput.value?.$el as HTMLInputElement
        if (inputElement && typeof inputElement.focus === 'function') {
          inputElement.focus()
        }
      }, 50)
    }
  }
}

const handleAddNew = () => {
  isOpen.value = false
  emit('add-new')
}

// Close dropdown when clicking outside
const dropdown = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
  if (dropdown.value && !dropdown.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="form-group-vertical" ref="dropdown">
    <Label class="form-label">{{ label }} :</Label>
    <div class="relative">
      <div
        @click="toggleDropdown"
        :class="[
          'flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer transition-colors',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500',
          isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
        ]"
      >
        <span :class="selectedItem ? 'text-gray-900' : 'text-gray-400'">
          {{ selectedItem?.name || placeholder }}
        </span>
        <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden"
      >
        <!-- Search -->
        <div class="p-2 border-b border-gray-200">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="pl-8 h-8 text-sm"
              @click.stop
            />
          </div>
        </div>

        <!-- Add New Button -->
        <div v-if="showAddButton" class="p-2 border-b border-gray-200">
          <Button
            @click="handleAddNew"
            variant="outline"
            size="sm"
            class="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus class="w-4 h-4 mr-2" />
            Ajouter nouveau
          </Button>
        </div>

        <!-- Items List -->
        <div class="overflow-y-auto max-h-48">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click="selectItem(item)"
            :class="[
              'px-3 py-2 cursor-pointer transition-colors text-sm',
              selectedItem?.id === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100'
            ]"
          >
            {{ item.name }}
          </div>
          <div v-if="filteredItems.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
            Aucun résultat trouvé
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
</style>
