<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="['text-sm [&_p]:leading-relaxed', props.class]">
    <slot />
  </div>
</template>
