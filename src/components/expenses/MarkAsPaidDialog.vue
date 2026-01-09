<template>
  <div class="modal-overlay" @click="closeOnBackdrop">
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>Marquer comme payé</h2>
        <button class="btn-close" @click="close" aria-label="Fermer">
          <i class="icon-cross"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="expense" class="expense-info">
          <div class="info-row">
            <span class="label">Numéro:</span>
            <span class="value">{{ expense.expense_number }}</span>
          </div>
          <div class="info-row">
            <span class="label">Montant:</span>
            <span class="value">{{ formatCurrency(expense.amount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Bénéficiaire:</span>
            <span class="value">{{ expense.beneficiary }}</span>
          </div>
          <div class="info-row">
            <span class="label">Catégorie:</span>
            <span class="value">{{ expense.category_name }}</span>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="payment-form">
          <div class="form-group">
            <label>Mode de paiement *</label>
            <select v-model="paymentMethod" required>
              <option value="">Sélectionner un mode</option>
              <option value="cash">Espèces</option>
              <option value="bank_transfer">Virement bancaire</option>
              <option value="check">Chèque</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Carte bancaire</option>
            </select>
            <span v-if="errors.paymentMethod" class="error">{{ errors.paymentMethod }}</span>
          </div>

          <div class="form-group">
            <label>Référence de paiement</label>
            <input v-model="paymentReference" type="text" placeholder="N° chèque, N° transaction, etc." />
          </div>

          <div v-if="submitError" class="alert alert-error">
            {{ submitError }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="close" :disabled="isSubmitting">
              Annuler
            </button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">Traitement...</span>
              <span v-else>Confirmer le paiement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatCurrency } from '@/lib/formatters';
import type { Expense } from '@/types/expenses';

const props = defineProps<{
  expense: Expense | null;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [paymentMethod: string, paymentReference: string];
}>();

const paymentMethod = ref('');
const paymentReference = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const errors = ref<Record<string, string>>({});

function submitForm() {
  errors.value = {};
  submitError.value = '';

  if (!paymentMethod.value) {
    errors.value.paymentMethod = 'Veuillez sélectionner un mode de paiement';
    return;
  }

  isSubmitting.value = true;

  try {
    emit('confirm', paymentMethod.value, paymentReference.value);
    close();
  } catch (error: any) {
    submitError.value = error.response?.data?.detail || 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false;
  }
}

function close() {
  emit('close');
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close();
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.expense-info {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.info-row .label {
  font-weight: 600;
  color: #666;
}

.info-row .value {
  color: #333;
  text-align: right;
}

.payment-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.error {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #229954;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
