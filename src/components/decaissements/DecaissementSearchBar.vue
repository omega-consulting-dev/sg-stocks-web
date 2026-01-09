<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, FileDown } from 'lucide-vue-next'

const emit = defineEmits<{
  search: [filters: { start_date?: string; end_date?: string }]
  export: [filters: { start_date?: string; end_date?: string }]
}>()

const startDate = ref('')
const endDate = ref('')

const handleSearch = () => {
  emit('search', {
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
  })
}

const handleExport = () => {
  emit('export', {
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
  })
}
</script>

<template>
  <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm">
    <CardContent class="pt-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <div class="flex-1 space-y-2">
          <Label for="start-date" class="text-sm font-medium text-slate-700">Date de début</Label>
          <Input
            id="start-date"
            v-model="startDate"
            type="date"
            placeholder="Date de début"
            class="border-slate-200 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div class="flex-1 space-y-2">
          <Label for="end-date" class="text-sm font-medium text-slate-700">Date de fin</Label>
          <Input
            id="end-date"
            v-model="endDate"
            type="date"
            placeholder="Date de fin"
            :min="startDate"
            class="border-slate-200 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div class="flex gap-2">
          <Button
            @click="handleSearch"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            <Search class="mr-2 h-4 w-4" />
            Rechercher
          </Button>

          <Button
            @click="handleExport"
            variant="outline"
            class="border-2 border-green-500 text-green-600 hover:bg-green-50 shadow-md"
          >
            <FileDown class="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
