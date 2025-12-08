<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Building2, User, Phone, Mail, MapPin, Hash, CreditCard, X } from 'lucide-vue-next'
import type { Supplier, SupplierDetail, CreateSupplierDto, UpdateSupplierDto } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  fournisseur?: Supplier | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [fournisseur: SupplierDetail]
}>()

const store = useFournisseursStore()

// État
const loading = ref(false)
const formError = ref<string | null>(null)

// Mode création ou édition
const isEditMode = computed(() => !!props.fournisseur)

// Données du formulaire
const formData = ref({
  supplier_code: '',
  supplier_company_name: '',
  first_name: '',
  phone: '',
  email: '',
  city: '',
  supplier_bank_account: '',
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
    supplier_company_name: '',
    first_name: '',
    phone: '',
    email: '',
    city: '',
    supplier_bank_account: '',
  }
  formError.value = null
}

// Charger les données en mode édition
watch(
  () => props.open,
  async (newValue) => {
    if (newValue) {
      if (props.fournisseur) {
        // Mode édition : charger les détails
        loading.value = true
        try {
          const detail = await store.fetchFournisseurById(props.fournisseur.id)
          formData.value = {
            supplier_code: detail.supplier_code || '',
            supplier_company_name: detail.supplier_company_name || '',
            first_name: detail.first_name || '',
            phone: detail.phone || '',
            email: detail.email || '',
            city: detail.city || '',
            supplier_bank_account: detail.supplier_bank_account || '',
          }
        } catch (e) {
          console.error('Erreur chargement:', e)
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

// Validation
const isFormValid = computed(() => {
  return (
    formData.value.supplier_code &&
    formData.value.supplier_company_name &&
    formData.value.email
  )
})

// Soumission
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  formError.value = null

  try {
    if (isEditMode.value && props.fournisseur) {
      // Modification
      const updateData: UpdateSupplierDto = {
        email: formData.value.email,
        first_name: formData.value.first_name,
        phone: formData.value.phone,
        supplier_company_name: formData.value.supplier_company_name,
        supplier_bank_account: formData.value.supplier_bank_account,
        city: formData.value.city,
      }
      const updated = await store.updateFournisseur(props.fournisseur.id, updateData)
      emit('saved', updated)
      handleClose()
    } else {
      // Création - sans mot de passe (optionnel)
      const createData: CreateSupplierDto = {
        email: formData.value.email,
        first_name: formData.value.first_name,
        phone: formData.value.phone,
        is_supplier: true,
        supplier_code: formData.value.supplier_code,
        supplier_company_name: formData.value.supplier_company_name,
        supplier_bank_account: formData.value.supplier_bank_account,
        city: formData.value.city,
      }
      const created = await store.createFournisseur(createData)
      emit('saved', created)
      handleClose()
    }
  } catch (e) {
    formError.value = store.error || 'Une erreur est survenue'
    console.error('Erreur sauvegarde:', e)
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
      <div class="flex items-center justify-between p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
            <Building2 class="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 class="text-xl font-semibold">
            {{ isEditMode ? 'Modifier Fournisseur' : 'Nouveau Fournisseur' }}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-full"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
        <!-- Message d'erreur -->
        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ formError }}
        </div>

        <!-- Nom / Raison sociale -->
        <div class="space-y-2">
          <Label for="supplier_company_name" class="font-semibold">Nom / Raison sociale :</Label>
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="supplier_company_name"
              v-model="formData.supplier_company_name"
              placeholder="Ex : SARL Distribution Plus"
              class="pl-10 h-12"
              required
              :disabled="loading"
            />
          </div>
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
              class="pl-10 h-12"
              required
              :disabled="loading || isEditMode"
            />
          </div>
        </div>

        <!-- Contact -->
        <div class="space-y-2">
          <Label for="first_name" class="font-semibold">Contact :</Label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="first_name"
              v-model="formData.first_name"
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
              class="pl-10 h-12"
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
              class="pl-10 h-12"
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
              class="pl-10 h-12"
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
              v-model="formData.supplier_bank_account"
              placeholder="Ex : CM21 10005 00001 12345678901 23"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          class="w-full h-12 mt-6 text-base font-semibold"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Enregistrement...' : 'SAUVER' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
