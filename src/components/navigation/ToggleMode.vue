<script setup lang="ts">
// Composant désactivé
</script>

<template>
  <!-- Composant de basculement mode clair/sombre désactivé -->
</template>

<!--
<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode()

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LucideMoon, LucideSun } from 'lucide-vue-next'
import { computed, useId } from 'vue'

const id = useId()
const checked = computed({
  get: () => mode.value === 'dark',
  set: (value: boolean) => {
    mode.value = value ? 'dark' : 'light'
  },
})
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <Switch :id="id" v-model="checked" aria-label="Toggle switch" />

    <Label :for="id">
      <span class="sr-only">Toggle switch</span>
      <LucideSun v-if="mode == 'dark'" :size="16" aria-hidden="true" />
      <LucideMoon v-else :size="16" aria-hidden="true" />
    </Label>
  </div>
</template>
-->
