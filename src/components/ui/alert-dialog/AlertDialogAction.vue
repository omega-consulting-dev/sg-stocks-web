<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { DialogClose, type DialogCloseProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogCloseProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <DialogClose
    v-bind="delegatedProps"
    :class="cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50',
      props.class
    )"
  >
    <slot />
  </DialogClose>
</template>
