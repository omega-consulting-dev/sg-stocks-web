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
          <BreadcrumbPage>Emprunts</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with title and actions -->
    <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Emprunts</h1>
        <p class="opacity-60 text-xs sm:text-sm">Gestion des emprunts et remboursements</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-4">
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
          <span class="hidden sm:inline">Nouvel Emprunt</span>
        </Button>
      </div>
    </header>


    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Emprunté Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-blue-700/70">Total Emprunté</p>
              <p class="text-[28px] font-bold text-blue-900">{{ formatCurrency(loansStore.totalBorrowed) }}</p>
              <p class="text-[11px] text-blue-600/60">Principal + intérêts</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              💰
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Total Payé Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-green-700/70">Total Payé</p>
              <p class="text-[28px] font-bold text-green-900">{{ formatCurrency(loansStore.totalPaid) }}</p>
              <p class="text-[11px] text-green-600/60">Remboursements effectués</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              ✅
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Solde Restant Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-orange-700/70">Solde Restant</p>
              <p class="text-[28px] font-bold text-orange-900">{{ formatCurrency(loansStore.totalBalance) }}</p>
              <p class="text-[11px] text-orange-600/60">À rembourser</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Nombre Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-purple-700/70">Emprunts Actifs</p>
              <p class="text-[28px] font-bold text-purple-900">{{ loansStore.activeLoans.length }}</p>
              <p class="text-[11px] text-purple-600/60">En cours</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              📈
            </div>
          </div>
        </CardContent>
      </Card>
    </div>


    <!-- Filters section -->
    <Card class="rounded-xl border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Type filter -->
          <div class="flex flex-col gap-2">
            <Label for="type-filter" class="text-[13px] font-medium text-[#9197B3]">Type d'emprunt</Label>
            <Select v-model="selectedType" @update:model-value="applyFilters">
              <SelectTrigger id="type-filter" class="h-[38px] rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent class="rounded-[10px]">
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="bank">Prêt bancaire</SelectItem>
                <SelectItem value="supplier">Crédit fournisseur</SelectItem>
                <SelectItem value="personal">Prêt personnel</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
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
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="paid">Remboursé</SelectItem>
                <SelectItem value="defaulted">En défaut</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
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

          <!-- Clear filters button -->
          <div class="flex items-end">
            <Button
              @click="clearFiltersClick"
              variant="outline"
              class="w-full px-2 sm:px-4"
            >
              <RotateCcw class="h-4 w-4" />
              <span class="hidden sm:inline">Réinitialiser</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>



    <!-- Loading indicator -->
    <div v-if="loansStore.isLoading" class="flex items-center justify-center py-12">
      <Skeleton class="h-12 w-12 rounded-full" />
    </div>

    <!-- Loans table -->
    <Card v-else class="rounded-xl">
      <CardContent class="pt-6">
        <div v-if="loansStore.loans.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Aucun emprunt trouvé</p>
        </div>
        <div v-else class="overflow-x-auto -mx-4 sm:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead v-if="tableColumns.loan_number" class="min-w-[100px]">N° Emprunt</TableHead>
                <TableHead v-if="tableColumns.lender_name" class="min-w-[120px]">Prêteur</TableHead>
                <TableHead v-if="tableColumns.loan_type" class="hidden md:table-cell min-w-[100px]">Type</TableHead>
                <TableHead v-if="tableColumns.start_date" class="hidden lg:table-cell min-w-[100px]">Date</TableHead>
                <TableHead v-if="tableColumns.principal_amount" class="text-right min-w-[120px]">Montant Total</TableHead>
                <TableHead v-if="tableColumns.interest_rate" class="hidden lg:table-cell text-center min-w-[80px]">Taux (%)</TableHead>
                <TableHead v-if="tableColumns.balance_due" class="text-right min-w-[120px]">Solde Restant</TableHead>
                <TableHead v-if="tableColumns.status" class="hidden sm:table-cell min-w-[100px]">Statut</TableHead>
                <TableHead class="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="loan in loansStore.loans" :key="loan.id">
                <TableCell v-if="tableColumns.loan_number" class="font-medium">
                  <div class="flex flex-col">
                    <span>{{ loan.loan_number }}</span>
                    <span v-if="tableColumns.status" class="sm:hidden text-xs text-muted-foreground mt-1">
                      <Badge :variant="getStatusBadgeVariant(loan.status)" class="text-xs px-1 py-0">
                        {{ loan.status_display }}
                      </Badge>
                    </span>
                  </div>
                </TableCell>
                <TableCell v-if="tableColumns.lender_name">
                  <div class="flex flex-col">
                    <span>{{ loan.lender_name }}</span>
                    <span v-if="tableColumns.loan_type" class="md:hidden text-xs text-muted-foreground mt-1">{{ loan.loan_type_display }}</span>
                  </div>
                </TableCell>
                <TableCell v-if="tableColumns.loan_type" class="hidden md:table-cell">
                  <Badge variant="outline">{{ loan.loan_type_display }}</Badge>
                </TableCell>
                <TableCell v-if="tableColumns.start_date" class="hidden lg:table-cell text-sm text-muted-foreground">
                  {{ formatDate(loan.start_date) }}
                </TableCell>
                <TableCell v-if="tableColumns.principal_amount" class="text-right font-medium">{{ formatCurrency(loan.total_amount) }}</TableCell>
                <TableCell v-if="tableColumns.interest_rate" class="hidden lg:table-cell text-center">{{ loan.interest_rate }}%</TableCell>
                <TableCell v-if="tableColumns.balance_due" class="text-right font-bold" :class="loan.balance_due > 0 ? 'text-orange-600' : 'text-green-600'">
                  {{ formatCurrency(loan.balance_due) }}
                </TableCell>
                <TableCell v-if="tableColumns.status" class="hidden sm:table-cell">
                  <Badge :variant="getStatusBadgeVariant(loan.status)">
                    {{ loan.status_display }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0 rounded-lg">
                        ⋮
                        <span class="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="rounded-lg" align="end">
                      <DropdownMenuItem @select="editLoan(loan)">
                        <Pencil class="h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        v-if="loan.status === 'active' && loan.balance_due > 0"
                        @select="openPaymentDialog(loan)"
                      >
                        <CreditCard class="h-4 w-4" />
                        Effectuer un paiement
                      </DropdownMenuItem>

                      <DropdownMenuItem @select="openHistoryDialog(loan)">
                        <History class="h-4 w-4" />
                        Historique des paiements
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        @select="deleteLoan(loan.id)"
                        class="text-red-600"
                      >
                        <Trash2 class="h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Pagination -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
            <p class="text-sm text-muted-foreground">
              Page {{ loansStore.pagination.current_page }} / {{ loansStore.pagination.total_pages }}
            </p>
            <div class="flex gap-2">
              <Button
                @click="previousPage"
                :disabled="!loansStore.pagination.previous"
                variant="outline"
                class="rounded-lg px-3 sm:px-4"
              >
                <span class="hidden sm:inline">← Précédent</span>
                <span class="sm:hidden">←</span>
              </Button>
              <Button
                @click="nextPage"
                :disabled="!loansStore.pagination.next"
                variant="outline"
                class="rounded-lg px-3 sm:px-4"
              >
                <span class="hidden sm:inline">Suivant →</span>
                <span class="sm:hidden">→</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <LoanDialog
      v-if="showDialog"
      :loan="selectedLoanForEdit"
      @close="closeDialog"
      @save="handleSaveLoan"
    />

    <!-- Payment Dialog -->
    <LoanPaymentDialog
      v-if="showPaymentDialog && selectedLoanForPayment"
      :loan="selectedLoanForPayment"
      @close="showPaymentDialog = false"
      @confirm="handlePaymentConfirm"
    />

    <!-- Payment History Dialog -->
    <LoanPaymentHistoryDialog
      v-if="showHistoryDialog && selectedLoanForHistory"
      :loan="selectedLoanForHistory"
      @close="showHistoryDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLoansStore } from '@/stores/loans';
import { useFieldConfigStore } from '@/stores/field-config.store';
import { formatCurrency, formatDate } from '@/lib/formatters';
import LoanDialog from '@/components/loans/LoanDialog.vue';
import LoanPaymentDialog from '@/components/loans/LoanPaymentDialog.vue';
import LoanPaymentHistoryDialog from '@/components/loans/LoanPaymentHistoryDialog.vue';
import type { Loan } from '@/types/loans';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Upload, Sheet, RotateCcw, MoreVertical, Pencil, Check, X, CreditCard, Trash2, History } from 'lucide-vue-next';

