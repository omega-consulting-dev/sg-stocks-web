<script setup lang="ts">
// Ce composant est un placeholder pour le graphique
// À terme, il faudra intégrer une bibliothèque comme Chart.js ou Recharts
</script>

<template>
  <div class="w-[602px] h-[349px] bg-[#F4F9FF] rounded-[14px] p-[18px] flex flex-col gap-[10px]">
    <!-- Header du graphique -->
    <div class="flex items-center justify-between">
      <h3 class="text-[16px] font-semibold text-[#0A1632]">Graphique des ventes</h3>
      <div class="flex gap-2">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-xs text-gray-600">Ventes</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-xs text-gray-600">Achats</span>
        </div>
      </div>
    </div>

    <!-- Zone du graphique (placeholder) -->
    <div class="flex-1 bg-white/50 rounded-lg flex items-center justify-center border border-gray-200">
      <div class="text-center text-gray-500">
        <p class="text-sm">Graphique en cours de développement</p>
        <p class="text-xs mt-1">Bibliothèque de graphiques à intégrer</p>
      </div>
    </div>
  </div>
</template>
