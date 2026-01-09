<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] p-6">
    <div class="text-center max-w-md">
      <div class="mb-6">
        <ShieldAlert class="w-20 h-20 mx-auto text-red-500" />
      </div>

      <h2 class="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
        Accès refusé
      </h2>

      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
      </p>

      <div v-if="requiredPermissions && requiredPermissions.length > 0" class="mb-6">
        <p class="text-sm text-gray-500 dark:text-gray-500 mb-2">
          Permissions requises :
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <Badge
            v-for="permission in requiredPermissions"
            :key="permission"
            variant="outline"
            class="text-xs"
          >
            {{ formatPermission(permission) }}
          </Badge>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <Button @click="goBack" variant="outline">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Button @click="goHome">
          <Home class="w-4 h-4 mr-2" />
          Tableau de bord
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldAlert, ArrowLeft, Home } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'vue-router'

interface Props {
  requiredPermissions?: string[]
}

const props = defineProps<Props>()
const router = useRouter()

const formatPermission = (permission: string): string => {
  // Convertir can_manage_products en "Gérer Produits"
  return permission
    .replace('can_', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push({ name: 'home' })
}
</script>
