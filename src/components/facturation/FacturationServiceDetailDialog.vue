<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InvoiceServices } from '@/services/invoices.service'
import { FileText, Calendar, User, CreditCard, DollarSign } from 'lucide-vue-next'

const props = defineProps<{ open: boolean; factureId: number|null }>()
const emit = defineEmits(['update:open'])

const facture = ref<any>(null)
const loading = ref(false)

watch(() => props.open, async (val) => {
  if (val && props.factureId) {
    loading.value = true
    try {
      const res = await InvoiceServices.getInvoice(props.factureId)
      facture.value = res.data
    } finally {
      loading.value = false
    }
  }
})

const handleClose = () => emit('update:open', false)

const formatMoney = (v:number) => v?.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' XOF'
const formatDate = (d:string) => {
  const date = new Date(d)
  const day = date.getDate()
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const getStatusBadgeClass = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'paid': 'bg-green-100 text-green-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'unpaid': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  }
  return statusMap[status] || 'bg-blue-100 text-blue-800'
}
</script>
<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="border-b border-[#EEEEEE] pb-4">
        <DialogTitle class="text-[24px] font-bold text-[#003FD8] font-inter">
          Détail Facture Service
        </DialogTitle>
      </DialogHeader>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0769CF]"></div>
          <p class="text-[14px] text-[#85878D] font-inter">Chargement des détails...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="facture" class="space-y-6 py-4">
        <!-- Header Card with Invoice Info -->
        <div class="bg-gradient-to-br from-[#0769CF] to-[#003FD8] rounded-[20px] p-6 text-white">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="bg-white/20 rounded-full p-2">
                  <FileText class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-xs text-white/70 font-inter">Numéro de facture</div>
                  <div class="text-[18px] font-bold font-inter">{{ facture.invoice_number }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="bg-white/20 rounded-full p-2">
                  <Calendar class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-xs text-white/70 font-inter">Date de facturation</div>
                  <div class="text-[16px] font-medium font-inter">{{ formatDate(facture.invoice_date) }}</div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="bg-white/20 rounded-full p-2">
                  <User class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-xs text-white/70 font-inter">Client</div>
                  <div class="text-[16px] font-medium font-inter">{{ facture.customer_name }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="bg-white/20 rounded-full p-2">
                  <CreditCard class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-xs text-white/70 font-inter">Statut</div>
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1"
                    :class="getStatusBadgeClass(facture.status)"
                  >
                    {{ facture.status_display }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-[15px] shadow-[0px_4px_20px_0px_rgba(226,236,249,0.5)] p-5 border border-[#EEEEEE]">
            <div class="flex items-center gap-3">
              <div class="bg-blue-50 rounded-full p-3">
                <DollarSign class="w-6 h-6 text-[#0769CF]" />
              </div>
              <div>
                <div class="text-xs text-[#B5B7C0] font-inter">Montant total</div>
                <div class="text-[18px] font-bold text-[#292D32] font-inter">{{ formatMoney(facture.total_amount) }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[15px] shadow-[0px_4px_20px_0px_rgba(226,236,249,0.5)] p-5 border border-[#EEEEEE]">
            <div class="flex items-center gap-3">
              <div class="bg-green-50 rounded-full p-3">
                <DollarSign class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div class="text-xs text-[#B5B7C0] font-inter">Montant payé</div>
                <div class="text-[18px] font-bold text-green-600 font-inter">{{ formatMoney(facture.paid_amount) }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[15px] shadow-[0px_4px_20px_0px_rgba(226,236,249,0.5)] p-5 border border-[#EEEEEE]">
            <div class="flex items-center gap-3">
              <div class="bg-orange-50 rounded-full p-3">
                <DollarSign class="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div class="text-xs text-[#B5B7C0] font-inter">Solde dû</div>
                <div class="text-[18px] font-bold text-orange-600 font-inter">{{ formatMoney(facture.balance_due) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Services Table -->
        <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6 border border-[#EEEEEE]">
          <h3 class="text-[18px] font-bold text-[#292D32] font-inter mb-4">Services facturés</h3>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-[#0769CF] to-[#003FD8] text-white">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold font-inter rounded-tl-lg">Service</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold font-inter">Quantité</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold font-inter">Prix Unit. (XOF)</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold font-inter">TVA (%)</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold font-inter">Remise (%)</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold font-inter rounded-tr-lg">Total (XOF)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(line, idx) in facture.lines"
                  :key="idx"
                  class="border-b border-[#EEEEEE] hover:bg-[#F5F6FA] transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-[#292D32] font-inter">{{ line.service_name || line.description }}</td>
                  <td class="px-4 py-3 text-center text-sm text-[#85878D] font-inter">{{ line.quantity }}</td>
                  <td class="px-4 py-3 text-right text-sm text-[#85878D] font-inter">{{ formatMoney(line.unit_price) }}</td>
                  <td class="px-4 py-3 text-right text-sm text-[#85878D] font-inter">{{ line.tax_rate }}%</td>
                  <td class="px-4 py-3 text-right text-sm text-[#85878D] font-inter">{{ line.discount_percentage }}%</td>
                  <td class="px-4 py-3 text-right text-sm font-semibold text-[#0769CF] font-inter">
                    {{ formatMoney(line.line_total) }}
                  </td>
                </tr>
                <tr v-if="!facture.lines || facture.lines.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-sm text-[#B5B7C0] font-inter">
                    Aucun service trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals Section -->
          <div class="mt-6 border-t border-[#EEEEEE] pt-4">
            <div class="flex flex-col gap-2 max-w-md ml-auto">
              <div class="flex justify-between text-sm font-inter">
                <span class="text-[#85878D]">Sous-total HT:</span>
                <span class="font-semibold text-[#292D32]">{{ formatMoney(facture.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm font-inter">
                <span class="text-[#85878D]">TVA:</span>
                <span class="font-semibold text-[#292D32]">{{ formatMoney(facture.tax_amount) }}</span>
              </div>
              <div v-if="facture.discount_amount > 0" class="flex justify-between text-sm font-inter">
                <span class="text-[#85878D]">Remise:</span>
                <span class="font-semibold text-red-600">-{{ formatMoney(facture.discount_amount) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold font-inter pt-2 border-t border-[#EEEEEE]">
                <span class="text-[#003FD8]">Total TTC:</span>
                <span class="text-[#0769CF]">{{ formatMoney(facture.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="facture.notes" class="bg-[#F5F6FA] rounded-[15px] p-5 border border-[#EEEEEE]">
          <h4 class="text-[14px] font-semibold text-[#292D32] font-inter mb-2">Notes:</h4>
          <p class="text-[13px] text-[#85878D] font-inter whitespace-pre-line">{{ facture.notes }}</p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
        <Button
          variant="outline"
          @click="handleClose"
          class="px-6 py-2 border-[#0769CF] text-[#0769CF] hover:bg-[#0769CF]/5"
        >
          Fermer
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
