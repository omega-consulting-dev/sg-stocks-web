<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">MTN/Orange Money</h1>
        <p class="text-muted-foreground">Gérez vos transactions Mobile Money</p>
      </div>
      <div class="flex gap-3">
        <Button @click="openDepositDialog" size="lg" variant="default">
          <BanknoteArrowUp class="mr-2 h-5 w-5" />
          Faire un Dépôt
        </Button>
        <Button @click="openWithdrawalDialog" size="lg" variant="outline">
          <BanknoteArrowDown class="mr-2 h-5 w-5" />
          Nouveau Retrait
        </Button>
      </div>
    </div>

    <!-- Mobile Money Balance Card -->
    <Card class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
      <CardHeader>
        <CardTitle class="text-orange-900 dark:text-orange-100">Solde Mobile Money</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-orange-900 dark:text-orange-100">
            {{ formatCurrency(store.balance) }}
          </span>
          <span class="text-sm text-orange-700 dark:text-orange-300">XAF</span>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-orange-700 dark:text-orange-300">Total Dépôts</p>
            <p class="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {{ formatCurrency(totalDeposits) }} XAF
            </p>
          </div>
          <div>
            <p class="text-orange-700 dark:text-orange-300">Total Retraits</p>
            <p class="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {{ formatCurrency(totalWithdrawals) }} XAF
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
                <SelectItem value="depot">Entrées</SelectItem>
                <SelectItem value="retrait">Sorties</SelectItem>
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
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Magasin</TableHead>
                <TableHead class="text-right">Montant</TableHead>
                <TableHead class="text-right">Solde Après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="store.loading">
                <TableCell colspan="7" class="text-center py-8">
                  <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Chargement...</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="store.transactions.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
              <TableRow v-else v-for="(transaction, index) in store.transactions" :key="transaction.id">
                <TableCell class="font-medium">{{ index + 1 }}</TableCell>
                <TableCell>{{ formatDate(transaction.date) }}</TableCell>
                <TableCell>
                  <Badge :variant="(transaction.type === 'depot' || transaction.type === 'paiement') ? 'default' : 'destructive'">
                    {{ (transaction.type === 'depot' || transaction.type === 'paiement') ? 'Dépôt' : 'Retrait' }}
                  </Badge>
                </TableCell>
                <TableCell>{{ transaction.description }}</TableCell>
                <TableCell>{{ transaction.store_name }}</TableCell>
                <TableCell class="text-right font-medium" :class="(transaction.type === 'depot' || transaction.type === 'paiement') ? 'text-green-600' : 'text-red-600'">
                  {{ (transaction.type === 'depot' || transaction.type === 'paiement') ? '+' : '-' }}{{ formatCurrency(transaction.amount) }} XAF
                </TableCell>
                <TableCell class="text-right font-semibold text-blue-600 dark:text-blue-400">
                  {{ formatCurrency(transaction.balance_after) }} XAF
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="store.transactions.length > 0" class="flex items-center justify-between mt-4">
          <p class="text-sm text-muted-foreground">
            Total: {{ store.totalCount }} transaction(s)
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="store.previousPage"
              :disabled="!store.hasPrevious"
            >
              Précédent
            </Button>
            <span class="text-sm">Page {{ store.currentPage }}</span>
            <Button
              variant="outline"
              size="sm"
              @click="store.nextPage"
              :disabled="!store.hasNext"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Deposit Dialog -->
  <Dialog v-model:open="showDepositDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Dépôt Mobile Money</DialogTitle>
        <DialogDescription>
          Transférer de l'argent de la caisse vers Mobile Money (MTN/Orange)
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleDeposit" class="space-y-4">
        <div v-if="isAdmin">
          <Label for="deposit_store">Point de Vente</Label>
          <Select v-model="depositForm.store_id">
            <SelectTrigger id="deposit_store">
              <SelectValue placeholder="Sélectionnez un point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les points de vente</SelectItem>
              <SelectItem v-for="s in storesStore.stores" :key="s.id" :value="s.id">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label for="deposit_date">Date *</Label>
          <Input
            id="deposit_date"
            type="date"
            v-model="depositForm.date"
            required
          />
        </div>
        <div>
          <Label for="deposit_amount">Montant *</Label>
          <Input
            id="deposit_amount"
            type="number"
            step="0.01"
            min="0"
            v-model.number="depositForm.amount"
            placeholder="Entrez le montant à déposer"
            required
          />
        </div>
        <div>
          <Label for="deposit_description">Motif</Label>
          <Textarea
            id="deposit_description"
            v-model="depositForm.description"
            placeholder="Motif du dépôt..."
            rows="3"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="showDepositDialog = false">
            Annuler
          </Button>
          <Button type="submit" :disabled="submitting">
            <div v-if="submitting" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enregistrement...</span>
            </div>
            <span v-else>Enregistrer le Dépôt</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Withdrawal Dialog -->
  <Dialog v-model:open="showWithdrawalDialog">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Retrait Mobile Money</DialogTitle>
        <DialogDescription>
          Retirer de l'argent de Mobile Money vers la caisse
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleWithdrawal" class="space-y-4">
        <div v-if="isAdmin">
          <Label for="withdrawal_store">Point de Vente</Label>
          <Select v-model="withdrawalForm.store_id">
            <SelectTrigger id="withdrawal_store">
              <SelectValue placeholder="Sélectionnez un point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les points de vente</SelectItem>
              <SelectItem v-for="s in storesStore.stores" :key="s.id" :value="s.id">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label for="withdrawal_date">Date *</Label>
          <Input
            id="withdrawal_date"
            type="date"
            v-model="withdrawalForm.date"
            required
          />
        </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMobileMoneyStore } from '@/stores/mobile-money'
