<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Customer {
  id: number
  name: string
}

const props = defineProps<{
  customers: Customer[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'create-customer': []
}>()

const open = ref(false)
const searchQuery = ref('')

const selectedCustomer = computed(() => {
  return props.customers.find((customer) => String(customer.id) === props.modelValue)
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return props.customers

  const query = searchQuery.value.toLowerCase()
  return props.customers.filter(customer =>
    customer.name.toLowerCase().includes(query)
  )
})

const selectCustomer = (customerId: string) => {
  emit('update:modelValue', customerId)
  open.value = false
  searchQuery.value = ''
}

const createNewCustomer = () => {
  open.value = false
  searchQuery.value = ''
  emit('create-customer')
}

const clearSelection = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="relative">
    <Popover :open="open" @update:open="(value) => open = value">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-full justify-between text-left font-normal"
        >
          <span class="truncate">
            {{ selectedCustomer ? selectedCustomer.name : "Sélectionner un client..." }}
          </span>
          <Search class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[400px] p-0" align="start">
        <div class="flex flex-col">
          <!-- Search input -->
          <div class="p-3 border-b">
            <div class="relative">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Rechercher un client..."
                class="pl-8"
              />
            </div>
          </div>

          <!-- Customer list -->
          <div class="max-h-[300px] overflow-y-auto">
            <div v-if="filteredCustomers.length === 0" class="flex flex-col items-center gap-2 py-6">
              <p class="text-sm text-muted-foreground">Aucun client trouvé.</p>
              <Button size="sm" @click="createNewCustomer">
                <Plus class="mr-2 h-4 w-4" />
                Créer un nouveau client
              </Button>
            </div>

            <div v-else>
              <button
                v-for="customer in filteredCustomers"
                :key="customer.id"
                @click="selectCustomer(String(customer.id))"
                class="w-full text-left px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                :class="modelValue === String(customer.id) ? 'bg-accent' : ''"
              >
                <div class="flex items-center justify-between">
                  <span>{{ customer.name }}</span>
                  <span v-if="modelValue === String(customer.id)" class="text-primary">✓</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Create button -->
          <div class="border-t p-2">
            <Button variant="outline" size="sm" class="w-full" @click="createNewCustomer">
              <Plus class="mr-2 h-4 w-4" />
              Créer un nouveau client
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Clear button -->
    <Button
      v-if="selectedCustomer"
      variant="ghost"
      size="sm"
      class="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
      @click.stop="clearSelection"
    >
      <X class="h-3 w-3" />
    </Button>
  </div>
</template>
