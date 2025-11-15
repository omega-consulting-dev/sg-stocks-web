<script setup lang="ts">
import type { StockItem } from '@/stores/dashboard'

defineProps<{
  items: StockItem[]
}>()
</script>

<template>
  <div class="w-[1069px] h-[317px] bg-[#F0F5FE] rounded-[4.1px]">
    <!-- Titre -->
    <div class="px-[23px] py-[20px]">
      <h3 class="text-[16px] font-normal leading-[1.448] tracking-[0.01em] text-[#0A1632] border-b border-[#060606]/50" style="font-family: 'Mochiy Pop One'">
        Stock
      </h3>
    </div>

    <!-- Header du tableau -->
    <div class="mx-[4.1px] h-[49px] bg-[rgba(0,63,216,0.58)] border border-[#C8D4EA] rounded-[4.1px] flex items-center px-[49px]">
      <span class="text-[14.76px] font-normal leading-[1.182] text-white" style="font-family: ABeeZee">Code</span>
    </div>

    <!-- Lignes du tableau -->
    <div class="flex flex-col">
      <div
        v-for="item in items"
        :key="item.id"
        class="mx-[4.1px] h-[50px] bg-white border border-[#C8D4EA] rounded-[4.1px] flex items-center px-[49px]"
      >
        <span class="text-[14.76px] font-normal leading-[1.182] text-[#5E6670]" style="font-family: ABeeZee">
          {{ item.code }}
        </span>
      </div>
    </div>
  </div>
</template>
