<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { History, Calendar, CreditCard, User, FileText } from 'lucide-vue-next'
import type { SupplierDebt, SupplierPayment } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  open: boolean
  supplier: SupplierDebt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const fournisseursStore = useFournisseursStore()
const payments = ref<SupplierPayment[]>([])
const loading = ref(false)

// Charger l'historique quand le dialog s'ouvre
watch(
  () => props.open,
  async (newValue) => {
    if (newValue && props.supplier) {
      await loadPaymentHistory()
    }
  }
)

async function loadPaymentHistory() {
  if (!props.supplier) return

  loading.value = true
  try {
    payments.value = await fournisseursStore.fetchSupplierPayments(props.supplier.id)
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  } finally {
    loading.value = false
  }
}

// Formater la date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Formater le montant
function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Traduire la méthode de paiement
function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    'cash': 'Espèces',
    'bank_transfer': 'Virement bancaire',
    'check': 'Chèque',
    'mobile_money': 'Mobile Money',
    'other': 'Autre'
  }
  return labels[method] || method
}

const totalPaid = computed(() => {
  return payments.value.reduce((sum, payment) => sum + payment.amount, 0)
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-xl">
          <History class="h-5 w-5" />
          Historique des paiements
        </DialogTitle>
        <DialogDescription v-if="supplier">
          <div class="mt-2 space-y-1">
            <p class="font-semibold text-base text-foreground">{{ supplier.name }}</p>
            <p class="text-sm">Code: {{ supplier.supplier_code }}</p>
            <div class="flex gap-4 mt-2">
              <span class="text-sm">Total commandé: <strong class="text-foreground">{{ formatAmount(supplier.total_ordered) }}</strong></span>
              <span class="text-sm">Total payé: <strong class="text-green-600">{{ formatAmount(supplier.total_paid) }}</strong></span>
              <span class="text-sm">Solde: <strong :class="supplier.balance > 0 ? 'text-red-600' : 'text-green-600'">{{ formatAmount(supplier.balance) }}</strong></span>
            </div>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto mt-4">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="border rounded-lg p-4">
            <Skeleton class="h-4 w-1/4 mb-2" />
            <Skeleton class="h-4 w-1/2 mb-2" />
            <Skeleton class="h-4 w-1/3" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="payments.length === 0" class="text-center py-8">
          <History class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p class="text-muted-foreground">Aucun paiement enregistré</p>
        </div>

        <!-- Liste des paiements -->
        <div v-else class="space-y-3">
          <div
            v-for="payment in payments"
            :key="payment.id"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CreditCard class="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p class="font-semibold text-lg text-green-600">{{ formatAmount(payment.amount) }}</p>
                  <p class="text-xs text-muted-foreground">Paiement #{{ payment.id }}</p>
                </div>
              </div>
              <span class="text-xs text-muted-foreground">{{ formatDate(payment.created_at) }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center gap-2">
                <Calendar class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Date:</span>
                <span class="font-medium">{{ formatDate(payment.payment_date) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CreditCard class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Méthode:</span>
                <span class="font-medium">{{ getPaymentMethodLabel(payment.payment_method) }}</span>
              </div>
              <div v-if="payment.reference" class="flex items-center gap-2 col-span-2">
                <FileText class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Référence:</span>
                <span class="font-medium">{{ payment.reference }}</span>
              </div>
              <div v-if="payment.created_by_name" class="flex items-center gap-2 col-span-2">
                <User class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Par:</span>
                <span class="font-medium">{{ payment.created_by_name }}</span>
              </div>
              <div v-if="payment.notes" class="col-span-2 mt-2 p-2 bg-muted rounded text-sm">
                <p class="text-muted-foreground text-xs mb-1">Notes:</p>
                <p>{{ payment.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer avec total -->
      <div v-if="payments.length > 0" class="border-t pt-4 mt-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Total des paiements ({{ payments.length }})</span>
          <span class="text-lg font-bold text-green-600">{{ formatAmount(totalPaid) }}</span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
