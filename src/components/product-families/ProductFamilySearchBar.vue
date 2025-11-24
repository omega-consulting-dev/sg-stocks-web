<script setup lang="ts">
import { ref } from 'vue'
import { Filter, Plus, Upload, Download, FileText, Sheet } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const emit = defineEmits<{
  search: [value: string]
  add: []
  import: []
  exportPdf: []
  exportExcel: []
}>()

const searchQuery = ref('')

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleAdd = () => {
  emit('add')
}

const handleImport = () => {
  emit('import')
}

const handleExportPdf = () => {
  emit('exportPdf')
}

const handleExportExcel = () => {
  emit('exportExcel')
}
</script>

<template>
  <div class="flex items-center justify-center gap-7">
    <!-- Section Titre -->
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-3">
        <h1 class="text-[32px] font-bold leading-[1.21] text-[#003FD8]">
          Famille de produits
        </h1>
      </div>
      <p class="text-[20px] font-normal leading-[1.21] text-[#85878D]">
        Categorisation des produits
      </p>
    </div>

    <!-- Section Filtre -->
    <div class="flex items-center gap-2.5">
      <Button
        variant="outline"
        size="icon"
        class="h-[46.68px] w-[47.65px] rounded-[11.67px] border-[#E7EAE9]"
        @click="handleSearch"
      >
        <Filter class="h-5 w-5" />
      </Button>
      <span class="text-[16px] font-normal leading-[1.21] text-[#85878D]">
        Filter by designation
      </span>
    </div>

    <!-- Boutons d'action -->
    <div class="flex items-center gap-2.5 ml-auto">
      <!-- Bouton Importer -->
      <Button
        variant="outline"
        class="gap-2 rounded-[10px] border-[rgba(7,105,207,0.23)] px-[10.64px] py-[7.09px] text-[#0769CF] hover:bg-[#0769CF]/5"
        @click="handleImport"
      >
        <Upload class="h-[14.19px] w-[14.19px]" />
        <span class="text-[18.41px] font-medium leading-[1.5]">Importer</span>
      </Button>

      <!-- Bouton Exporter avec menu déroulant -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="gap-2 rounded-[10px] border-[rgba(7,105,207,0.23)] px-[10.64px] py-[7.09px] text-[#0769CF] hover:bg-[#0769CF]/5"
          >
            <Download class="h-[14.19px] w-[14.19px]" />
            <span class="text-[18.41px] font-medium leading-[1.5]">Exporter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[164px] rounded-[10px] border-[#E9E9E9] p-0"
          style="box-shadow: 0px 5px 10px 5px rgba(0, 0, 0, 0.05)"
        >
          <DropdownMenuItem
            @click="handleExportPdf"
            class="cursor-pointer flex items-center gap-2 px-[37px] py-3 text-[14.9px] font-medium text-[#3A3A3A] hover:bg-gray-50"
            style="font-family: Inter"
          >
            <FileText class="h-4 w-4" />
            document pdf
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="handleExportExcel"
            class="cursor-pointer flex items-center gap-2 px-[37px] py-3 text-[14.9px] font-medium text-[#3A3A3A] hover:bg-gray-50"
            style="font-family: Inter"
          >
            <Sheet class="h-4 w-4" />
            document excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bouton Nouveau -->
      <Button
        class="gap-2 rounded-[10px] bg-[#0769CF] px-[10.64px] py-[7.09px] text-white hover:bg-[#0558b0]"
        @click="handleAdd"
      >
        <Plus class="h-[14.19px] w-[14.19px]" />
        <span class="text-[18.41px] font-medium leading-[1.5]">Nouveau</span>
      </Button>
    </div>
  </div>
</template>
