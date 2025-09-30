<script setup lang="ts">
import Input from '@/components/ui/input/Input.vue'
import { Label } from '@/components/ui/label'
import type { LucideIcon } from 'lucide-vue-next'
import { useId, useAttrs } from 'vue'

withDefaults(defineProps<{
  label: string
  icon: LucideIcon
  type?: string
}>(), { type: 'text' })

const formId = useId()
const attrs = useAttrs()
const field = defineModel<string | number>()
</script>

<template>
  <div class="*:not-first:mt-2">
    <Label :for="`${formId}`" class="font-semibold">{{ label }}</Label>
    <div class="relative">
      <Input
        v-bind="attrs"
        v-model="field"
        :id="`${formId}`"
        :type="type"
        class="ps-9 placeholder:opacity-50 border-accent/10"
      />
      <component
        :is="icon"
        class="size-4 absolute inset-y-2 start-3 opacity-50"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
