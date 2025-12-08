<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  User,
  FileText,
  DollarSign,
  Calendar,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  CreditCard as CreditCardIcon
} from 'lucide-vue-next'
import { useFournisseursStore, type SupplierDebt, type CreateSupplierPaymentDto } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  open: boolean
  supplier?: SupplierDebt | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const store = useFournisseursStore()

const formData = ref({
  supplier_id: 0,
  montant: 0,
  payment_method: 'cash' as 'cash' | 'bank_transfer' | 'check' | 'mobile_money',
  date_reglement: '',
  reference: '',
  notes: '',
  piece_jointe: null as string | null,
})

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const submitting = ref(false)

// Fournisseurs avec des dettes (balance > 0)
const suppliersWithDebts = computed(() => {
  return store.debts.filter(d => d.balance > 0)
})

// Fournisseur sélectionné
const selectedSupplier = computed(() => {
  return store.debts.find(d => d.id === formData.value.supplier_id)
})

// Modes de paiement
const paymentMethods = [
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'bank_transfer', label: 'Virement', icon: Building2 },
  { value: 'check', label: 'Chèque', icon: FileText },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone }
]

watch(() => props.open, (newValue) => {
  if (newValue) {
    // Si un fournisseur est passé en prop, le sélectionner
    // Sinon, sélectionner le premier avec une dette
    const initialSupplier = props.supplier || suppliersWithDebts.value[0]

    formData.value = {
      supplier_id: initialSupplier?.id || 0,
      montant: 0,
      payment_method: 'cash',
      date_reglement: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
      piece_jointe: null,
    }
    fileName.value = ''
  }
})

