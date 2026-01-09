<template>
  <div class="inline-flex items-center gap-1.5">
    <span
      :class="[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all',
        variantClasses[variant],
        sizeClasses[size]
      ]"
    >
      <component v-if="icon" :is="icon" :class="['mr-1', iconSizeClasses[size]]" />
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'

interface Props {
  label?: string
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'destructive'
    | 'info'
    | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  primary: 'bg-primary/10 text-primary dark:bg-primary/20',
  secondary: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  outline:
    'border border-current bg-transparent text-foreground dark:border-current dark:text-foreground'
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1'
}

const iconSizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5'
}
</script>
