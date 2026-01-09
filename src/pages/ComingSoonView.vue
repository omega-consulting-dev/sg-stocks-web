<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center space-y-6 max-w-md px-4">
      <div class="flex justify-center">
        <div class="rounded-full p-6 bg-gray-100 dark:bg-gray-800">
          <component :is="icon" class="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-2xl font-semibold text-foreground">{{ title }}</h3>
        <p class="text-muted-foreground">{{ message }}</p>
      </div>
      <div class="flex justify-center">
        <Button @click="goBack" variant="outline" class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Retour
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Construction, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

interface Props {
  title?: string
  message?: string
  icon?: any
}

withDefaults(defineProps<Props>(), {
  title: 'Page en construction',
  message: 'Cette fonctionnalité sera bientôt disponible.',
  icon: Construction
})

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
