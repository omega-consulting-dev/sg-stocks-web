<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Upload, Download, FileText, Sheet, FileDown, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const emit = defineEmits<{
  search: [value: string]
  add: []
  exportPdf: []
  exportExcel: []
  importExcel: [file: File]
  downloadTemplate: []
}>()

const searchQuery = ref('')
const isSearchOpen = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

const openSearch = () => {
  isSearchOpen.value = true
  setTimeout(() => {
    const input = document.querySelector('#compteSearchInput') as HTMLInputElement
    input?.focus()
  }, 100)
}

const handleFocusOut = () => {
  if (searchQuery.value.length === 0) {
    isSearchOpen.value = false
  }
}

// Gestion de l'import
const handleImportClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('importExcel', file)
    // Reset input pour permettre de réimporter le même fichier
    target.value = ''
  }
}
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-primary">Comptes Fournisseurs</h1>
      <p class="opacity-60 text-xs sm:text-sm">Gestion des fournisseurs</p>
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
          id="compteSearchInput"
          v-model="searchQuery"
          placeholder="Rechercher un fournisseur..."
          :class="{ 'pl-9': isSearchOpen }"
          @focusout="handleFocusOut"
          @focusin="openSearch"
        />
      </div>

      <!-- Input file caché pour l'import -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".xlsx,.xls"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Bouton Importer -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="px-2 sm:px-4">
            <Download />
            <span class="hidden sm:inline">Importer</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="rounded-lg" align="end">
          <DropdownMenuItem @select="handleImportClick" class="cursor-pointer">
            <Sheet class="mr-2 h-4 w-4" />
            Importer Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('downloadTemplate')" class="cursor-pointer">
            <FileDown class="mr-2 h-4 w-4" />
            Télécharger le modèle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bouton Exporter -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="px-2 sm:px-4">
            <Upload />
            <span class="hidden sm:inline">Exporter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="rounded-lg" align="end">
          <DropdownMenuItem @select="emit('exportPdf')" class="cursor-pointer">
            <FileText class="mr-2 h-4 w-4" />
            Document PDF
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('exportExcel')" class="cursor-pointer">
            <Sheet class="mr-2 h-4 w-4" />
            Document Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bouton Nouveau -->
      <Button class="bg-[#0769CF] hover:bg-[#0557a8] px-2 sm:px-4" @click="emit('add')">
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">Nouveau</span>
      </Button>
    </div>
  </header>
</template>
