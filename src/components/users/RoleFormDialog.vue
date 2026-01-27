<template>
  <Dialog :open="isOpen" @update:open="handleDialogChange">
    <DialogContent class="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <DialogTitle class="text-2xl font-bold flex items-center gap-2">
          <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          {{ isEditMode ? 'Modifier le rôle' : 'Nouveau rôle' }}
        </DialogTitle>
        <DialogDescription class="text-base mt-2">
          {{
            isEditMode
              ? 'Modifiez les informations et permissions du rôle'
              : 'Créez un nouveau rôle avec des permissions personnalisées'
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <!-- Informations de base -->
        <div class="relative bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5">
          <!-- Coin décoratif -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full"></div>

          <div class="flex items-center gap-3 mb-4 relative">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Informations de base</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Définissez les caractéristiques principales du rôle</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-2.5">
              <Label for="name" class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Type de rôle
                <span class="text-destructive">*</span>
              </Label>
              <Select v-model="formData.name" :disabled="isEditMode">
                <SelectTrigger class="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Sélectionnez un type de rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="choice in roleChoices"
                    :key="choice.value"
                    :value="choice.value"
                  >
                    {{ choice.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Type de rôle prédéfini dans le système
              </p>
            </div>

            <div class="space-y-2.5">
              <Label for="display_name" class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Nom d'affichage
                <span class="text-destructive">*</span>
              </Label>
              <Input
                id="display_name"
                v-model="formData.display_name"
                placeholder="ex: Commercial"
                class="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary/50 focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div class="space-y-2.5">
            <Label for="description" class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Décrivez les responsabilités de ce rôle..."
              rows="3"
              class="resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div class="space-y-2.5">
            <Label for="access_scope" class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Périmètre d'accès
              <span class="text-destructive">*</span>
            </Label>
            <Select v-model="formData.access_scope">
              <SelectTrigger class="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Sélectionnez un périmètre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les points de vente</SelectItem>
                <SelectItem value="assigned">Points de vente assignés uniquement</SelectItem>
                <SelectItem value="own">Propres données uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Permissions -->
        <div class="relative bg-gradient-to-br from-violet-50 to-purple-50/30 dark:from-violet-950/30 dark:to-purple-950/20 rounded-xl border border-violet-200/60 dark:border-violet-800/60 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5">
          <!-- Coin décoratif -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
          <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full"></div>

          <div class="flex items-center gap-3 mb-6 relative">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Permissions</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Configurez les accès et capacités du rôle</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            <!-- Utilisateurs -->
            <PermissionCard
              title="Utilisateurs"
              icon="users"
              :permissions="[
                { id: 'can_manage_users', label: 'Gérer les utilisateurs', checked: formData.can_manage_users }
              ]"
              @update="updatePermission"
            />

            <!-- Produits -->
            <PermissionCard
              title="Produits"
              icon="package"
              :permissions="[
                { id: 'can_manage_products', label: 'Gérer les produits', checked: formData.can_manage_products },
                { id: 'can_view_products', label: 'Voir les produits', checked: formData.can_view_products }
              ]"
              @update="updatePermission"
            />

            <!-- Catégories -->
            <PermissionCard
              title="Catégories"
              icon="folder"
              :permissions="[
                { id: 'can_manage_categories', label: 'Gérer les catégories', checked: formData.can_manage_categories },
                { id: 'can_view_categories', label: 'Voir les catégories', checked: formData.can_view_categories }
              ]"
              @update="updatePermission"
            />

            <!-- Services -->
            <PermissionCard
              title="Services"
              icon="wrench"
              :permissions="[
                { id: 'can_manage_services', label: 'Gérer les services', checked: formData.can_manage_services },
                { id: 'can_view_services', label: 'Voir les services', checked: formData.can_view_services }
              ]"
              @update="updatePermission"
            />

            <!-- Stock -->
            <PermissionCard
              title="Stock"
              icon="warehouse"
              :permissions="[
                { id: 'can_manage_inventory', label: 'Gérer le stock', checked: formData.can_manage_inventory },
                { id: 'can_view_inventory', label: 'Voir le stock', checked: formData.can_view_inventory }
              ]"
              @update="updatePermission"
            />

            <!-- Ventes -->
            <PermissionCard
              title="Ventes"
              icon="shopping-cart"
              :permissions="[
                { id: 'can_manage_sales', label: 'Gérer les ventes', checked: formData.can_manage_sales }
              ]"
              @update="updatePermission"
            />

            <!-- Clients -->
            <PermissionCard
              title="Clients"
              icon="user-check"
              :permissions="[
                { id: 'can_manage_customers', label: 'Gérer les clients', checked: formData.can_manage_customers }
              ]"
              @update="updatePermission"
            />

            <!-- Fournisseurs -->
            <PermissionCard
              title="Fournisseurs"
              icon="truck"
              :permissions="[
                { id: 'can_manage_suppliers', label: 'Gérer les fournisseurs', checked: formData.can_manage_suppliers }
              ]"
              @update="updatePermission"
            />

            <!-- Caisse -->
            <PermissionCard
              title="Caisse"
              icon="dollar-sign"
              :permissions="[
                { id: 'can_manage_cashbox', label: 'Gérer la caisse', checked: formData.can_manage_cashbox }
              ]"
              @update="updatePermission"
            />

            <!-- Banque -->
            <PermissionCard
              title="Banque"
              icon="building-2"
              :permissions="[
                { id: 'can_manage_bank', label: 'Gérer la banque', checked: formData.can_manage_bank }
              ]"
              @update="updatePermission"
            />

            <!-- Emprunts -->
            <PermissionCard
              title="Emprunts"
              icon="credit-card"
              :permissions="[
                { id: 'can_manage_loans', label: 'Gérer les emprunts', checked: !!formData.can_manage_loans }
              ]"
              @update="updatePermission"
            />

            <!-- Dépenses -->
            <PermissionCard
              title="Dépenses"
              icon="file-text"
              :permissions="[
                { id: 'can_manage_expenses', label: 'Gérer les dépenses', checked: !!formData.can_manage_expenses }
              ]"
              @update="updatePermission"
            />

            <!-- Analytics -->
            <PermissionCard
              title="Analytics"
              icon="bar-chart"
              :permissions="[
                { id: 'can_view_analytics', label: 'Voir les analytics', checked: formData.can_view_analytics },
                { id: 'can_export_data', label: 'Exporter les données', checked: formData.can_export_data }
              ]"
              @update="updatePermission"
            />
          </div>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </form>

      <!-- Actions Footer -->
      <div class="px-6 py-4 border-t bg-muted/30 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          @click="closeDialog"
          :disabled="loading"
          class="min-w-[100px]"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="loading"
          class="min-w-[120px] bg-primary hover:bg-primary/90"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ isEditMode ? 'Enregistrer' : 'Créer le rôle' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import { usersApi } from '@/services/api/users.api'
