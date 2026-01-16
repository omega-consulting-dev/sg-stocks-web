<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Store as StoreIcon, MapPin, Phone, Mail, Building2 } from 'lucide-vue-next'
import type { Store, StoreCreateData, StoreUpdateData } from '@/types/store.types'
import { useStoresStore } from '@/stores/stores.store'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

defineOptions({ name: 'StoreEditForm' })

const props = defineProps<{
  open: boolean
  store?: Store | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [store: Store]
}>()

const storesStore = useStoresStore()

// État
const loading = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Mode création ou édition
const isEditMode = computed(() => !!props.store)

// Données du formulaire
const formData = ref({
  code: '',
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  store_type: 'retail' as 'retail' | 'warehouse' | 'both',
  is_active: true
})

// Générer un code store séquentiel (PDV001, PDV002, etc.)
const generateStoreCode = async () => {
  // S'assurer que la liste des stores est chargée
  if (storesStore.stores.length === 0) {
    await storesStore.fetchStores()
  }

  // Extraire le numéro maximum des codes existants (actifs ou inactifs)
  let maxNumber = 0
  for (const store of storesStore.stores) {
    if (store.code) {
      // Extraire le numéro du code (ex: "STR-001" → 1)
      const match = store.code.match(/STR-(\d+)/i)
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
  formData.value.code = `STR-${nextNumber.toString().padStart(3, '0')}`
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    store_type: 'retail',
    is_active: true
  }
  formError.value = null
  fieldErrors.value = {}
}

// Charger les données en mode édition
watch(
  () => props.open,
  async (newValue) => {
    if (newValue) {
      if (props.store) {
        // Mode édition : charger les détails
        loading.value = true
        try {
          const detail = await storesStore.fetchStore(props.store.id)
          if (detail) {
            formData.value = {
              code: detail.code || '',
              name: detail.name || '',
              address: detail.address || '',
              city: detail.city || '',
              phone: detail.phone || '',
              email: detail.email || '',
              store_type: detail.store_type || 'retail',
              is_active: detail.is_active ?? true
            }
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
        await generateStoreCode()
      }
    }
  }
)

// Validation
const isFormValid = computed(() => {
  return (
    formData.value.code &&
    formData.value.name &&
    formData.value.city
  )
})

// Soumission
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  formError.value = null
  fieldErrors.value = {}

  try {
    if (isEditMode.value && props.store) {
      // Modification
      const updateData: StoreUpdateData = {
        name: formData.value.name,
        address: formData.value.address,
        city: formData.value.city,
        phone: formData.value.phone,
        email: formData.value.email,
        store_type: formData.value.store_type,
        is_active: formData.value.is_active
      }
      const updated = await storesStore.updateStore(props.store.id, updateData)
      emit('saved', updated)
      handleClose()
    } else {
      // Création
      const createData: StoreCreateData = {
        code: formData.value.code,
        name: formData.value.name,
        address: formData.value.address,
        city: formData.value.city,
        phone: formData.value.phone,
        email: formData.value.email,
        store_type: formData.value.store_type,
        is_active: formData.value.is_active
      }
      const created = await storesStore.createStore(createData)
      emit('saved', created)
      handleClose()
    }
  } catch (e) {
    console.error('Erreur sauvegarde:', e)

    const error = e as { response?: { data?: Record<string, unknown> } }

    // Extraire les erreurs de validation par champ
    if (error.response?.data) {
      const errors = error.response.data

      // Si c'est un objet avec des erreurs par champ
      if (typeof errors === 'object' && !Array.isArray(errors)) {
        fieldErrors.value = {}
        for (const [field, messages] of Object.entries(errors)) {
          if (Array.isArray(messages)) {
            fieldErrors.value[field] = messages[0]
          } else if (typeof messages === 'string') {
            fieldErrors.value[field] = messages
          }
        }

        // Si des erreurs de champs sont présentes, afficher un message général
        if (Object.keys(fieldErrors.value).length > 0) {
          formError.value = 'Veuillez corriger les erreurs dans le formulaire'
        } else {
          formError.value = storesStore.error || 'Une erreur est survenue'
        }
      } else {
        formError.value = storesStore.error || 'Une erreur est survenue'
      }
    } else {
      formError.value = storesStore.error || 'Une erreur est survenue'
    }
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
        <div class="flex items-center gap-2">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <StoreIcon class="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 class="text-lg font-semibold">
            {{ isEditMode ? 'Modifier Magasin' : 'Nouveau Magasin' }}
          </h2>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-4 pb-4 space-y-3">
        <!-- Message d'erreur -->
        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ formError }}
        </div>

        <!-- Code magasin -->
        <div class="space-y-1">
          <Label for="code" class="text-sm font-medium">Code magasin <span class="text-red-500">*</span></Label>
          <div class="relative">
            <Input
              id="code"
              v-model="formData.code"
              placeholder="STR-001"
              :class="['h-10 bg-muted', fieldErrors.code ? 'border-red-500' : '']"
              required
              readonly
            />
          </div>
          <p v-if="fieldErrors.code" class="text-xs text-red-500 mt-1">{{ fieldErrors.code }}</p>
        </div>

        <!-- Nom -->
        <div class="space-y-1">
          <Label for="name" class="text-sm font-medium">Nom du magasin <span class="text-red-500">*</span></Label>
          <div class="relative">
            <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : Boutique Centre-Ville"
              :class="['pl-10 h-10', fieldErrors.name ? 'border-red-500' : '']"
              required
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.name" class="text-xs text-red-500 mt-1">{{ fieldErrors.name }}</p>
        </div>

        <!-- Type de magasin -->
        <div class="space-y-1">
          <Label for="store_type" class="text-sm font-medium">Type de magasin :</Label>
          <Select v-model="formData.store_type" :disabled="loading">
            <SelectTrigger class="h-10">
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Point de vente</SelectItem>
              <SelectItem value="warehouse">Entrepôt</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Ville -->
        <div class="space-y-1">
          <Label for="city" class="text-sm font-medium">Ville <span class="text-red-500">*</span></Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              v-model="formData.city"
              placeholder="Ex : Douala"
              :class="['pl-10 h-10', fieldErrors.city ? 'border-red-500' : '']"
              required
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.city" class="text-xs text-red-500 mt-1">{{ fieldErrors.city }}</p>
        </div>

        <!-- Adresse -->
        <div class="space-y-1">
          <Label for="address" class="text-sm font-medium">Adresse <span class="text-red-500">*</span></Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              v-model="formData.address"
              placeholder="Ex : 123 Avenue de la République"
              :class="['pl-10 h-10', fieldErrors.address ? 'border-red-500' : '']"
              required
              :disabled="loading"
            />
          </div>
          <p v-if="fieldErrors.address" class="text-xs text-red-500 mt-1">{{ fieldErrors.address }}</p>
        </div>

        <!-- Téléphone -->
        <div class="space-y-1">
          <Label for="phone" class="text-sm font-medium">Téléphone :</Label>
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
        <div class="space-y-1">
          <Label for="email" class="text-sm font-medium">Email :</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Ex : centerville@sgstock.com"
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
