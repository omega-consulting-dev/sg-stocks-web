<script setup lang="ts">
import { ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaRoot, ScrollAreaViewport } from 'reka-ui'
import type { ScrollAreaRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import ScrollBar from './ScrollBar.vue'

const props = defineProps<ScrollAreaRootProps & { class?: string }>()
</script>

<template>
  <ScrollAreaRoot v-bind="props" :class="cn('relative overflow-hidden', props.class)">
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaScrollbar orientation="horizontal" class="flex h-2.5 touch-none select-none flex-col border-t border-t-transparent p-px transition-colors">
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