// Quand le prop supplier change
watch(() => props.supplier, (newSupplier) => {
  if (newSupplier && props.open) {
    formData.value.supplier_id = newSupplier.id
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    fileName.value = file.name
    formData.value.piece_jointe = file.name
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  fileName.value = ''
  formData.value.piece_jointe = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
}

// Calculer le pourcentage payé pour un fournisseur
const getPaymentPercentage = (supplier: SupplierDebt) => {
  if (supplier.total_ordered === 0) return 100
  return Math.round((supplier.total_paid / supplier.total_ordered) * 100)
}

// Obtenir le statut du paiement
const getPaymentStatus = (supplier: SupplierDebt) => {
  const percentage = getPaymentPercentage(supplier)
  if (percentage >= 100) return 'paid'
  if (percentage > 0) return 'partial'
  return 'unpaid'
}

// Validation du formulaire
const isValid = computed(() => {
  return formData.value.supplier_id > 0 &&
         formData.value.montant > 0 &&
         formData.value.date_reglement
})

const handleSubmit = async () => {
  if (!isValid.value) return

  submitting.value = true
  try {
    const paymentData: CreateSupplierPaymentDto = {
      supplier: formData.value.supplier_id,
      amount: formData.value.montant,
      payment_method: formData.value.payment_method,
      payment_date: formData.value.date_reglement,
      reference: formData.value.reference || undefined,
      notes: formData.value.notes || undefined
    }

    await store.createPayment(paymentData)

    emit('success')
    emit('update:open', false)
  } catch (error) {
    console.error('Erreur lors du règlement:', error)
    alert('Impossible d\'enregistrer le règlement')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[650px] p-0 gap-0 border-0 rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl">
      <!-- Header avec gradient -->
      <div class="relative bg-gradient-to-r from-[#0769CF] to-[#0891B2] px-6 py-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CreditCard class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">
              Nouveau règlement
            </h2>
            <p class="text-white/70 text-sm">Enregistrer un paiement fournisseur</p>
          </div>
        </div>
        <!-- Decorative circles -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 right-20 w-16 h-16 bg-white/5 rounded-full translate-y-1/2"></div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50">
        <!-- Fournisseur -->
        <div class="mb-5">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Building2 class="w-4 h-4 text-[#0769CF]" />
            Fournisseur
          </label>

          <!-- Message si aucun fournisseur n'a de dettes -->
          <div v-if="suppliersWithDebts.length === 0" class="p-5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-emerald-800">Aucune dette en cours</p>
                <p class="text-xs text-emerald-600 mt-1">
                  Tous les comptes fournisseurs sont soldés. Il n'y a pas de règlement à effectuer.
                </p>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="supplier in suppliersWithDebts"
              :key="supplier.id"
              @click="formData.supplier_id = supplier.id"
              :class="[
                'relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center',
                formData.supplier_id === supplier.id
                  ? 'border-[#0769CF] bg-[#0769CF] text-white shadow-lg shadow-[#0769CF]/25'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#0769CF]/50 hover:shadow-md'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <User :class="['w-4 h-4', formData.supplier_id === supplier.id ? 'text-white' : 'text-gray-400']" />
                <span class="font-medium text-sm truncate">{{ supplier.name }}</span>
              </div>
              <p :class="['text-[10px] mt-1', formData.supplier_id === supplier.id ? 'text-white/70' : 'text-gray-400']">
                {{ supplier.supplier_code }}
              </p>
            </div>
          </div>
        </div>

        <!-- Détails du fournisseur sélectionné -->
        <div v-if="selectedSupplier" class="mb-5">
          <div class="p-4 rounded-xl border-2 border-[#0769CF]/20 bg-gradient-to-r from-[#F0F7FF] to-[#E8F4FD]">
            <!-- En-tête avec statut -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <User class="w-4 h-4 text-[#0769CF]" />
                </div>
                <span class="text-sm font-semibold text-gray-700">{{ selectedSupplier.name }}</span>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
                  getPaymentStatus(selectedSupplier) === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  getPaymentStatus(selectedSupplier) === 'partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                ]"
              >
                <CheckCircle2 v-if="getPaymentStatus(selectedSupplier) === 'paid'" class="w-3 h-3" />
                <Clock v-else-if="getPaymentStatus(selectedSupplier) === 'partial'" class="w-3 h-3" />
                <AlertCircle v-else class="w-3 h-3" />
                {{ getPaymentStatus(selectedSupplier) === 'paid' ? 'Soldé' :
                   getPaymentStatus(selectedSupplier) === 'partial' ? 'En cours' : 'Non payé' }}
              </span>
            </div>

            <!-- Montants -->
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="bg-white rounded-lg p-2">
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total commandé</p>
                <p class="text-sm font-bold text-gray-800">{{ formatMontant(selectedSupplier.total_ordered) }}</p>
              </div>
              <div class="bg-emerald-50 rounded-lg p-2">
                <p class="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Total payé</p>
                <p class="text-sm font-bold text-emerald-600">{{ formatMontant(selectedSupplier.total_paid) }}</p>
              </div>
              <div :class="['rounded-lg p-2', selectedSupplier.balance > 0 ? 'bg-rose-50' : 'bg-emerald-50']">
                <p :class="['text-[10px] uppercase tracking-wider font-medium', selectedSupplier.balance > 0 ? 'text-rose-600' : 'text-emerald-600']">Solde dû</p>
                <p :class="['text-sm font-bold', selectedSupplier.balance > 0 ? 'text-rose-600' : 'text-emerald-600']">
                  {{ formatMontant(selectedSupplier.balance) }}
                </p>
              </div>
            </div>

            <!-- Barre de progression -->
            <div>
              <div class="flex justify-between text-[10px] text-gray-500 mb-1.5">
                <span class="font-medium">Progression du paiement</span>
                <span class="font-bold text-gray-700">{{ getPaymentPercentage(selectedSupplier) }}%</span>
              </div>
              <div class="h-2.5 bg-white rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    getPaymentStatus(selectedSupplier) === 'paid' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                    getPaymentStatus(selectedSupplier) === 'partial' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    'bg-gradient-to-r from-rose-400 to-rose-500'
                  ]"
                  :style="{ width: `${Math.min(getPaymentPercentage(selectedSupplier), 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Séparateur -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-gray-50 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Détails du règlement</span>
          </div>
        </div>

        <!-- Mode de paiement -->
        <div class="mb-4">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <CreditCard class="w-4 h-4 text-[#0769CF]" />
            Mode de paiement
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              @click="formData.payment_method = method.value as any"
              :class="[
                'p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center',
                formData.payment_method === method.value
                  ? 'border-[#0769CF] bg-[#0769CF]/10 text-[#0769CF]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#0769CF]/50'
              ]"
            >
              <component :is="method.icon" class="w-5 h-5 mx-auto mb-1" />
              <span class="text-xs font-medium">{{ method.label }}</span>
            </div>
          </div>
        </div>

        <!-- Montant et Date sur la même ligne -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <!-- Montant -->
          <div>
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign class="w-4 h-4 text-[#0769CF]" />
              Montant
            </label>
            <div class="relative">
              <Input
                id="montant"
                v-model.number="formData.montant"
                type="number"
                min="1"
                step="1"
                :max="selectedSupplier?.balance"
                placeholder="0"
                required
                :disabled="submitting"
                class="h-12 w-full pl-4 pr-16 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all font-semibold text-lg"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">FCFA</span>
            </div>
            <p v-if="selectedSupplier && formData.montant > selectedSupplier.balance" class="text-xs text-amber-600 mt-1">
              Le montant dépasse le solde dû
            </p>
          </div>

          <!-- Date règlement -->
          <div>
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar class="w-4 h-4 text-[#0769CF]" />
              Date du règlement
            </label>
            <Input
              id="date_reglement"
              v-model="formData.date_reglement"
              type="date"
              required
              :disabled="submitting"
              class="h-12 w-full px-4 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all"
            />
          </div>
        </div>

        <!-- Référence -->
        <div class="mb-4">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText class="w-4 h-4 text-[#0769CF]" />
            Référence
            <span class="text-xs font-normal text-gray-400">(optionnel)</span>
          </label>
          <Input
            v-model="formData.reference"
            type="text"
            placeholder="N° chèque, référence virement..."
            :disabled="submitting"
            class="h-12 w-full px-4 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all"
          />
        </div>

        <!-- Pièce jointe -->
        <div class="mb-6">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Paperclip class="w-4 h-4 text-[#0769CF]" />
            Pièce jointe
            <span class="text-xs font-normal text-gray-400">(optionnel)</span>
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="!fileName"
            @click="triggerFileInput"
            class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#0769CF]/50 hover:bg-[#0769CF]/5 transition-all group"
          >
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0769CF]/10 transition-all">
              <Paperclip class="w-5 h-5 text-gray-400 group-hover:text-[#0769CF] transition-all" />
            </div>
            <p class="text-sm font-medium text-gray-600">Cliquez pour ajouter un fichier</p>
            <p class="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC (max 5MB)</p>
          </div>

          <div v-else class="flex items-center gap-3 p-3 bg-[#0769CF]/5 border border-[#0769CF]/20 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-[#0769CF]/10 flex items-center justify-center">
              <FileText class="w-5 h-5 text-[#0769CF]" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{ fileName }}</p>
              <p class="text-xs text-gray-400">Fichier sélectionné</p>
            </div>
            <button
              type="button"
              @click="clearFile"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-100 flex items-center justify-center transition-all group"
            >
              <X class="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-all" />
            </button>
          </div>
        </div>
      </form>

      <!-- Footer avec boutons -->
      <div class="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="submitting"
          class="h-11 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="submitting || !isValid"
          class="h-11 px-8 rounded-xl bg-gradient-to-r from-[#0769CF] to-[#0891B2] hover:from-[#0558b0] hover:to-[#0782a3] text-white font-semibold shadow-lg shadow-[#0769CF]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle2 class="w-4 h-4 mr-2" />
          {{ submitting ? 'Enregistrement...' : 'Valider le règlement' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
