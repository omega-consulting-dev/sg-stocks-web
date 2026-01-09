<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { FileText, CreditCard } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import Axios from '@/services/axios.service'
import type { SupplierDebt } from '@/stores/fournisseurs'

interface DebtPurchaseOrder {
  id: number
  order_number: string
  order_date: string
  delivery_date: string | null
  due_date: string | null
  total_amount: number
  paid_amount: number
  balance_due: number
  status: string
}

const props = defineProps<{
  open: boolean
  supplier: SupplierDebt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'pay-order': [order: DebtPurchaseOrder]
}>()

const debts = ref<DebtPurchaseOrder[]>([])
const loading = ref(false)

// Charger les commandes avec dette quand le dialog s'ouvre
watch(() => props.open, async (newValue) => {
  if (newValue && props.supplier) {
    await fetchSupplierDebts()
  }
})

const fetchSupplierDebts = async () => {
  if (!props.supplier) return

  loading.value = true
  try {
    const response = await Axios.get(`/suppliers/suppliers/${props.supplier.id}/purchase-orders-with-debt/`)

    debts.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des dettes:', error)
    debts.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
}

const handleClose = () => {
  emit('update:open', false)
}

const totalDebts = computed(() => {
  return debts.value.reduce((sum, debt) => sum + debt.balance_due, 0)
})
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-5xl max-h-[85vh] p-0 gap-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:opacity-100">
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileText class="w-6 h-6 text-white" />
          </div>
          <div>
            <DialogTitle class="text-xl font-bold text-white">
              Dettes Fournisseur
            </DialogTitle>
            <DialogDescription class="text-white/80 text-sm" v-if="supplier">
              {{ supplier.name }} - Code: {{ supplier.supplier_code }}
            </DialogDescription>
            <DialogDescription class="text-white/80 text-sm" v-else>
              Liste des commandes impayées
            </DialogDescription>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto">
        <div v-if="loading" class="space-y-2">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="debts.length === 0" class="text-center py-8">
          <p class="text-muted-foreground">Aucune dette en cours pour ce fournisseur</p>
        </div>

        <div v-else>
          <div class="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-center">N° Commande</TableHead>
                  <TableHead class="text-center">Date commande</TableHead>
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
                    {{ debt.order_number }}
                  </TableCell>
                  <TableCell class="text-center">
                    {{ formatDate(debt.order_date) }}
                  </TableCell>
                  <TableCell class="text-center">
                    {{ formatDate(debt.due_date) }}
                  </TableCell>
                  <TableCell class="text-center">
                    {{ formatMontant(debt.total_amount) }}
                  </TableCell>
                  <TableCell class="text-center text-green-600">
                    {{ formatMontant(debt.paid_amount) }}
                  </TableCell>
                  <TableCell class="text-center font-semibold text-red-600">
                    {{ formatMontant(debt.balance_due) }}
                  </TableCell>
                  <TableCell class="text-center">
                    <Button
                      @click="emit('pay-order', debt)"
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

          <!-- Total -->
          <div class="mt-4 flex justify-end">
            <div class="bg-gray-50 rounded-lg px-6 py-3 border-2 border-gray-200">
              <div class="text-sm text-gray-600">Total des dettes</div>
              <div class="text-2xl font-bold text-red-600">
                {{ formatMontant(totalDebts) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
