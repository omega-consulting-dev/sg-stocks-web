<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDecaissementsStore } from '@/stores/decaissements'
import { useStoreAssignment } from '@/composables/useStoreAssignment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, DollarSign } from 'lucide-vue-next'
import DecaissementSearchBar from '@/components/decaissements/DecaissementSearchBar.vue'
import DecaissementTable from '@/components/decaissements/DecaissementTable.vue'
import { encaissementsApi } from '@/services/api/encaissements.api'

const store = useDecaissementsStore()
const { shouldShowStoreSelector, getDefaultStoreId } = useStoreAssignment()

const filters = ref({
  start_date: '',
  end_date: '',
  store: undefined as number | string | undefined,
  page: 1,
  page_size: 20,
})

const stores = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedStoreId = ref<number | string>('')

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

// Delete confirmation dialog
const deleteDialog = ref({
  isOpen: false,
  decaissementId: null as number | null
})

// Alert Dialog state
const alertDialog = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'default' as 'default' | 'success' | 'error'
})

const formData = ref({
  amount: 0,
  payment_method: 'cash',
  reference: '',
  description: '',
  notes: '',
  store_id: 0
})

const showAlert = (title: string, message: string, variant: 'default' | 'success' | 'error' = 'default') => {
  alertDialog.value = {
    isOpen: true,
    title,
    message,
    variant
  }
}

const loadDecaissements = async () => {
  try {
    await store.fetchDecaissements(filters.value)
  } catch (error: any) {
    console.error('Erreur lors du chargement des décaissements:', error)
  }
}

const handleSearch = async (searchFilters: any) => {
  filters.value = { ...filters.value, ...searchFilters, page: 1 }
  await loadDecaissements()
}

const handleExport = async () => {
  try {
    const exportFilters = {
      start_date: filters.value.start_date || undefined,
      end_date: filters.value.end_date || undefined,
      store: filters.value.store,
    }
    await store.exportToExcel(exportFilters)
  } catch (error: any) {
    console.error('Erreur lors de l\'export:', error)
    showAlert('Erreur d\'export', 'Impossible d\'exporter le fichier Excel. Veuillez réessayer.', 'error')
  }
}

const handleExportPDF = async () => {
  try {
    const exportFilters = {
      start_date: filters.value.start_date || undefined,
      end_date: filters.value.end_date || undefined,
      store: filters.value.store,
    }
    await store.exportToPDF(exportFilters)
  } catch (error: any) {
    console.error('Erreur lors de l\'export PDF:', error)
    showAlert('Erreur d\'export', 'Impossible d\'exporter le fichier PDF. Veuillez réessayer.', 'error')
  }
}

const handleNew = () => {
  isEditing.value = false
  editingId.value = null
  
  // Auto-assigner le store pour les utilisateurs avec store assigné
  let defaultStoreId = 0
  if (getDefaultStoreId.value) {
    defaultStoreId = getDefaultStoreId.value
  } else if (stores.value.length > 0) {
    defaultStoreId = stores.value[0].id
  }
  
  formData.value = {
    amount: 0,
    payment_method: 'cash',
    reference: '',
    description: '',
    notes: '',
    store_id: defaultStoreId
  }
  isModalOpen.value = true
}

const handleEdit = (decaissement: any) => {
  isEditing.value = true
  editingId.value = decaissement.id
  formData.value = {
    amount: decaissement.montant,
    payment_method: decaissement.payment_method,  // Utiliser la valeur brute
    reference: decaissement.reference || '',
    description: decaissement.description || '',
    notes: decaissement.notes || '',
    store_id: decaissement.store_id || (stores.value.length > 0 ? stores.value[0].id : 0)
  }
  isModalOpen.value = true
}

const handleDeleteClick = (id: number) => {
  deleteDialog.value = {
    isOpen: true,
    decaissementId: id
  }
}

const confirmDelete = async () => {
  if (!deleteDialog.value.decaissementId) return

  try {
    await store.deleteDecaissement(deleteDialog.value.decaissementId)
    showAlert('Succès', 'Décaissement supprimé avec succès.', 'success')
    await loadDecaissements()
    const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value
    await store.fetchCaisseSolde(storeFilter)
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    showAlert('Erreur de suppression', error.response?.data?.error || 'Erreur lors de la suppression du décaissement.', 'error')
  } finally {
    deleteDialog.value = {
      isOpen: false,
      decaissementId: null
    }
  }
}

