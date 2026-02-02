<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Building2, User, Phone, Mail, MapPin, Hash, CreditCard, Globe } from 'lucide-vue-next'
import type { Supplier, SupplierDetail, CreateSupplierDto, UpdateSupplierDto } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { useToast } from '@/composables/useToast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
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
  if (!validateForm()) {
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
        contact_person: formData.value.contact_person || undefined,
        email: formData.value.email || undefined,
        phone: formData.value.phone || undefined,
        mobile: formData.value.mobile || undefined,
        website: formData.value.website || undefined,
        address: formData.value.address || undefined,
        city: formData.value.city || undefined,
        postal_code: formData.value.postal_code || undefined,
        country: formData.value.country || undefined,
        tax_id: formData.value.tax_id || undefined,
        bank_account: formData.value.bank_account || undefined,
        rating: formData.value.rating || undefined,
        notes: formData.value.notes || undefined,
      }
      const updated = await store.updateFournisseur(props.fournisseur.id, updateData)
      emit('saved', updated)
      handleClose()
    } else {
      // Création
      const createData: CreateSupplierDto = {
        name: formData.value.name,
        supplier_code: formData.value.supplier_code,
        contact_person: formData.value.contact_person || undefined,
        email: formData.value.email || undefined,
        phone: formData.value.phone || undefined,
        mobile: formData.value.mobile || undefined,
        website: formData.value.website || undefined,
        address: formData.value.address || undefined,
        city: formData.value.city || undefined,
        postal_code: formData.value.postal_code || undefined,
        country: formData.value.country || undefined,
        tax_id: formData.value.tax_id || undefined,
        bank_account: formData.value.bank_account || undefined,
        rating: formData.value.rating || undefined,
        notes: formData.value.notes || undefined,
      }

      // Nettoyer les valeurs undefined pour éviter de les envoyer
      Object.keys(createData).forEach(key => {
        if (createData[key as keyof CreateSupplierDto] === undefined) {
          delete createData[key as keyof CreateSupplierDto]
        }
      })

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
    <DialogContent class="sm:max-w-[550px] p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <DialogHeader class="p-4 pb-3">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Building2 class="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <DialogTitle class="text-lg font-semibold">
              {{ isEditMode ? 'Modifier Fournisseur' : 'Nouveau Fournisseur' }}
            </DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground">
              {{ isEditMode ? 'Modifiez les informations du fournisseur' : 'Ajoutez un nouveau fournisseur' }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-4 space-y-3">
        <!-- Message d'erreur général -->
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
              placeholder="FOURN--XXX"
              class="pl-10 h-10 bg-gray-50 cursor-not-allowed"
              required
              :disabled="true"
              readonly
            />
          </div>
        </div>

        <!-- Nom / Raison sociale -->
        <div v-if="formFields.name.visible" class="space-y-2">
          <Label for="name" class="font-semibold">
            Nom / Raison sociale <span v-if="formFields.name.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : SARL Distribution Plus"
              :class="['pl-10 h-10', fieldErrors.name ? 'border-red-500' : '']"
              :required="formFields.name.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.name" class="text-sm text-red-500">{{ fieldErrors.name }}</p>
        </div>

        <!-- Contact Person -->
        <div v-if="formFields.contact_person.visible" class="space-y-2">
          <Label for="contact_person" class="font-semibold">
            Contact <span v-if="formFields.contact_person.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="contact_person"
              v-model="formData.contact_person"
              placeholder="Ex : Jean Dupont"
              :class="['pl-10 h-10', fieldErrors.contact_person ? 'border-red-500' : '']"
              :required="formFields.contact_person.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.contact_person" class="text-sm text-red-500">{{ fieldErrors.contact_person }}</p>
        </div>

        <!-- Email -->
        <div v-if="formFields.email.visible" class="space-y-2">
          <Label for="email" class="font-semibold">
            Email <span v-if="formFields.email.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Ex : contact@fournisseur.com"
              :class="['pl-10 h-10', fieldErrors.email ? 'border-red-500' : '']"
              :required="formFields.email.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.email" class="text-sm text-red-500">{{ fieldErrors.email }}</p>
        </div>

        <!-- Téléphone -->
        <div v-if="formFields.phone.visible" class="space-y-2">
          <Label for="phone" class="font-semibold">
            Téléphone <span v-if="formFields.phone.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              v-model="formData.phone"
              placeholder="+237 6xx xx xx xx"
              :class="['pl-10 h-10', fieldErrors.phone ? 'border-red-500' : '']"
              :required="formFields.phone.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.phone" class="text-sm text-red-500">{{ fieldErrors.phone }}</p>
        </div>

        <!-- Mobile -->
        <div v-if="formFields.mobile.visible" class="space-y-2">
          <Label for="mobile" class="font-semibold">
            Mobile <span v-if="formFields.mobile.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="mobile"
              v-model="formData.mobile"
              placeholder="+237 6xx xx xx xx"
              :class="['pl-10 h-10', fieldErrors.mobile ? 'border-red-500' : '']"
              :required="formFields.mobile.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.mobile" class="text-sm text-red-500">{{ fieldErrors.mobile }}</p>
        </div>

        <!-- Website -->
        <div v-if="formFields.website.visible" class="space-y-2">
          <Label for="website" class="font-semibold">
            Site web <span v-if="formFields.website.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="website"
              v-model="formData.website"
              placeholder="https://www.exemple.com"
              :class="['pl-10 h-10', fieldErrors.website ? 'border-red-500' : '']"
              :required="formFields.website.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.website" class="text-sm text-red-500">{{ fieldErrors.website }}</p>
        </div>

        <!-- Address -->
        <div v-if="formFields.address.visible" class="space-y-2">
          <Label for="address" class="font-semibold">
            Adresse <span v-if="formFields.address.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="address"
              v-model="formData.address"
              placeholder="Ex : 123 Rue de la République"
              :class="['pl-10 min-h-[80px]', fieldErrors.address ? 'border-red-500' : '']"
              :required="formFields.address.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.address" class="text-sm text-red-500">{{ fieldErrors.address }}</p>
        </div>

        <!-- City -->
        <div v-if="formFields.city.visible" class="space-y-2">
          <Label for="city" class="font-semibold">
            Ville <span v-if="formFields.city.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              v-model="formData.city"
              placeholder="Ex : Douala"
              :class="['pl-10 h-10', fieldErrors.city ? 'border-red-500' : '']"
              :required="formFields.city.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.city" class="text-sm text-red-500">{{ fieldErrors.city }}</p>
        </div>

        <!-- Postal Code -->
        <div v-if="formFields.postal_code.visible" class="space-y-2">
          <Label for="postal_code" class="font-semibold">
            Code postal <span v-if="formFields.postal_code.required" class="text-red-500">*</span>
          </Label>
          <Input
            id="postal_code"
            v-model="formData.postal_code"
            placeholder="Ex : BP 1234"
            :class="['h-10', fieldErrors.postal_code ? 'border-red-500' : '']"
            :required="formFields.postal_code.required"
            :disabled="loading"
          />
          <p v-if="fieldErrors.postal_code" class="text-sm text-red-500">{{ fieldErrors.postal_code }}</p>
        </div>

        <!-- Country -->
        <div v-if="formFields.country.visible" class="space-y-2">
          <Label for="country" class="font-semibold">
            Pays <span v-if="formFields.country.required" class="text-red-500">*</span>
          </Label>
          <Input
            id="country"
            v-model="formData.country"
            placeholder="Ex : Cameroun"
            :class="['h-10', fieldErrors.country ? 'border-red-500' : '']"
            :required="formFields.country.required"
            :disabled="loading"
          />
          <p v-if="fieldErrors.country" class="text-sm text-red-500">{{ fieldErrors.country }}</p>
        </div>

        <!-- Tax ID -->
        <div v-if="formFields.tax_id.visible" class="space-y-2">
          <Label for="tax_id" class="font-semibold">
            Numéro fiscal <span v-if="formFields.tax_id.required" class="text-red-500">*</span>
          </Label>
          <Input
            id="tax_id"
            v-model="formData.tax_id"
            placeholder="Ex : M012345678901N"
            :class="['h-10', fieldErrors.tax_id ? 'border-red-500' : '']"
            :required="formFields.tax_id.required"
            :disabled="loading"
          />
          <p v-if="fieldErrors.tax_id" class="text-sm text-red-500">{{ fieldErrors.tax_id }}</p>
        </div>

        <!-- Compte bancaire -->
        <div v-if="formFields.bank_account.visible" class="space-y-2">
          <Label for="bank_account" class="font-semibold">
            Compte bancaire <span v-if="formFields.bank_account.required" class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="bank_account"
              v-model="formData.bank_account"
              placeholder="Ex : CM21 10005 00001 12345678901 23"
              :class="['pl-10 h-10', fieldErrors.bank_account ? 'border-red-500' : '']"
              :required="formFields.bank_account.required"
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.bank_account" class="text-sm text-red-500">{{ fieldErrors.bank_account }}</p>
        </div>

        <!-- Notes -->
        <div v-if="formFields.notes.visible" class="space-y-2">
          <Label for="notes" class="font-semibold">
            Notes <span v-if="formFields.notes.required" class="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires..."
            :class="['min-h-[80px]', fieldErrors.notes ? 'border-red-500' : '']"
            :required="formFields.notes.required"
            :disabled="loading"
          />
          <p v-if="fieldErrors.notes" class="text-sm text-red-500">{{ fieldErrors.notes }}</p>
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