const loansStore = useLoansStore();
const fieldConfigStore = useFieldConfigStore();

const showDialog = ref(false);
const showPaymentDialog = ref(false);
const showHistoryDialog = ref(false);
const selectedLoanForEdit = ref<Loan | null>(null);
const selectedLoanForPayment = ref<Loan | null>(null);
const selectedLoanForHistory = ref<Loan | null>(null);

const selectedType = ref<string>('all');
const selectedStatus = ref<string>('all');
const dateFrom = ref('');

// Field configurations
const tableColumns = computed(() => {
  const configsByForm = fieldConfigStore.getConfigsByForm();
  const configs = configsByForm['loan_table'] || [];
  return {
    loan_number: configs.find(c => c.field_name === 'loan_number')?.is_visible ?? true,
    lender_name: configs.find(c => c.field_name === 'lender_name')?.is_visible ?? true,
    loan_type: configs.find(c => c.field_name === 'loan_type')?.is_visible ?? true,
    start_date: configs.find(c => c.field_name === 'start_date')?.is_visible ?? true,
    principal_amount: configs.find(c => c.field_name === 'principal_amount')?.is_visible ?? true,
    interest_rate: configs.find(c => c.field_name === 'interest_rate')?.is_visible ?? true,
    balance_due: configs.find(c => c.field_name === 'balance_due')?.is_visible ?? true,
    status: configs.find(c => c.field_name === 'status')?.is_visible ?? true,
  };
});

