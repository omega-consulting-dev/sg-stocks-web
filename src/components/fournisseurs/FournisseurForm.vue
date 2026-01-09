<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { User, Phone, Mail, MapPin, Building2, Star, CreditCard, FileText } from 'lucide-vue-next'
import type { Supplier, SupplierDetail } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  open: boolean
  fournisseur?: Supplier | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const store = useFournisseursStore()
const fournisseurDetail = ref<SupplierDetail | null>(null)
const loadingDetail = ref(false)

// Computed pour afficher le nom
const displayName = computed(() => {
  if (!fournisseurDetail.value) return ''
  return fournisseurDetail.value.contact_person || fournisseurDetail.value.name || '-'
})

// Charger les détails quand on ouvre le dialog
watch(() => props.open, async (newValue) => {
  if (newValue && props.fournisseur) {
    loadingDetail.value = true
    try {
      fournisseurDetail.value = await store.fetchFournisseurById(props.fournisseur.id)
    } catch (e) {
      console.error('Erreur lors du chargement des détails:', e)
    } finally {
      loadingDetail.value = false
    }
  } else {
    fournisseurDetail.value = null
  }
})

const handleClose = () => {
  emit('update:open', false)
}

// Formatage de la date
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Formatage du solde
const formatMontant = (montant: number | null | undefined) => {
  if (montant === null || montant === undefined) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
}

// Afficher les étoiles de rating
const getRatingStars = (rating: number | null) => {
  if (!rating) return '-'
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[600px] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="relative px-4 sm:px-[47px] pt-[27px] pb-[20px] border-b border-gray-100">
        <div class="flex items-center gap-3 sm:gap-5">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <User class="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
          </div>
          <div>
            <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
              Détails du fournisseur
            </h2>
            <p v-if="fournisseurDetail" class="text-sm text-gray-500">
              Code: {{ fournisseurDetail.supplier_code }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 sm:px-[47px] py-6">
        <!-- Loading state -->
        <template v-if="loadingDetail">
          <div class="space-y-4">
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </template>

        <!-- Detail content -->
        <template v-else-if="fournisseurDetail">
          <div class="space-y-5">
            <!-- Nom / Raison sociale -->
            <div class="flex items-start gap-3">
              <Building2 class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Nom / Raison sociale</p>
                <p class="text-[15px] font-medium text-[#292D32]">{{ fournisseurDetail.name || '-' }}</p>
                <p v-if="fournisseurDetail.contact_person" class="text-sm text-gray-600">
                  Contact: {{ fournisseurDetail.contact_person }}
                </p>
              </div>
            </div>

            <!-- Contact -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Téléphone -->
              <div class="flex items-start gap-3">
                <Phone class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                  <p class="text-[15px] font-medium text-[#292D32]">
                    {{ fournisseurDetail.phone || '-' }}
                  </p>
                  <p v-if="fournisseurDetail.alternative_phone" class="text-sm text-gray-600">
                    {{ fournisseurDetail.alternative_phone }}
                  </p>
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-start gap-3">
                <Mail class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">E-mail</p>
                  <p class="text-[15px] font-medium text-[#5932EA]">
                    {{ fournisseurDetail.email || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Adresse -->
            <div class="flex items-start gap-3">
              <MapPin class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Adresse</p>
                <p class="text-[15px] font-medium text-[#292D32]">
                  {{ fournisseurDetail.address || '-' }}
                </p>
                <p v-if="fournisseurDetail.city || fournisseurDetail.postal_code" class="text-sm text-gray-600">
                  {{ [fournisseurDetail.postal_code, fournisseurDetail.city, fournisseurDetail.country].filter(Boolean).join(', ') }}
                </p>
              </div>
            </div>

            <!-- Informations financières -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <!-- Solde -->
              <div class="flex items-start gap-3">
                <CreditCard class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Solde</p>
                  <p class="text-[15px] font-bold" :class="fournisseurDetail.balance > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ formatMontant(fournisseurDetail.balance) }}
                  </p>
                </div>
              </div>

              <!-- Évaluation -->
              <div class="flex items-start gap-3">
                <Star class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Évaluation</p>
                  <p class="text-[15px] font-medium text-amber-500">
                    {{ getRatingStars(fournisseurDetail.rating) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Informations complémentaires -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <!-- N° Fiscal -->
              <div class="flex items-start gap-3">
                <FileText class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">N° Fiscal</p>
                  <p class="text-[15px] font-medium text-[#292D32]">
                    {{ fournisseurDetail.tax_id || '-' }}
                  </p>
                </div>
              </div>

              <!-- Compte bancaire -->
              <div class="flex items-start gap-3">
                <CreditCard class="w-5 h-5 text-[#0769CF] mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide">Compte bancaire</p>
                  <p class="text-[15px] font-medium text-[#292D32]">
                    {{ fournisseurDetail.bank_account || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="fournisseurDetail.notes" class="pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p class="text-[14px] text-[#292D32] bg-gray-50 p-3 rounded-lg">
                {{ fournisseurDetail.notes }}
              </p>
            </div>

            <!-- Statut et dates -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  fournisseurDetail.is_active
                    ? 'bg-[#E6F9F0] text-[#16A34A]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                ]"
              >
                {{ fournisseurDetail.is_active ? 'Actif' : 'Inactif' }}
              </span>
              <span>Inscrit le {{ formatDate(fournisseurDetail.created_at) }}</span>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else>
          <div class="text-center py-8 text-gray-500">
            Aucune information disponible
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-4 sm:px-[47px] pb-6">
        <Button
          variant="outline"
          @click="handleClose"
          class="w-full h-[37px] rounded-[10px]"
        >
          Fermer
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
