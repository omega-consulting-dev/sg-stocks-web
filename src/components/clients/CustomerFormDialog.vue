<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Customer, CreateCustomerData } from '@/services/api/customers.api'
import { useCustomersStore } from '@/stores/customers.store'
import { useFieldConfigStore } from '@/stores/field-config.store'

interface Props {
  open: boolean
  customer?: Customer | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const store = useCustomersStore()
const fieldConfigStore = useFieldConfigStore()
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const fieldErrors = ref<Record<string, string>>({})

const formData = ref<CreateCustomerData>({
  customer_code: '',
  name: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'Cameroun',
  billing_address: '',
  tax_id: '',
  payment_term: 'immediate',
  credit_limit: 0,
  notes: '',
  is_active: true
})

const isEditing = computed(() => !!props.customer)

const dialogTitle = computed(() =>
  isEditing.value ? 'Modifier le client' : 'Nouveau client'
)

// Computed property for form fields visibility and requirements
const formFields = computed(() => {
  const configsByForm = fieldConfigStore.getConfigsByForm()
  const configs = configsByForm['customer'] || []
  return {
    name: {
      visible: configs.find(c => c.field_name === 'name')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'name')?.is_required ?? true
    },
    email: {
      visible: configs.find(c => c.field_name === 'email')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'email')?.is_required ?? false
    },
    phone: {
      visible: configs.find(c => c.field_name === 'phone')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'phone')?.is_required ?? false
    },
    mobile: {
      visible: configs.find(c => c.field_name === 'mobile')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'mobile')?.is_required ?? false
    },
    address: {
      visible: configs.find(c => c.field_name === 'address')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'address')?.is_required ?? false
    },
    city: {
      visible: configs.find(c => c.field_name === 'city')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'city')?.is_required ?? false
    },
    postal_code: {
      visible: configs.find(c => c.field_name === 'postal_code')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'postal_code')?.is_required ?? false
    },
    country: {
      visible: configs.find(c => c.field_name === 'country')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'country')?.is_required ?? false
    },
    billing_address: {
      visible: configs.find(c => c.field_name === 'billing_address')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'billing_address')?.is_required ?? false
    },
    tax_id: {
      visible: configs.find(c => c.field_name === 'tax_id')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'tax_id')?.is_required ?? false
    },
    payment_term: {
      visible: configs.find(c => c.field_name === 'payment_term')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'payment_term')?.is_required ?? false
    },
    credit_limit: {
      visible: configs.find(c => c.field_name === 'credit_limit')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'credit_limit')?.is_required ?? false
    },
    notes: {
      visible: configs.find(c => c.field_name === 'notes')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'notes')?.is_required ?? false
    },
  }
})

// Watchers
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      // Fetch field configurations
      await fieldConfigStore.fetchConfigurations()

      if (props.customer) {
        // Mode édition
        formData.value = {
          customer_code: props.customer.customer_code,
          name: props.customer.name,
          email: props.customer.email || '',
          phone: props.customer.phone || '',
          mobile: props.customer.mobile || '',
          address: props.customer.address || '',
          city: props.customer.city || '',
          postal_code: props.customer.postal_code || '',
          country: props.customer.country || 'Cameroun',
          billing_address: props.customer.billing_address || '',
          tax_id: props.customer.tax_id || '',
          payment_term: props.customer.payment_term,
          credit_limit: props.customer.credit_limit,
          notes: props.customer.notes || '',
          is_active: props.customer.is_active
        }
      } else {
        // Mode création
        resetForm()
        await generateCustomerCode()
      }
    }
    errors.value = {}
    fieldErrors.value = {}
  }
)

const resetForm = () => {
  formData.value = {
    customer_code: '',
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Cameroun',
    billing_address: '',
    tax_id: '',
    payment_term: 'immediate',
    credit_limit: 0,
    notes: '',
    is_active: true
  }
}

// Générer un code client séquentiel (CLI00001, CLI00002, etc.)
const generateCustomerCode = async () => {
  // Ne plus générer le code côté frontend
  // Le backend va le générer automatiquement en utilisant le comptage global
  // Cela évite les conflits pour les utilisateurs avec access_scope='own' qui ne voient pas tous les clients
  formData.value.customer_code = ''
}

