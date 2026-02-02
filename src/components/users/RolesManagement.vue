<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight">Gestion des rôles</h2>
        <p class="text-sm text-muted-foreground">
          Gérez les rôles et leurs permissions
        </p>
      </div>
      <Button
        v-permission="'can_manage_users'"
        @click="openCreateDialog"
        class="gap-2 w-full sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">Nouveau rôle</span>
        <span class="sm:hidden">Nouveau</span>
      </Button>
    </div>

    <!-- Liste des rôles -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else-if="error" class="p-6 text-center text-destructive">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="role in roles" :key="role.id" class="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="space-y-1 flex-1">
              <CardTitle class="text-base md:text-lg">{{ role.display_name }}</CardTitle>
              <CardDescription class="text-xs md:text-sm">{{ role.description || 'Aucune description' }}</CardDescription>
            </div>
            <div class="flex gap-1 shrink-0">
              <Button
                v-permission="'can_manage_users'"
                variant="ghost"
                size="sm"
                @click="editRole(role)"
                class="h-8 w-8 p-0"
              >
                <Pencil class="h-3.5 w-3.5" />
              </Button>
              <Button
                v-permission="'can_manage_users'"
                variant="ghost"
                size="sm"
                class="text-destructive hover:text-destructive h-8 w-8 p-0"
                @click="confirmDelete(role)"
                :disabled="['super_admin', 'manager'].includes(role.name)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Statistiques -->
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-1">
              <Users class="h-4 w-4 text-muted-foreground" />
              <span>{{ role.users_count || 0 }} utilisateur{{ (role.users_count || 0) > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <Separator />

          <!-- Périmètre d'accès -->
          <div class="space-y-2">
            <div class="text-sm font-medium">Périmètre d'accès</div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {{
                role.access_scope === 'all'
                  ? 'Tous les points de vente'
                  : role.access_scope === 'assigned'
                    ? 'Points de vente assignés'
                    : 'Propres données'
              }}
            </span>
          </div>

          <!-- Permissions principales -->
          <div class="space-y-2">
            <div class="text-sm font-medium">Permissions principales</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-if="role.can_manage_users"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                Utilisateurs
              </span>
              <span
                v-if="role.can_manage_products"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                Produits
              </span>
              <span
                v-if="role.can_manage_inventory"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              >
                Stock
              </span>
              <span
                v-if="role.can_manage_sales"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              >
                Ventes
              </span>
              <span
                v-if="role.can_manage_customers"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                Clients
              </span>
              <span
                v-if="role.can_manage_suppliers"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                Fournisseurs
              </span>
              <span
                v-if="role.can_manage_cashbox"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                Caisse
              </span>
              <span
                v-if="role.can_manage_bank"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                Banque
              </span>
              <span
                v-if="role.can_manage_mobile_money"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              >
                MTN/Orange Money
              </span>
              <span
                v-if="role.can_manage_loans"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
              >
                Emprunts
              </span>
              <span
                v-if="role.can_manage_expenses"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
              >
                Dépenses
              </span>
              <span
                v-if="role.can_view_analytics"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                Analytics
              </span>
              <span
                v-if="role.can_export_data"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
              >
                Export
              </span>
            </div>
          </div>

          <!-- Bouton voir détails -->
          <Button variant="outline" size="sm" class="w-full" @click="viewRole(role)">
            <Eye class="mr-2 h-4 w-4" />
            Voir les détails
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Dialog de formulaire -->
    <RoleFormDialog
      v-model:open="isFormDialogOpen"
      :role="selectedRole"
      @saved="handleRoleSaved"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le rôle
            <strong>{{ selectedRole?.display_name }}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isDeleteDialogOpen = false">Annuler</Button>
          <Button variant="destructive" @click="handleDelete">
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de détails du rôle -->
    <Dialog v-model:open="isDetailsDialogOpen">
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ selectedRole?.display_name }}</DialogTitle>
          <DialogDescription>{{ selectedRole?.description }}</DialogDescription>
        </DialogHeader>

        <div v-if="selectedRole" class="space-y-6">
          <!-- Informations générales -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Informations générales</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Code:</span>
                <span class="ml-2 font-mono">{{ selectedRole.name }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Utilisateurs:</span>
                <span class="ml-2 font-semibold">{{ selectedRole.users_count || 0 }}</span>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Toutes les permissions -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Permissions détaillées</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Utilisateurs -->
              <PermissionItem
                label="Gérer les utilisateurs"
                :granted="selectedRole.can_manage_users"
              />

              <!-- Produits -->
              <PermissionItem label="Gérer les produits" :granted="selectedRole.can_manage_products" />
              <PermissionItem label="Voir les produits" :granted="selectedRole.can_view_products" />

              <!-- Catégories -->
              <PermissionItem
                label="Gérer les catégories"
                :granted="selectedRole.can_manage_categories"
              />
              <PermissionItem
                label="Voir les catégories"
                :granted="selectedRole.can_view_categories"
              />

              <!-- Services -->
              <PermissionItem label="Gérer les services" :granted="selectedRole.can_manage_services" />
              <PermissionItem label="Voir les services" :granted="selectedRole.can_view_services" />

              <!-- Stock -->
              <PermissionItem label="Gérer le stock" :granted="selectedRole.can_manage_inventory" />
              <PermissionItem label="Voir le stock" :granted="selectedRole.can_view_inventory" />

              <!-- Autres -->
              <PermissionItem label="Gérer les ventes" :granted="selectedRole.can_manage_sales" />
              <PermissionItem label="Gérer les clients" :granted="selectedRole.can_manage_customers" />
              <PermissionItem
                label="Gérer les fournisseurs"
                :granted="selectedRole.can_manage_suppliers"
              />
              <PermissionItem label="Gérer la caisse" :granted="selectedRole.can_manage_cashbox" />
              <PermissionItem label="Gérer la banque" :granted="selectedRole.can_manage_bank" />
              <PermissionItem label="Gérer MTN/Orange Money" :granted="selectedRole.can_manage_mobile_money" />
              <PermissionItem label="Gérer les emprunts" :granted="selectedRole.can_manage_loans" />
              <PermissionItem label="Gérer les dépenses" :granted="selectedRole.can_manage_expenses" />
              <PermissionItem label="Voir les analytics" :granted="selectedRole.can_view_analytics" />
              <PermissionItem label="Exporter les données" :granted="selectedRole.can_export_data" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import { storeToRefs } from 'pinia'
import type { Role } from '@/types/user.types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

// Icônes
import { Plus, Pencil, Trash2, Users, Eye, Loader2 } from 'lucide-vue-next'

// Composants
import RoleFormDialog from './RoleFormDialog.vue'
import PermissionItem from './PermissionItem.vue'

// Store
const usersStore = useUsersStore()
const { roles, loading, error } = storeToRefs(usersStore)

// État local
const selectedRole = ref<Role | null>(null)
const isFormDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isDetailsDialogOpen = ref(false)

// Chargement initial
onMounted(async () => {
  await usersStore.fetchRoles()
})

// Fonctions
const openCreateDialog = () => {
  selectedRole.value = null
  isFormDialogOpen.value = true
}

const editRole = (role: Role) => {
  // Créer une copie profonde pour éviter de modifier l'objet original
  selectedRole.value = JSON.parse(JSON.stringify(role))
  isFormDialogOpen.value = true
}

const viewRole = (role: Role) => {
  selectedRole.value = role
  isDetailsDialogOpen.value = true
}

const confirmDelete = (role: Role) => {
  selectedRole.value = role
  isDeleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!selectedRole.value) return

  try {
    await usersStore.deleteRole(selectedRole.value.id)
    isDeleteDialogOpen.value = false
    selectedRole.value = null
    // Rafraîchir la liste des rôles
    await usersStore.fetchRoles()
  } catch (error) {
  }
}

const handleRoleSaved = async () => {
  isFormDialogOpen.value = false
  selectedRole.value = null
  await usersStore.fetchRoles()
}
</script>
