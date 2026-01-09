<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? 'Nouveau magasin' : 'Modifier le magasin' }}
        </DialogTitle>
        <DialogDescription>
          {{ mode === 'create'
            ? 'Créez un nouveau point de vente ou entrepôt'
            : 'Modifiez les informations du magasin'
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Informations de base -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Informations de base</h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name" class="required">Nom du magasin</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Ex: SG Store Centre-ville"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="code" class="required">Code</Label>
              <Input
                id="code"
                v-model="formData.code"
                placeholder="Ex: SG-CV-001"
                required
                :disabled="mode === 'edit'"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="store_type" class="required">Type de magasin</Label>
            <Select v-model="formData.store_type">
              <SelectTrigger id="store_type">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">
                  <div class="flex items-center gap-2">
                    <ShoppingBag class="h-4 w-4" />
                    Point de vente
                  </div>
                </SelectItem>
                <SelectItem value="warehouse">
                  <div class="flex items-center gap-2">
                    <Warehouse class="h-4 w-4" />
                    Entrepôt
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div class="flex items-center gap-2">
                    <StoreIcon class="h-4 w-4" />
                    Les deux
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <!-- Localisation -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Localisation</h3>

          <div class="space-y-2">
            <Label for="address" class="required">Adresse</Label>
            <Textarea
              id="address"
              v-model="formData.address"
              placeholder="Entrez l'adresse complète"
              rows="2"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="city" class="required">Ville</Label>
            <Input
              id="city"
              v-model="formData.city"
              placeholder="Ex: Dakar"
              required
            />
          </div>
        </div>

        <Separator />

        <!-- Contact -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Contact</h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="phone">Téléphone</Label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  placeholder="+221 XX XXX XX XX"
                  class="pl-10"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="magasin@example.com"
                  class="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Responsable -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Gestion</h3>

          <div class="space-y-2">
            <Label for="manager">Responsable</Label>
            <Select v-model="formData.manager">
              <SelectTrigger id="manager">
                <SelectValue placeholder="Sélectionnez un responsable (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">Aucun responsable</SelectItem>
                <SelectItem
                  v-for="user in availableManagers"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center space-x-2">
            <Switch
              id="is_active"
              v-model:checked="formData.is_active"
            />
            <Label for="is_active" class="cursor-pointer">
              Magasin actif
            </Label>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            @click="emit('update:open', false)"
            class="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer' }}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useStoresStore } from '@/stores/stores.store'
import { useUsersStore } from '@/stores/users.store'
import type { Store, StoreCreateData, StoreUpdateData } from '@/types/store.types'

// Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

// Icons
import { Phone, Mail, ShoppingBag, Warehouse, Store as StoreIcon } from 'lucide-vue-next'

// Props & Emits
interface Props {
  open: boolean
  store?: Store | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  store: null
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

// Stores
const storesStore = useStoresStore()
const usersStore = useUsersStore()

// État
const loading = ref(false)
const formData = ref<StoreCreateData>({
  name: '',
  code: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  manager: null,
  store_type: 'retail',
  is_active: true
})

// Computed
const availableManagers = computed(() => usersStore.users)

// Watchers
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.store) {
      formData.value = {
        name: props.store.name,
        code: props.store.code,
        address: props.store.address,
        city: props.store.city,
        phone: props.store.phone || '',
        email: props.store.email || '',
        manager: props.store.manager,
        store_type: props.store.store_type,
        is_active: props.store.is_active
      }
    } else {
      resetForm()
    }
  }
})

// Méthodes
function resetForm() {
  formData.value = {
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    manager: null,
    store_type: 'retail',
    is_active: true
  }
}

async function handleSubmit() {
  loading.value = true

  try {
    if (props.mode === 'create') {
      await storesStore.createStore(formData.value)
    } else if (props.store) {
      const updateData: StoreUpdateData = { ...formData.value }
      delete (updateData as Record<string, unknown>).code // Ne pas envoyer le code en modification
      await storesStore.updateStore(props.store.id, updateData)
    }

    emit('success')
    resetForm()
  } catch (error: unknown) {
    console.error('Erreur lors de l\'enregistrement:', error)
    const err = error as { response?: { data?: { message?: string } } }
    alert(err.response?.data?.message || 'Une erreur est survenue')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Charger les utilisateurs pour la liste des responsables
  if (usersStore.users.length === 0) {
    usersStore.fetchUsers()
  }
})
</script>

<style scoped>
.required::after {
  content: ' *';
  color: rgb(239 68 68);
}
</style>
