<template>
  <div class="flex items-center gap-2 text-sm">
    <div
      :class="[
        'h-4 w-4 rounded-full flex items-center justify-center',
        granted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
      ]"
    >
      <Check v-if="granted" class="h-3 w-3 text-green-600 dark:text-green-400" />
      <X v-else class="h-3 w-3 text-gray-400" />
    </div>
    <span :class="granted ? 'text-foreground' : 'text-muted-foreground'">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'

interface Props {
  label: string
  granted: boolean
}

defineProps<Props>()
</script>
