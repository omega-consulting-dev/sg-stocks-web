<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDecaissementsStore } from '@/stores/decaissements'
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
import { Plus, DollarSign } from 'lucide-vue-next'
import DecaissementSearchBar from '@/components/decaissements/DecaissementSearchBar.vue'
import DecaissementTable from '@/components/decaissements/DecaissementTable.vue'
import { encaissementsApi } from '@/services/api/encaissements.api'

const store = useDecaissementsStore()

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

const formData = ref({
  amount: 0,
  payment_method: 'cash',
  reference: '',
  description: '',
  notes: '',
  store_id: 0
})

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
    alert('Erreur lors de l\'export du fichier Excel')
  }
}

const handleNew = () => {
  formData.value = {
    amount: 0,
    payment_method: 'cash',
    reference: '',
    description: '',
    notes: '',
    store_id: stores.value.length > 0 ? stores.value[0].id : 0
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  if (formData.value.amount <= 0) {
    alert('Le montant doit être supérieur à 0')
    return
  }

  if (!formData.value.description) {
    alert('La description est obligatoire')
    return
  }

  if (!formData.value.store_id) {
    alert('Veuillez sélectionner un point de vente')
    return
  }

  isSubmitting.value = true
  try {
    await store.createDecaissement(formData.value)
    alert('Décaissement créé avec succès')
    isModalOpen.value = false
    await loadDecaissements()
    const storeFilter = selectedStoreId.value === '' ? undefined : selectedStoreId.value
    await store.fetchCaisseSolde(storeFilter)
  } catch (error: any) {
    console.error('Erreur lors de la création:', error)
    alert(error.response?.data?.error || 'Erreur lors de la création du décaissement')
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

  await store.fetchCaisseSolde()
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
                Gérer les approvisionnements bancaires et sorties de caisse
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
            <div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2.5">
              <DollarSign class="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {{ store.soldeCaisse.toLocaleString('fr-FR') }} FCFA
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Solde actuel de la caisse
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
          <Button
            @click="handleExport"
            class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg text-white"
          >
            Exporter Excel
          </Button>
        </div>
      </div>

      <!-- Tableau -->
      <DecaissementTable :decaissements="store.decaissements" :loading="store.loading" />

      <!-- Modal Approvisionnement Bancaire -->
      <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
        <DialogContent class="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle class="text-2xl font-bold text-slate-900">
              Nouvel Approvisionnement Bancaire
            </DialogTitle>
            <DialogDescription class="text-slate-600">
              Enregistrer une sortie de caisse vers la banque
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <!-- Point de vente -->
            <div class="space-y-2">
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
              {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
