<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const emit = defineEmits<{
  filter: [{ dateFrom: string; dateTo: string }]
  clear: []
}>()

const dateFrom = ref('')
const dateTo = ref('')

const applyFilter = () => {
  if (dateFrom.value && dateTo.value) {
    emit('filter', {
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
    })
  }
}

const clearFilter = () => {
  dateFrom.value = ''
  dateTo.value = ''
  emit('clear')
}

const formatDateDisplay = () => {
  if (dateFrom.value && dateTo.value) {
    const from = new Date(dateFrom.value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const to = new Date(dateTo.value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return `${from} - ${to}`
  }
  return 'Filtrer par période'
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        class="justify-start text-left font-normal"
        :class="{ 'text-muted-foreground': !dateFrom || !dateTo }"
      >
        <Calendar class="mr-2 h-4 w-4" />
        <span>{{ formatDateDisplay() }}</span>
        <X
          v-if="dateFrom && dateTo"
          class="ml-2 h-4 w-4 cursor-pointer hover:text-destructive"
          @click.stop="clearFilter"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-4" align="start">
      <div class="space-y-4">
        <h4 class="font-medium leading-none">Filtrer par période</h4>

        <div class="grid gap-3">
          <div class="space-y-2">
            <Label for="date-from">Date de début</Label>
            <Input
              id="date-from"
              v-model="dateFrom"
              type="date"
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <Label for="date-to">Date de fin</Label>
            <Input
              id="date-to"
              v-model="dateTo"
              type="date"
              class="w-full"
              :min="dateFrom"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="clearFilter">
            Effacer
          </Button>
          <Button
            size="sm"
            @click="applyFilter"
            :disabled="!dateFrom || !dateTo"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
