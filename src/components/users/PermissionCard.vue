<template>
  <div class="group relative bg-white dark:bg-slate-800/50 rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 hover:border-primary/40 dark:hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <!-- Indicateur actif -->
    <div v-if="hasActivePermissions" class="absolute -top-1.5 -right-1.5 h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>

    <div class="flex items-center gap-3 mb-4">
      <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
        <component :is="iconComponent" class="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors duration-300">{{ title }}</h4>
    </div>

    <div class="space-y-3">
      <div
        v-for="permission in permissions"
        :key="permission.id"
        class="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
      >
        <Label
          :for="permission.id"
          class="text-sm cursor-pointer flex-1 text-slate-600 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-slate-100 transition-colors font-medium"
        >
          {{ permission.label }}
        </Label>
        <Switch
          :id="permission.id"
          :model-value="permission.checked"
          @update:model-value="(value) => handleUpdate(permission.id, value)"
          class="data-[state=checked]:bg-primary data-[state=checked]:shadow-md data-[state=checked]:shadow-primary/20"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Users,
  Package,
  Folder,
  Wrench,
  Warehouse,
  ShoppingCart,
  UserCheck,
  Truck,
  DollarSign,
  CreditCard,
  FileText,
  BarChart
} from 'lucide-vue-next'

interface Permission {
  id: string
  label: string
  checked: boolean
}

interface Props {
  title: string
  icon: string
  permissions: Permission[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', permissionId: string, value: boolean): void
}>()

// Map des icônes
const iconMap: Record<string, any> = {
  users: Users,
  package: Package,
  folder: Folder,
  wrench: Wrench,
  warehouse: Warehouse,
  'shopping-cart': ShoppingCart,
  'user-check': UserCheck,
  truck: Truck,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  'file-text': FileText,
  'bar-chart': BarChart
}

const iconComponent = computed(() => iconMap[props.icon] || Package)

// Vérifier si au moins une permission est active
const hasActivePermissions = computed(() =>
  props.permissions.some(p => p.checked)
)

const handleUpdate = (permissionId: string, value: boolean) => {
  emit('update', permissionId, value)
}
</script>
