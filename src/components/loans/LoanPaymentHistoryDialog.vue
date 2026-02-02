<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loansApi } from '@/services/api/loans.api'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Loan } from '@/types/loans'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt, Calendar, DollarSign, CreditCard, FileText } from 'lucide-vue-next'

interface Props {
  loan: Loan
}

interface LoanPayment {
  id: number
  payment_number: string
  payment_date: string
  amount: number
  payment_method: string
  payment_method_display: string
  reference?: string
  created_by_name: string
  created_at: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const payments = ref<LoanPayment[]>([])

const loadPayments = async () => {
  loading.value = true
  try {
    const response = await loansApi.getPaymentHistory(props.loan.id)
    payments.value = response.data
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return '💵'
    case 'check':
      return '📝'
    case 'bank_transfer':
      return '🏦'
    case 'mobile_money':
      return '📱'
    default:
      return '💳'
  }
}

const totalPaid = computed(() => {
  return payments.value.reduce((sum, payment) => sum + Number(payment.amount), 0)
})

onMounted(() => {
  loadPayments()
})
</script>

<template>
  <Dialog :open="true" @update:open="emit('close')">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Receipt class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <DialogTitle class="text-xl font-semibold">
              Historique des paiements
            </DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground">
              Emprunt {{ loan.loan_number }} - {{ loan.lender_name }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Loan Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div class="flex flex-col gap-1">
          <p class="text-xs text-muted-foreground">Montant total (principal + intérêts)</p>
          <p class="text-lg font-semibold">{{ formatCurrency(loan.total_amount) }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-muted-foreground">Total payé</p>
          <p class="text-lg font-semibold text-green-600">{{ formatCurrency(loan.paid_amount) }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-muted-foreground">Solde restant</p>
          <p class="text-lg font-semibold text-orange-600">{{ formatCurrency(loan.balance_due) }}</p>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="flex-1 overflow-auto">
        <div v-if="loading" class="space-y-3 p-4">
          <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>

        <div v-else-if="payments.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Aucun paiement enregistré</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[140px]">N° Paiement</TableHead>
              <TableHead>Date</TableHead>
              <TableHead class="text-right">Montant</TableHead>
              <TableHead>Mode de paiement</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Créé par</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="payment in payments" :key="payment.id">
              <TableCell class="font-mono text-sm">
                {{ payment.payment_number }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-muted-foreground" />
                  <span>{{ formatDate(payment.payment_date) }}</span>
                </div>
              </TableCell>
              <TableCell class="text-right font-semibold text-green-600">
                {{ formatCurrency(payment.amount) }}
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="gap-1">
                  <span>{{ getPaymentMethodIcon(payment.payment_method) }}</span>
                  <span>{{ payment.payment_method_display }}</span>
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ payment.reference || '-' }}
              </TableCell>
              <TableCell class="text-sm">
                {{ payment.created_by_name }}
              </TableCell>
            </TableRow>

            <!-- Total Row -->
            <TableRow class="bg-muted/50 font-semibold">
              <TableCell colspan="2" class="text-right">Total des paiements</TableCell>
              <TableCell class="text-right text-green-600">
                {{ formatCurrency(totalPaid) }}
              </TableCell>
              <TableCell colspan="3"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
</template>
