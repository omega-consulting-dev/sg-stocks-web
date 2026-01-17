<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Plus, FileText, Sheet } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePermissions } from '@/composables/usePermissions'

const { permissions } = usePermissions()

const emit = defineEmits<{
  search: [value: string]
  add: []
  exportExcel: []
}>()

const searchQuery = ref('')
const isSearchOpen = ref(false)

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

const openSearch = () => {
  isSearchOpen.value = true
  setTimeout(() => {
    const input = document.querySelector('#customerSearchInput') as HTMLInputElement
    input?.focus()
  }, 100)
}

const handleFocusOut = () => {
  if (searchQuery.value.length === 0) {
    isSearchOpen.value = false
  }
}
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-primary">Clients</h1>
      <p class="opacity-60 text-xs sm:text-sm">Liste des clients</p>
    </div>

    <div class="flex flex-wrap items-center gap-2 sm:gap-4">
      <!-- Barre de recherche -->
      <div
        class="relative flex items-center gap-1 transition-all duration-500 w-11 overflow-hidden"
        :class="{ 'w-48 sm:w-64 overflow-visible': isSearchOpen }"
      >
        <Button
          variant="outline"
          :class="{ 'absolute size-7 left-1 top-1/2 -translate-y-1/2 border-none': isSearchOpen }"
          @click="openSearch"
        >
          <Search />
        </Button>
        <Input
          id="customerSearchInput"
          v-model="searchQuery"
          placeholder="Rechercher un client..."
          :class="{ 'pl-9': isSearchOpen }"
          @focusout="handleFocusOut"
          @focusin="openSearch"
        />
      </div>

      <!-- Bouton Exporter Excel -->
      <Button v-if="permissions.canExportData" variant="outline" class="px-2 sm:px-4" @click="emit('exportExcel')">
        <Sheet />
        <span class="hidden sm:inline">Exporter Excel</span>
      </Button>

      <!-- Bouton Nouveau Client -->
      <Button v-if="permissions.canManageCustomers" @click="emit('add')" class="px-2 sm:px-4">
        <Plus />
        <span class="hidden sm:inline">Nouveau Client</span>
      </Button>
    </div>
  </header>
</template>
