<template>
  <div class="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-lg shadow-lg p-4 flex items-start gap-3',
          'backdrop-blur-sm border animate-slide-in',
          toastClasses[toast.type]
        ]"
      >
        <div class="flex-shrink-0 mt-0.5">
          <component :is="toastIcons[toast.type]" :class="iconClasses[toast.type]" :size="20" />
        </div>

        <div class="flex-1 min-w-0">
          <p v-if="toast.title" class="font-semibold text-sm mb-1">{{ toast.title }}</p>
          <p class="text-sm leading-relaxed">{{ toast.message }}</p>
        </div>

        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-orange-50 border-orange-200 text-orange-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900'
}

const iconClasses = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-orange-600',
  info: 'text-blue-600'
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
