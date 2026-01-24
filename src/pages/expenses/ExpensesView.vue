<template>
  <div class="flex-1 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
    <!-- Breadcrumb -->
    <Breadcrumb class="mb-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" class="text-xs sm:text-sm">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator class="text-xs sm:text-sm" />
        <BreadcrumbItem>
          <BreadcrumbPage class="text-xs sm:text-sm">Dépenses</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with title and actions -->
    <header class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start md:items-center">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-primary truncate">Dépenses</h1>
        <p class="opacity-60 text-xs sm:text-sm mt-0.5">Gestion des dépenses de l'entreprise</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 shrink-0">
        <!-- Manage Categories button -->
        <Button
          @click="$router.push('/depenses/categories')"
          variant="outline"
          size="sm"
          class="flex-1 sm:flex-none min-w-[100px] sm:min-w-0 h-9 sm:h-10"
        >
          <FolderTree class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span class="ml-1.5 sm:ml-2 text-xs sm:text-sm">Catégories</span>
        </Button>

        <!-- Export button -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button 
              variant="outline" 
              size="sm"
              class="flex-1 sm:flex-none min-w-[100px] sm:min-w-0 h-9 sm:h-10"
            >
              <Upload class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span class="ml-1.5 sm:ml-2 text-xs sm:text-sm">Exporter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="rounded-lg w-48" align="end">
            <DropdownMenuItem @select="exportToExcel" class="gap-2 cursor-pointer">
              <Sheet class="h-4 w-4 text-green-600" />
              <span>Exporter en Excel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Create button -->
        <Button 
          @click="openCreateDialog" 
          size="sm"
          class="flex-1 sm:flex-none min-w-[100px] sm:min-w-0 h-9 sm:h-10"
        >
          <Plus class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span class="ml-1.5 sm:ml-2 text-xs sm:text-sm">Nouvelle</span>
        </Button>
      </div>
    </header>


 <!-- Stats cards -->
    <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Dépenses Card -->
      <Card class="rounded-lg sm:rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all">
        <CardContent class="p-4 sm:p-5 md:p-6">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 sm:gap-1.5 md:gap-2 flex-1 min-w-0">
              <p class="text-[11px] sm:text-xs md:text-[13px] font-medium text-blue-700/70 truncate">Total Dépenses</p>
              <p class="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-bold text-blue-900 truncate">{{ formatCurrency(expensesStore.totalAmount) }}</p>
              <p class="text-[10px] sm:text-[11px] text-blue-600/60">Toutes périodes</p>
            </div>
            <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <CreditCard class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Payées Card -->
      <Card class="rounded-lg sm:rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-all">
        <CardContent class="p-4 sm:p-5 md:p-6">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 sm:gap-1.5 md:gap-2 flex-1 min-w-0">
              <p class="text-[11px] sm:text-xs md:text-[13px] font-medium text-green-700/70 truncate">Payées</p>
              <p class="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-bold text-green-900 truncate">{{ formatCurrency(expensesStore.totalPaid) }}</p>
              <p class="text-[10px] sm:text-[11px] text-green-600/60">Validées</p>
            </div>
            <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Check class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- En Attente Card -->
      <Card class="rounded-lg sm:rounded-xl border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-all">
        <CardContent class="p-4 sm:p-5 md:p-6">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 sm:gap-1.5 md:gap-2 flex-1 min-w-0">
              <p class="text-[11px] sm:text-xs md:text-[13px] font-medium text-orange-700/70 truncate">En Attente</p>
              <p class="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-bold text-orange-900 truncate">{{ formatCurrency(expensesStore.totalPending) }}</p>
              <p class="text-[10px] sm:text-[11px] text-orange-600/60">À approuver</p>
            </div>
            <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <RotateCcw class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Nombre Card -->
      <Card class="rounded-lg sm:rounded-xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-all">
        <CardContent class="p-4 sm:p-5 md:p-6">
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 sm:gap-1.5 md:gap-2 flex-1 min-w-0">
              <p class="text-[11px] sm:text-xs md:text-[13px] font-medium text-purple-700/70 truncate">Total</p>
              <p class="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-bold text-purple-900 truncate">{{ expensesStore.expenses.length }}</p>
              <p class="text-[10px] sm:text-[11px] text-purple-600/60">Enregistrées</p>
            </div>
            <div class="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Sheet class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>


    <!-- Filters section -->
    <Card class="rounded-lg sm:rounded-xl border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent class="p-3 sm:p-4 md:p-5 lg:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <!-- Category filter -->
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <Label for="category-filter" class="text-xs sm:text-[13px] font-medium text-[#9197B3]">Catégorie</Label>
            <Select v-model="selectedCategory" @update:model-value="applyFilters">
              <SelectTrigger id="category-filter" class="h-9 sm:h-[38px] rounded-lg sm:rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors text-xs sm:text-sm">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent class="rounded-lg sm:rounded-[10px]">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem v-for="cat in expensesStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status filter -->
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <Label for="status-filter" class="text-xs sm:text-[13px] font-medium text-[#9197B3]">Statut</Label>
            <Select v-model="selectedStatus" @update:model-value="applyFilters">
              <SelectTrigger id="status-filter" class="h-9 sm:h-[38px] rounded-lg sm:rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors text-xs sm:text-sm">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent class="rounded-lg sm:rounded-[10px]">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date from filter -->
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <Label for="date-from" class="text-xs sm:text-[13px] font-medium text-[#9197B3]">Date début</Label>
            <Input
              id="date-from"
              type="date"
              v-model="dateFrom"
              @change="applyFilters"
              class="h-9 sm:h-[38px] rounded-lg sm:rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors text-xs sm:text-sm"
            />
          </div>

          <!-- Date to filter -->
          <div class="flex flex-col gap-1.5 sm:gap-2">
            <Label for="date-to" class="text-xs sm:text-[13px] font-medium text-[#9197B3]">Date fin</Label>
            <Input
              id="date-to"
              type="date"
              v-model="dateTo"
              @change="applyFilters"
              class="h-9 sm:h-[38px] rounded-lg sm:rounded-[10px] border-[#E5E5E5] bg-white hover:border-[#5932EA] transition-colors text-xs sm:text-sm"
            />
          </div>

          <!-- Clear filters button -->
          <div class="flex items-end sm:col-span-2 lg:col-span-1">
            <Button
              @click="clearFiltersClick"
              variant="outline"
              size="sm"
              class="w-full h-9 sm:h-[38px] gap-1.5 sm:gap-2 rounded-lg sm:rounded-[10px] border-[#E5E5E5] hover:bg-[#5932EA] hover:text-white hover:border-[#5932EA] transition-all text-xs sm:text-sm"
            >
              <RotateCcw class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Réinitialiser</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>



    <!-- Loading indicator -->
    <div v-if="expensesStore.isLoading" class="flex items-center justify-center py-8 sm:py-10 md:py-12">
      <Skeleton class="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
    </div>

    <!-- Expenses table -->
    <Card v-else class="rounded-lg sm:rounded-xl overflow-hidden">
      <CardContent class="p-0 sm:pt-6">
        <div v-if="expensesStore.expenses.length === 0" class="text-center py-8 sm:py-10 md:py-12 px-4">
          <p class="text-muted-foreground text-sm sm:text-base">Aucune dépense trouvée</p>
        </div>
        
        <!-- Mobile Card View (visible only on mobile) -->
        <div v-else class="block lg:hidden space-y-3 p-3 sm:p-4">
          <Card 
            v-for="(expense, index) in expensesStore.expenses" 
            :key="expense.id"
            class="rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent class="p-3 sm:p-4 space-y-3">
              <!-- Header -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold text-gray-500">#{index + 1}</span>
                    <Badge :variant="getStatusBadgeVariant(expense.status)" class="text-xs">
                      {{ expense.status_display }}
                    </Badge>
                  </div>
                  <p class="text-sm font-medium text-gray-900 truncate">{{ expense.category_name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(expense.expense_date) }}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0 rounded-lg shrink-0">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="rounded-lg w-48" align="end">
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
              </div>
              
              <!-- Details -->
              <div class="space-y-2 text-xs sm:text-sm">
                <div class="flex justify-between items-start gap-2">
                  <span class="text-gray-500">Description:</span>
                  <span class="font-medium text-right line-clamp-2">{{ expense.description || '-' }}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-gray-500">Bénéficiaire:</span>
                  <span class="font-medium truncate">{{ expense.beneficiary || '-' }}</span>
                </div>
                <div class="flex justify-between items-center gap-2 pt-2 border-t">
                  <span class="text-gray-700 font-medium">Montant:</span>
                  <span class="font-bold text-base sm:text-lg text-primary">{{ formatCurrency(expense.amount) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop Table View (hidden on mobile) -->
        <div class="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12 xl:w-16">#</TableHead>
                <TableHead class="min-w-[100px]">Date</TableHead>
                <TableHead class="min-w-[140px]">Catégorie</TableHead>
                <TableHead class="min-w-[180px]">Description</TableHead>
                <TableHead class="min-w-[120px]">Bénéficiaire</TableHead>
                <TableHead class="text-right min-w-[120px]">Montant</TableHead>
                <TableHead class="min-w-[100px]">Statut</TableHead>
                <TableHead class="text-right w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(expense, index) in expensesStore.expenses" :key="expense.id" class="hover:bg-gray-50/50">
                <TableCell class="font-semibold text-gray-500 text-sm">{{ index + 1 }}</TableCell>
                <TableCell class="text-sm">{{ formatDate(expense.expense_date) }}</TableCell>
                <TableCell class="text-sm">{{ expense.category_name }}</TableCell>
                <TableCell class="max-w-xs truncate text-sm" :title="expense.description">{{ expense.description || '-' }}</TableCell>
                <TableCell class="text-sm">{{ expense.beneficiary || '-' }}</TableCell>
                <TableCell class="text-right font-medium text-sm">{{ formatCurrency(expense.amount) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusBadgeVariant(expense.status)" class="text-xs">
                    {{ expense.status_display }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm" class="h-8 w-8 p-0 rounded-lg">
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
          <div v-if="expensesStore.pagination.total_pages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 px-3 sm:px-6 border-t">
            <p class="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
              Page {{ expensesStore.pagination.current_page }} / {{ expensesStore.pagination.total_pages }}
            </p>
            <div class="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button
                @click="previousPage"
                :disabled="!expensesStore.pagination.previous"
                variant="outline"
                size="sm"
                class="flex-1 sm:flex-none rounded-lg text-xs sm:text-sm h-9"
              >
                ← Précédent
              </Button>
              <Button
                @click="nextPage"
                :disabled="!expensesStore.pagination.next"
                variant="outline"
                size="sm"
                class="flex-1 sm:flex-none rounded-lg text-xs sm:text-sm h-9"
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
import { useToast } from '@/composables/useToast'
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

const selectedCategory = ref<number | string>('all')
const selectedStatus = ref<string>('all')
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

const toast = useToast()

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
      toast.success('Dépense marquée comme payée avec succès', 'Paiement enregistré')
    } catch (error: any) {
      console.error('Erreur lors du marquage comme payé:', error)
      // Ne pas fermer le dialog pour que l'utilisateur voie l'erreur
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Une erreur est survenue lors du paiement'
      toast.error(errorMessage, 'Erreur de paiement')
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
    category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
    status: selectedStatus.value === 'all' ? undefined : (selectedStatus.value as any),
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
  })
}

function clearFiltersClick() {
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
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
