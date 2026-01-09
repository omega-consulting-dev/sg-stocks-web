<template>
  <div class="modal-overlay" @click="closeOnBackdrop">
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Modifier la dépense' : 'Nouvelle dépense' }}</h2>
        <button class="btn-close" @click="close" aria-label="Fermer">
          <i class="icon-cross"></i>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="expense-form">
        <div class="form-section">
          <h3>Informations générales</h3>

          <div class="form-group">
            <label>Catégorie *</label>
            <select v-model.number="formData.category" required>
              <option value="">Sélectionner une catégorie</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <span v-if="errors.category" class="error">{{ errors.category }}</span>
          </div>

          <div class="form-group">
            <label>Point de vente</label>
            <select v-model.number="formData.store">
              <option value="">Aucun</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date de dépense *</label>
              <input v-model="formData.expense_date" type="date" required />
              <span v-if="errors.expense_date" class="error">{{ errors.expense_date }}</span>
            </div>

            <div class="form-group">
              <label>Montant (FCFA) *</label>
              <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
              <span v-if="errors.amount" class="error">{{ errors.amount }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Bénéficiaire *</label>
            <input v-model="formData.beneficiary" type="text" required />
            <span v-if="errors.beneficiary" class="error">{{ errors.beneficiary }}</span>
          </div>

          <div class="form-group">
            <label>Description *</label>
            <textarea v-model="formData.description" required rows="3"></textarea>
            <span v-if="errors.description" class="error">{{ errors.description }}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Paiement</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Mode de paiement</label>
              <select v-model="formData.payment_method">
                <option :value="null">Non défini</option>
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte bancaire</option>
              </select>
            </div>

            <div class="form-group">
              <label>Référence de paiement</label>
              <input v-model="formData.payment_reference" type="text" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Documents et notes</h3>

          <div class="form-group">
            <label>Reçu/Facture (PDF, JPG, PNG)</label>
            <div class="file-upload-container">
              <input
                ref="fileInputRef"
                type="file"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png"
                class="file-input-hidden"
                id="receipt-upload"
              />
              <label for="receipt-upload" class="file-upload-label">
                <div class="file-upload-icon">📎</div>
                <div class="file-upload-text">
                  <span v-if="!selectedFile && !currentReceipt" class="upload-prompt">
                    Cliquez pour sélectionner un fichier ou glissez-le ici
                  </span>
                  <span v-else class="file-selected">
                    <span class="file-icon">{{ getFileIcon(selectedFile || currentReceipt) }}</span>
                    <span class="file-name-display">
                      {{ selectedFile ? selectedFile.name : (typeof currentReceipt === 'string' ? currentReceipt.split('/').pop() : '') }}
                    </span>
                  </span>
                </div>
              </label>
              <button
                v-if="selectedFile || currentReceipt"
                type="button"
                @click="clearFile"
                class="btn-remove-file"
                title="Supprimer le fichier"
              >
                ✕
              </button>
            </div>
            <p class="file-help-text">Formats acceptés: PDF, JPG, JPEG, PNG (max 5 Mo)</p>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="formData.notes" rows="2" placeholder="Ajoutez des notes supplémentaires..."></textarea>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="alert alert-error">
          {{ submitError }}
        </div>

        <!-- Form actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isSubmitting">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>{{ isEdit ? 'Mettre à jour' : 'Créer' }} la dépense</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import { useStoresStore } from '@/stores/stores.store';
import type { Expense, CreateExpenseRequest } from '@/types/expenses';

const props = defineProps<{
  expense?: Expense | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [expense: Expense];
}>();

const expensesStore = useExpensesStore()
const storesStore = useStoresStore()

const isSubmitting = ref(false)
const submitError = ref('')
const selectedFile = ref<File | null>(null)
const currentReceipt = ref<string | File | undefined>(undefined)
const fileInputRef = ref<HTMLInputElement | null>(null)

const formData = ref<CreateExpenseRequest>({
  category: 0,
  expense_date: new Date().toISOString().split('T')[0],
  description: '',
  amount: 0,
  beneficiary: '',
  expense_number: '', // Sera généré automatiquement par le store
})

const errors = ref<Record<string, string>>({})

const isEdit = computed(() => !!props.expense)
const categories = computed(() => expensesStore.categories)
const stores = computed(() => storesStore.stores)

// Lifecycle
onMounted(async () => {
  // Fetch stores if not already loaded
  if (storesStore.stores.length === 0) {
    try {
      await storesStore.fetchStores()
    } catch (error) {
      console.error('Erreur lors du chargement des points de vente:', error)
    }
  }

  if (props.expense) {
    formData.value = {
      category: props.expense.category,
      store: props.expense.store || undefined,
      expense_date: props.expense.expense_date,
      description: props.expense.description,
      amount: props.expense.amount,
      beneficiary: props.expense.beneficiary,
      payment_method: props.expense.payment_method || undefined,
      payment_reference: props.expense.payment_reference || undefined,
      notes: props.expense.notes || undefined,
      receipt: props.expense.receipt || undefined,
    };
    currentReceipt.value = props.expense.receipt;
  }
});

// Methods
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Vérifier la taille du fichier (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      submitError.value = 'Le fichier est trop volumineux (max 5 Mo)';
      return;
    }
    
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      submitError.value = 'Type de fichier non accepté. Utilisez PDF, JPG ou PNG';
      return;
    }
    
    selectedFile.value = file;
    formData.value.receipt = file;
    submitError.value = '';
  }
}

