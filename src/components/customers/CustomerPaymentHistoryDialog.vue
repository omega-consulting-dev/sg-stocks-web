<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CustomerDebt, CustomerPayment } from '@/stores/customerDebts'
import { useCustomerDebtsStore } from '@/stores/customerDebts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  open: boolean
  customer: CustomerDebt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const store = useCustomerDebtsStore()
const payments = ref<CustomerPayment[]>([])
const loading = ref(false)

watch(() => props.open, async (newValue) => {
  if (newValue && props.customer) {
    await loadPayments()
  }
})

const loadPayments = async () => {
  if (!props.customer) return
  loading.value = true
  try {
    payments.value = await store.fetchCustomerPayments(props.customer.id)
  } catch (error) {
    console.error('Erreur chargement historique:', error)
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'default'  // Green
    case 'failed':
      return 'destructive'  // Red
    case 'pending':
      return 'secondary'  // Gray
    default:
      return 'outline'
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Historique des paiements</DialogTitle>
        <DialogDescription v-if="customer">
          <div class="mt-2 space-y-1">
            <p class="font-semibold text-base text-foreground">{{ customer.name }}</p>
            <p class="text-sm">Code: {{ customer.customer_code }}</p>
            <div class="flex gap-4 text-sm mt-2">
              <span>Total facturé: <strong class="text-foreground">{{ formatAmount(customer.total_invoiced) }}</strong></span>
              <span>Total payé: <strong class="text-green-600">{{ formatAmount(customer.total_paid) }}</strong></span>
              <span>Solde: <strong class="text-red-600">{{ formatAmount(customer.balance) }}</strong></span>
            </div>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div class="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° Paiement</TableHead>
              <TableHead>N° Facture</TableHead>
              <TableHead class="text-right">Montant</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Référence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="7" class="text-center">Chargement...</TableCell>
            </TableRow>
            <TableRow v-else-if="payments.length === 0">
              <TableCell colspan="7" class="text-center text-muted-foreground">
                Aucun paiement enregistré
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="payment in payments" :key="payment.id">
              <TableCell>{{ formatDate(payment.payment_date) }}</TableCell>
              <TableCell class="font-mono text-sm">{{ payment.payment_number }}</TableCell>
              <TableCell class="font-mono text-sm">{{ payment.invoice_number }}</TableCell>
              <TableCell class="text-right font-semibold text-green-600">{{ formatAmount(payment.amount) }}</TableCell>
              <TableCell>{{ payment.payment_method_display }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(payment.status || 'success')">
                  {{ payment.status_display || payment.status || 'Réussi' }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ payment.reference || '-' }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
</template>
