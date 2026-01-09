<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Calendar, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const emit = defineEmits<{
  search: [value: string]
  dateRangeChange: [startDate: Date | undefined, endDate: Date | undefined]
}>()

const searchQuery = ref('')
const startDateInput = ref('')
const endDateInput = ref('')

function handleSearch() {
  emit('search', searchQuery.value)
}

function handleDateChange() {
  const start = startDateInput.value ? new Date(startDateInput.value) : undefined
  const end = endDateInput.value ? new Date(endDateInput.value) : undefined
  emit('dateRangeChange', start, end)
}

// Validation: la date "Du" ne peut pas être supérieure à la date "Au"
watch(startDateInput, (newStartDate) => {
  if (newStartDate && endDateInput.value) {
    const start = new Date(newStartDate)
    const end = new Date(endDateInput.value)

    if (start > end) {
      // Si la date de début est supérieure à la date de fin, réinitialiser la date de fin
      endDateInput.value = newStartDate
    }
  }
})

watch(endDateInput, (newEndDate) => {
  if (newEndDate && startDateInput.value) {
    const start = new Date(startDateInput.value)
    const end = new Date(newEndDate)

    if (end < start) {
      // Si la date de fin est inférieure à la date de début, ajuster la date de début
      startDateInput.value = newEndDate
    }
  }
})
</script>

<template>
  <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end">
      <!-- Recherche -->
      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Rechercher</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            v-model="searchQuery"
            placeholder="Rechercher une facture..."
            class="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Date de début -->
      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Date de début</label>
        <div class="relative">
          <Input
            v-model="startDateInput"
            type="date"
            class="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            @change="handleDateChange"
          />
          <Calendar
            class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      <!-- Date de fin -->
      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Date de fin</label>
        <div class="relative">
          <Input
            v-model="endDateInput"
            type="date"
            :min="startDateInput"
            class="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            @change="handleDateChange"
          />
          <Calendar
            class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