import type { Role } from '@/types/user.types'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Icônes
import { Loader2 } from 'lucide-vue-next'

// Composant PermissionCard pour afficher les permissions
import PermissionCard from './PermissionCard.vue'

// Props
interface Props {
  open: boolean
  role?: Role | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

// Store
const usersStore = useUsersStore()

// État local
const loading = ref(false)
const error = ref<string | null>(null)
const roleChoices = ref<{ value: string; label: string }[]>([])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isEditMode = computed(() => !!props.role)

// Formulaire - utiliser ref() avec objet complet pour meilleure réactivité
const formData = reactive<{
  name: string
  display_name: string
  description: string
  access_scope: string
  can_manage_users: boolean
  can_manage_products: boolean
  can_view_products: boolean
  can_manage_categories: boolean
  can_view_categories: boolean
  can_manage_services: boolean
  can_view_services: boolean
  can_manage_inventory: boolean
  can_view_inventory: boolean
  can_manage_sales: boolean
  can_manage_customers: boolean
  can_manage_suppliers: boolean
  can_manage_cashbox: boolean
  can_manage_bank: boolean
  can_manage_loans: boolean
  can_manage_expenses: boolean
  can_view_analytics: boolean
  can_export_data: boolean
}>({
  name: '',
  display_name: '',
  description: '',
  access_scope: 'assigned',
  can_manage_users: false,
  can_manage_products: false,
  can_view_products: false,
  can_manage_categories: false,
  can_view_categories: false,
  can_manage_services: false,
  can_view_services: false,
  can_manage_inventory: false,
  can_view_inventory: false,
  can_manage_sales: false,
  can_manage_customers: false,
  can_manage_suppliers: false,
  can_manage_cashbox: false,
  can_manage_bank: false,
  can_manage_loans: false,
  can_manage_expenses: false,
  can_view_analytics: false,
  can_export_data: false
})

// Charger les choix de rôles
const loadRoleChoices = async () => {
  try {
    const response = await usersApi.getRoleChoices()
    roleChoices.value = response.data
  } catch (e) {
    console.error('Erreur lors du chargement des choix de rôles:', e)
  }
}

// Charger immédiatement
loadRoleChoices()

// Fonction de réinitialisation du formulaire
const resetForm = () => {
  formData.name = ''
  formData.display_name = ''
  formData.description = ''
  formData.access_scope = 'assigned'
  formData.can_manage_users = false
  formData.can_manage_products = false
  formData.can_view_products = false
  formData.can_manage_categories = false
  formData.can_view_categories = false
  formData.can_manage_services = false
  formData.can_view_services = false
  formData.can_manage_inventory = false
  formData.can_view_inventory = false
  formData.can_manage_sales = false
  formData.can_manage_customers = false
  formData.can_manage_suppliers = false
  formData.can_manage_cashbox = false
  formData.can_manage_bank = false
  formData.can_manage_loans = false
  formData.can_manage_expenses = false
  formData.can_view_analytics = false
  formData.can_export_data = false
  error.value = null
}

// Fonction pour charger les données du rôle dans le formulaire
const loadRoleData = () => {
  if (props.role) {
    console.log('🔄 Chargement du rôle:', props.role.display_name)
    formData.name = props.role.name || ''
    formData.display_name = props.role.display_name || ''
    formData.description = props.role.description || ''
    formData.access_scope = props.role.access_scope || 'assigned'
    formData.can_manage_users = props.role.can_manage_users === true
    formData.can_manage_products = props.role.can_manage_products === true
    formData.can_view_products = props.role.can_view_products === true
    formData.can_manage_categories = props.role.can_manage_categories === true
    formData.can_view_categories = props.role.can_view_categories === true
    formData.can_manage_services = props.role.can_manage_services === true
    formData.can_view_services = props.role.can_view_services === true
    formData.can_manage_inventory = props.role.can_manage_inventory === true
    formData.can_view_inventory = props.role.can_view_inventory === true
    formData.can_manage_sales = props.role.can_manage_sales === true
    formData.can_manage_customers = props.role.can_manage_customers === true
    formData.can_manage_suppliers = props.role.can_manage_suppliers === true
    formData.can_manage_cashbox = props.role.can_manage_cashbox === true
    formData.can_manage_bank = props.role.can_manage_bank === true
    formData.can_manage_loans = props.role.can_manage_loans === true
    formData.can_manage_expenses = props.role.can_manage_expenses === true
    formData.can_view_analytics = props.role.can_view_analytics === true
    formData.can_export_data = props.role.can_export_data === true
  }
}

// Watcher pour détecter l'ouverture du dialog et charger les données
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      if (props.role) {
        // Mode édition : charger les données du rôle
        loadRoleData()
      } else {
        // Mode création : réinitialiser le formulaire
        resetForm()
      }
    }
  },
  { immediate: true }
)

