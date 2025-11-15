<script setup lang="ts">
import { Building2, DollarSign, TrendingUp, Users } from 'lucide-vue-next'
import type { StatCard } from '@/stores/dashboard'

const props = defineProps<{
  stat: StatCard
}>()

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    building: Building2,
    money: DollarSign,
    chart: TrendingUp,
    users: Users,
  }
  return icons[iconName] || Building2
}

const gradientStyle = `linear-gradient(201deg, ${props.stat.gradientColors[0]} 0%, ${props.stat.gradientColors[1]} 100%)`
</script>

<template>
  <div class="relative w-[255px] h-[137px] bg-white border border-[#D7D7D7] rounded-[12px] p-[13px]">
    <!-- Cercle avec icône -->
    <div
      class="absolute -top-[13px] left-[13px] w-[51px] h-[51px] rounded-full flex items-center justify-center"
      :style="{ background: gradientStyle }"
    >
      <component
        :is="getIconComponent(stat.icon)"
        class="w-[28px] h-[28px]"
        :style="{ color: stat.iconColor }"
      />
    </div>

    <!-- Contenu -->
    <div class="mt-[51px]">
      <h3 class="text-[16px] font-semibold leading-[1.33] text-black text-center" style="font-family: 'Segoe UI'">
        {{ stat.title }}
      </h3>
      <p class="text-[29.73px] font-bold leading-[1.33] text-black mt-[15px]" style="font-family: 'Segoe UI'">
        {{ stat.value }}
      </p>
      <p class="text-[12px] font-semibold leading-[1.33] text-black mt-[10px]" style="font-family: 'Segoe UI'">
        {{ stat.percentage }}
      </p>
    </div>
  </div>
</template>
