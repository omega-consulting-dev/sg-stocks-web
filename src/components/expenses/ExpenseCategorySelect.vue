<template>
  <select :value="modelValue" @change="updateValue" class="category-select">
    <option :value="undefined">{{ placeholder }}</option>
    <option v-for="category in categories" :key="category.id" :value="category.id">
      {{ category.code }} - {{ category.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import type { ExpenseCategory } from '@/types/expenses';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    placeholder: 'Sélectionner une catégorie',
    disabled: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined];
}>();

const expensesStore = useExpensesStore();

const categories = computed(() => expensesStore.categories);

function updateValue(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value ? parseInt(target.value) : undefined;
  emit('update:modelValue', value);
}
</script>

<style scoped>
.category-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
  width: 100%;
}

.category-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.category-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
