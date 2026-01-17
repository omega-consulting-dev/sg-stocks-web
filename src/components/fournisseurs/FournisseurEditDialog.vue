<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Supplier, CreateSupplierDto } from '@/stores/fournisseurs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useFieldConfigStore } from '@/stores/field-config.store'

const props = defineProps<{
  open: boolean
  supplier?: Supplier | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateSupplierDto]
}>()

const fieldConfigStore = useFieldConfigStore()
const fieldErrors = ref<Record<string, string>>({})

// État du formulaire
const formData = ref<CreateSupplierDto>({
  name: '',
  supplier_code: '',
  contact_person: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  tax_id: '',
  bank_account: '',
  rating: undefined,
  notes: '',
})

// Computed property for form fields visibility and requirements
const formFields = computed(() => {
  const configsByForm = fieldConfigStore.getConfigsByForm()
  const configs = configsByForm['supplier'] || []
  return {
    name: {
      visible: configs.find(c => c.field_name === 'name')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'name')?.is_required ?? true
    },
    contact_person: {
      visible: configs.find(c => c.field_name === 'contact_person')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'contact_person')?.is_required ?? false
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
    website: {
      visible: configs.find(c => c.field_name === 'website')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'website')?.is_required ?? false
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
    tax_id: {
      visible: configs.find(c => c.field_name === 'tax_id')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'tax_id')?.is_required ?? false
    },
    bank_account: {
      visible: configs.find(c => c.field_name === 'bank_account')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'bank_account')?.is_required ?? false
    },
    rating: {
      visible: configs.find(c => c.field_name === 'rating')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'rating')?.is_required ?? false
    },
    notes: {
      visible: configs.find(c => c.field_name === 'notes')?.is_visible ?? true,
      required: configs.find(c => c.field_name === 'notes')?.is_required ?? false
    },
  }
})

// Réinitialiser le formulaire quand on ouvre/ferme ou change de fournisseur
watch([() => props.open, () => props.supplier], async ([isOpen, supplier]) => {
  if (isOpen) {
    // Fetch field configurations
    await fieldConfigStore.fetchConfigurations()

    if (supplier) {
      // Mode édition - remplir avec les données du fournisseur
      formData.value = {
        name: supplier.name,
        supplier_code: supplier.supplier_code,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        mobile: supplier.mobile || '',
        website: supplier.website || '',
        address: supplier.address || '',
        city: supplier.city || '',
        postal_code: supplier.postal_code || '',
        country: supplier.country || '',
        tax_id: supplier.tax_id || '',
        bank_account: supplier.bank_account || '',
        rating: supplier.rating || undefined,
        notes: supplier.notes || '',
      }
    } else {
      // Mode création - formulaire vide
      formData.value = {
        name: '',
        supplier_code: '',
        contact_person: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        tax_id: '',
        bank_account: '',
        rating: undefined,
        notes: '',
      }
    }
  }
  fieldErrors.value = {}
})

const dialogTitle = computed(() => {
  return props.supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'
})

