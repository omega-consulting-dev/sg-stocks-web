/**
 * Expense API Service
 */


import { expensesApi } from './api/expenses.api';
import { type Expense, type ExpenseCategory, type CreateExpenseRequest, type ExpenseFilters } from '@/types/expenses';
import type { PaginatedResponse } from '@/types/common';

export const expensesService = {
  // ===== EXPENSES ENDPOINTS =====

  /**
   * Get all expenses with filtering and pagination
   */
  async getExpenses(page = 1, filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> {
    const params: Record<string, any> = {
      page,
      _t: Date.now(), // Cache busting
    };

    if (filters) {
      if (filters.category) params.category = filters.category;
      if (filters.store) params.store = filters.store;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.dateFrom) params.expense_date__gte = filters.dateFrom;
      if (filters.dateTo) params.expense_date__lte = filters.dateTo;
    }

    const response = await expensesApi.getExpenses(params);
    return response.data;
  },

  /**
   * Get a single expense by ID
   */
  async getExpense(id: number): Promise<Expense> {
    const response = await expensesApi.getExpense(id);
    return response.data;
  },

  /**
   * Create a new expense
   */
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    // Toujours fournir un expense_number non vide (fallback horodaté si absent)
    const expenseNumber = data.expense_number && data.expense_number.trim() !== ''
      ? data.expense_number.trim()
      : `EXP-${Date.now()}`;

    const formData = new FormData();
    formData.append('expense_number', expenseNumber);
    formData.append('category', data.category.toString());
    if (data.store) formData.append('store', data.store.toString());
    formData.append('expense_date', data.expense_date);
    formData.append('description', data.description);
    formData.append('amount', data.amount.toString());
    formData.append('beneficiary', data.beneficiary);
    if (data.payment_method) formData.append('payment_method', data.payment_method);
    if (data.payment_reference) formData.append('payment_reference', data.payment_reference);
    if (data.notes) formData.append('notes', data.notes);
    if (data.receipt) formData.append('receipt', data.receipt);

    const response = await expensesApi.createExpense(formData);
    return response.data;
  },

  /**
   * Update an expense
   */
  async updateExpense(id: number, data: Partial<CreateExpenseRequest>): Promise<Expense> {
    const formData = new FormData();
    if (data.expense_number) formData.append('expense_number', data.expense_number);
    if (data.category) formData.append('category', data.category.toString());
    // For store: send empty string when null (FormData can't send null)
    if ('store' in data) formData.append('store', data.store ? data.store.toString() : '');
    if (data.expense_date) formData.append('expense_date', data.expense_date);
    if (data.description) formData.append('description', data.description);
    if (data.amount) formData.append('amount', data.amount.toString());
    if (data.beneficiary) formData.append('beneficiary', data.beneficiary);
    // For payment_method: send empty string when null (FormData can't send null)
    if ('payment_method' in data) formData.append('payment_method', data.payment_method || '');
    if (data.payment_reference) formData.append('payment_reference', data.payment_reference);
    if (data.notes) formData.append('notes', data.notes);
    if (data.receipt) formData.append('receipt', data.receipt);

    const response = await expensesApi.updateExpense(id, formData);
    return response.data;
  },

  /**
   * Delete an expense
   */
  async deleteExpense(id: number): Promise<void> {
    await expensesApi.deleteExpense(id);
  },

  /**
   * Approve an expense
   */
  async approveExpense(id: number): Promise<Expense> {
    const response = await expensesApi.approveExpense(id);
    return response.data;
  },

  /**
   * Reject an expense
   */
  async rejectExpense(id: number): Promise<Expense> {
    const response = await expensesApi.rejectExpense(id);
    return response.data;
  },

  /**
   * Mark expense as paid
   */
  async markAsPaid(id: number, paymentMethod?: string, paymentReference?: string): Promise<Expense> {
    const data: Record<string, any> = {};
    if (paymentMethod) data.payment_method = paymentMethod;
    if (paymentReference) data.payment_reference = paymentReference;

    const response = await expensesApi.markAsPaid(id, data);
    return response.data;
  },

  /**
   * Export expenses to Excel
   */
  async exportToExcel(filters?: ExpenseFilters): Promise<Blob> {
    const params: Record<string, any> = { format: 'xlsx' };

    if (filters) {
      if (filters.category) params.category = filters.category;
      if (filters.store) params.store = filters.store;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.expense_date__gte = filters.dateFrom;
      if (filters.dateTo) params.expense_date__lte = filters.dateTo;
    }

    const response = await expensesApi.exportToExcel(params);
    return response.data;
  },

  /**
   * Get expense summary statistics
   */
  async getSummary(): Promise<{
    total_amount: number
    total_paid: number
    total_pending: number
    counts: {
      total: number
      draft: number
      pending: number
      approved: number
      paid: number
      rejected: number
    }
  }> {
    const response = await expensesApi.getSummary();
    return response.data;
  },

  // ===== CATEGORY ENDPOINTS =====

  /**
   * Get all expense categories
   */
  async getCategories(): Promise<ExpenseCategory[]> {
    const response = await expensesApi.getCategories();
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  /**
   * Get a single category
   */
  async getCategory(id: number): Promise<ExpenseCategory> {
    const response = await expensesApi.getCategory(id);
    return response.data;
  },

  /**
   * Create a new category
   */
  async createCategory(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await expensesApi.createCategory(data);
    return response.data;
  },

  /**
   * Update a category
   */
  async updateCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await expensesApi.updateCategory(id, data);
    return response.data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    await expensesApi.deleteCategory(id);
  },
};
