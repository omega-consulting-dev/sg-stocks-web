<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Plus, Upload, FileText, Sheet } from 'lucide-vue-next'
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
  add: []
  exportPdf: []
  exportExcel: []
}>()

const searchQuery = ref('')

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-primary">Clients</h1>
      <p class="opacity-60 text-xs sm:text-sm">Liste des dettes clients</p>
    </div>

    <div class="flex flex-wrap items-center gap-2 sm:gap-4">
      <!-- Barre de recherche -->
      <div class="relative flex items-center w-48 sm:w-64">
        <Search class="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher un client..."
          class="pl-9"
        />
      </div>

      <!-- Bouton Exporter -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="gap-2">
            <Upload class="h-4 w-4" />
            <span class="hidden sm:inline">Exporter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="rounded-lg" align="end">
          <DropdownMenuItem @select="emit('exportPdf')">
            <FileText class="mr-2 h-4 w-4" />
            Document pdf
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('exportExcel')">
            <Sheet class="mr-2 h-4 w-4" />
            Document excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bouton Règlement -->
      <Button @click="emit('add')" class="gap-2">
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">Règlement</span>
      </Button>
    </div>
  </header>
</template>
