<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  User,
  FileText,
  DollarSign,
  Calendar,
  Paperclip,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  CreditCard,
  Building2
} from 'lucide-vue-next'
import { useFournisseursStore, type Operation, type CompteFournisseur } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<Operation, 'id' | 'created_at'>]
}>()

const store = useFournisseursStore()

const formData = ref({
  fournisseur_id: 0,
  compte_id: 0,
  intitule: '',
  montant: 0,
  date_reglement: '',
  piece_jointe: null as string | null,
})

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')

// Comptes filtrés par fournisseur sélectionné - seulement ceux avec des dettes (solde > 0)
const comptesForFournisseur = computed(() => {
  if (!formData.value.fournisseur_id) return []
  return store.comptes.filter(c =>
    c.fournisseur_id === formData.value.fournisseur_id &&
    (c.montant_facture - c.montant_encaissement) > 0
  )
})

// Fournisseurs qui ont au moins un compte avec dette
const fournisseursWithDebts = computed(() => {
  return store.fournisseurs.filter(f => {
    return store.comptes.some(c =>
      c.fournisseur_id === f.id &&
      (c.montant_facture - c.montant_encaissement) > 0
    )
  })
})

// Fournisseur sélectionné
const selectedFournisseur = computed(() => {
  return store.fournisseurs.find(f => f.id === formData.value.fournisseur_id)
})

// Compte sélectionné
const selectedCompte = computed(() => {
  return comptesForFournisseur.value.find(c => c.id === formData.value.compte_id)
})

watch(() => props.open, (newValue) => {
  if (newValue) {
    // Sélectionner le premier fournisseur qui a des dettes
    const firstFournisseurWithDebt = store.fournisseurs.find(f => {
      return store.comptes.some(c =>
        c.fournisseur_id === f.id &&
        (c.montant_facture - c.montant_encaissement) > 0
      )
    })

    formData.value = {
      fournisseur_id: firstFournisseurWithDebt?.id || 0,
      compte_id: 0,
      intitule: '',
      montant: 0,
      date_reglement: new Date().toISOString().split('T')[0],
      piece_jointe: null,
    }
    fileName.value = ''

    // Sélectionner le premier compte avec dette du fournisseur sélectionné
    if (formData.value.fournisseur_id) {
      const comptesWithDebt = store.comptes.filter(c =>
        c.fournisseur_id === formData.value.fournisseur_id &&
        (c.montant_facture - c.montant_encaissement) > 0
      )
      if (comptesWithDebt.length > 0) {
        formData.value.compte_id = comptesWithDebt[0].id
      }
    }
  }
})

