<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InvoiceServices } from '@/services'
import type { Invoice } from '@/types/invoice.types'

const props = defineProps<{
  open: boolean
  invoiceId: number|null
}>()

const emit = defineEmits(['update:open'])

const invoice = ref<Invoice|null>(null)
const loading = ref(false)

watch(() => props.open, async (val) => {
  if (val && props.invoiceId) {
    loading.value = true
    try {
      const res = await InvoiceServices.getInvoice(props.invoiceId)
      invoice.value = res.data
    } finally {
      loading.value = false
    }
  }
})

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-2xl">
      <template v-if="loading">
        <div class="py-12 text-center text-gray-500">Chargement...</div>
      </template>
      <template v-else-if="invoice">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold">Facture {{ invoice.invoice_number }}</h2>
          <Button size="sm" @click="handleClose">Fermer</Button>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-xs text-gray-400">Client</div>
            <div class="font-semibold">{{ invoice.customer_name }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Date</div>
            <div>{{ new Date(invoice.invoice_date).toLocaleDateString('fr-FR') }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Montant total</div>
            <div>{{ invoice.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-400">Statut</div>
            <div>{{ invoice.status_display }}</div>
          </div>
        </div>
        <div class="border-t pt-4">
          <div class="font-semibold mb-2">Détails produits</div>
          <ul class="text-sm space-y-1">
            <li v-for="item in invoice.items" :key="item.id">
              {{ item.product_name }} — {{ item.quantity }} x {{ item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) }}
            </li>
          </ul>
        </div>
      </template>
      <template v-else>
        <div class="py-12 text-center text-gray-400">Aucune donnée</div>
      </template>
    </DialogContent>
  </Dialog>
</template>
