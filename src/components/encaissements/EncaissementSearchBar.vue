<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Search, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const emit = defineEmits<{
  search: [value: string]
  exportExcel: []
  dateRangeChange: [start: Date | undefined, end: Date | undefined]
}>()

const searchQuery = ref('')
const isSearchOpen = ref(false)
const startDateStr = ref('')
const endDateStr = ref('')

// Computed pour la date min du champ de fin
const minEndDate = computed(() => {
  return startDateStr.value || ''
})

watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

watch([startDateStr, endDateStr], ([start, end]) => {
  const startDate = start ? new Date(start) : undefined
  const endDate = end ? new Date(end) : undefined
  emit('dateRangeChange', startDate, endDate)
})

// Si la date de début change et devient supérieure à la date de fin, réinitialiser la date de fin
watch(startDateStr, (newStart) => {
  if (newStart && endDateStr.value && newStart > endDateStr.value) {
    endDateStr.value = ''
  }
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
  <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end">
      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Rechercher</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            v-model="searchQuery"
            placeholder="Code, référence, client..."
            class="pl-10 border-slate-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Date de début</label>
        <Input
          v-model="startDateStr"
          type="date"
          class="border-slate-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div class="flex-1 space-y-2">
        <label class="text-sm font-medium text-slate-700">Date de fin</label>
        <Input
          v-model="endDateStr"
          type="date"
          :min="minEndDate"
          class="border-slate-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div class="flex gap-2">
        <Button
          @click="emit('exportExcel')"
          class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
        >
          <Upload class="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>
    </div>
  </div>
</template>