// Quand le fournisseur change, mettre à jour le compte (uniquement ceux avec dettes)
watch(() => formData.value.fournisseur_id, (newFournisseurId) => {
  if (newFournisseurId) {
    const comptesWithDebt = store.comptes.filter(c =>
      c.fournisseur_id === newFournisseurId &&
      (c.montant_facture - c.montant_encaissement) > 0
    )
    formData.value.compte_id = comptesWithDebt.length > 0 ? comptesWithDebt[0].id : 0
  } else {
    formData.value.compte_id = 0
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

// Calculer le solde d'un compte
const getSolde = (compte: CompteFournisseur) => {
  return compte.montant_facture - compte.montant_encaissement
}

// Calculer le pourcentage payé
const getPaymentPercentage = (compte: CompteFournisseur) => {
  if (compte.montant_facture === 0) return 100
  return Math.round((compte.montant_encaissement / compte.montant_facture) * 100)
}

// Obtenir le statut du paiement
const getPaymentStatus = (compte: CompteFournisseur) => {
  const percentage = getPaymentPercentage(compte)
  if (percentage >= 100) return 'paid'
  if (percentage > 0) return 'partial'
  return 'unpaid'
}

// Formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const handleSubmit = () => {
  if (!formData.value.compte_id || !formData.value.intitule || !formData.value.montant || !formData.value.date_reglement) {
    return
  }

  emit('submit', {
    compte_id: formData.value.compte_id,
    intitule: formData.value.intitule,
    montant: formData.value.montant,
    date_reglement: formData.value.date_reglement,
    piece_jointe: formData.value.piece_jointe,
  })
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
          <div v-if="fournisseursWithDebts.length === 0" class="p-5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50">
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
              v-for="fournisseur in fournisseursWithDebts"
              :key="fournisseur.id"
              @click="formData.fournisseur_id = fournisseur.id"
              :class="[
                'relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center',
                formData.fournisseur_id === fournisseur.id
                  ? 'border-[#0769CF] bg-[#0769CF] text-white shadow-lg shadow-[#0769CF]/25'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#0769CF]/50 hover:shadow-md'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <User :class="['w-4 h-4', formData.fournisseur_id === fournisseur.id ? 'text-white' : 'text-gray-400']" />
                <span class="font-medium text-sm truncate">{{ fournisseur.name }}</span>
              </div>
              <p :class="['text-[10px] mt-1', formData.fournisseur_id === fournisseur.id ? 'text-white/70' : 'text-gray-400']">
                {{ fournisseur.location }}
              </p>
            </div>
          </div>
        </div>

        <!-- Compte -->
        <div class="mb-5">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Receipt class="w-4 h-4 text-[#0769CF]" />
            Sélectionner un compte
          </label>

          <!-- Liste des comptes sous forme de cartes cliquables -->
          <div v-if="comptesForFournisseur.length > 0" class="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            <div
              v-for="compte in comptesForFournisseur"
              :key="compte.id"
              @click="formData.compte_id = compte.id"
              :class="[
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                formData.compte_id === compte.id
                  ? 'border-[#0769CF] bg-gradient-to-r from-[#F0F7FF] to-[#E8F4FD] shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              ]"
            >
              <!-- Indicateur de sélection -->
              <div
                v-if="formData.compte_id === compte.id"
                class="absolute top-3 right-3 w-6 h-6 bg-[#0769CF] rounded-full flex items-center justify-center shadow-md"
              >
                <CheckCircle2 class="w-4 h-4 text-white" />
              </div>

              <!-- En-tête avec date et statut -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Calendar class="w-4 h-4 text-gray-500" />
                  </div>
                  <span class="text-sm font-medium text-gray-600">{{ formatDate(compte.date_facture) }}</span>
                </div>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
                    getPaymentStatus(compte) === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    getPaymentStatus(compte) === 'partial' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  ]"
                >
                  <CheckCircle2 v-if="getPaymentStatus(compte) === 'paid'" class="w-3 h-3" />
                  <Clock v-else-if="getPaymentStatus(compte) === 'partial'" class="w-3 h-3" />
                  <AlertCircle v-else class="w-3 h-3" />
                  {{ getPaymentStatus(compte) === 'paid' ? 'Soldé' :
                     getPaymentStatus(compte) === 'partial' ? 'En cours' : 'Non payé' }}
                </span>
              </div>

              <!-- Montants -->
              <div class="grid grid-cols-3 gap-3 mb-3">
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Facture</p>
                  <p class="text-sm font-bold text-gray-800">{{ formatMontant(compte.montant_facture) }}</p>
                </div>
                <div class="bg-emerald-50 rounded-lg p-2">
                  <p class="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Payé</p>
                  <p class="text-sm font-bold text-emerald-600">{{ formatMontant(compte.montant_encaissement) }}</p>
                </div>
                <div :class="['rounded-lg p-2', getSolde(compte) > 0 ? 'bg-rose-50' : 'bg-emerald-50']">
                  <p :class="['text-[10px] uppercase tracking-wider font-medium', getSolde(compte) > 0 ? 'text-rose-600' : 'text-emerald-600']">Reste</p>
                  <p :class="['text-sm font-bold', getSolde(compte) > 0 ? 'text-rose-600' : 'text-emerald-600']">
                    {{ formatMontant(getSolde(compte)) }}
                  </p>
                </div>
              </div>

              <!-- Barre de progression -->
              <div>
                <div class="flex justify-between text-[10px] text-gray-500 mb-1.5">
                  <span class="font-medium">Progression du paiement</span>
                  <span class="font-bold text-gray-700">{{ getPaymentPercentage(compte) }}%</span>
                </div>
                <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-500',
                      getPaymentStatus(compte) === 'paid' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                      getPaymentStatus(compte) === 'partial' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      'bg-gradient-to-r from-rose-400 to-rose-500'
                    ]"
                    :style="{ width: `${Math.min(getPaymentPercentage(compte), 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucun compte -->
          <div v-else-if="formData.fournisseur_id" class="p-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-amber-800">Aucun compte disponible</p>
                <p class="text-xs text-amber-600 mt-1">
                  Ce fournisseur n'a pas encore de compte enregistré. Veuillez d'abord créer un compte dans la section "Comptes Fournisseur".
                </p>
              </div>
            </div>
          </div>

          <!-- Message si aucun fournisseur sélectionné -->
          <div v-else class="p-5 rounded-xl border-2 border-dashed border-gray-300 bg-white">
            <p class="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
              <User class="w-4 h-4" />
              Sélectionnez un fournisseur pour voir ses comptes
            </p>
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

        <!-- Intitulé -->
        <div class="mb-4">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText class="w-4 h-4 text-[#0769CF]" />
            Intitulé du règlement
          </label>
          <div class="relative">
            <Input
              id="intitule"
              v-model="formData.intitule"
              type="text"
              placeholder="Ex : Paiement facture N°001"
              required
              :disabled="loading"
              class="h-12 w-full pl-4 pr-4 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all"
            />
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
                placeholder="0"
                required
                :disabled="loading"
                class="h-12 w-full pl-4 pr-16 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all font-semibold text-lg"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">FCFA</span>
            </div>
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
              :disabled="loading"
              class="h-12 w-full px-4 border-gray-200 rounded-xl text-sm bg-white focus:border-[#0769CF] focus:ring-[#0769CF]/20 transition-all"
            />
          </div>
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
          :disabled="loading"
          class="h-11 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="loading || !formData.compte_id || !formData.intitule || !formData.montant || !formData.date_reglement"
          class="h-11 px-8 rounded-xl bg-gradient-to-r from-[#0769CF] to-[#0891B2] hover:from-[#0558b0] hover:to-[#0782a3] text-white font-semibold shadow-lg shadow-[#0769CF]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle2 class="w-4 h-4 mr-2" />
          {{ loading ? 'Enregistrement...' : 'Valider le règlement' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
