<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight">Gestion des utilisateurs</h2>
        <p class="text-sm text-muted-foreground">
          Gérez les collaborateurs, leurs rôles et permissions
        </p>
      </div>
      <Button
        v-permission="'can_manage_users'"
        @click="openCreateDialog"
        class="gap-2 w-full sm:w-auto"
      >
        <UserPlus class="h-4 w-4" />
        <span class="hidden sm:inline">Nouvel utilisateur</span>
        <span class="sm:hidden">Nouveau</span>
      </Button>
    </div>

    <!-- Filtres et recherche -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Rechercher par nom, email, matricule..."
                class="pl-10"
                @input="debouncedSearch"
              />
            </div>
          </div>
          <Select v-model="selectedRole">
            <SelectTrigger class="w-full sm:w-[200px]">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem v-for="role in validRoles" :key="role.id" :value="role.name || ''">
                {{ role.display_name || role.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-full sm:w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Tableau des utilisateurs -->
    <Card>
      <CardContent class="p-0">
        <div v-if="accessDenied" class="p-12 text-center">
          <div class="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-red-600">Accès refusé</h3>
          <p class="text-muted-foreground mb-4 max-w-md mx-auto">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs et rôles.
            Veuillez contacter votre administrateur système.
          </p>
        </div>

        <div v-else-if="loading" class="flex justify-center items-center py-12">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div v-else-if="error" class="p-6 text-center text-destructive">
          {{ error }}
        </div>

        <div v-else-if="users.length === 0" class="p-12 text-center">
          <Users class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h3>
          <p class="text-muted-foreground mb-4">
            Commencez par créer votre premier utilisateur
          </p>
          <Button @click="openCreateDialog">
            <UserPlus class="mr-2 h-4 w-4" />
            Créer un utilisateur
          </Button>
        </div>

        <template v-else>
          <!-- Vue Mobile: Cards -->
          <div class="block md:hidden divide-y">
            <div
              v-for="user in users"
              :key="user.id"
              class="p-4 hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-start gap-3 mb-3">
                <Avatar class="h-10 w-10">
                  <AvatarImage v-if="user.profile_picture" :src="user.profile_picture" :alt="user.username" />
                  <AvatarFallback>{{ getInitials(user) }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ user.first_name }} {{ user.last_name }}</div>
                  <div class="text-sm text-muted-foreground truncate">@{{ user.username }}</div>
                </div>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    user.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  ]"
                >
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground w-20">Email:</span>
                  <span class="truncate">{{ user.email }}</span>
                </div>
                <div v-if="user.phone" class="flex items-center gap-2">
                  <span class="text-muted-foreground w-20">Téléphone:</span>
                  <span>{{ user.phone }}</span>
                </div>
                <div v-if="user.role" class="flex items-center gap-2">
                  <span class="text-muted-foreground w-20">Rôle:</span>
                  <span class="font-medium">{{ user.role.display_name || user.role.name }}</span>
                </div>
                <div v-if="user.employee_id" class="flex items-center gap-2">
                  <span class="text-muted-foreground w-20">Matricule:</span>
                  <span>{{ user.employee_id }}</span>
                </div>
              </div>
              <div class="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" @click="viewUser(user)" class="flex-1">
                  <Eye class="h-3 w-3 mr-1" />
                  Voir
                </Button>
                <Button
                  v-permission="'can_manage_users'"
                  size="sm"
                  variant="outline"
                  @click="editUser(user)"
                  class="flex-1"
                >
                  <Pencil class="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button
                  v-permission="'can_manage_users'"
                  size="sm"
                  variant="outline"
                  @click="confirmDelete(user)"
                  class="flex-1"
                >
                  <Trash2 class="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          <!-- Vue Desktop: Table -->
          <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="border-b bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Utilisateur</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Email / Téléphone</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Matricule</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Date d'ajout</th>
                <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-muted/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage v-if="user.profile_picture" :src="user.profile_picture" :alt="user.username" />
                      <AvatarFallback>{{ getInitials(user) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">
                        {{ user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username }}
                      </div>
                      <div class="text-sm text-muted-foreground">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="space-y-1">
                    <div class="text-sm">{{ user.email }}</div>
                    <div v-if="user.phone" class="text-sm text-muted-foreground">
                      {{ user.phone }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="user.role_name"
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                  >
                    {{ user.role_name }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm font-mono">{{ user.employee_id || '-' }}</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      user.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    ]"
                  >
                    <span
                      :class="[
                        'h-1.5 w-1.5 rounded-full',
                        user.is_active ? 'bg-green-500' : 'bg-gray-400'
                      ]"
                    />
                    {{ user.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground">
                  {{ formatDate(user.date_joined) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewUser(user)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      v-permission="'can_manage_users'"
                      variant="ghost"
                      size="sm"
                      @click="editUser(user)"
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      v-permission="'can_manage_users'"
                      variant="ghost"
                      size="sm"
                      class="text-destructive hover:text-destructive"
                      @click="confirmDelete(user)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </template>

        <!-- Pagination -->
        <div
          v-if="users.length > 0"
          class="flex items-center justify-between border-t px-4 py-3"
        >
          <div class="text-sm text-muted-foreground">
            Total : {{ totalUsers }} utilisateur{{ totalUsers > 1 ? 's' : '' }}
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <span class="text-sm">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Dialog de création/édition -->
    <UserFormDialog
      v-model:open="isFormDialogOpen"
      :user="selectedUser"
      :roles="validRoles"
      @saved="handleUserSaved"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir désactiver l'utilisateur
            <strong>{{ selectedUser?.username }}</strong> ?
            Cette action peut être annulée en réactivant l'utilisateur.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUsersStore } from '@/stores/users.store'
import { storeToRefs } from 'pinia'
import type { User } from '@/types/user.types'
import { debounce } from '@/lib/utils'

// Composants UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// Icônes
import {
  UserPlus,
  Search,
  Users,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

// Composant de formulaire
import UserFormDialog from './UserFormDialog.vue'

// Store
const usersStore = useUsersStore()
const { users, roles, loading, error, totalUsers, currentPage, totalPages } =
  storeToRefs(usersStore)

// Filtrer les rôles valides
const validRoles = computed(() => {
  if (!roles.value) return []
  if (Array.isArray(roles.value)) {
    return roles.value.filter(role => role && role.id)
  }
  return []
})

// État local
const searchQuery = ref('')
const selectedRole = ref('all')
const statusFilter = ref('all')
const selectedUser = ref<User | null>(null)
const isFormDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const accessDenied = ref(false)

// Chargement initial
onMounted(async () => {
  try {
    await Promise.all([usersStore.fetchUsers(), usersStore.fetchRoles()])
  } catch (err: any) {
    if (err.response?.status === 403) {
      accessDenied.value = true
    }
  }
})

// Watchers pour les filtres
watch([selectedRole, statusFilter], () => {
  applyFilters()
})

// Recherche avec debounce
const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

// Fonctions
const applyFilters = () => {
  const filters: Record<string, string | boolean | number> = {}

  if (searchQuery.value) {
    filters.search = searchQuery.value
  }

  if (selectedRole.value && selectedRole.value !== 'all') {
    filters.role = selectedRole.value
  }

  if (statusFilter.value !== 'all') {
    filters.is_active = statusFilter.value === 'active'
  }

  usersStore.fetchUsers(filters)
}

const openCreateDialog = () => {
  selectedUser.value = null
  isFormDialogOpen.value = true
}

const viewUser = async (user: User) => {
  try {
    // Récupérer les détails complets depuis le backend
    await usersStore.fetchUserById(user.id)
    selectedUser.value = user
    // TODO: Ouvrir un dialog de détails avec les infos complètes
  } catch (error) {
  }
}

const editUser = (user: User) => {
  // Créer une copie profonde pour éviter de modifier l'objet original
  selectedUser.value = JSON.parse(JSON.stringify(user))
  isFormDialogOpen.value = true
}

const confirmDelete = (user: User) => {
  selectedUser.value = user
  isDeleteDialogOpen.value = true
}

const handleDelete = async () => {
  if (!selectedUser.value) return

  try {
    await usersStore.deleteUser(selectedUser.value.id)
    isDeleteDialogOpen.value = false
    selectedUser.value = null
    await usersStore.fetchUsers()
  } catch (error) {
  }
}

const handleUserSaved = async () => {
  isFormDialogOpen.value = false
  selectedUser.value = null
  await usersStore.fetchUsers()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    usersStore.setPage(currentPage.value - 1)
    applyFilters()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    usersStore.setPage(currentPage.value + 1)
    applyFilters()
  }
}

const getInitials = (user: User): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase()
  }
  return 'US'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
