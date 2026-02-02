<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Transferts de Stock</h1>
        <p class="text-muted-foreground">
          Gérez les transferts de produits entre magasins
        </p>
      </div>
      <div class="flex gap-2">
        <Button @click="handleExportExcel" variant="outline" size="default">
          <FileSpreadsheet class="mr-2 h-4 w-4" />
          Exporter Excel
        </Button>
        <Button @click="openCreateDialog" size="default">
          <Plus class="mr-2 h-4 w-4" />
          Nouveau Transfert
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-4">
            <div class="rounded-full bg-primary/10 p-3">
              <Package class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total</p>
              <h3 class="text-2xl font-bold">{{ transfersStore.stats.total }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-4">
            <div class="rounded-full bg-yellow-500/10 p-3">
              <FileText class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Brouillons</p>
              <h3 class="text-2xl font-bold text-yellow-600">{{ transfersStore.stats.draft }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-4">
            <div class="rounded-full bg-blue-500/10 p-3">
              <ArrowRightLeft class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">En transit</p>
              <h3 class="text-2xl font-bold text-blue-600">{{ transfersStore.stats.validated }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-4">
            <div class="rounded-full bg-green-500/10 p-3">
              <CheckCircle class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Reçus</p>
              <h3 class="text-2xl font-bold text-green-600">{{ transfersStore.stats.received }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-4">
            <div class="rounded-full bg-red-500/10 p-3">
              <XCircle class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Annulés</p>
              <h3 class="text-2xl font-bold text-red-600">{{ transfersStore.stats.cancelled }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div class="flex-1 space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                v-model="searchQuery"
                @input="handleSearch"
                placeholder="Rechercher par numéro, magasin, produit..."
                class="pl-9"
              />
            </div>
          </div>
          <div class="w-full space-y-2 md:w-48">
            <Label htmlFor="status">Statut</Label>
            <Select v-model="filters.status" @update:model-value="applyFilters">
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DateRangeFilter
            @filter="handleDateFilter"
            @clear="handleClearDateFilter"
          />
          <div class="flex space-x-2">
            <Button @click="resetFilters" variant="outline">
              <X class="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Transfers Table -->
    <Card>
      <CardContent class="p-0">
        <LoadingState v-if="transfersStore.loading" message="Chargement des transferts..." />

        <EmptyState
          v-else-if="!transfersStore.loading && transfersStore.transfers.length === 0"
          :icon="Package"
          title="Aucun transfert"
          message="Commencez par créer un transfert de stock entre magasins"
        >
          <Button @click="openCreateDialog" class="mt-4">
            <Plus class="mr-2 h-4 w-4" />
            Créer un transfert
          </Button>
        </EmptyState>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="px-4 py-3 text-left text-sm font-medium">Référence</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Magasin source</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Magasin destination</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Produit(s)</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transfer in transfersStore.transfers"
                :key="transfer.id"
                class="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                @click="viewTransfer(transfer.id)"
              >
                <td class="px-4 py-3">
                  <div class="font-medium">{{ transfer.transfer_number }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <Store class="h-4 w-4 text-muted-foreground" />
                    <span>{{ transfer.source_store_name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <Store class="h-4 w-4 text-muted-foreground" />
                    <span>{{ transfer.destination_store_name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-muted-foreground">
                  {{ formatDate(transfer.transfer_date) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <Package class="h-4 w-4 text-muted-foreground" />
                    <span v-if="transfer.products && transfer.products.length > 0" class="text-sm" :title="transfer.products.join(', ')">
                      {{ transfer.products.length === 1 ? transfer.products[0] : `${transfer.products.length} produits` }}
                    </span>
                    <span v-else class="text-sm text-muted-foreground">Aucun produit</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="getStatusBadgeClass(transfer.status)" class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {{ getStatusLabel(transfer.status) }}
                  </span>
                </td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex justify-end gap-1">
                    <Button
                      v-if="transfer.status === 'draft'"
                      @click="validateTransferAction(transfer.id)"
                      variant="outline"
                      size="sm"
                      title="Valider le transfert"
                    >
                      <Check class="h-4 w-4" />
                    </Button>
                    <Button
                      v-if="transfer.status === 'in_transit'"
                      @click="receiveTransferAction(transfer.id)"
                      variant="outline"
                      size="sm"
                      title="Réceptionner"
                    >
                      <PackageCheck class="h-4 w-4" />
                    </Button>
                    <Button
                      v-if="['draft', 'pending', 'in_transit'].includes(transfer.status)"
                      @click="cancelTransferAction(transfer.id)"
                      variant="ghost"
                      size="sm"
                      title="Annuler"
                    >
                      <X class="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="transfersStore.totalCount > 20" class="flex items-center justify-between border-t px-4 py-4">
            <div class="text-sm text-muted-foreground">
              Affichage de {{ (transfersStore.currentPage - 1) * 20 + 1 }} à
              {{ Math.min(transfersStore.currentPage * 20, transfersStore.totalCount) }}
              sur {{ transfersStore.totalCount }} transfert(s)
            </div>
            <div class="flex space-x-2">
              <Button
                @click="previousPage"
                :disabled="transfersStore.currentPage === 1"
                variant="outline"
                size="sm"
              >
                Précédent
              </Button>
              <Button
                @click="nextPage"
                :disabled="transfersStore.currentPage * 20 >= transfersStore.totalCount"
                variant="outline"
                size="sm"
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Transfer Form Dialog -->
    <TransferFormDialog
      :open="showCreateDialog"
      @update:open="showCreateDialog = $event"
      :edit-data="currentTransfer"
      @saved="handleTransferCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransfersStore } from '@/stores/transfers.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DateRangeFilter from '@/components/shared/DateRangeFilter.vue'
import LoadingState from '@/components/ui/loading/LoadingState.vue'
import EmptyState from '@/components/ui/empty/EmptyState.vue'
import {
  Plus,
  Search,
  Package,
  X,
  FileSpreadsheet,
  FileText,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Store,
  Check,
  PackageCheck
} from 'lucide-vue-next'
import TransferFormDialog from '@/components/transfers/TransferFormDialog.vue'
import type { TransferStatus, TransferFilters } from '@/services/api/transfers.api'

const router = useRouter()
const transfersStore = useTransfersStore()

const showCreateDialog = ref(false)
const currentTransfer = ref(null)
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const filters = ref({
  status: '' as TransferStatus | '',
  search: '',
  start_date: '',
  end_date: ''
})

// Charger les données au montage
onMounted(async () => {
  try {
    await loadTransfers()
    await transfersStore.fetchStats()
  } catch (error) {
  }
})

// Charger les transferts avec filtres
const loadTransfers = async () => {
  const filterData: Partial<TransferFilters> = {}
  if (filters.value.status) filterData.status = filters.value.status as TransferStatus
  if (searchQuery.value) filterData.search = searchQuery.value
  if (dateFrom.value) filterData.start_date = dateFrom.value
  if (dateTo.value) filterData.end_date = dateTo.value

  await transfersStore.fetchTransfers(filterData as TransferFilters)
  await transfersStore.fetchStats()
}

// Recherche automatique lors de la saisie
const handleSearch = () => {
  loadTransfers()
}

const applyFilters = async () => {
  await loadTransfers()
}

const resetFilters = async () => {
  searchQuery.value = ''
  filters.value = {
    status: '',
    search: '',
    start_date: '',
    end_date: ''
  }
  dateFrom.value = ''
  dateTo.value = ''
  await loadTransfers()
}

// Gestion du filtre par date
const handleDateFilter = ({ dateFrom: from, dateTo: to }: { dateFrom: string; dateTo: string }) => {
  dateFrom.value = from
  dateTo.value = to
  filters.value.start_date = from
  filters.value.end_date = to
  loadTransfers()
}

const handleClearDateFilter = () => {
  dateFrom.value = ''
  dateTo.value = ''
  filters.value.start_date = ''
  filters.value.end_date = ''
  loadTransfers()
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    const filterData: Partial<TransferFilters> = {}
    if (filters.value.status) filterData.status = filters.value.status as TransferStatus
    if (searchQuery.value) filterData.search = searchQuery.value
    if (dateFrom.value) filterData.start_date = dateFrom.value
    if (dateTo.value) filterData.end_date = dateTo.value

    await transfersStore.exportExcel(filterData as TransferFilters)
  } catch (error) {
    alert('Erreur lors de l\'export Excel')
  }
}

const openCreateDialog = () => {
  currentTransfer.value = null
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  currentTransfer.value = null
}

const handleTransferCreated = async () => {
  await transfersStore.fetchTransfers()
  await transfersStore.fetchStats()
  closeCreateDialog()
}

const viewTransfer = (id: number) => {
  router.push(`/transfers/${id}`)
}

const validateTransferAction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir valider ce transfert ?')) {
    try {
      await transfersStore.validateTransfer(id)
      await transfersStore.fetchStats()
    } catch {
      // Error handled in store
    }
  }
}

const receiveTransferAction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir réceptionner ce transfert ?')) {
    try {
      await transfersStore.receiveTransfer(id)
      await transfersStore.fetchStats()
    } catch {
      // Error handled in store
    }
  }
}

const cancelTransferAction = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir annuler ce transfert ?')) {
    try {
      await transfersStore.cancelTransfer(id)
      await transfersStore.fetchStats()
    } catch {
      // Error handled in store
    }
  }
}

const previousPage = async () => {
  if (transfersStore.currentPage > 1) {
    const filterData: Partial<TransferFilters> = {}
    if (filters.value.status) filterData.status = filters.value.status as TransferStatus
    if (filters.value.search) filterData.search = filters.value.search
    await transfersStore.fetchTransfers(filterData as TransferFilters, transfersStore.currentPage - 1)
  }
}

const nextPage = async () => {
  if (transfersStore.currentPage * 20 < transfersStore.totalCount) {
    const filterData: Partial<TransferFilters> = {}
    if (filters.value.status) filterData.status = filters.value.status as TransferStatus
    if (filters.value.search) filterData.search = filters.value.search
    await transfersStore.fetchTransfers(filterData as TransferFilters, transfersStore.currentPage + 1)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatusLabel = (status: TransferStatus) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    in_transit: 'En transit',
    received: 'Reçu',
    cancelled: 'Annulé'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: TransferStatus) => {
  const classes: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
    in_transit: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
