/**
 * Expenses Store (Pinia)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { expensesService } from '@/services/expenses.service';
import type { Expense, ExpenseCategory, CreateExpenseRequest, ExpenseFilters } from '@/types/expenses';
import type { PaginatedResponse } from '@/types/common';

export const useExpensesStore = defineStore('expenses', () => {
  // State
  const expenses = ref<Expense[]>([]);
  const categories = ref<ExpenseCategory[]>([]);
  const currentExpense = ref<Expense | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    current_page: 1,
    total_pages: 1,
  });

  // Summary statistics from backend
  const summary = ref({
    total_amount: 0,
    total_paid: 0,
    total_pending: 0,
    counts: {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      paid: 0,
      rejected: 0
    }
  });

  // Filters
  const filters = ref<ExpenseFilters>({});

  // Computed
  const draftExpenses = computed(() => expenses.value.filter(e => e.status === 'draft'));
  const pendingExpenses = computed(() => expenses.value.filter(e => e.status === 'pending'));
  const approvedExpenses = computed(() => expenses.value.filter(e => e.status === 'approved'));
  const paidExpenses = computed(() => expenses.value.filter(e => e.status === 'paid'));
  const rejectedExpenses = computed(() => expenses.value.filter(e => e.status === 'rejected'));

  // Use summary data instead of calculating from paginated results
  const totalAmount = computed(() => summary.value.total_amount);
  const totalPaid = computed(() => summary.value.total_paid);
  const totalPending = computed(() => summary.value.total_pending);

  /**
   * Generate next expense number
   */
  const nextExpenseNumber = computed(() => {
    if (expenses.value.length === 0) {
      return 'EXP001';
    }

    // Extract all numeric parts from existing expense numbers
    const existingNumbers = expenses.value
      .map(exp => {
        const match = exp.expense_number.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(num => num > 0);

    // Find the highest number and increment
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;

    // Format with leading zeros (e.g., 1 -> 001, 10 -> 010)
    return `EXP${nextNumber.toString().padStart(3, '0')}`;
  });

  // Actions

  /**
   * Fetch summary statistics
   */
  async function fetchSummary() {
    try {
      const data = await expensesService.getSummary();
      summary.value = data;
      console.log('Summary loaded:', data);
    } catch (err: any) {
      console.error('Fetch summary error:', err);
    }
  }

  /**
   * Fetch expenses with filters
   */
  async function fetchExpenses(page = 1, newFilters?: ExpenseFilters) {
    isLoading.value = true;
    error.value = null;

    try {
      if (newFilters) {
        filters.value = newFilters;
      }

      // Fetch both expenses and summary in parallel
      const [response] = await Promise.all([
        expensesService.getExpenses(page, filters.value),
        fetchSummary()
      ]);

      expenses.value = response.results;

      pagination.value = {
        count: response.count,
        next: response.next,
        previous: response.previous,
        current_page: page,
        total_pages: Math.ceil(response.count / 10),
      };
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des dépenses';
      console.error('Fetch expenses error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single expense
   */
  async function fetchExpense(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      currentExpense.value = await expensesService.getExpense(id);
      return currentExpense.value;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement de la dépense';
      console.error('Fetch expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new expense
   */
  async function createExpense(data: CreateExpenseRequest) {
    isLoading.value = true;
    error.value = null;

    try {
      // Auto-generate expense_number if not provided or empty
      const expenseNumber = (data.expense_number && data.expense_number.trim() !== '')
        ? data.expense_number
        : nextExpenseNumber.value;

      const expenseData = {
        ...data,
        expense_number: expenseNumber,
      };

      console.log('Creating expense with number:', expenseData.expense_number);
      console.log('Full expense data:', expenseData);

      const newExpense = await expensesService.createExpense(expenseData);
      expenses.value.unshift(newExpense);
      return newExpense;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création de la dépense';
      console.error('Create expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an expense
   */
  async function updateExpense(id: number, data: Partial<CreateExpenseRequest>) {
    isLoading.value = true;
    error.value = null;

    try {
      const updated = await expensesService.updateExpense(id, data);

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value[index] = updated;
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = updated;
      }

      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour de la dépense';
      console.error('Update expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete an expense
   */
  async function deleteExpense(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await expensesService.deleteExpense(id);
      expenses.value = expenses.value.filter(e => e.id !== id);

      if (currentExpense.value?.id === id) {
        currentExpense.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la suppression de la dépense';
      console.error('Delete expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Approve an expense
   */
  async function approveExpense(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const updated = await expensesService.approveExpense(id);

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value[index] = updated;
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = updated;
      }

      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de l\'approbation de la dépense';
      console.error('Approve expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Reject an expense
   */
  async function rejectExpense(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const updated = await expensesService.rejectExpense(id);

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value[index] = updated;
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = updated;
      }

      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du rejet de la dépense';
      console.error('Reject expense error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Mark expense as paid
   */
  async function markAsPaid(id: number, paymentMethod?: string, paymentReference?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const updated = await expensesService.markAsPaid(id, paymentMethod, paymentReference);

      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value[index] = updated;
      }

      if (currentExpense.value?.id === id) {
        currentExpense.value = updated;
      }

      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du marquage comme payé';
      console.error('Mark as paid error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch categories
   */
  async function fetchCategories() {
    isLoading.value = true;
    error.value = null;

    try {
      categories.value = await expensesService.getCategories();
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des catégories';
      console.error('Fetch categories error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a category
   */
  async function createCategory(data: Partial<ExpenseCategory>) {
    isLoading.value = true;
    error.value = null;

    try {
      const newCategory = await expensesService.createCategory(data);
      categories.value.push(newCategory);
      return newCategory;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création de la catégorie';
      console.error('Create category error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a category
   */
  async function updateCategory(id: number, data: Partial<ExpenseCategory>) {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedCategory = await expensesService.updateCategory(id, data);
      const index = categories.value.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour de la catégorie';
      console.error('Update category error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a category
   */
  async function deleteCategory(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await expensesService.deleteCategory(id);
      categories.value = categories.value.filter(cat => cat.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la suppression de la catégorie';
      console.error('Delete category error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Export to Excel
   */
  async function exportToExcel() {
    isLoading.value = true;
    error.value = null;

    try {
      const blob = await expensesService.exportToExcel(filters.value);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `depenses_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de l\'export';
      console.error('Export error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear filters
   */
  function clearFilters() {
    filters.value = {};
  }

  /**
   * Force refresh expenses (cache-busting)
   */
  async function forceRefresh() {
    // Add a small delay to ensure database updates are complete
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchExpenses(pagination.value.current_page, filters.value);
  }

  return {
    // State
    expenses,
    categories,
    currentExpense,
    isLoading,
    error,
    pagination,
    filters,
    summary,

    // Computed
    draftExpenses,
    pendingExpenses,
    approvedExpenses,
    paidExpenses,
    rejectedExpenses,
    totalAmount,
    totalPaid,
    totalPending,
    nextExpenseNumber,

    // Actions
    fetchSummary,
    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    markAsPaid,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    exportToExcel,
    clearFilters,
    forceRefresh,
  };
});
