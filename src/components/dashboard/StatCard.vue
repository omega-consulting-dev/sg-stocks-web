<script setup lang="ts">
import type { StatCard } from '@/stores/dashboard'

const props = defineProps<{
  stat: StatCard
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-2">{{ stat.title }}</p>
        <h3 class="text-3xl font-bold text-gray-900 mb-3">
          {{ stat.value }}
        </h3>
        <p
          class="text-sm font-medium"
          :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'"
        >
          {{ stat.percentage }}
        </p>
      </div>

      <div
        class="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        :style="{ backgroundColor: stat.bgColor }"
      >
        <component
          :is="stat.iconComponent"
          class="w-7 h-7"
          :style="{ color: stat.iconColor }"
        />
      </div>
    </div>
  </div>
</template>
