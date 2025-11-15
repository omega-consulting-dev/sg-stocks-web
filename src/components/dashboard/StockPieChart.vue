<script setup lang="ts">
// Ce composant est un placeholder pour le diagramme circulaire
// À terme, il faudra intégrer une bibliothèque de graphiques
</script>

<template>
  <div class="w-[200px] h-[200px] bg-white flex flex-col items-center justify-center gap-[5px]">
    <!-- Diagramme circulaire (placeholder) -->
    <div class="w-[150px] h-[150px] rounded-full border-8 border-blue-500 flex items-center justify-center">
      <div class="w-[100px] h-[100px] rounded-full bg-white flex items-center justify-center">
        <span class="text-2xl font-bold text-gray-700">Stock</span>
      </div>
    </div>

    <!-- Légende -->
    <div class="flex gap-2 mt-2">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="text-xs text-gray-600">En stock</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-red-500"></div>
        <span class="text-xs text-gray-600">Rupture</span>
      </div>
    </div>
  </div>
</template>