function clearFile() {
  selectedFile.value = null;
  currentReceipt.value = undefined;
  formData.value.receipt = undefined;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function getFileIcon(file: File | string | undefined): string {
  if (!file) return '📄';
  
  const fileName = typeof file === 'string' ? file : file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📕';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️';
    default:
      return '📄';
  }
}

async function submitForm() {
  // Reset errors
  errors.value = {};
  submitError.value = '';

  // Validate
  if (!formData.value.category) {
    errors.value.category = 'La catégorie est requise';
    return;
  }
  if (!formData.value.expense_date) {
    errors.value.expense_date = 'La date est requise';
    return;
  }
  if (!formData.value.amount || formData.value.amount <= 0) {
    errors.value.amount = 'Le montant doit être supérieur à 0';
    return;
  }
  if (!formData.value.beneficiary) {
    errors.value.beneficiary = 'Le bénéficiaire est requis';
    return;
  }
  if (!formData.value.description) {
    errors.value.description = 'La description est requise';
    return;
  }

  isSubmitting.value = true;

  try {
    console.log('Submitting expense with data:', formData.value);
    let result: Expense;

    if (isEdit.value && props.expense) {
      result = await expensesStore.updateExpense(props.expense.id, formData.value);
    } else {
      result = await expensesStore.createExpense(formData.value);
    }

    console.log('Expense created/updated:', result);
    emit('save', result);
    close();
  } catch (error: any) {
    console.error('Submit error details:', error);
    console.error('Error response:', error.response?.data);
    submitError.value = error.response?.data?.detail || error.response?.data?.message || JSON.stringify(error.response?.data) || 'Une erreur est survenue';
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
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

.expense-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.error {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* Styles améliorés pour l'upload de fichiers */
.file-upload-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-input-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-upload-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed #3498db;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  border-color: #2980b9;
  background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
}

.file-upload-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-upload-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.upload-prompt {
  color: #3498db;
  font-weight: 600;
  font-size: 1rem;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #27ae60;
  font-weight: 600;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name-display {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
}

.btn-remove-file {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e74c3c;
  background: white;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-file:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1);
}

.file-help-text {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-style: italic;
}

.file-input {
  position: relative;
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
  background: #f9f9f9;
  transition: all 0.2s;
}

.file-input:hover {
  border-color: #3498db;
  background: #f0f8ff;
}

.file-input input[type='file'] {
  display: none;
}

.file-input::before {
  content: '📁 Cliquez pour sélectionner un fichier';
  cursor: pointer;
  display: block;
  color: #666;
}

.file-name {
  display: block;
  margin-top: 0.5rem;
  color: #27ae60;
  font-size: 0.9rem;
  font-weight: 600;
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
  margin-top: 2rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
