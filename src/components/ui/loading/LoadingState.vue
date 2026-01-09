<template>
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4">
      <div class="flex justify-center">
        <div class="relative">
          <div
            class="absolute inset-0 animate-ping rounded-full bg-primary/30"
            style="animation-duration: 1.5s"
          />
          <component :is="icon" :class="['relative h-12 w-12 animate-pulse', iconColor]" />
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p v-if="message" class="text-sm text-muted-foreground">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'

interface Props {
  title?: string
  message?: string
  icon?: LucideIcon
  variant?: 'primary' | 'secondary' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Chargement...',
  variant: 'primary'
})

const icon = computed(() => props.icon || Loader2)

const iconColor = computed(() => {
  const colors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground'
  }
  return colors[props.variant]
})
</script>
