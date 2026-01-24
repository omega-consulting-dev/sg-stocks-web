<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier l\'emprunt' : 'Nouvel emprunt' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Modifiez les informations de l\'emprunt' : 'Enregistrez un nouvel emprunt bancaire ou personnel' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
        <!-- Type d'emprunt -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="formFields.loan_type.visible" class="space-y-2">
            <Label for="loan_type">Type d'emprunt <span v-if="formFields.loan_type.required" class="text-red-500">*</span></Label>
            <Select v-model="formData.loan_type" :class="{ 'border-red-500': fieldErrors.loan_type }">
              <SelectTrigger id="loan_type">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Prêt bancaire</SelectItem>
                <SelectItem value="supplier">Crédit fournisseur</SelectItem>
                <SelectItem value="personal">Prêt personnel</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="fieldErrors.loan_type" class="text-xs text-red-500">{{ fieldErrors.loan_type }}</p>
          </div>

          <!-- Nom du prêteur -->
          <div v-if="formFields.lender_name.visible" class="space-y-2">
            <Label for="lender_name">Nom du prêteur <span v-if="formFields.lender_name.required" class="text-red-500">*</span></Label>
            <Input
              id="lender_name"
              v-model="formData.lender_name"
              placeholder="Ex: Banque ABC, Jean Dupont"
              :required="formFields.lender_name.required"
              :class="{ 'border-red-500': fieldErrors.lender_name }"
            />
            <p v-if="fieldErrors.lender_name" class="text-xs text-red-500">{{ fieldErrors.lender_name }}</p>
          </div>
        </div>

        <!-- Contact prêteur -->
        <div v-if="formFields.lender_contact.visible" class="space-y-2">
          <Label for="lender_contact">Contact prêteur<span v-if="formFields.lender_contact.required" class="text-red-500">*</span></Label>
          <Input
            id="lender_contact"
            v-model="formData.lender_contact"
            placeholder="Téléphone ou email"
            :required="formFields.lender_contact.required"
            :class="{ 'border-red-500': fieldErrors.lender_contact }"
          />
          <p v-if="fieldErrors.lender_contact" class="text-xs text-red-500">{{ fieldErrors.lender_contact }}</p>
        </div>

        <!-- Point de vente -->
        <div v-if="shouldShowStoreField" class="space-y-2">
          <Label for="store">Point de vente<span v-if="formFields.store.required" class="text-red-500">*</span></Label>
          <Select v-model.number="formData.store" :class="{ 'border-red-500': fieldErrors.store }">
            <SelectTrigger id="store">
              <SelectValue placeholder="Sélectionnez un point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">Aucun point de vente</SelectItem>
              <SelectItem v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="fieldErrors.store" class="text-xs text-red-500">{{ fieldErrors.store }}</p>
        </div>

        <!-- Montant principal et taux -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="formFields.principal_amount.visible" class="space-y-2">
            <Label for="principal_amount">Montant emprunté (FCFA) <span v-if="formFields.principal_amount.required" class="text-red-500">*</span></Label>
            <Input
              id="principal_amount"
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.principal_amount"
              placeholder="Ex: 1000000"
              :required="formFields.principal_amount.required"
              :class="{ 'border-red-500': fieldErrors.principal_amount }"
            />
            <p v-if="fieldErrors.principal_amount" class="text-xs text-red-500">{{ fieldErrors.principal_amount }}</p>
          </div>

          <div v-if="formFields.interest_rate.visible" class="space-y-2">
            <Label for="interest_rate">Taux d'intérêt (%) <span v-if="formFields.interest_rate.required" class="text-red-500">*</span></Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              v-model.number="formData.interest_rate"
              placeholder="Ex: 12.5"
              :required="formFields.interest_rate.required"
              :class="{ 'border-red-500': fieldErrors.interest_rate }"
            />
            <p v-if="fieldErrors.interest_rate" class="text-xs text-red-500">{{ fieldErrors.interest_rate }}</p>
            <p v-else class="text-xs text-muted-foreground">
              {{ formData.loan_type === 'bank'
                ? 'Taux annuel proratisé sur la durée du prêt'
                : 'Taux simple appliqué au montant emprunté' }}
            </p>
          </div>
        </div>

        <!-- Durée -->
        <div v-if="formFields.duration_months.visible" class="space-y-2">
          <Label for="duration_months">Durée (mois) <span v-if="formFields.duration_months.required" class="text-red-500">*</span></Label>
          <Input
            id="duration_months"
            type="number"
            min="1"
            v-model.number="formData.duration_months"
            placeholder="Ex: 12"
            :required="formFields.duration_months.required"
            :class="{ 'border-red-500': fieldErrors.duration_months }"
          />
          <p v-if="fieldErrors.duration_months" class="text-xs text-red-500">{{ fieldErrors.duration_months }}</p>
        </div>

        <!-- Montant total calculé (lecture seule) -->
        <div v-if="calculatedTotalAmount > 0" class="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-900">Montant total à rembourser</p>
              <p class="text-xs text-green-600 mt-1">
                Intérêts: {{ formatCurrency(calculatedTotalAmount - (formData.principal_amount || 0)) }}
              </p>
            </div>
            <p class="text-2xl font-bold text-green-700">{{ formatCurrency(calculatedTotalAmount) }}</p>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="formFields.start_date.visible" class="space-y-2">
            <Label for="start_date">Date de début <span v-if="formFields.start_date.required" class="text-red-500">*</span></Label>
            <Input
              id="start_date"
              type="date"
              v-model="formData.start_date"
              :max="formData.end_date"
              :required="formFields.start_date.required"
              :class="{ 'border-red-500': fieldErrors.start_date }"
            />
            <p v-if="fieldErrors.start_date" class="text-xs text-red-500">{{ fieldErrors.start_date }}</p>
          </div>

          <div v-if="formFields.end_date.visible" class="space-y-2">
            <Label for="end_date">Date de fin <span v-if="formFields.end_date.required" class="text-red-500">*</span></Label>
            <Input
              id="end_date"
              type="date"
              v-model="formData.end_date"
              :min="formData.start_date"
              :required="formFields.end_date.required"
              :class="{ 'border-red-500': fieldErrors.end_date }"
            />
            <p v-if="fieldErrors.end_date" class="text-xs text-red-500">{{ fieldErrors.end_date }}</p>
          </div>
        </div>

        <!-- Objet du prêt -->
        <div v-if="formFields.purpose.visible" class="space-y-2">
          <Label for="purpose">Objet du prêt<span v-if="formFields.purpose.required" class="text-red-500">*</span></Label>
          <Textarea
            id="purpose"
            v-model="formData.purpose"
            placeholder="Décrivez l'objet du prêt"
            rows="2"
            :required="formFields.purpose.required"
            :class="{ 'border-red-500': fieldErrors.purpose }"
          />
          <p v-if="fieldErrors.purpose" class="text-xs text-red-500">{{ fieldErrors.purpose }}</p>
        </div>

        <!-- Notes -->
        <div v-if="formFields.notes.visible" class="space-y-2">
          <Label for="notes">Notes<span v-if="formFields.notes.required" class="text-red-500">*</span></Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires"
            rows="2"
            :required="formFields.notes.required"
            :class="{ 'border-red-500': fieldErrors.notes }"
          />
          <p v-if="fieldErrors.notes" class="text-xs text-red-500">{{ fieldErrors.notes }}</p>
        </div>

        <!-- Actions -->
        <DialogFooter class="gap-2">
          <Button type="button" variant="outline" @click="handleClose">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isEdit ? 'Modifier' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLoansStore } from '@/stores/loans';
