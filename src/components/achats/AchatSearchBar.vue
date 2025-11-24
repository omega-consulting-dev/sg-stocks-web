<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DatePicker from '@/components/ui/date-picker/DatePicker.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus } from 'lucide-vue-next'

// Props & Emits
const emit = defineEmits<{
  search: [query: string]
  add: []
  periodChange: [period: string]
  dateChange: [date: Date]
}>()

const searchQuery = ref('')
const selectedPeriod = ref('mois-en-cours')
const selectedDate = ref(new Date('2025-04-01'))

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('search', target.value)
}

const handlePeriodChange = (value: string) => {
  selectedPeriod.value = value
  emit('periodChange', value)
}

const handleDateChange = (date: Date) => {
  selectedDate.value = date
  emit('dateChange', date)
}
</script>

<template>
  <div class="space-y-4">
    <!-- En-tête avec titre et bouton Nouveau -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[32px] font-bold text-[#003FD8] leading-tight">Entrée en stock</h1>
        <p class="text-[20px] text-[#85878D] mt-1">vos differents achat en stock</p>
      </div>
      <Button
          class="gap-2 rounded-[10px] bg-[#0769CF] px-[10.64px] py-[7.09px] text-white hover:bg-[#0558b0]"
          @click="emit('add')"
        >
          <Plus class="h-[14.19px] w-[14.19px]" />
          <span class="text-[18.41px] font-medium leading-[1.5]">Nouveau</span>
        </Button>
      <!-- <Button
        @click="emit('add')"
        class="bg-[#0769CF] hover:bg-[#0769CF]/90 text-white font-medium px-4 py-2 rounded-[10px] flex items-center gap-2"
      >
        <Plus class="h-4 w-4" />
        Nouveau
      </Button> -->
    </div>

    <!-- Filtres -->
    <div class="flex items-center gap-4">
      <!-- Période -->
      <div class="flex items-center gap-2">
        <span class="text-[#0E1420] text-[18.76px]">Periode</span>
        <Select v-model="selectedPeriod" @update:model-value="handlePeriodChange">
          <SelectTrigger class="w-[216px] h-[38px] bg-[#F9FBFF] border-none rounded-[10px]">
            <SelectValue placeholder="Mois en cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mois-en-cours">Mois en cours</SelectItem>
            <SelectItem value="mois-dernier">Mois dernier</SelectItem>
            <SelectItem value="trimestre">Ce trimestre</SelectItem>
            <SelectItem value="annee">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Date -->
      <div class="flex items-center gap-2">
        <DatePicker v-model="selectedDate" @update:model-value="handleDateChange" />
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Recherche -->
      <div class="relative w-[216px]">
        <Input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search"
          class="w-full h-[38px] pl-10 bg-[#F9FBFF] border-none rounded-[10px] text-[#B5B7C0] placeholder:text-[#B5B7C0]"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7E7E7E]" />
      </div>
    </div>
  </div>
</template>
