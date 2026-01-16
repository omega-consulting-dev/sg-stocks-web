<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <h5 :class="['mb-1 font-medium leading-none tracking-tight', props.class]">
    <slot />
  </h5>
</template>