const handleSubmit = async () => {
  if (formData.value.amount <= 0) {
    showAlert('Montant invalide', 'Le montant doit être supérieur à 0.', 'error')
    return
  }

  if (!formData.value.description) {
    showAlert('Description requise', 'La description est obligatoire.', 'error')
    return
  }

  if (!formData.value.store_id) {
    showAlert('Point de vente requis', 'Veuillez sélectionner un point de vente.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await store.updateDecaissement(editingId.value, formData.value)
      showAlert('Succès', 'Décaissement modifié avec succès.', 'success')
    } else {
      await store.createDecaissement(formData.value)
      showAlert('Succès', 'Décaissement créé avec succès.', 'success')
    }
    isModalOpen.value = false
    await loadDecaissements()
    const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value
    await store.fetchCaisseSolde(storeFilter)
  } catch (error: any) {
    console.error('Erreur lors de l\'opération:', error)
    const action = isEditing.value ? 'modification' : 'création'
    
    // Récupérer le message d'erreur détaillé
    let errorMessage = `Erreur lors de la ${action} du décaissement.`
    
    if (error.response?.data) {
      // Si c'est une erreur de validation (comme solde insuffisant)
      if (error.response.data.amount) {
        errorMessage = error.response.data.amount
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data
      }
    }
    
    showAlert(`Erreur de ${action}`, errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleStoreChange = async () => {
  filters.value.store = selectedStoreId.value === '' ? undefined : selectedStoreId.value
  filters.value.page = 1
  await loadDecaissements()
  const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value
  await store.fetchCaisseSolde(storeFilter)
}

onMounted(async () => {
  // Charger la liste des stores
  stores.value = await encaissementsApi.getStores()

  // Déterminer le store par défaut et appeler fetchCaisseSolde avec le bon paramètre
  const defaultStore = getDefaultStoreId.value
  if (defaultStore) {
    selectedStoreId.value = defaultStore
    filters.value.store = defaultStore
    await store.fetchCaisseSolde(defaultStore)
  } else {
    await store.fetchCaisseSolde()
  }
  
  await loadDecaissements()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- En-tête avec design moderne -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-gradient-to-br from-red-500 to-orange-500 p-3 shadow-lg">
              <DollarSign class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight text-slate-900">Décaissements</h1>
              <p class="text-sm text-slate-600">
                Gérer les approvisionnements et sorties de caisse
              </p>
            </div>
          </div>
        </div>
        <Button
          @click="handleNew"
          class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
        >
          <Plus class="mr-2 h-4 w-4" />
          Nouveau décaissement
        </Button>
      </div>

      <!-- Filtre par point de vente -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4">
        <label for="store-select" class="block text-sm font-medium text-slate-700 mb-2">
          Point de Vente
        </label>
        <select
          id="store-select"
          v-model="selectedStoreId"
          @change="handleStoreChange"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          <option value="">Tous les points de vente</option>
          <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
            {{ storeItem.name }} ({{ storeItem.code }})
          </option>
        </select>
      </div>

      <!-- Statistiques avec design amélioré -->
      <div class="grid gap-6 md:grid-cols-2">
        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Montant en Caisse</CardTitle>
            <div :class="[
              'rounded-lg p-2.5',
              store.soldeCaisse >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                : 'bg-gradient-to-br from-red-500 to-rose-500'
            ]">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div :class="[
              'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
              store.soldeCaisse >= 0 
                ? 'from-green-600 to-emerald-600' 
                : 'from-red-600 to-rose-600'
            ]">
              {{ store.soldeCaisse.toLocaleString('fr-FR') }} FCFA
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Solde actuel de la caisse{{ selectedStoreId ? ' (Store sélectionné)' : ' (Tous les stores)' }}
            </p>
            <p v-if="store.soldeCaisse < 0" class="mt-2 text-xs text-red-600 font-medium">
              ⚠️ Attention : Solde négatif. Réapprovisionnez la caisse avant de faire un décaissement.
            </p>
          </CardContent>
        </Card>

        <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle class="text-sm font-medium text-slate-600">Total Décaissements</CardTitle>
            <div class="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-2.5">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {{ store.totalMontant.toLocaleString('fr-FR') }} FCFA
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ store.totalCount }} décaissement(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Barre de recherche et actions -->
      <div class="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-lg p-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 flex-1">
            <!-- Filtres de dates -->
            <div class="flex items-center gap-2">
              <Label for="start-date" class="text-sm font-medium text-slate-700">Du</Label>
              <Input
                id="start-date"
                v-model="filters.start_date"
                type="date"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
                @change="loadDecaissements"
              />
            </div>
            <div class="flex items-center gap-2">
              <Label for="end-date" class="text-sm font-medium text-slate-700">Au</Label>
              <Input
                id="end-date"
                v-model="filters.end_date"
                type="date"
                :min="filters.start_date"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
                @change="loadDecaissements"
              />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="handleExportPDF"
              variant="outline"
              class="border-red-500 text-red-600 hover:bg-red-50 shadow-lg"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Exporter PDF
            </Button>
            <Button
              @click="handleExport"
              class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg text-white"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter Excel
            </Button>
          </div>
        </div>
      </div>

      <!-- Tableau -->
      <DecaissementTable
        :decaissements="store.decaissements"
        :loading="store.loading"
        @edit="handleEdit"
        @delete="handleDeleteClick"
      />

      <!-- Modal Approvisionnement Bancaire -->
      <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
        <DialogContent class="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle class="text-2xl font-bold text-slate-900">
              {{ isEditing ? 'Modifier le Décaissement' : 'Nouvel Approvisionnement Bancaire' }}
            </DialogTitle>
            <DialogDescription class="text-slate-600">
              {{ isEditing ? 'Modifier les informations du décaissement' : 'Enregistrer une sortie de caisse vers la banque' }}
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <!-- Point de vente -->
            <div class="space-y-2" v-if="shouldShowStoreSelector">
              <Label for="store" class="text-slate-700">Point de Vente *</Label>
              <select
                id="store"
                v-model.number="formData.store_id"
                class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                required
              >
                <option :value="0" disabled>Sélectionnez un point de vente</option>
                <option v-for="storeItem in stores" :key="storeItem.id" :value="storeItem.id">
                  {{ storeItem.name }} ({{ storeItem.code }})
                </option>
              </select>
            </div>

            <!-- Montant -->
            <div class="space-y-2">
              <Label for="amount" class="text-slate-700">Montant (FCFA) *</Label>
              <Input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                min="0"
                placeholder="Entrez le montant"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            <!-- Mode de paiement -->
            <div class="space-y-2">
              <Label for="payment_method" class="text-slate-700">Mode de paiement *</Label>
              <Select v-model="formData.payment_method">
                <SelectTrigger class="border-slate-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Sélectionnez un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Référence -->
            <div class="space-y-2">
              <Label for="reference" class="text-slate-700">Référence</Label>
              <Input
                id="reference"
                v-model="formData.reference"
                placeholder="Numéro de référence (optionnel)"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description" class="text-slate-700">Description *</Label>
              <Input
                id="description"
                v-model="formData.description"
                placeholder="Description de l'opération"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <Label for="notes" class="text-slate-700">Notes</Label>
              <Textarea
                id="notes"
                v-model="formData.notes"
                placeholder="Notes additionnelles (optionnel)"
                class="border-slate-300 focus:border-red-500 focus:ring-red-500"
                rows="3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              @click="isModalOpen = false"
              :disabled="isSubmitting"
            >
              Annuler
            </Button>
            <Button
              @click="handleSubmit"
              :disabled="isSubmitting"
              class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Enregistrer') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Alert Dialog -->
      <AlertDialog :open="alertDialog.isOpen" @update:open="alertDialog.isOpen = $event">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              :class="{
                'text-green-600': alertDialog.variant === 'success',
                'text-red-600': alertDialog.variant === 'error',
                'text-slate-900': alertDialog.variant === 'default'
              }"
            >
              {{ alertDialog.title }}
            </AlertDialogTitle>
            <AlertDialogDescription class="text-slate-600">
              {{ alertDialog.message }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              @click="alertDialog.isOpen = false"
              :class="{
                'bg-green-600 hover:bg-green-700': alertDialog.variant === 'success',
                'bg-red-600 hover:bg-red-700': alertDialog.variant === 'error',
                'bg-slate-900 hover:bg-slate-800': alertDialog.variant === 'default'
              }"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Delete Confirmation Dialog -->
      <AlertDialog :open="deleteDialog.isOpen" @update:open="deleteDialog.isOpen = $event">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="text-red-600">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription class="text-slate-600">
              Êtes-vous sûr de vouloir supprimer ce décaissement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              @click="deleteDialog.isOpen = false"
            >
              Annuler
            </Button>
            <Button
              @click="confirmDelete"
              class="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Delete Confirmation Dialog -->
      <AlertDialog :open="deleteDialog.isOpen" @update:open="deleteDialog.isOpen = $event">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="text-red-600">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription class="text-slate-600">
              Êtes-vous sûr de vouloir supprimer ce décaissement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              @click="deleteDialog.isOpen = false"
            >
              Annuler
            </Button>
            <Button
              @click="confirmDelete"
              class="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