import { useAuthStore } from '@/stores/auth.store'
import { useStoresStore } from '@/stores/stores.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, BanknoteArrowDown, BanknoteArrowUp, FileDown } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const store = useMobileMoneyStore()
const authStore = useAuthStore()
const storesStore = useStoresStore()

// Vérifier si l'utilisateur est admin (sans point de vente assigné)
const isAdmin = computed(() => {
  const user = authStore.user
  return user?.is_superuser || (user?.role?.access_scope === 'all' && (!user?.assigned_stores || user.assigned_stores.length === 0))
})

// Calculer les totaux des dépôts et retraits
const totalDeposits = computed(() => {
  return store.transactions
    .filter(t => t.type === 'depot' || t.type === 'paiement')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalWithdrawals = computed(() => {
  return store.transactions
    .filter(t => t.type === 'retrait')
    .reduce((sum, t) => sum + t.amount, 0)
})

const showDepositDialog = ref(false)
const showWithdrawalDialog = ref(false)
const submitting = ref(false)

const filters = ref({
  date_debut: '',
  date_fin: '',
  type: 'all'
})

const depositForm = ref({
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  store_id: undefined as number | undefined
})

const withdrawalForm = ref({
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  store_id: undefined as number | undefined
})

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return new Intl.NumberFormat('fr-FR').format(value)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const fetchTransactions = async () => {
  await store.fetchTransactions({
    ...filters.value,
    type: filters.value.type === 'all' ? undefined : filters.value.type
  })
}

const openDepositDialog = () => {
  depositForm.value = {
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    store_id: undefined
  }
  showDepositDialog.value = true
}

const openWithdrawalDialog = () => {
  withdrawalForm.value = {
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    store_id: undefined
  }
  showWithdrawalDialog.value = true
}

const handleDeposit = async () => {
  if (!depositForm.value.amount || depositForm.value.amount <= 0) {
    toast.error('Veuillez entrer un montant valide', 'Erreur')
    return
  }

  submitting.value = true
  try {
    await store.createDeposit({
      amount: depositForm.value.amount,
      description: depositForm.value.description || 'Dépôt Mobile Money',
      date: depositForm.value.date,
      store_id: depositForm.value.store_id
    })

    toast.success('Dépôt Mobile Money enregistré avec succès', 'Succès')
    showDepositDialog.value = false
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error.message || 'Impossible d\'enregistrer le dépôt'
    toast.error(errorMessage, 'Erreur')
  } finally {
    submitting.value = false
  }
}

const handleWithdrawal = async () => {
  if (!withdrawalForm.value.amount || withdrawalForm.value.amount <= 0) {
    toast.error('Veuillez entrer un montant valide', 'Erreur')
    return
  }

  submitting.value = true
  try {
    await store.createWithdrawal({
      amount: withdrawalForm.value.amount,
      description: withdrawalForm.value.description || 'Retrait Mobile Money',
      date: withdrawalForm.value.date,
      store_id: withdrawalForm.value.store_id
    })

    toast.success('Retrait Mobile Money enregistré avec succès', 'Succès')
    showWithdrawalDialog.value = false
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error.message || 'Impossible d\'enregistrer le retrait'
    toast.error(errorMessage, 'Erreur')
  } finally {
    submitting.value = false
  }
}

const exportPDF = async () => {
  try {
    await store.exportPDF(filters.value)
    toast.success('Export PDF généré avec succès', 'Succès')
  } catch (error: any) {
    toast.error('Erreur lors de l\'export PDF', 'Erreur')
  }
}

const exportExcel = async () => {
  try {
    await store.exportExcel(filters.value)
    toast.success('Export Excel généré avec succès', 'Succès')
  } catch (error: any) {
    toast.error('Erreur lors de l\'export Excel', 'Erreur')
  }
}

onMounted(async () => {
  if (isAdmin.value) {
    await storesStore.fetchStores()
  }
  await store.fetchBalance()
  await fetchTransactions()
})
</script>