import { useFieldConfigStore } from '@/stores/field-config.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/formatters';
import type { Loan, CreateLoanRequest } from '@/types/loans';
import type { Store } from '@/types/store.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storesApi } from '@/services/api/stores.api';
// Loader2 désactivé - problème d'import lucide-vue-next

const props = defineProps<{
  loan?: Loan | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const loansStore = useLoansStore();
const fieldConfigStore = useFieldConfigStore();
const authStore = useAuthStore();
const isSubmitting = ref(false);
const isEdit = ref(false);
const stores = ref<Store[]>([]);
const fieldErrors = ref<Record<string, string>>({});
const calculatedTotalAmount = ref<number>(0);

// Computed pour gérer le point de vente selon le rôle
const shouldShowStoreField = computed(() => {
  // Si admin, afficher le champ pour qu'il puisse choisir
  if (authStore.isAdmin) return formFields.value.store.visible;
  // Si collaborateur avec un seul store, ne pas afficher (pré-rempli automatiquement)
  if (authStore.defaultStore && !authStore.hasMultipleStores) return false;
  // Si collaborateur avec plusieurs stores, afficher pour qu'il choisisse
  return formFields.value.store.visible;
});

// Field configurations
const formFields = computed(() => {
  const configsByForm = fieldConfigStore.getConfigsByForm();
  const configs = configsByForm['loan'] || [];
  return {
    loan_type: {
      visible: configs.find(c => c.field_name === 'loan_type')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'loan_type')?.is_required ?? true,
    },
    lender_name: {
      visible: configs.find(c => c.field_name === 'lender_name')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'lender_name')?.is_required ?? true,
    },
    lender_contact: {
      visible: configs.find(c => c.field_name === 'lender_contact')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'lender_contact')?.is_required ?? false,
    },
    store: {
      visible: configs.find(c => c.field_name === 'store')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'store')?.is_required ?? false,
    },
    principal_amount: {
      visible: configs.find(c => c.field_name === 'principal_amount')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'principal_amount')?.is_required ?? true,
    },
    interest_rate: {
      visible: configs.find(c => c.field_name === 'interest_rate')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'interest_rate')?.is_required ?? true,
    },
    duration_months: {
      visible: configs.find(c => c.field_name === 'duration_months')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'duration_months')?.is_required ?? true,
    },
    start_date: {
      visible: configs.find(c => c.field_name === 'start_date')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'start_date')?.is_required ?? true,
    },
    end_date: {
      visible: configs.find(c => c.field_name === 'end_date')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'end_date')?.is_required ?? true,
    },
    purpose: {
      visible: configs.find(c => c.field_name === 'purpose')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'purpose')?.is_required ?? false,
    },
    notes: {
      visible: configs.find(c => c.field_name === 'notes')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'notes')?.is_required ?? false,
    },
  };
});

