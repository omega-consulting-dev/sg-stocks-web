<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Effectuer un remboursement</DialogTitle>
        <DialogDescription>
          Enregistrez un paiement pour l'emprunt <strong>{{ loan?.loan_number }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div v-if="loan" class="space-y-4">
        <!-- Loan info -->
        <div class="rounded-lg bg-muted p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Prêteur:</span>
            <span class="font-medium">{{ loan.lender_name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Montant total:</span>
            <span class="font-medium">{{ formatCurrency(loan.total_amount) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Déjà payé:</span>
            <span class="font-medium text-green-600">{{ formatCurrency(loan.paid_amount) }}</span>
          </div>
          <div class="flex justify-between text-sm border-t pt-2">
            <span class="text-muted-foreground font-semibold">Solde restant:</span>
            <span class="font-bold text-lg">{{ formatCurrency(loan.balance_due) }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Montant -->
          <div class="space-y-2">
            <Label for="amount">Montant du paiement (FCFA) <span class="text-red-500">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              :max="loan.balance_due"
              v-model.number="formData.amount"
              placeholder="Ex: 50000"
              required
            />
            <p class="text-xs text-muted-foreground">
              Maximum: {{ formatCurrency(loan.balance_due) }}
            </p>
          </div>

          <!-- Mode de paiement -->
          <div class="space-y-2">
            <Label for="payment_method">Mode de paiement <span class="text-red-500">*</span></Label>
            <Select v-model="formData.payment_method" required>
              <SelectTrigger id="payment_method">
                <SelectValue placeholder="Sélectionnez le mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Référence -->
          <div class="space-y-2">
            <Label for="reference">Référence de paiement</Label>
            <Input
              id="reference"
              v-model="formData.reference"
              placeholder="Ex: CHQ001234 ou TX7890"
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
            <Button type="submit" :disabled="isSubmitting || formData.amount <= 0">
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLoansStore } from '@/stores/loans';
import { formatCurrency } from '@/lib/formatters';
import type { Loan, MakePaymentRequest } from '@/types/loans';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// Loader2 désactivé - problème d'import lucide-vue-next

const props = defineProps<{
  loan: Loan;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const loansStore = useLoansStore();
const isSubmitting = ref(false);

const formData = ref<MakePaymentRequest>({
  amount: 0,
  payment_method: 'cash',
  reference: '',
  notes: '',
});

async function handleSubmit() {
  if (!props.loan || formData.value.amount <= 0) return;

  isSubmitting.value = true;

  try {
    await loansStore.makePayment(props.loan.id, formData.value);
    emit('confirm');
    handleClose();
  } catch (error) {
    console.error('Error making payment:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  emit('close');
}
</script>
