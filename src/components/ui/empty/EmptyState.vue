<template>
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-6 max-w-md">
      <div class="flex justify-center">
        <div
          :class="[
            'rounded-full p-6',
            variantClasses[variant].bg
          ]"
        >
          <component
            :is="computedIcon"
            :class="['h-16 w-16', variantClasses[variant].icon]"
          />
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-semibold">{{ title }}</h3>
        <p class="text-muted-foreground">{{ message }}</p>
      </div>
      <div v-if="action" class="flex justify-center gap-2">
        <Button @click="action.onClick" :variant="action.variant || 'default'">
          <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
          {{ action.label }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, XCircle, Info, Package } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  variant?: 'error' | 'warning' | 'info' | 'empty'
  title: string
  message: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary' | 'destructive'
    icon?: LucideIcon
  }
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'empty'
})

const defaultIcons = {
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  empty: Package
}

const computedIcon = computed(() => props.icon || defaultIcons[props.variant])

const variantClasses = {
  error: {
    bg: 'bg-red-100 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400'
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/20',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  empty: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-400 dark:text-gray-500'
  }
}
</script>
