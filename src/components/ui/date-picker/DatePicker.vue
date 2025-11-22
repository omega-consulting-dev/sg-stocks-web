<script setup lang="ts">
import { ref, watch } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'

interface Props {
  modelValue?: Date | string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionner une date',
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

// Format la date en dd/mm/yyyy
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Format la date pour l'input type="date" (yyyy-mm-dd)
const formatForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const displayValue = ref(props.modelValue ? formatDate(props.modelValue) : '')
const inputValue = ref(props.modelValue ? formatForInput(props.modelValue) : '')
const showDatePicker = ref(false)

// Mettre à jour l'affichage quand la valeur change
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      displayValue.value = formatDate(newValue)
      inputValue.value = formatForInput(newValue)
    }
  }
)

const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedDate = new Date(target.value)
  displayValue.value = formatDate(selectedDate)
  emit('update:modelValue', selectedDate)
  showDatePicker.value = false
}

const handleIconClick = () => {
  const inputElement = document.getElementById('date-input-hidden') as HTMLInputElement
  if (inputElement) {
    inputElement.showPicker()
  }
}
</script>

<template>
  <div class="relative">
    <!-- Input de display -->
    <Input
      :value="displayValue"
      readonly
      :placeholder="placeholder"
      class="w-[138px] h-[30px] border border-[#007ACE] rounded bg-[#FFFEFF] text-[#696060] text-sm px-3 pr-10 cursor-pointer"
      @click="handleIconClick"
    />

    <!-- Input date caché -->
    <input
      id="date-input-hidden"
      type="date"
      :value="inputValue"
      @change="handleDateChange"
      class="absolute opacity-0 pointer-events-none"
    />

    <!-- Icône calendrier -->
    <div
      @click="handleIconClick"
      class="absolute right-0 top-0 bottom-0 w-[36px] flex items-center justify-center cursor-pointer"
    >
      <CalendarIcon class="h-5 w-5 text-gray-500" />
    </div>
  </div>
</template>
