<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Building2, User, Phone, Mail, MapPin, Hash, CreditCard, X, Globe } from 'lucide-vue-next'
import type { Supplier, SupplierDetail, CreateSupplierDto, UpdateSupplierDto } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { useToast } from '@/composables/useToast'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  fournisseur?: Supplier | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [fournisseur: SupplierDetail]
}>()

const store = useFournisseursStore()
const fieldConfigStore = useFieldConfigStore()
const toast = useToast()

// État
const loading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Mode création ou édition
const isEditMode = computed(() => !!props.fournisseur)

// Données du formulaire
const formData = ref({
  supplier_code: '',
  name: '',
  contact_person: '',
  phone: '',
  mobile: '',
  email: '',
  website: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  tax_id: '',
  bank_account: '',
  rating: undefined as number | undefined,
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

// Générer un code fournisseur séquentiel (FOURN--001, FOURN--002, etc.)
const generateSupplierCode = async () => {
  // S'assurer que la liste des fournisseurs est chargée
  if (store.fournisseurs.length === 0) {
    await store.fetchFournisseurs()
  }

  // Extraire le numéro maximum des codes existants (actifs ou inactifs)
  let maxNumber = 0
  for (const fournisseur of store.fournisseurs) {
    if (fournisseur.supplier_code) {
      // Extraire le numéro du code (ex: "FOURN--042" → 42)
      const match = fournisseur.supplier_code.match(/FOURN--(\d+)/i)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    }
  }

  // Incrémenter le numéro maximum
  const nextNumber = maxNumber + 1

  // Formater avec des zéros (001, 002, etc.)
  formData.value.supplier_code = `FOURN--${nextNumber.toString().padStart(3, '0')}`
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    supplier_code: '',
    name: '',
    contact_person: '',
    phone: '',
    mobile: '',
    email: '',
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
  formError.value = null
  fieldErrors.value = {}
}

// Charger les données en mode édition
watch(
  () => props.open,
  async (newValue) => {
    if (newValue) {
      // Charger les configurations de champs
      await fieldConfigStore.fetchConfigurations()
      
      if (props.fournisseur) {
        // Mode édition : charger les détails
        loading.value = true
        try {
          const detail = await store.fetchFournisseurById(props.fournisseur.id)
          formData.value = {
            supplier_code: detail.supplier_code || '',
            name: detail.name || '',
            contact_person: detail.contact_person || '',
            phone: detail.phone || '',
            mobile: detail.mobile || '',
            email: detail.email || '',
            website: detail.website || '',
            address: detail.address || '',
            city: detail.city || '',
            postal_code: detail.postal_code || '',
            country: detail.country || '',
            tax_id: detail.tax_id || '',
            bank_account: detail.bank_account || '',
            rating: detail.rating || undefined,
            notes: detail.notes || '',
          }
        } catch (e) {
          formError.value = 'Erreur lors du chargement'
        } finally {
          loading.value = false
        }
      } else {
        // Mode création
        resetForm()
        await generateSupplierCode()
      }
    }
  }
)

// Validation du formulaire
const validateForm = (): boolean => {
  fieldErrors.value = {}
  // Validate required fields based on field configurations
  if (formFields.value.name.visible && formFields.value.name.required && !formData.value.name?.trim()) {
    fieldErrors.value.name = 'Le nom est obligatoire'
  }

  if (formFields.value.contact_person.visible && formFields.value.contact_person.required && !formData.value.contact_person?.trim()) {
    fieldErrors.value.contact_person = 'Le contact est obligatoire'
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
    fieldErrors.value.rating = 'La note est obligatoire'
  }

  if (formFields.value.notes.visible && formFields.value.notes.required && !formData.value.notes?.trim()) {
    fieldErrors.value.notes = 'Les notes sont obligatoires'
  }

  const hasErrors = Object.keys(fieldErrors.value).length > 0
  return !hasErrors
}

// Validation (pour computed isFormValid, conservé pour compatibilité)
const isFormValid = computed(() => {
  // Au minimum, le nom doit être rempli
  return formData.value.supplier_code && formData.value.name
})

// Soumission
const handleSubmit = async () => {
  const isValid = validateForm()
  if (!isValid) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  loading.value = true
  formError.value = null

  try {
    if (isEditMode.value && props.fournisseur) {
      // Modification
      const updateData: UpdateSupplierDto = {
        name: formData.value.name,
        contact_person: formData.value.contact_person,
        email: formData.value.email,
        phone: formData.value.phone,
        mobile: formData.value.mobile,
        website: formData.value.website,
        address: formData.value.address,
        city: formData.value.city,
        postal_code: formData.value.postal_code,
        country: formData.value.country,
        tax_id: formData.value.tax_id,
        bank_account: formData.value.bank_account,
        rating: formData.value.rating,
        notes: formData.value.notes,
      }
      const updated = await store.updateFournisseur(props.fournisseur.id, updateData)
      emit('saved', updated)
      handleClose()
    } else {
      // Création
      const createData: CreateSupplierDto = {
        name: formData.value.name,
        supplier_code: formData.value.supplier_code,
        contact_person: formData.value.contact_person,
        email: formData.value.email,
        phone: formData.value.phone,
        mobile: formData.value.mobile,
        website: formData.value.website,
        address: formData.value.address,
        city: formData.value.city,
        postal_code: formData.value.postal_code,
        country: formData.value.country,
        tax_id: formData.value.tax_id,
        bank_account: formData.value.bank_account,
        rating: formData.value.rating,
        notes: formData.value.notes,
      }
      const created = await store.createFournisseur(createData)
      emit('saved', created)
      handleClose()
    }
  } catch (e) {
    formError.value = store.error || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-[450px] p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 pb-3">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Building2 class="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 class="text-lg font-semibold">
            {{ isEditMode ? 'Modifier Fournisseur' : 'Nouveau Fournisseur' }}
          </h2>
        </div>

      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-4 space-y-3">
        <!-- Message d'erreur -->
        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ formError }}
        </div>

        <!-- Code fournisseur -->
        <div class="space-y-2">
          <Label for="supplier_code" class="font-semibold">Code fournisseur :</Label>
          <div class="relative">
            <Hash class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="supplier_code"
              v-model="formData.supplier_code"
              placeholder="FRN-XXXXX"
              class="pl-10 h-10 bg-gray-50 cursor-not-allowed"
              required
              :disabled="true"
              readonly
            />
          </div>
        </div>

        <!-- Nom / Raison sociale -->
        <div class="space-y-2">
          <Label for="name" class="font-semibold">Nom / Raison sociale :</Label>
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : SARL Distribution Plus"
              class="pl-10 h-10"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Contact -->
        <div class="space-y-2">
          <Label for="contact_person" class="font-semibold">Contact :</Label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contact_person"
              v-model="formData.contact_person"
              placeholder="Ex : Jean Dupont"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Téléphone -->
        <div class="space-y-2">
          <Label for="phone" class="font-semibold">Téléphone :</Label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              v-model="formData.phone"
              placeholder="+237 6xx xx xx xx"
              class="pl-10 h-10"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <Label for="email" class="font-semibold">Email :</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Ex : contact@fournisseur.com"
              class="pl-10 h-10"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Localisation -->
        <div class="space-y-2">
          <Label for="city" class="font-semibold">Localisation :</Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              v-model="formData.city"
              placeholder="Ex : Douala, Akwa"
              class="pl-10 h-10"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Compte bancaire -->
        <div class="space-y-2">
          <Label for="supplier_bank_account" class="font-semibold">Compte bancaire :</Label>
          <div class="relative">
            <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="supplier_bank_account"
              v-model="formData.bank_account"
              placeholder="Ex : CM21 10005 00001 12345678901 23"
              class="pl-10 h-10"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          class="w-full h-10 mt-4 text-sm font-semibold"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Enregistrement...' : 'SAUVER' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