const validateForm = (): boolean => {
  fieldErrors.value = {}

  // Validate required fields based on field configurations
  if (formFields.value.name.visible && formFields.value.name.required && !formData.value.name?.trim()) {
    fieldErrors.value.name = 'Le nom est obligatoire'
  }

  if (formFields.value.email.visible && formFields.value.email.required && !formData.value.email?.trim()) {
    fieldErrors.value.email = 'L\'email est obligatoire'
  }

  if (formFields.value.phone.visible && formFields.value.phone.required && !formData.value.phone?.trim()) {
    fieldErrors.value.phone = 'Le téléphone est obligatoire'
  }

  if (formFields.value.mobile.visible && formFields.value.mobile.required && !formData.value.mobile?.trim()) {
    fieldErrors.value.mobile = 'Le mobile est obligatoire'
  }

  if (formFields.value.address.visible && formFields.value.address.required && !formData.value.address?.trim()) {
    fieldErrors.value.address = 'L\'adresse est obligatoire'
  }

  if (formFields.value.city.visible && formFields.value.city.required && !formData.value.city?.trim()) {
    fieldErrors.value.city = 'La ville est obligatoire'
  }

  if (formFields.value.postal_code.visible && formFields.value.postal_code.required && !formData.value.postal_code?.trim()) {
    fieldErrors.value.postal_code = 'Le code postal est obligatoire'
  }

  if (formFields.value.country.visible && formFields.value.country.required && !formData.value.country?.trim()) {
    fieldErrors.value.country = 'Le pays est obligatoire'
  }

  if (formFields.value.billing_address.visible && formFields.value.billing_address.required && !formData.value.billing_address?.trim()) {
    fieldErrors.value.billing_address = 'L\'adresse de facturation est obligatoire'
  }

  if (formFields.value.tax_id.visible && formFields.value.tax_id.required && !formData.value.tax_id?.trim()) {
    fieldErrors.value.tax_id = 'Le numéro fiscal est obligatoire'
  }

  if (formFields.value.payment_term.visible && formFields.value.payment_term.required && !formData.value.payment_term) {
    fieldErrors.value.payment_term = 'Les conditions de paiement sont obligatoires'
  }

  if (formFields.value.credit_limit.visible && formFields.value.credit_limit.required && !formData.value.credit_limit) {
    fieldErrors.value.credit_limit = 'La limite de crédit est obligatoire'
  }

  if (formFields.value.notes.visible && formFields.value.notes.required && !formData.value.notes?.trim()) {
    fieldErrors.value.notes = 'Les notes sont obligatoires'
  }

  // Validation supplémentaire pour credit_limit
  if (formData.value.credit_limit && formData.value.credit_limit < 0) {
    fieldErrors.value.credit_limit = 'La limite de crédit doit être positive'
  }

  const hasErrors = Object.keys(fieldErrors.value).length > 0

  return !hasErrors
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  isLoading.value = true
  errors.value = {}
  fieldErrors.value = {}

  try {
    if (isEditing.value && props.customer) {
      // Mode modification
      await store.updateCustomer(props.customer.id, formData.value)
    } else {
      // Mode création - toujours actif par défaut
      await store.createCustomer({
        ...formData.value,
        is_active: true
      })
    }

    emit('saved')
    emit('update:open', false)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errors.value.submit = err.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
  resetForm()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client à votre base' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" novalidate class="space-y-6">
        <!-- Informations de base -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Informations de base</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="customer_code">Code client</Label>
              <Input
                id="customer_code"
                v-model="formData.customer_code"
                placeholder="Auto-généré"
                disabled
                class="bg-gray-50"
              />
            </div>

            <div v-if="formFields.name.visible" class="space-y-2">
              <Label for="name">
                Nom / Raison sociale
                <span v-if="formFields.name.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Nom du client"
                :class="{ 'border-red-500': fieldErrors.name }"
              />
              <p v-if="fieldErrors.name" class="text-sm text-red-500">
                {{ fieldErrors.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Contact</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="formFields.email.visible" class="space-y-2">
              <Label for="email">
                Email
                <span v-if="formFields.email.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="client@example.com"
                :class="{ 'border-red-500': fieldErrors.email }"
              />
              <p v-if="fieldErrors.email" class="text-sm text-red-500">
                {{ fieldErrors.email }}
              </p>
            </div>

            <div v-if="formFields.phone.visible" class="space-y-2">
              <Label for="phone">
                Téléphone
                <span v-if="formFields.phone.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+237 6XX XX XX XX"
                :class="{ 'border-red-500': fieldErrors.phone }"
              />
              <p v-if="fieldErrors.phone" class="text-sm text-red-500">
                {{ fieldErrors.phone }}
              </p>
            </div>

            <div v-if="formFields.mobile.visible" class="space-y-2">
              <Label for="mobile">
                Mobile
                <span v-if="formFields.mobile.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="mobile"
                v-model="formData.mobile"
                placeholder="+237 6XX XX XX XX"
                :class="{ 'border-red-500': fieldErrors.mobile }"
              />
              <p v-if="fieldErrors.mobile" class="text-sm text-red-500">
                {{ fieldErrors.mobile }}
              </p>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Adresse</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="formFields.address.visible" class="space-y-2 col-span-2">
              <Label for="address">
                Adresse
                <span v-if="formFields.address.required" class="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                v-model="formData.address"
                placeholder="Adresse complète"
                rows="2"
                :class="{ 'border-red-500': fieldErrors.address }"
              />
              <p v-if="fieldErrors.address" class="text-sm text-red-500">
                {{ fieldErrors.address }}
              </p>
            </div>

            <div v-if="formFields.city.visible" class="space-y-2">
              <Label for="city">
                Ville
                <span v-if="formFields.city.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                v-model="formData.city"
                placeholder="Ville"
                :class="{ 'border-red-500': fieldErrors.city }"
              />
              <p v-if="fieldErrors.city" class="text-sm text-red-500">
                {{ fieldErrors.city }}
              </p>
            </div>

            <div v-if="formFields.postal_code.visible" class="space-y-2">
              <Label for="postal_code">
                Code postal
                <span v-if="formFields.postal_code.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="postal_code"
                v-model="formData.postal_code"
                placeholder="Code postal"
                :class="{ 'border-red-500': fieldErrors.postal_code }"
              />
              <p v-if="fieldErrors.postal_code" class="text-sm text-red-500">
                {{ fieldErrors.postal_code }}
              </p>
            </div>

            <div v-if="formFields.country.visible" class="space-y-2 col-span-2">
              <Label for="country">
                Pays
                <span v-if="formFields.country.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                v-model="formData.country"
                placeholder="Pays"
                :class="{ 'border-red-500': fieldErrors.country }"
              />
              <p v-if="fieldErrors.country" class="text-sm text-red-500">
                {{ fieldErrors.country }}
              </p>
            </div>
          </div>
        </div>

        <!-- Facturation -->
        <div class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div v-if="formFields.billing_address.visible" class="space-y-2 col-span-2">
              <Label for="billing_address">
                Adresse de facturation
                <span v-if="formFields.billing_address.required" class="text-red-500">*</span>
              </Label>
              <Textarea
                id="billing_address"
                v-model="formData.billing_address"
                placeholder="Adresse de facturation (si différente)"
                rows="2"
                :class="{ 'border-red-500': fieldErrors.billing_address }"
              />
              <p v-if="fieldErrors.billing_address" class="text-sm text-red-500">
                {{ fieldErrors.billing_address }}
              </p>
            </div>

            <div v-if="formFields.tax_id.visible" class="space-y-2">
              <Label for="tax_id">
                Numéro fiscal
                <span v-if="formFields.tax_id.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="tax_id"
                v-model="formData.tax_id"
                placeholder="Numéro fiscal"
                :class="{ 'border-red-500': fieldErrors.tax_id }"
              />
              <p v-if="fieldErrors.tax_id" class="text-sm text-red-500">
                {{ fieldErrors.tax_id }}
              </p>
            </div>
          </div>
        </div>        <!-- Conditions commerciales -->
        <div class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div v-if="formFields.payment_term.visible" class="space-y-2">
              <Label for="payment_term">
                Conditions de paiement
                <span v-if="formFields.payment_term.required" class="text-red-500">*</span>
              </Label>
              <Select v-model="formData.payment_term">
                <SelectTrigger id="payment_term" :class="{ 'border-red-500': fieldErrors.payment_term }">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Comptant</SelectItem>
                  <SelectItem value="15_days">15 jours</SelectItem>
                  <SelectItem value="30_days">30 jours</SelectItem>
                  <SelectItem value="60_days">60 jours</SelectItem>
                  <SelectItem value="90_days">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="fieldErrors.payment_term" class="text-sm text-red-500">
                {{ fieldErrors.payment_term }}
              </p>
            </div>

            <div v-if="formFields.credit_limit.visible" class="space-y-2">
              <Label for="credit_limit">
                Limite de crédit (FCFA)
                <span v-if="formFields.credit_limit.required" class="text-red-500">*</span>
              </Label>
              <Input
                id="credit_limit"
                v-model.number="formData.credit_limit"
                type="number"
                min="0"
                placeholder="0"
                :class="{ 'border-red-500': fieldErrors.credit_limit }"
              />
              <p v-if="fieldErrors.credit_limit" class="text-sm text-red-500">
                {{ fieldErrors.credit_limit }}
              </p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="formFields.notes.visible" class="space-y-2">
          <Label for="notes">
            Notes
            <span v-if="formFields.notes.required" class="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires..."
            rows="3"
            :class="{ 'border-red-500': fieldErrors.notes }"
          />
          <p v-if="fieldErrors.notes" class="text-sm text-red-500">
            {{ fieldErrors.notes }}
          </p>
        </div>

        <div v-if="errors.submit" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ errors.submit }}</p>
        </div>

        <!-- Actions -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel" :disabled="isLoading">
            Annuler
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading">Enregistrement...</span>
            <span v-else>{{ isEditing ? 'Mettre à jour' : 'Créer' }}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