const formData = ref<CreateLoanRequest>({
  loan_type: 'bank',
  lender_name: '',
  lender_contact: '',
  principal_amount: 0,
  interest_rate: 0,
  duration_months: 12,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  purpose: '',
  notes: '',
  // Pré-remplir avec le store par défaut si l'utilisateur n'est pas admin
  store: authStore.isAdmin ? undefined : (authStore.defaultStore?.id || undefined),
});

// Load stores, configs and initialize form when dialog opens or loan changes
watch(() => props.loan, async (loan) => {
  try {
    // Recharger les configurations à chaque ouverture
    await fieldConfigStore.fetchConfigurations();
    const response = await storesApi.getStores({ page_size: 100 });
    stores.value = response.results || [];
  } catch (error) {
    console.error('Error loading stores:', error);
  }

  // Initialiser ou réinitialiser le formulaire
  if (loan) {
    // Mode édition : charger les données de l'emprunt
    isEdit.value = true;
    formData.value = {
      loan_type: loan.loan_type,
      lender_name: loan.lender_name,
      lender_contact: loan.lender_contact || '',
      principal_amount: loan.principal_amount,
      interest_rate: loan.interest_rate,
      duration_months: loan.duration_months,
      start_date: loan.start_date,
      end_date: loan.end_date,
      purpose: loan.purpose || '',
      notes: loan.notes || '',
      store: loan.store,
    };
  } else {
    // Mode création : réinitialiser le formulaire
    isEdit.value = false;
    formData.value = {
      loan_type: 'bank',
      lender_name: '',
      lender_contact: '',
      principal_amount: 0,
      interest_rate: 0,
      duration_months: 12,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      purpose: '',
      notes: '',
      // Pré-remplir avec le store par défaut si l'utilisateur n'est pas admin
      store: authStore.isAdmin ? undefined : (authStore.defaultStore?.id || undefined),
    };
  }

  // Réinitialiser les erreurs
  fieldErrors.value = {};
}, { immediate: true });

