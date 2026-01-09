<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Modifier l\'emprunt' : 'Nouvel emprunt' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Modifiez les informations de l\'emprunt' : 'Enregistrez un nouvel emprunt bancaire ou personnel' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Type d'emprunt -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="loan_type">Type d'emprunt <span class="text-red-500">*</span></Label>
            <Select v-model="formData.loan_type" required>
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
          </div>

          <!-- Nom du prêteur -->
          <div class="space-y-2">
            <Label for="lender_name">Nom du prêteur <span class="text-red-500">*</span></Label>
            <Input
              id="lender_name"
              v-model="formData.lender_name"
              placeholder="Ex: Banque ABC, Jean Dupont"
              required
            />
          </div>
        </div>

        <!-- Contact prêteur -->
        <div class="space-y-2">
          <Label for="lender_contact">Contact prêteur</Label>
          <Input
            id="lender_contact"
            v-model="formData.lender_contact"
            placeholder="Téléphone ou email"
          />
        </div>

        <!-- Point de vente -->
        <div class="space-y-2">
          <Label for="store">Point de vente (optionnel)</Label>
          <Select v-model.number="formData.store">
            <SelectTrigger id="store">
              <SelectValue placeholder="Aucun point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="undefined">Aucun point de vente</SelectItem>
              <SelectItem v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Montant principal et taux -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="principal_amount">Montant emprunté (FCFA) <span class="text-red-500">*</span></Label>
            <Input
              id="principal_amount"
              type="number"
              step="0.01"
              min="0"
              v-model.number="formData.principal_amount"
              placeholder="Ex: 1000000"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="interest_rate">Taux d'intérêt (%) <span class="text-red-500">*</span></Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              v-model.number="formData.interest_rate"
              placeholder="Ex: 12.5"
              required
            />
          </div>
        </div>

        <!-- Durée -->
        <div class="space-y-2">
          <Label for="duration_months">Durée (mois) <span class="text-red-500">*</span></Label>
          <Input
            id="duration_months"
            type="number"
            min="1"
            v-model.number="formData.duration_months"
            placeholder="Ex: 12"
            required
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="start_date">Date de début <span class="text-red-500">*</span></Label>
            <Input
              id="start_date"
              type="date"
              v-model="formData.start_date"
              :max="formData.end_date"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="end_date">Date de fin <span class="text-red-500">*</span></Label>
            <Input
              id="end_date"
              type="date"
              v-model="formData.end_date"
              :min="formData.start_date"
              required
            />
          </div>
        </div>

        <!-- Objet du prêt -->
        <div class="space-y-2">
          <Label for="purpose">Objet du prêt</Label>
          <Textarea
            id="purpose"
            v-model="formData.purpose"
            placeholder="Décrivez l'objet du prêt"
            rows="2"
          />
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires"
            rows="2"
          />
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
import { ref, watch, onMounted } from 'vue';
import { useLoansStore } from '@/stores/loans';
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
const isSubmitting = ref(false);
const isEdit = ref(false);
const stores = ref<Store[]>([]);

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
  store: undefined,
});

// Load stores on component mount
onMounted(async () => {
  try {
    const response = await storesApi.getStores({ page_size: 100 });
    stores.value = response.results || [];
  } catch (error) {
    console.error('Error loading stores:', error);
  }
});

// Initialize form with loan data if editing
watch(() => props.loan, (loan) => {
  if (loan) {
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
  }
}, { immediate: true });

async function handleSubmit() {
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
