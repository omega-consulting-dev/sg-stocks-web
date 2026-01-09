<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CustomerDebt } from '@/stores/customerDebts'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, CreditCard } from 'lucide-vue-next'
import Axios from '@/services/axios.service'

interface DebtInvoice {
  id: number
  invoice_number: string
  invoice_date: string
  due_date: string | null
  total_amount: number
  paid_amount: number
  balance_due: number
  status: string
  status_display: string
}

const props = defineProps<{
  open: boolean
  customer: CustomerDebt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'pay-invoice': [invoice: DebtInvoice]
}>()

const debts = ref<DebtInvoice[]>([])
const loading = ref(false)

watch(() => props.open, async (newValue) => {
  if (newValue && props.customer) {
    await loadDebts()
  }
})

const loadDebts = async () => {
  if (!props.customer) return
  loading.value = true
  try {
    const response = await Axios.get(`/invoicing/invoices/?customer=${props.customer.id}&page_size=1000`)
    const allInvoices = response.data.results || response.data
    // Filtrer uniquement les factures avec un solde dû
    debts.value = allInvoices.filter((inv: DebtInvoice) => inv.balance_due > 0)
  } catch (error) {
    console.error('Erreur chargement dettes:', error)
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'partial':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const isOverdue = (dueDate: string | null) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const handleClose = () => {
  emit('update:open', false)
}

const totalDebts = computed(() => {
  return debts.value.reduce((sum, debt) => {
    const balanceDue = Number(debt.balance_due) || 0
    return sum + balanceDue
  }, 0)
})
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-5xl max-h-[85vh] p-0 gap-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:opacity-100">
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-5">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileText class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <DialogTitle class="text-lg sm:text-xl font-bold text-white">
              Dettes Client
            </DialogTitle>
            <DialogDescription class="text-white/80 text-xs sm:text-sm" v-if="customer">
              {{ customer.name }} - Code: {{ customer.customer_code }}
            </DialogDescription>
            <DialogDescription class="text-white/80 text-xs sm:text-sm" v-else>
              Liste des factures impayées
            </DialogDescription>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 sm:p-6 overflow-y-auto">
        <div v-if="loading" class="space-y-2">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="debts.length === 0" class="text-center py-8">
          <p class="text-muted-foreground">Aucune dette en cours pour ce client</p>
        </div>

        <div v-else>
          <div class="rounded-lg border overflow-hidden">
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="text-center">N° Facture</TableHead>
                    <TableHead class="text-center">Date émission</TableHead>
                    <TableHead class="text-center">Date échéance</TableHead>
                    <TableHead class="text-center">Montant total</TableHead>
                    <TableHead class="text-center">Montant payé</TableHead>
                    <TableHead class="text-center">Solde dû</TableHead>
                    <TableHead class="text-center w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="debt in debts" :key="debt.id">
                    <TableCell class="text-center font-medium text-blue-600">
                      {{ debt.invoice_number }}
                    </TableCell>
                    <TableCell class="text-center">
                      {{ formatDate(debt.invoice_date) }}
                    </TableCell>
                    <TableCell class="text-center" :class="isOverdue(debt.due_date) ? 'text-red-600 font-semibold' : ''">
                      {{ formatDate(debt.due_date) }}
                    </TableCell>
                    <TableCell class="text-center">
                      {{ formatAmount(debt.total_amount) }} FCFA
                    </TableCell>
                    <TableCell class="text-center text-green-600">
                      {{ formatAmount(debt.paid_amount) }} FCFA
                    </TableCell>
                    <TableCell class="text-center font-semibold text-red-600">
                      {{ formatAmount(debt.balance_due) }} FCFA
                    </TableCell>
                    <TableCell class="text-center">
                      <Button
                        @click="emit('pay-invoice', debt)"
                        size="sm"
                        class="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard class="w-4 h-4 mr-2" />
                        Règlement
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-4 flex justify-end">
            <div class="bg-gray-50 rounded-lg px-6 py-3 border-2 border-gray-200">
              <div class="text-sm text-gray-600">Total des dettes</div>
              <div class="text-2xl font-bold text-red-600">
                {{ formatAmount(totalDebts) }} FCFA
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
