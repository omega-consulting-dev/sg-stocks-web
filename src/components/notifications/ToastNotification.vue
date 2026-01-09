<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.priority}`, { 'toast-stock-rupture': toast.type === 'stock_rupture' }]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <component :is="getIcon(toast.type)" :class="['icon', `icon-${toast.priority}`]" />
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <X :size="16" />
          </button>
        </div>
        <!-- Barre de progression uniquement pour les notifications auto-dismiss -->
        <div v-if="toast.duration > 0" class="toast-progress" :style="{ animationDuration: `${toast.duration}ms` }"></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertTriangle,
  PackageX,
  Package,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  DollarSign,
  FileText,
  CheckCheck,
  X
} from 'lucide-vue-next'

interface ToastNotification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  duration: number
}

const toasts = ref<ToastNotification[]>([])

const getIcon = (type: string) => {
  const icons: Record<string, any> = {
    stock_rupture: PackageX,
    stock_low: Package,
    debt_due: Clock,
    transfer_pending: ArrowRightLeft,
    transfer_validated: CheckCircle,
    payment_received: DollarSign,
    payment_due: AlertTriangle,
    invoice_created: FileText,
    invoice_paid: CheckCheck
  }
  return icons[type] || AlertTriangle
}

const addToast = (notification: Omit<ToastNotification, 'id' | 'duration'>) => {
  const id = `${Date.now()}-${Math.random()}`

  // Déterminer si c'est une notification de stock (persistante) ou autre (auto-dismiss)
  const isStockNotification = notification.type === 'stock_rupture' || notification.type === 'stock_low'

  // Durée basée sur le type et la priorité
  let duration = 0 // Par défaut, persistant

  if (!isStockNotification) {
    // Pour les autres notifications, durée basée sur la priorité
    const durationMap: Record<string, number> = {
      urgent: 8000,    // 8 secondes
      high: 7000,      // 7 secondes
      medium: 6000,    // 6 secondes
      low: 5000        // 5 secondes
    }
    duration = durationMap[notification.priority] || 6000
  }

  const toast: ToastNotification = {
    ...notification,
    id,
    duration
  }

  toasts.value.push(toast)

  // Retirer automatiquement uniquement les notifications non-stock
  if (!isStockNotification && duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({
  addToast
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.toast {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: all;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.toast-stock-rupture {
  border: 2px solid #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.25);
}

.toast-stock-rupture:hover {
  box-shadow: 0 12px 32px rgba(239, 68, 68, 0.35);
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-critical {
  color: #ef4444;
}

.icon-high {
  color: #f97316;
}

.icon-medium {
  color: #3b82f6;
}

.icon-low {
  color: #10b981;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: currentColor;
  animation: progress linear forwards;
}

.toast-critical .toast-progress {
  color: #ef4444;
}

.toast-high .toast-progress {
  color: #f97316;
}

.toast-medium .toast-progress {
  color: #3b82f6;
}

.toast-low .toast-progress {
  color: #10b981;
}

@keyframes progress {
  from {
    transform: scaleX(1);
    transform-origin: left;
  }
  to {
    transform: scaleX(0);
    transform-origin: left;
  }
}

/* Animations de transition */
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 60px;
    right: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>
