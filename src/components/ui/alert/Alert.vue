<template>
  <div
    :class="[
      'rounded-lg p-4 border-l-4 flex items-start gap-3',
      variantClasses[variant]
    ]"
  >
    <div class="flex-shrink-0">
      <component :is="icon" :class="['h-5 w-5', iconClasses[variant]]" />
    </div>
    <div class="flex-1">
      <h4 v-if="title" :class="['font-semibold mb-1', textClasses[variant]]">
        {{ title }}
      </h4>
      <p :class="['text-sm', textClasses[variant]]">
        <slot>{{ message }}</slot>
      </p>
    </div>
    <button
      v-if="dismissible"
      @click="$emit('dismiss')"
      :class="['flex-shrink-0 hover:opacity-70 transition-opacity', textClasses[variant]]"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X
} from 'lucide-vue-next'

interface Props {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false
})

defineEmits<{
  (e: 'dismiss'): void
}>()

const icon = computed(() => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  }
  return icons[props.variant]
})

const variantClasses = {
  info: 'bg-blue-50 border-blue-500 dark:bg-blue-950/20',
  success: 'bg-green-50 border-green-500 dark:bg-green-950/20',
  warning: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950/20',
  error: 'bg-red-50 border-red-500 dark:bg-red-950/20'
}

const iconClasses = {
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400'
}

const textClasses = {
  info: 'text-blue-900 dark:text-blue-100',
  success: 'text-green-900 dark:text-green-100',
  warning: 'text-yellow-900 dark:text-yellow-100',
  error: 'text-red-900 dark:text-red-100'
}
</script>