// Recalculer automatiquement le montant total et la date de fin
watch(
  () => [formData.value.principal_amount, formData.value.interest_rate, formData.value.duration_months, formData.value.start_date, formData.value.loan_type],
  () => {
    // Recalculer le montant total
    const principal = Number(formData.value.principal_amount) || 0;
    const rate = Number(formData.value.interest_rate) || 0;
    const duration = Number(formData.value.duration_months) || 0;

    let interestAmount = 0;
    if (formData.value.loan_type === 'bank') {
      // Prêt bancaire: taux annuel proratisé sur la durée
      interestAmount = (principal * rate * duration) / (100 * 12);
    } else {
      // Prêt personnel, fournisseur, autre: taux simple
      interestAmount = (principal * rate) / 100;
    }

    calculatedTotalAmount.value = principal + interestAmount;

    // Calculer automatiquement la date de fin si on a la date de début et la durée
    if (formData.value.start_date && duration > 0) {
      const startDate = new Date(formData.value.start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duration);
      formData.value.end_date = endDate.toISOString().split('T')[0];
    }
  }
);

function validateRequiredFields(): boolean {
  // Réinitialiser les erreurs
  fieldErrors.value = {};

  // Valider chaque champ obligatoire selon les configurations
  if (formFields.value.loan_type.required && !formData.value.loan_type) {
    fieldErrors.value.loan_type = 'Ce champ est obligatoire';
  }
  if (formFields.value.lender_name.required && !formData.value.lender_name) {
    fieldErrors.value.lender_name = 'Ce champ est obligatoire';
  }
  if (formFields.value.lender_contact.required && !formData.value.lender_contact) {
    fieldErrors.value.lender_contact = 'Ce champ est obligatoire';
  }
  // Ne valider le store que si le champ est visible et obligatoire
  if (shouldShowStoreField.value && formFields.value.store.required && !formData.value.store) {
    fieldErrors.value.store = 'Ce champ est obligatoire';
  }
  if (formFields.value.principal_amount.required && (!formData.value.principal_amount || formData.value.principal_amount <= 0)) {
    fieldErrors.value.principal_amount = 'Ce champ est obligatoire et doit être supérieur à 0';
  }
  if (formFields.value.interest_rate.required && (formData.value.interest_rate === null || formData.value.interest_rate === undefined || formData.value.interest_rate < 0)) {
    fieldErrors.value.interest_rate = 'Ce champ est obligatoire';
  }
  if (formFields.value.duration_months.required && (!formData.value.duration_months || formData.value.duration_months <= 0)) {
    fieldErrors.value.duration_months = 'Ce champ est obligatoire et doit être supérieur à 0';
  }
  if (formFields.value.start_date.required && !formData.value.start_date) {
    fieldErrors.value.start_date = 'Ce champ est obligatoire';
  }
  if (formFields.value.end_date.required && !formData.value.end_date) {
    fieldErrors.value.end_date = 'Ce champ est obligatoire';
  }
  if (formFields.value.purpose.required && !formData.value.purpose) {
    fieldErrors.value.purpose = 'Ce champ est obligatoire';
  }
  if (formFields.value.notes.required && !formData.value.notes) {
    fieldErrors.value.notes = 'Ce champ est obligatoire';
  }

  return Object.keys(fieldErrors.value).length === 0;
}

async function handleSubmit() {
  // Valider les champs obligatoires
  if (!validateRequiredFields()) {
    return;
  }

  isSubmitting.value = true;

  try {
    if (isEdit.value && props.loan) {
      await loansStore.updateLoan(props.loan.id, formData.value);
    } else {
      await loansStore.createLoan(formData.value);
    }

    emit('save');
    handleClose();
  } catch (error) {
    console.error('Error saving loan:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  emit('close');
}
</script>
