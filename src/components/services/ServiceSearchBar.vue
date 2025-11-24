<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Upload, Download, FileText, Sheet, Search, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const emit = defineEmits<{
  search: [value: string]
  familyFilter: [value: string]
  add: []
  import: []
  exportPdf: []
  exportExcel: []
}>()

const searchQuery = ref('')
const selectedFamily = ref('')

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  emit('search', searchQuery.value)
}

const handleFamilyFilter = () => {
  // TODO: Ouvrir le menu de filtrage famille
  emit('familyFilter', selectedFamily.value)
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
  <div class="flex items-start justify-between gap-12">
    <!-- Colonne gauche : Titre et sous-titre -->
    <div class="flex flex-col gap-2">
      <h1 class="text-[32px] font-bold leading-[1.21] text-[#003FD8]" style="font-family: Inter">
        Services
      </h1>
      <p class="text-[20px] font-normal leading-[1.21] text-[#85878D]" style="font-family: Inter">
        listes des services
      </p>
    </div>

    <!-- Colonne droite : Boutons d'action + Barre de recherche/Filtre -->
    <div class="flex flex-col gap-6">
      <!-- Boutons d'action -->
      <div class="flex items-center gap-8">

    <!-- Bouton Importer avec menu déroulant -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              class="gap-2 rounded-[10px] border-[rgba(7,105,207,0.23)] px-[10.64px] py-[7.09px] text-[#0769CF] hover:bg-[#0769CF]/5"
            >
              <Download class="h-[14.19px] w-[14.19px]" />
              <span class="text-[18.41px] font-medium leading-[1.5]">Importer</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-[164px] rounded-[10px] border-[#EBEBEB] p-0"
            style="box-shadow: 0px 5px 10px 5px rgba(0, 0, 0, 0.05)"
          >
            <DropdownMenuItem
              @click="handleExportPdf"
              class="cursor-pointer px-[37px] py-3 text-[14.9px] font-medium text-[#3A3A3A] hover:bg-gray-50"
              style="font-family: Inter"
            >
              <div class="flex items-center gap-2">
                <FileText class="h-6 w-6" />
                <span>document pdf</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="handleExportExcel"
              class="cursor-pointer px-[37px] py-3 text-[14.9px] font-medium text-[#3A3A3A] hover:bg-gray-50"
              style="font-family: Inter"
            >
              <div class="flex items-center gap-2">
                <Sheet class="h-6 w-6" />
                <span>document excel</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Bouton Exporter -->
        <Button
          variant="outline"
          class="gap-2 rounded-[10px] border-[rgba(7,105,207,0.23)] px-[10.64px] py-[7.09px] text-[#0769CF] hover:bg-[#0769CF]/5"
          @click="handleImport"
        >
          <Upload class="h-[14.19px] w-[14.19px]" />
          <span class="text-[18.41px] font-medium leading-[1.5]">Exporter</span>
        </Button>



        <!-- Bouton Nouveau -->
        <Button
          class="gap-2 rounded-[10px] bg-[#0769CF] px-[10.64px] py-[7.09px] text-white hover:bg-[#0558b0]"
          @click="handleAdd"
        >
          <Plus class="h-[14.19px] w-[14.19px]" />
          <span class="text-[18.41px] font-medium leading-[1.5]">Nouveau</span>
        </Button>
      </div>

      <!-- Barre de recherche + Filtre (sous les boutons) -->
      <div class="flex items-center gap-6">
        <!-- Barre de recherche -->
        <div class="relative flex-1 max-w-[216px]">
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            class="h-[38px] rounded-[10px] bg-[#F9FBFF] border-0 pl-10 pr-4 text-[12px] font-normal text-[#B5B7C0] placeholder:text-[#B5B7C0]"
            style="font-family: Poppins"
            @input="handleSearch"
          />
          <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 text-[#7E7E7E]" />
        </div>

        <!-- Filtre Famille de produit -->
        <div class="relative">
          <Button
            variant="outline"
            class="h-[38px] rounded-[10px] bg-[#F9FBFF] border-0 px-4 gap-2 text-[12px] font-normal text-[#7E7E7E] hover:bg-[#F9FBFF]/80"
            style="font-family: Poppins"
            @click="handleFamilyFilter"
          >
            <span>Famille de produit</span>
            <ChevronDown class="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