// Lifecycle
onMounted(async () => {
  await fieldConfigStore.fetchConfigurations();
  await loansStore.fetchLoans();
});

// Methods
function openCreateDialog() {
  selectedLoanForEdit.value = null;
  showDialog.value = true;
}

function editLoan(loan: Loan) {
  selectedLoanForEdit.value = loan;
  showDialog.value = true;
}

function closeDialog() {
  showDialog.value = false;
  selectedLoanForEdit.value = null;
}

async function handleSaveLoan() {
  closeDialog();
  await loansStore.forceRefresh();
}

function openPaymentDialog(loan: Loan) {
  selectedLoanForPayment.value = loan;
  showPaymentDialog.value = true;
}

function openHistoryDialog(loan: Loan) {
  selectedLoanForHistory.value = loan;
  showHistoryDialog.value = true;
}

async function handlePaymentConfirm() {
  showPaymentDialog.value = false;
  selectedLoanForPayment.value = null;
  await loansStore.forceRefresh();
}

async function deleteLoan(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet emprunt ?')) {
    try {
      await loansStore.deleteLoan(id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
}

function applyFilters() {
  loansStore.fetchLoans(1, {
    loan_type: selectedType.value === 'all' ? undefined : selectedType.value as any,
    status: selectedStatus.value === 'all' ? undefined : selectedStatus.value as any,
    dateFrom: dateFrom.value,
  });
}

function clearFiltersClick() {
  selectedType.value = 'all';
  selectedStatus.value = 'all';
  dateFrom.value = '';
  loansStore.clearFilters();
  loansStore.fetchLoans();
}

async function exportToExcel() {
  try {
    await loansStore.exportToExcel();
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
  }
}

function previousPage() {
  if (loansStore.pagination.previous) {
    loansStore.fetchLoans(loansStore.pagination.current_page - 1, loansStore.filters);
  }
}

function nextPage() {
  if (loansStore.pagination.next) {
    loansStore.fetchLoans(loansStore.pagination.current_page + 1, loansStore.filters);
  }
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | undefined {
  const variants: Record<string, any> = {
    active: 'info',
    paid: 'success',
    defaulted: 'error',
    cancelled: 'secondary',
  };
  return variants[status] || 'default';
}
</script>
