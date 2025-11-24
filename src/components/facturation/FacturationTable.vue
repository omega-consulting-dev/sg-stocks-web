<script setup lang="ts">
import { FileText, Eye } from 'lucide-vue-next'
import type { Facturation } from '@/stores/facturations'

defineProps<{
  facturations: Facturation[]
}>()

const emit = defineEmits<{
  generateInvoice: [id: number]
  viewDetails: [id: number]
}>()

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre'
  ]
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function formatMontant(montant: number) {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 0 })
}
</script>

<template>
  <div
    class="bg-white rounded-[30px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] px-[38px] py-[35px]"
  >
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <!-- Header -->
        <thead>
          <tr class="border-b border-[#EEEEEE]">
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Intitulé de l'opération
            </th>
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Date de vente
            </th>
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Client
            </th>
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Quantite
            </th>
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Montant Facture
            </th>
            <th
              class="pb-4 text-left text-[14.9px] font-bold text-[#B5B7C0] font-inter tracking-[-0.01em] leading-[18.03px]"
            >
              Action
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <tr
            v-for="facturation in facturations"
            :key="facturation.id"
            class="border-b border-[#EEEEEE] last:border-0"
          >
            <td
              class="py-6 text-[14px] font-medium text-[#292D32] font-['Poppins'] tracking-[-0.01em] leading-[21px]"
            >
              {{ facturation.intitule }}
            </td>
            <td
              class="py-6 text-[14px] font-medium text-[#292D32] font-['Poppins'] tracking-[-0.01em] leading-[21px]"
            >
              {{ formatDate(facturation.dateVente) }}
            </td>
            <td
              class="py-6 text-[14px] font-medium text-[#292D32] font-['Poppins'] tracking-[-0.01em] leading-[21px]"
            >
              {{ facturation.client }}
            </td>
            <td
              class="py-6 text-[14px] font-medium text-[#292D32] font-['Poppins'] tracking-[-0.01em] leading-[21px]"
            >
              {{ facturation.quantite }}
            </td>
            <td
              class="py-6 text-[14px] font-medium text-[#292D32] font-['Poppins'] tracking-[-0.01em] leading-[21px]"
            >
              {{ formatMontant(facturation.montantFacture) }}
            </td>
            <td class="py-6">
              <div class="flex items-center gap-3">
                <!-- Générer Facture -->
                <button
                  class="w-[47px] h-[35px] bg-[#0769CF] rounded-[5px] flex items-center justify-center hover:bg-[#0769CF]/90 transition-colors"
                  @click="emit('generateInvoice', facturation.id)"
                  title="Générer la facture"
                >
                  <FileText class="w-[28px] h-[28px] text-white" />
                </button>

                <!-- Consulter -->
                <button
                  class="w-[47px] h-[35px] bg-[#0769CF] rounded-[5px] flex items-center justify-center hover:bg-[#0769CF]/90 transition-colors"
                  @click="emit('viewDetails', facturation.id)"
                  title="Consulter les détails"
                >
                  <Eye class="w-[28px] h-[28px] text-white" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="facturations.length === 0"
        class="text-center py-12 text-[#B5B7C0] text-sm font-inter"
      >
        Aucune facturation trouvée
      </div>
    </div>
  </div>
</template>
