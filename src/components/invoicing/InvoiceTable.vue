<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '@/types/invoice.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, FileText, Mail, Trash2 } from 'lucide-vue-next'

interface Props {
  invoices: Invoice[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [invoice: Invoice]
  delete: [invoice: Invoice]
  sendEmail: [invoice: Invoice]
  exportPdf: [invoice: Invoice]
}>()

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    sent: 'default',
    paid: 'outline',
    overdue: 'destructive',
    cancelled: 'secondary'
  }
  return variants[status] || 'default'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numéro</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Point de vente</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Échéance</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Payé</TableHead>
          <TableHead>Solde</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading">
          <TableCell colspan="10" class="text-center py-8">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-else-if="invoices.length === 0">
          <TableCell colspan="10" class="text-center py-8 text-gray-500">
            Aucune facture trouvée
          </TableCell>
        </TableRow>
        <TableRow v-else v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
          <TableCell class="font-medium">{{ invoice.invoice_number }}</TableCell>
          <TableCell>{{ invoice.customer_name }}</TableCell>
          <TableCell>{{ invoice.store_name }}</TableCell>
          <TableCell>{{ formatDate(invoice.invoice_date) }}</TableCell>
          <TableCell>
            <span :class="{ 'text-red-600 font-semibold': invoice.is_overdue }">
              {{ formatDate(invoice.due_date) }}
            </span>
          </TableCell>
          <TableCell>{{ formatCurrency(invoice.total_amount) }}</TableCell>
          <TableCell>{{ formatCurrency(invoice.paid_amount) }}</TableCell>
          <TableCell>
            <span :class="{ 'text-red-600 font-semibold': invoice.balance_due > 0 }">
              {{ formatCurrency(invoice.balance_due) }}
            </span>
          </TableCell>
          <TableCell>
            <Badge :variant="getStatusVariant(invoice.status)">
              {{ invoice.status_display }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex justify-end gap-2">
              <Button
                size="icon"
                variant="ghost"
                @click="emit('view', invoice)"
                title="Voir les détails"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                @click="emit('exportPdf', invoice)"
                title="Exporter en PDF"
              >
                <FileText class="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                @click="emit('sendEmail', invoice)"
                title="Envoyer par email"
              >
                <Mail class="h-4 w-4" />
              </Button>
              <Button
                v-if="invoice.status === 'draft'"
                size="icon"
                variant="ghost"
                @click="emit('delete', invoice)"
                title="Supprimer"
                class="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
