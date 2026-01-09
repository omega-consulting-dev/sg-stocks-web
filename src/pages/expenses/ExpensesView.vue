<template>
  <div class="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Dépenses</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with title and actions -->
    <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Dépenses</h1>
        <p class="opacity-60 text-xs sm:text-sm">Gestion des dépenses de l'entreprise</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-4">
        <!-- Manage Categories button -->
        <Button
          @click="$router.push('/depenses/categories')"
          variant="outline"
          class="px-2 sm:px-4"
        >
          <FolderTree class="h-4 w-4" />
          <span class="hidden sm:inline">Catégories</span>
        </Button>

        <!-- Export button -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="px-2 sm:px-4">
              <Upload class="h-4 w-4" />
              <span class="hidden sm:inline">Exporter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="rounded-lg" align="end">
            <DropdownMenuItem @select="exportToExcel" class="gap-2 cursor-pointer">
              <Sheet class="h-4 w-4 text-green-600" />
              <span>Exporter en Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Create button -->
        <Button @click="openCreateDialog" class="px-2 sm:px-4">
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Nouvelle Dépense</span>
        </Button>
      </div>
    </header>


 <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Dépenses Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-blue-700/70">Total Dépenses</p>
              <p class="text-[28px] font-bold text-blue-900">{{ formatCurrency(expensesStore.totalAmount) }}</p>
              <p class="text-[11px] text-blue-600/60">Toutes périodes</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Payées Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-green-700/70">Dépenses Payées</p>
              <p class="text-[28px] font-bold text-green-900">{{ formatCurrency(expensesStore.totalPaid) }}</p>
              <p class="text-[11px] text-green-600/60">Payées et validées</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Check class="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- En Attente Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-orange-700/70">En Attente</p>
              <p class="text-[28px] font-bold text-orange-900">{{ formatCurrency(expensesStore.totalPending) }}</p>
              <p class="text-[11px] text-orange-600/60">À approuver</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <RotateCcw class="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Nombre Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-purple-700/70">Nombre Total</p>
              <p class="text-[28px] font-bold text-purple-900">{{ expensesStore.expenses.length }}</p>
              <p class="text-[11px] text-purple-600/60">Dépenses enregistrées</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sheet class="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>


    <!-- Filters section -->
    <Card class="rounded-xl border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Category filter -->
          <div class="flex flex-col gap-2">
            <Label for="category-filter" class="text-[13px] font-medium text-[#9197B3]">Catégorie</Label>
            <Select v-model="selectedCategory" @update:model-value="applyFilters">
              <SelectTrigger id="category-filter" class="h-[38px] rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent class="rounded-[10px]">
                <SelectItem :value="undefined">Toutes les catégories</SelectItem>
                <SelectItem v-for="cat in expensesStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status filter -->
          <div class="flex flex-col gap-2">
            <Label for="status-filter" class="text-[13px] font-medium text-[#9197B3]">Statut</Label>
            <Select v-model="selectedStatus" @update:model-value="applyFilters">
              <SelectTrigger id="status-filter" class="h-[38px] rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent class="rounded-[10px]">
                <SelectItem :value="undefined">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date from filter -->
          <div class="flex flex-col gap-2">
            <Label for="date-from" class="text-[13px] font-medium text-[#9197B3]">Date début</Label>
            <Input
              id="date-from"
              type="date"
              v-model="dateFrom"
              @change="applyFilters"
              class="h-[38px] rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors"
            />
          </div>

          <!-- Date to filter -->
          <div class="flex flex-col gap-2">
            <Label for="date-to" class="text-[13px] font-medium text-[#9197B3]">Date fin</Label>
            <Input
              id="date-to"
              type="date"
              v-model="dateTo"
              @change="applyFilters"
              class="h-[38px] rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors"
            />
          </div>

          <!-- Clear filters button -->
          <div class="flex items-end">
            <Button
              @click="clearFiltersClick"
              variant="outline"
              class="w-full h-[38px] gap-2 rounded-[10px] border-[#E5E5E5] hover:bg-[#5932EA] hover:text-white hover:border-[#5932EA] transition-all"
            >
              <RotateCcw class="h-4 w-4" />
              <span class="hidden sm:inline">Réinitialiser</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>



    <!-- Loading indicator -->
    <div v-if="expensesStore.isLoading" class="flex items-center justify-center py-12">
      <Skeleton class="h-12 w-12 rounded-full" />
    </div>

    <!-- Expenses table -->
    <Card v-else class="rounded-xl">
      <CardContent class="pt-6">
        <div v-if="expensesStore.expenses.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Aucune dépense trouvée</p>
        </div>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead class="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(expense, index) in expensesStore.expenses" :key="expense.id">
                <TableCell class="font-semibold text-gray-500">{{ index + 1 }}</TableCell>
                <TableCell>{{ formatDate(expense.expense_date) }}</TableCell>
                <TableCell>{{ expense.category_name }}</TableCell>
                <TableCell>{{ expense.beneficiary }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatCurrency(expense.amount) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusBadgeVariant(expense.status)">
                    {{ expense.status_display }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0 rounded-lg">
                        <MoreVertical class="h-4 w-4" />
                        <span class="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="rounded-lg" align="end">
                      <DropdownMenuItem @select="editExpense(expense)">
                        <Pencil class="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        v-if="expense.status === 'draft' || expense.status === 'pending'"
                        @select="approveExpenseDialog(expense)"
                      >
                        <Check class="mr-2 h-4 w-4 text-green-600" />
                        Approuver
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        v-if="expense.status === 'draft' || expense.status === 'pending'"
                        @select="rejectExpenseDialog(expense)"
                      >
                        <X class="mr-2 h-4 w-4 text-red-600" />
                        Rejeter
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        v-if="expense.status === 'approved'"
                        @select="markAsPaidDialog(expense)"
                      >
                        <CreditCard class="mr-2 h-4 w-4 text-green-600" />
                        Marquer payée
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        @select="deleteExpenseDialog(expense)"
                        class="text-red-600"
                      >
                        <Trash2 class="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Pagination -->
          <div v-if="expensesStore.pagination.total_pages > 1" class="flex items-center justify-between mt-6 pt-6 border-t">
            <p class="text-sm text-muted-foreground">
              Page {{ expensesStore.pagination.current_page }} / {{ expensesStore.pagination.total_pages }}
            </p>
            <div class="flex gap-2">
              <Button
                @click="previousPage"
                :disabled="!expensesStore.pagination.previous"
                variant="outline"
                class="rounded-lg"
              >
                ← Précédent
              </Button>
              <Button
                @click="nextPage"
                :disabled="!expensesStore.pagination.next"
                variant="outline"
                class="rounded-lg"
              >
                Suivant →
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <ExpenseDialog
      v-if="showDialog"
      :expense="selectedExpenseForEdit"
      @close="closeDialog"
      @save="handleSaveExpense"
    />

    <!-- Mark as paid Dialog -->
    <MarkAsPaidDialog
      v-if="showPaymentDialog"
      :expense="selectedExpenseForPayment"
      @close="showPaymentDialog = false"
      @confirm="handleMarkAsPaid"
    />

    <!-- Approve Confirmation Dialog -->
    <Dialog :open="showApproveDialog" @update:open="showApproveDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-green-600">
            <Check class="h-5 w-5" />
            Approuver la dépense
          </DialogTitle>
          <DialogDescription class="pt-4">
            Êtes-vous sûr de vouloir approuver cette dépense ?
            <div v-if="selectedExpenseForAction" class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Montant:</span>
                  <span class="font-bold text-green-700">{{ formatCurrency(selectedExpenseForAction.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Bénéficiaire:</span>
                  <span class="text-gray-900">{{ selectedExpenseForAction.beneficiary }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Catégorie:</span>
                  <span class="text-gray-900">{{ selectedExpenseForAction.category_name }}</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showApproveDialog = false">
            Annuler
          </Button>
          <Button @click="handleApproveExpense" class="bg-green-600 hover:bg-green-700">
            <Check class="h-4 w-4 mr-2" />
            Approuver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Confirmation Dialog -->
    <Dialog :open="showRejectDialog" @update:open="showRejectDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-red-600">
            <X class="h-5 w-5" />
            Rejeter la dépense
          </DialogTitle>
          <DialogDescription class="pt-4">
            Êtes-vous sûr de vouloir rejeter cette dépense ?
            <div v-if="selectedExpenseForAction" class="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Montant:</span>
                  <span class="font-bold text-red-700">{{ formatCurrency(selectedExpenseForAction.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Bénéficiaire:</span>
                  <span class="text-gray-900">{{ selectedExpenseForAction.beneficiary }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Catégorie:</span>
                  <span class="text-gray-900">{{ selectedExpenseForAction.category_name }}</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showRejectDialog = false">
            Annuler
          </Button>
          <Button @click="handleRejectExpense" variant="destructive">
            <X class="h-4 w-4 mr-2" />
            Rejeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-red-600">
            <Trash2 class="h-5 w-5" />
            Supprimer la dépense
          </DialogTitle>
          <DialogDescription class="pt-4">
            Êtes-vous sûr de vouloir supprimer définitivement cette dépense ? Cette action est irréversible.
            <div v-if="selectedExpenseForAction" class="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Montant:</span>
                  <span class="font-bold text-red-700">{{ formatCurrency(selectedExpenseForAction.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Bénéficiaire:</span>
                  <span class="text-gray-900">{{ selectedExpenseForAction.beneficiary }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Date:</span>
                  <span class="text-gray-900">{{ formatDate(selectedExpenseForAction.expense_date) }}</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="showDeleteDialog = false">
            Annuler
          </Button>
          <Button @click="handleDeleteExpense" variant="destructive">
            <Trash2 class="h-4 w-4 mr-2" />
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useStoresStatsStore } from '@/stores/storesStats'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { PAYMENT_METHOD_LABELS } from '@/types/expenses'
import ExpenseDialog from '@/components/expenses/ExpenseDialog.vue'
import MarkAsPaidDialog from '@/components/expenses/MarkAsPaidDialog.vue'
import type { Expense } from '@/types/expenses'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Upload, Sheet, RotateCcw, MoreVertical, Pencil, Check, X, CreditCard, Trash2, FolderTree } from 'lucide-vue-next'

const expensesStore = useExpensesStore()

const showDialog = ref(false)
const showPaymentDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedExpenseForEdit = ref<Expense | null>(null)
const selectedExpenseForPayment = ref<Expense | null>(null)
const selectedExpenseForAction = ref<Expense | null>(null)

const selectedCategory = ref<number | undefined>()
const selectedStatus = ref<string | undefined>()
const dateFrom = ref('')
const dateTo = ref('')

// Lifecycle
onMounted(async () => {
  await expensesStore.fetchCategories()
  await expensesStore.fetchExpenses()
})

// Methods
function openCreateDialog() {
  selectedExpenseForEdit.value = null
  showDialog.value = true
}

function editExpense(expense: Expense) {
  selectedExpenseForEdit.value = expense
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  selectedExpenseForEdit.value = null
}

async function handleSaveExpense() {
  closeDialog()
  await expensesStore.forceRefresh()

  // Refresh stores stats if needed
  try {
    const storesStatsStore = useStoresStatsStore()
    await storesStatsStore.refreshStats()
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des stats stores:', error)
  }
}

function approveExpenseDialog(expense: Expense) {
  selectedExpenseForAction.value = expense
  showApproveDialog.value = true
}

async function handleApproveExpense() {
  if (selectedExpenseForAction.value) {
    try {
      await expensesStore.approveExpense(selectedExpenseForAction.value.id)
      showApproveDialog.value = false
      selectedExpenseForAction.value = null
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }
}

function rejectExpenseDialog(expense: Expense) {
  selectedExpenseForAction.value = expense
  showRejectDialog.value = true
}

async function handleRejectExpense() {
  if (selectedExpenseForAction.value) {
    try {
      await expensesStore.rejectExpense(selectedExpenseForAction.value.id)
      showRejectDialog.value = false
      selectedExpenseForAction.value = null
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }
}

function markAsPaidDialog(expense: Expense) {
  selectedExpenseForPayment.value = expense
  showPaymentDialog.value = true
}

async function handleMarkAsPaid(paymentMethod: string, paymentReference: string) {
  if (selectedExpenseForPayment.value) {
    try {
      await expensesStore.markAsPaid(
        selectedExpenseForPayment.value.id,
        paymentMethod,
        paymentReference
      )
      showPaymentDialog.value = false
      selectedExpenseForPayment.value = null
    } catch (error) {
      console.error('Erreur lors du marquage comme payé:', error)
    }
  }
}

function deleteExpenseDialog(expense: Expense) {
  selectedExpenseForAction.value = expense
  showDeleteDialog.value = true
}

async function handleDeleteExpense() {
  if (selectedExpenseForAction.value) {
    try {
      await expensesStore.deleteExpense(selectedExpenseForAction.value.id)
      showDeleteDialog.value = false
      selectedExpenseForAction.value = null
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

async function deleteExpense_OLD(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
    try {
      await expensesStore.deleteExpense(id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

function applyFilters() {
  expensesStore.fetchExpenses(1, {
    category: selectedCategory.value,
    status: selectedStatus.value as any,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
  })
}

function clearFiltersClick() {
  selectedCategory.value = undefined
  selectedStatus.value = undefined
  dateFrom.value = ''
  dateTo.value = ''
  expensesStore.clearFilters()
  expensesStore.fetchExpenses()
}

async function exportToExcel() {
  try {
    await expensesStore.exportToExcel()
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  }
}

function previousPage() {
  if (expensesStore.pagination.previous) {
    expensesStore.fetchExpenses(expensesStore.pagination.current_page - 1, expensesStore.filters)
  }
}

function nextPage() {
  if (expensesStore.pagination.next) {
    expensesStore.fetchExpenses(expensesStore.pagination.current_page + 1, expensesStore.filters)
  }
}

function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | undefined {
  const variants: Record<string, any> = {
    draft: 'secondary',
    pending: 'warning',
    approved: 'success',
    paid: 'info',
    rejected: 'error',
  }
  return variants[status] || 'default'
}
</script>