const validateForm = (): boolean => {
  fieldErrors.value = {}

  // Validate required fields based on field configurations
  if (formFields.value.name.visible && formFields.value.name.required && !formData.value.name?.trim()) {
    fieldErrors.value.name = 'Le nom est obligatoire'
  }

  if (formFields.value.contact_person.visible && formFields.value.contact_person.required && !formData.value.contact_person?.trim()) {
    fieldErrors.value.contact_person = 'Le contact principal est obligatoire'
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

  if (formFields.value.website.visible && formFields.value.website.required && !formData.value.website?.trim()) {
    fieldErrors.value.website = 'Le site web est obligatoire'
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

  if (formFields.value.tax_id.visible && formFields.value.tax_id.required && !formData.value.tax_id?.trim()) {
    fieldErrors.value.tax_id = 'Le numéro fiscal est obligatoire'
  }

  if (formFields.value.bank_account.visible && formFields.value.bank_account.required && !formData.value.bank_account?.trim()) {
    fieldErrors.value.bank_account = 'Le compte bancaire est obligatoire'
  }

  if (formFields.value.rating.visible && formFields.value.rating.required && !formData.value.rating) {
    fieldErrors.value.rating = 'L\'évaluation est obligatoire'
  }

  return Object.keys(fieldErrors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  emit('submit', formData.value)
  fieldErrors.value = {}
}

const handleClose = () => {
  emit('update:open', false)
  fieldErrors.value = {}
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ supplier ? 'Modifiez les informations du fournisseur' : 'Ajoutez un nouveau fournisseur' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nom -->
          <div v-if="formFields.name.visible" class="space-y-2">
            <Label for="name">
              Raison sociale
              <span v-if="formFields.name.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Nom de l'entreprise"
              :class="{ 'border-red-500': fieldErrors.name }"
            />
            <p v-if="fieldErrors.name" class="text-sm text-red-500">
              {{ fieldErrors.name }}
            </p>
          </div>

          <!-- Code fournisseur -->
          <div class="space-y-2">
            <Label for="supplier_code">Code fournisseur *</Label>
            <Input
              id="supplier_code"
              v-model="formData.supplier_code"
              placeholder="Ex: FOURG001"
              :disabled="!!supplier"
              :class="{ 'bg-gray-50': !!supplier }"
            />
          </div>

          <!-- Personne de contact -->
          <div v-if="formFields.contact_person.visible" class="space-y-2">
            <Label for="contact_person">
              Personne de contact
              <span v-if="formFields.contact_person.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="contact_person"
              v-model="formData.contact_person"
              placeholder="Nom de la personne"
              :class="{ 'border-red-500': fieldErrors.contact_person }"
            />
            <p v-if="fieldErrors.contact_person" class="text-sm text-red-500">
              {{ fieldErrors.contact_person }}
            </p>
          </div>

          <!-- Email -->
          <div v-if="formFields.email.visible" class="space-y-2">
            <Label for="email">
              Email
              <span v-if="formFields.email.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="email@exemple.com"
              :class="{ 'border-red-500': fieldErrors.email }"
            />
            <p v-if="fieldErrors.email" class="text-sm text-red-500">
              {{ fieldErrors.email }}
            </p>
          </div>

          <!-- Téléphone -->
          <div v-if="formFields.phone.visible" class="space-y-2">
            <Label for="phone">
              Téléphone
              <span v-if="formFields.phone.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              v-model="formData.phone"
              placeholder="+237 6XX XXX XXX"
              :class="{ 'border-red-500': fieldErrors.phone }"
            />
            <p v-if="fieldErrors.phone" class="text-sm text-red-500">
              {{ fieldErrors.phone }}
            </p>
          </div>

          <!-- Mobile -->
          <div v-if="formFields.mobile.visible" class="space-y-2">
            <Label for="mobile">
              Mobile
              <span v-if="formFields.mobile.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="mobile"
              v-model="formData.mobile"
              placeholder="+237 6XX XXX XXX"
              :class="{ 'border-red-500': fieldErrors.mobile }"
            />
            <p v-if="fieldErrors.mobile" class="text-sm text-red-500">
              {{ fieldErrors.mobile }}
            </p>
          </div>

          <!-- Site web -->
          <div v-if="formFields.website.visible" class="space-y-2">
            <Label for="website">
              Site web
              <span v-if="formFields.website.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="website"
              v-model="formData.website"
              type="url"
              placeholder="https://example.com"
              :class="{ 'border-red-500': fieldErrors.website }"
            />
            <p v-if="fieldErrors.website" class="text-sm text-red-500">
              {{ fieldErrors.website }}
            </p>
          </div>

          <!-- Ville -->
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

          <!-- Code postal -->
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

          <!-- Pays -->
          <div v-if="formFields.country.visible" class="space-y-2">
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

          <!-- Numéro fiscal -->
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

          <!-- Compte bancaire -->
          <div v-if="formFields.bank_account.visible" class="space-y-2">
            <Label for="bank_account">
              Compte bancaire
              <span v-if="formFields.bank_account.required" class="text-red-500">*</span>
            </Label>
            <Input
              id="bank_account"
              v-model="formData.bank_account"
              placeholder="Numéro de compte"
              :class="{ 'border-red-500': fieldErrors.bank_account }"
            />
            <p v-if="fieldErrors.bank_account" class="text-sm text-red-500">
              {{ fieldErrors.bank_account }}
            </p>
          </div>

          <!-- Rating -->
          <div v-if="formFields.rating.visible" class="space-y-2">
            <Label for="rating">
              Évaluation
              <span v-if="formFields.rating.required" class="text-red-500">*</span>
            </Label>
            <Select v-model="formData.rating">
              <SelectTrigger :class="{ 'border-red-500': fieldErrors.rating }">
                <SelectValue placeholder="Sélectionnez une note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="1">⭐</SelectItem>
                <SelectItem :value="2">⭐⭐</SelectItem>
                <SelectItem :value="3">⭐⭐⭐</SelectItem>
                <SelectItem :value="4">⭐⭐⭐⭐</SelectItem>
                <SelectItem :value="5">⭐⭐⭐⭐⭐</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="fieldErrors.rating" class="text-sm text-red-500">
              {{ fieldErrors.rating }}
            </p>
          </div>
        </div>

        <!-- Adresse (pleine largeur) -->
        <div v-if="formFields.address.visible" class="space-y-2">
          <Label for="address">
            Adresse complète
            <span v-if="formFields.address.required" class="text-red-500">*</span>
          </Label>
          <Textarea
            id="address"
            v-model="formData.address"
            placeholder="Adresse du fournisseur"
            rows="2"
            :class="{ 'border-red-500': fieldErrors.address }"
          />
          <p v-if="fieldErrors.address" class="text-sm text-red-500">
            {{ fieldErrors.address }}
          </p>
        </div>

        <!-- Notes (pleine largeur) -->
        <div v-if="formFields.notes.visible" class="space-y-2">
          <Label for="notes">
            Notes
            <span v-if="formFields.notes.required" class="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires"
            rows="3"
            :class="{ 'border-red-500': fieldErrors.notes }"
          />
          <p v-if="fieldErrors.notes" class="text-sm text-red-500">
            {{ fieldErrors.notes }}
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="handleClose">
            Annuler
          </Button>
          <Button type="submit">
            {{ supplier ? 'Modifier' : 'Créer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
