<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold">Test Transferts</h1>
    <p>Si vous voyez ce message, le routing fonctionne !</p>
    <button @click="testClick" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
      Tester le clic
    </button>
    <p v-if="clicked" class="mt-4 text-green-600">✓ Le clic fonctionne !</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clicked = ref(false)

const testClick = () => {
  clicked.value = true
}
</script>
