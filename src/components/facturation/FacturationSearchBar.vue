<script setup lang="ts">
import { ref } from 'vue'
import { Search, Calendar, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

defineProps<{
  onExport?: () => void
  onNew?: () => void
}>()

const emit = defineEmits<{
  search: [value: string]
  dateRangeChange: [startDate: Date | undefined, endDate: Date | undefined]
}>()

const searchQuery = ref('')
const startDateInput = ref('2025-04-01')
const endDateInput = ref('2025-04-31')

function handleSearch() {
  emit('search', searchQuery.value)
}

function handleDateChange() {
  const start = startDateInput.value ? new Date(startDateInput.value) : undefined
  const end = endDateInput.value ? new Date(endDateInput.value) : undefined
  emit('dateRangeChange', start, end)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Buttons Row -->
    <div class="flex justify-end gap-[31px]">
      <Button
        variant="outline"
        class="h-auto px-[10.64px] py-[7.09px] border-[rgba(7,105,207,0.23)] text-[#0769CF] hover:bg-[#0769CF]/5 text-[18.41px] font-medium rounded-[10px]"
        @click="onExport"
      >
        Exporter
      </Button>
      <Button
        class="gap-2 rounded-[10px] bg-[#0769CF] px-[10.64px] py-[7.09px] text-white hover:bg-[#0558b0]"
        @click="onNew"
      >
        <Plus class="h-[14.19px] w-[14.19px]" />
        <span class="text-[18.41px] font-medium leading-[1.5]">Nouveau</span>
      </Button>
    </div>

    <!-- Filters Row -->
    <div class="flex items-center gap-6">
      <!-- Period Label -->
      <div class="text-[18.76px] font-normal text-[#0E1420] font-['Palanquin_Dark']">
        Periode
      </div>

      <!-- Date Range -->
      <div class="flex items-center gap-4">
        <!-- Du Label -->
        <span class="text-[14.76px] font-normal text-[#696060]">Du</span>

        <!-- Start Date Input -->
        <div class="relative">
          <input
            v-model="startDateInput"
            type="date"
            class="w-[138px] h-[30px] border border-[#007ACE] rounded bg-[#FFFEFF] text-[#696060] text-[14.76px] px-3 pr-10"
            @change="handleDateChange"
          />
          <Calendar
            class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
          />
        </div>

        <!-- Au Label -->
        <span class="text-[14.76px] font-normal text-[#696060]">Au</span>

        <!-- End Date Input -->
        <div class="relative">
          <input
            v-model="endDateInput"
            type="date"
            class="w-[138px] h-[30px] border border-[#007ACE] rounded bg-[#FFFEFF] text-[#696060] text-[14.76px] px-3 pr-10"
            @change="handleDateChange"
          />
          <Calendar
            class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      <!-- Search Bar with Dropdown -->
      <div class="relative flex-1 max-w-[424px] ml-auto">
        <div class="absolute left-0 top-0 bottom-0 w-[18px] flex items-center justify-center">
          <div class="w-3 h-3 border-l border-t border-b border-gray-300" />
        </div>
        <div class="relative">
          <Search class="absolute left-[32px] top-1/2 -translate-y-1/2 h-5 w-5 text-[#7E7E7E]" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            class="pl-[60px] bg-[#F9FBFF] border-0 h-[38px] text-[12px] text-[#B5B7C0] placeholder:text-[#B5B7C0] rounded-[10px]"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>
  </div>
</template>
