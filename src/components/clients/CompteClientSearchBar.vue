<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Upload, FileText, Sheet, Users } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const emit = defineEmits<{
  search: [value: string]
  exportPdf: []
  exportExcel: []
  compteClient: []
}>()

const searchQuery = ref('')
const isSearchOpen = ref(false)

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

const openSearch = () => {
  isSearchOpen.value = true
  setTimeout(() => {
    const input = document.querySelector('#compteClientSearchInput') as HTMLInputElement
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
      <h1 class="text-2xl sm:text-3xl font-bold text-primary">Client</h1>
      <p class="opacity-60 text-xs sm:text-sm">Liste des clients ajouter</p>
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
          id="compteClientSearchInput"
          v-model="searchQuery"
          placeholder="recherche"
          :class="{ 'pl-9': isSearchOpen }"
          @focusout="handleFocusOut"
          @focusin="openSearch"
        />
      </div>

      <!-- Bouton Exporter -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="px-2 sm:px-4">
            <Upload />
            <span class="hidden sm:inline">Exporter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="rounded-lg" align="end">
          <DropdownMenuItem @click="emit('exportPdf')">
            <FileText />
            document pdf
          </DropdownMenuItem>
          <DropdownMenuItem @click="emit('exportExcel')">
            <Sheet />
            document excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bouton Compte client -->
      <Button @click="emit('compteClient')" class="px-2 sm:px-4 bg-[#0D47A1] hover:bg-[#0D47A1]/90">
        <Users />
        <span class="hidden sm:inline">compte client</span>
      </Button>
    </div>
  </header>
</template>
