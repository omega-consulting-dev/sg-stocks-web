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
import { Switch } from '@/components/ui/switch'
import type { Customer, CreateCustomerData, PaymentTerm } from '@/services/api/customers.api'
import { useCustomersStore } from '@/stores/customers.store'

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
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

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

// Watchers
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.customer) {
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
    } else if (isOpen) {
      // Mode création
      resetForm()
      await generateCustomerCode()
    }
    errors.value = {}
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
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom est obligatoire'
  }

  if (formData.value.credit_limit && formData.value.credit_limit < 0) {
    errors.value.credit_limit = 'La limite de crédit doit être positive'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errors.value = {}

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
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error)
    errors.value.submit = error.response?.data?.message || 'Erreur lors de l\'enregistrement'
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

      <form @submit.prevent="handleSubmit" class="space-y-6">
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

            <div class="space-y-2">
              <Label for="name">Nom / Raison sociale *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Nom du client"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-sm text-red-500">
                {{ errors.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Contact</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="client@example.com"
              />
            </div>

            <div class="space-y-2">
              <Label for="phone">Téléphone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+237 6XX XX XX XX"
              />
            </div>

            <div class="space-y-2">
              <Label for="mobile">Mobile</Label>
              <Input
                id="mobile"
                v-model="formData.mobile"
                placeholder="+237 6XX XX XX XX"
              />
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Adresse</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 col-span-2">
              <Label for="address">Adresse</Label>
              <Textarea
                id="address"
                v-model="formData.address"
                placeholder="Adresse complète"
                rows="2"
              />
            </div>

            <div class="space-y-2">
              <Label for="city">Ville</Label>
              <Input
                id="city"
                v-model="formData.city"
                placeholder="Ville"
              />
            </div>

            <div class="space-y-2">
              <Label for="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                v-model="formData.postal_code"
                placeholder="Code postal"
              />
            </div>

            <div class="space-y-2 col-span-2">
              <Label for="country">Pays</Label>
              <Input
                id="country"
                v-model="formData.country"
                placeholder="Pays"
              />
            </div>
          </div>
        </div>

        <!-- Facturation -->
        <div class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 col-span-2">
              <Label for="billing_address">Adresse de facturation</Label>
              <Textarea
                id="billing_address"
                v-model="formData.billing_address"
                placeholder="Adresse de facturation (si différente)"
                rows="2"
              />
            </div>

            <div class="space-y-2">
              <Label for="tax_id">Numéro fiscal</Label>
              <Input
                id="tax_id"
                v-model="formData.tax_id"
                placeholder="Numéro fiscal"
              />
            </div>
          </div>
        </div>        <!-- Conditions commerciales -->
        <div class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="payment_term">Conditions de paiement</Label>
              <Select v-model="formData.payment_term">
                <SelectTrigger id="payment_term">
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
            </div>

            <div class="space-y-2">
              <Label for="credit_limit">Limite de crédit (FCFA)</Label>
              <Input
                id="credit_limit"
                v-model.number="formData.credit_limit"
                type="number"
                min="0"
                placeholder="0"
                :class="{ 'border-red-500': errors.credit_limit }"
              />
              <p v-if="errors.credit_limit" class="text-sm text-red-500">
                {{ errors.credit_limit }}
              </p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires..."
            rows="3"
          />
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
