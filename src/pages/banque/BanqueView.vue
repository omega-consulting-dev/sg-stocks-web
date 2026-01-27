<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Gestion Bancaire</h1>
        <p class="text-muted-foreground">Gérez les dépôts et retraits bancaires</p>
      </div>
      <Button @click="openWithdrawalDialog" size="lg">
        <BanknoteArrowDown class="mr-2 h-5 w-5" />
        Nouveau Retrait
      </Button>
    </div>

    <!-- Bank Balance Card -->
    <Card class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <CardHeader>
        <CardTitle class="text-blue-900 dark:text-blue-100">Solde Bancaire</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-blue-900 dark:text-blue-100">
            {{ formatCurrency(bankBalance) }}
          </span>
          <span class="text-sm text-blue-700 dark:text-blue-300">FCFA</span>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-blue-700 dark:text-blue-300">Total Dépôts</p>
            <p class="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {{ formatCurrency(totalDeposits) }} FCFA
            </p>
          </div>
          <div>
            <p class="text-blue-700 dark:text-blue-300">Total Retraits</p>
            <p class="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {{ formatCurrency(totalWithdrawals) }} FCFA
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[200px]">
            <Label for="date_debut">Date Début</Label>
            <Input
              id="date_debut"
              type="date"
              v-model="filters.date_debut"
            />
          </div>
          <div class="flex-1 min-w-[200px]">
            <Label for="date_fin">Date Fin</Label>
            <Input
              id="date_fin"
              type="date"
              v-model="filters.date_fin"
            />
          </div>
          <div class="flex-1 min-w-[200px]">
            <Label for="type">Type de Transaction</Label>
            <Select v-model="filters.type">
              <SelectTrigger id="type">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="depot">Dépôts</SelectItem>
                <SelectItem value="retrait">Retraits</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button @click="fetchTransactions" class="flex-shrink-0">
            <Search class="mr-2 h-4 w-4" />
            Rechercher
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Transactions Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Historique des Transactions</CardTitle>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="exportPDF">
              <FileDown class="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" @click="exportExcel">
              <FileDown class="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Magasin</TableHead>
                <TableHead class="text-right">Montant</TableHead>
                <TableHead class="text-right">Solde Après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="6" class="text-center py-8">
                  <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Chargement...</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="transactions.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
              <TableRow v-else v-for="transaction in transactions" :key="transaction.id">
                <TableCell>{{ formatDate(transaction.date) }}</TableCell>
                <TableCell>
                  <Badge :variant="transaction.type === 'depot' ? 'default' : 'destructive'">
                    <BanknoteArrowUp v-if="transaction.type === 'depot'" class="mr-1 h-3 w-3" />
                    <BanknoteArrowDown v-else class="mr-1 h-3 w-3" />
                    {{ transaction.type === 'depot' ? 'Dépôt' : 'Retrait' }}
                  </Badge>
                </TableCell>
                <TableCell>{{ transaction.description }}</TableCell>
                <TableCell>{{ transaction.store_name }}</TableCell>
                <TableCell class="text-right font-medium" :class="transaction.type === 'depot' ? 'text-green-600' : 'text-red-600'">
                  {{ transaction.type === 'depot' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }} FCFA
                </TableCell>
                <TableCell class="text-right font-semibold">
                  {{ formatCurrency(transaction.balance_after) }} FCFA
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="transactions.length > 0" class="flex items-center justify-between mt-4">
          <p class="text-sm text-muted-foreground">
            Total: {{ totalCount }} transaction(s)
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="previousPage"
              :disabled="!hasPreviousPage"
            >
              Précédent
            </Button>
            <span class="text-sm">Page {{ currentPage }}</span>
            <Button
              variant="outline"
              size="sm"
              @click="nextPage"
              :disabled="!hasNextPage"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Withdrawal Dialog -->
    <Dialog v-model:open="showWithdrawalDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Retrait Bancaire</DialogTitle>
          <DialogDescription>
            Enregistrez un retrait d'argent depuis le compte bancaire
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleWithdrawal" class="space-y-4">
          <div>
            <Label for="withdrawal_amount">Montant *</Label>
            <Input
              id="withdrawal_amount"
              type="number"
              step="0.01"
              min="0"
              v-model.number="withdrawalForm.amount"
              placeholder="Entrez le montant"
              required
            />
          </div>
          <div>
            <Label for="withdrawal_description">Description</Label>
            <Textarea
              id="withdrawal_description"
              v-model="withdrawalForm.description"
              placeholder="Raison du retrait..."
              rows="3"
            />
          </div>
          <div>
            <Label for="withdrawal_store">Magasin de destination *</Label>
            <Select v-model="withdrawalForm.store_id" required>
              <SelectTrigger id="withdrawal_store">
                <SelectValue placeholder="Sélectionnez un magasin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="store in stores"
                  :key="store.id"
                  :value="store.id.toString()"
                >
                  {{ store.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showWithdrawalDialog = false">
              Annuler
            </Button>
            <Button type="submit" :disabled="submitting">
              <div v-if="submitting" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </div>
              <span v-else>Enregistrer le Retrait</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBanqueStore } from '@/stores/banque'
import { useStoresStore } from '@/stores/stores.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { BanknoteArrowDown, BanknoteArrowUp, Search, FileDown } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const banqueStore = useBanqueStore()
const storeStore = useStoresStore()

const loading = ref(false)
const submitting = ref(false)
const showWithdrawalDialog = ref(false)

const filters = ref({
  date_debut: '',
  date_fin: '',
  type: 'all'
})

const withdrawalForm = ref({
  amount: 0,
  description: '',
  store_id: ''
})

const transactions = computed(() => banqueStore.transactions)
const bankBalance = computed(() => banqueStore.balance)
const totalDeposits = computed(() => banqueStore.totalDeposits)
const totalWithdrawals = computed(() => banqueStore.totalWithdrawals)
const stores = computed(() => storeStore.stores)
const totalCount = computed(() => banqueStore.totalCount)
const currentPage = computed(() => banqueStore.currentPage)
const hasNextPage = computed(() => banqueStore.hasNext)
const hasPreviousPage = computed(() => banqueStore.hasPrevious)

onMounted(async () => {
  await fetchTransactions()
  await storeStore.fetchStores()
})

const fetchTransactions = async () => {
  loading.value = true
  try {
    await banqueStore.fetchTransactions(filters.value)
  } catch (_error) {
    toast.error('Impossible de charger les transactions bancaires', 'Erreur')
  } finally {
    loading.value = false
  }
}

const openWithdrawalDialog = () => {
  withdrawalForm.value = {
    amount: 0,
    description: '',
    store_id: ''
  }
  showWithdrawalDialog.value = true
}

const handleWithdrawal = async () => {
  if (!withdrawalForm.value.amount || !withdrawalForm.value.store_id) {
    toast.error('Veuillez remplir tous les champs obligatoires', 'Erreur')
    return
  }

  submitting.value = true
  try {
    await banqueStore.createWithdrawal({
      amount: withdrawalForm.value.amount,
      description: withdrawalForm.value.description || 'Retrait bancaire',
      store_id: parseInt(withdrawalForm.value.store_id)
    })
    
    toast.success('Retrait bancaire enregistré avec succès', 'Succès')
    
    showWithdrawalDialog.value = false
    await fetchTransactions()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Impossible d\'enregistrer le retrait'
    toast.error(errorMessage, 'Erreur')
  } finally {
    submitting.value = false
  }
}

const nextPage = async () => {
  await banqueStore.nextPage()
}

const previousPage = async () => {
  await banqueStore.previousPage()
}

const exportPDF = async () => {
  try {
    await banqueStore.exportPDF(filters.value)
    toast.success('Export PDF généré avec succès', 'Succès')
  } catch (_error) {
    toast.error('Impossible de générer le PDF', 'Erreur')
  }
}

const exportExcel = async () => {
  try {
    await banqueStore.exportExcel(filters.value)
    toast.success('Export Excel généré avec succès', 'Succès')
  } catch (_error) {
    toast.error('Impossible de générer l\'Excel', 'Erreur')
  }
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