// Fonction pour gérer le changement d'état du dialog
const handleDialogChange = (value: boolean) => {
  isOpen.value = value
  if (!value) {
    resetForm()
  }
}

// Fonction pour mettre à jour une permission depuis le composant enfant
const updatePermission = (permissionId: string, value: boolean) => {
  switch(permissionId) {
    case 'can_manage_users': formData.can_manage_users = value; break;
    case 'can_manage_products': formData.can_manage_products = value; break;
    case 'can_view_products': formData.can_view_products = value; break;
    case 'can_manage_categories': formData.can_manage_categories = value; break;
    case 'can_view_categories': formData.can_view_categories = value; break;
    case 'can_manage_services': formData.can_manage_services = value; break;
    case 'can_view_services': formData.can_view_services = value; break;
    case 'can_manage_inventory': formData.can_manage_inventory = value; break;
    case 'can_view_inventory': formData.can_view_inventory = value; break;
    case 'can_manage_sales': formData.can_manage_sales = value; break;
    case 'can_manage_customers': formData.can_manage_customers = value; break;
    case 'can_manage_suppliers': formData.can_manage_suppliers = value; break;
    case 'can_manage_cashbox': formData.can_manage_cashbox = value; break;
    case 'can_manage_bank': formData.can_manage_bank = value; break;
    case 'can_manage_loans': formData.can_manage_loans = value; break;
    case 'can_manage_expenses': formData.can_manage_expenses = value; break;
    case 'can_view_analytics': formData.can_view_analytics = value; break;
    case 'can_export_data': formData.can_export_data = value; break;
  }
}

const closeDialog = () => {
  isOpen.value = false
  resetForm()
}

const validateForm = (): boolean => {
  error.value = null

  if (!formData.name || !formData.display_name) {
    error.value = "Le code et le nom d'affichage sont obligatoires"
    return false
  }

  if (!formData.access_scope) {
    error.value = "Le périmètre d'accès est obligatoire"
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = null

  try {
    if (isEditMode.value && props.role) {
      console.log('📤 Données envoyées pour mise à jour rôle:', formData)
      await usersStore.updateRole(props.role.id, { ...formData })
    } else {
      console.log('📤 Données envoyées pour création rôle:', formData)
      await usersStore.createRole({ ...formData })
    }

    emit('saved')
    closeDialog()
  } catch (e: any) {
    console.error('❌ Erreur création/modification rôle:', e.response?.data)
    error.value = e.response?.data?.message || e.response?.data?.detail || JSON.stringify(e.response?.data) || "Une erreur s'est produite"
  } finally {
    loading.value = false
  }
}
</script>
