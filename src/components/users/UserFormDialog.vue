<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-lg md:text-xl">
          {{ isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
        </DialogTitle>
        <DialogDescription class="text-sm">
          {{
            isEditMode
              ? 'Modifiez les informations de l\'utilisateur'
              : 'Créez un nouveau compte utilisateur'
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
        <!-- Informations de base -->
        <div class="space-y-3 md:space-y-4">
          <h3 class="text-sm font-semibold">Informations de base</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                v-model="formData.username"
                placeholder="ex: jdupont"
                required
                :disabled="isEditMode"
              />
            </div>

            <div class="space-y-2">
              <Label for="email">Email *</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="ex: j.dupont@entreprise.com"
                required
              />
            </div>
          </div>

          <div v-if="!isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="password">Mot de passe *</Label>
              <Input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="••••••••"
                required
                :class="{ 'border-red-500': passwordError }"
              />
              <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
              <p class="text-xs text-gray-500 mt-1">Min. 8 caractères, incluant lettres et chiffres</p>
            </div>

            <div class="space-y-2">
              <Label for="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="first_name">Prénom</Label>
              <Input id="first_name" v-model="formData.first_name" placeholder="ex: Jean" />
            </div>

            <div class="space-y-2">
              <Label for="last_name">Nom</Label>
              <Input id="last_name" v-model="formData.last_name" placeholder="ex: Dupont" />
            </div>
          </div>
        </div>

        <!-- Informations de contact -->
        <Separator />

        <div class="space-y-4">
          <h3 class="text-sm font-semibold">Informations de contact</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="phone">Téléphone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+237612345678"
                type="tel"
              />
            </div>

            <div class="space-y-2">
              <Label for="alternative_phone">Téléphone alternatif</Label>
              <Input
                id="alternative_phone"
                v-model="formData.alternative_phone"
                placeholder="+237698765432"
                type="tel"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="address">Adresse</Label>
            <Textarea id="address" v-model="formData.address" placeholder="Adresse complète" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city">Ville</Label>
              <Input id="city" v-model="formData.city" placeholder="ex: Douala" />
            </div>

            <div class="space-y-2">
              <Label for="country">Pays</Label>
              <Input id="country" v-model="formData.country" placeholder="ex: Cameroun" />
            </div>
          </div>
        </div>

        <!-- Informations professionnelles -->
        <Separator />

        <div class="space-y-4">
          <h3 class="text-sm font-semibold">Informations professionnelles</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="employee_id">Matricule employé</Label>
              <Input
                id="employee_id"
                v-model="formData.employee_id"
                placeholder="ex: EMP-001"
              />
            </div>

            <div class="space-y-2">
              <Label for="role">Rôle *</Label>
              <Select v-model="formData.role">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.id" :value="String(role.id)">
                    {{ role.display_name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="assigned_stores">Magasins assignés</Label>
            <p class="text-sm text-muted-foreground mb-2">
              Sélectionnez les points de vente auxquels l'utilisateur aura accès
            </p>
            <div class="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="store in availableStores"
                :key="store.id"
                class="flex items-center space-x-2"
              >
                <input
                  :id="`store-${store.id}`"
                  type="checkbox"
                  :value="store.id"
                  v-model="formData.assigned_stores"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  :for="`store-${store.id}`"
                  class="cursor-pointer text-sm font-normal flex-1"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ store.name }}</span>
                    <span class="text-xs text-muted-foreground">({{ store.code }})</span>
                    <span
                      :class="[
                        'text-xs px-2 py-0.5 rounded',
                        store.store_type === 'retail' ? 'bg-purple-100 text-purple-700' :
                        store.store_type === 'warehouse' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      ]"
                    >
                      {{ getStoreTypeLabel(store.store_type) }}
                    </span>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ store.city }}</span>
                </Label>
              </div>
              <div v-if="availableStores.length === 0" class="text-sm text-muted-foreground text-center py-4">
                Aucun magasin disponible. Créez d'abord un magasin dans l'onglet "Magasins".
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="hire_date">Date d'embauche</Label>
            <Input id="hire_date" v-model="formData.hire_date" type="date" />
          </div>
        </div>

        <!-- Contact d'urgence -->
        <Separator />

        <Collapsible v-model:open="showEmergencyContact">
          <CollapsibleTrigger class="flex items-center gap-2 text-sm font-semibold hover:underline">
            Contact d'urgence (optionnel)
            <ChevronDown
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-180': showEmergencyContact }"
            />
          </CollapsibleTrigger>
          <CollapsibleContent class="space-y-4 mt-4">
            <div class="space-y-2">
              <Label for="emergency_contact_name">Nom du contact</Label>
              <Input
                id="emergency_contact_name"
                v-model="formData.emergency_contact_name"
                placeholder="ex: Marie Dupont"
              />
            </div>

            <div class="space-y-2">
              <Label for="emergency_contact_phone">Téléphone du contact</Label>
              <Input
                id="emergency_contact_phone"
                v-model="formData.emergency_contact_phone"
                placeholder="+237612345678"
                type="tel"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <!-- Notes -->
        <Separator />

        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes additionnelles..."
            rows="3"
          />
        </div>

        <!-- Statut (édition uniquement) -->
        <div v-if="isEditMode" class="flex items-center space-x-2">
          <Switch id="is_active" v-model:checked="formData.is_active" />
          <Label for="is_active">Compte actif</Label>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {{ error }}
        </div>

        <!-- Actions -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="closeDialog" :disabled="loading">
            Annuler
          </Button>
          <Button type="submit" :disabled="loading">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditMode ? 'Enregistrer' : 'Créer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import { useStoresStore } from '@/stores/stores.store'
import type { User, UserCreateData, UserUpdateData } from '@/types/user.types'
import type { Store } from '@/types/store.types'

// Composants UI
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Icônes
import { Loader2, ChevronDown } from 'lucide-vue-next'

// Props
interface Props {
  open: boolean
  user?: User | null
  roles: any[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

// Store
const usersStore = useUsersStore()
const storesStore = useStoresStore()

// Computed - Magasins disponibles
const availableStores = computed(() => storesStore.stores.filter(s => s.is_active))

// État local
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEditMode = computed(() => !!props.user)
const loading = ref(false)
const error = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const showEmergencyContact = ref(false)
const confirmPassword = ref('')

// Formulaire
const formData = ref<Partial<UserCreateData & UserUpdateData>>({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  city: '',
  country: 'Cameroun',
  employee_id: '',
  role: undefined,
  assigned_stores: [],
  hire_date: '',
  alternative_phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: '',
  is_active: true
})

// Fonction de réinitialisation du formulaire (définie avant le watcher)
const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Cameroun',
    employee_id: '',
    role: undefined,
    assigned_stores: [],
    hire_date: '',
    alternative_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    is_active: true
  }
  confirmPassword.value = ''
  error.value = null
}

// Watcher pour initialiser le formulaire en mode édition
watch(
  [() => props.user, () => props.open],
  ([user, open]) => {
    if (open && user) {
      formData.value = {
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Cameroun',
        employee_id: user.employee_id || '',
        role: user.role ? (typeof user.role === 'object' ? String(user.role.id) : String(user.role)) : undefined,
        assigned_stores: Array.isArray(user.assigned_stores)
          ? user.assigned_stores.map(s => (typeof s === 'object' ? s.id : s))
          : [],
        hire_date: user.hire_date || '',
        alternative_phone: user.alternative_phone || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        notes: user.notes || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      }
    } else if (open && !user) {
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

// Autres fonctions

const closeDialog = () => {
  isOpen.value = false
  resetForm()
}

const validateForm = (): boolean => {
  error.value = null

  if (!formData.value.username || !formData.value.email) {
    error.value = "Le nom d'utilisateur et l'email sont obligatoires"
    return false
  }

  if (!isEditMode.value) {
    if (!formData.value.password) {
      error.value = 'Le mot de passe est obligatoire'
      return false
    }

    if (formData.value.password !== confirmPassword.value) {
      error.value = 'Les mots de passe ne correspondent pas'
      return false
    }

    if (formData.value.password.length < 8) {
      error.value = 'Le mot de passe doit contenir au moins 8 caractères'
      return false
    }
  }

  if (!formData.value.role) {
    error.value = 'Le rôle est obligatoire'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = null
  passwordError.value = null

  try {
    // Préparer les données
    const data: any = {
      username: formData.value.username,
      email: formData.value.email,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      phone: formData.value.phone,
      address: formData.value.address,
      city: formData.value.city,
      country: formData.value.country,
      employee_id: formData.value.employee_id,
      role: Number(formData.value.role),
      assigned_stores: formData.value.assigned_stores || [],
      hire_date: formData.value.hire_date || undefined,
      alternative_phone: formData.value.alternative_phone,
      emergency_contact_name: formData.value.emergency_contact_name,
      emergency_contact_phone: formData.value.emergency_contact_phone,
      notes: formData.value.notes
    }

    if (isEditMode.value) {
      // Mode édition
      data.is_active = formData.value.is_active
      await usersStore.updateUser(props.user!.id, data)
    } else {
      // Mode création
      data.password = formData.value.password
      data.password_confirm = confirmPassword.value
      await usersStore.createUser(data as UserCreateData)
    }

    emit('saved')
    closeDialog()
  } catch (e: any) {
    // Extraire les erreurs de validation
    const validationErrors = e.response?.data

    // Gérer l'erreur de quota d'utilisateurs atteint
    if (validationErrors?.detail && typeof validationErrors.detail === 'string') {
      error.value = validationErrors.detail
    }
    // Gérer les erreurs de mot de passe
    else if (validationErrors?.password) {
      passwordError.value = Array.isArray(validationErrors.password)
        ? validationErrors.password[0]
        : validationErrors.password
      error.value = "Veuillez corriger les erreurs dans le formulaire"
    }
    // Gérer les autres erreurs
    else {
      error.value = e.response?.data?.message || e.response?.data?.detail || "Une erreur s'est produite. Vérifiez les champs."
    }
  } finally {
    loading.value = false
  }
}

// Fonction helper
function getStoreTypeLabel(type: string) {
  const labels: Record<string, string> = {
    retail: 'Point de vente',
    warehouse: 'Entrepôt',
    both: 'Les deux'
  }
  return labels[type] || type
}

// Lifecycle
onMounted(() => {
  // Charger les magasins si nécessaire
  if (storesStore.stores.length === 0) {
    storesStore.fetchStores()
  }
})
</script>
