<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Upload, FileText, Sheet } from 'lucide-vue-next'
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
  dateRangeChange: [start: Date | undefined, end: Date | undefined]
}>()

const searchQuery = ref('')
const isSearchOpen = ref(false)
const startDateStr = ref('')
const endDateStr = ref('')

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

watch([startDateStr, endDateStr], ([start, end]) => {
  const startDate = start ? new Date(start) : undefined
  const endDate = end ? new Date(end) : undefined
  emit('dateRangeChange', startDate, endDate)
})

const openSearch = () => {
  isSearchOpen.value = true
  setTimeout(() => {
    const input = document.querySelector('#encaissementSearchInput') as HTMLInputElement
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
  <header class="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
    <!-- Période + Recherche à gauche -->
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-muted-foreground">Période</span>

      <!-- Barre de recherche -->
      <div
        class="relative flex items-center gap-1 transition-all duration-500 w-11 overflow-hidden"
        :class="{ 'w-48 sm:w-56 overflow-visible': isSearchOpen }"
      >
        <Button
          variant="outline"
          size="sm"
          :class="{ 'absolute size-7 left-1 top-1/2 -translate-y-1/2 border-none': isSearchOpen }"
          @click="openSearch"
        >
          <Search class="h-4 w-4" />
        </Button>
        <Input
          id="encaissementSearchInput"
          v-model="searchQuery"
          placeholder="Rechercher..."
          class="h-9"
          :class="{ 'pl-9': isSearchOpen }"
          @focusout="handleFocusOut"
          @focusin="openSearch"
        />
      </div>
    </div>

    <!-- Dates + Exporter à droite -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <!-- Filtre Date Début -->
      <Input
        v-model="startDateStr"
        type="date"
        class="w-[140px] h-9"
      />

      <!-- Filtre Date Fin -->
      <Input
        v-model="endDateStr"
        type="date"
        class="w-[140px] h-9"
      />

      <!-- Bouton Exporter -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="px-2 sm:px-4 h-9">
            <Upload class="h-4 w-4" />
            <span class="hidden sm:inline">Exporter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="rounded-lg" align="end">
          <DropdownMenuItem @select="emit('exportPdf')">
            <FileText />
            Document pdf
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('exportExcel')">
            <Sheet />
            Document excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
