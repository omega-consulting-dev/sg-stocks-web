import Axios from '../axios.service';
import type { Expense, ExpenseCategory, CreateExpenseRequest, ExpenseFilters } from '@/types/expenses';
import type { PaginatedResponse } from '@/types/common';

const EXPENSES_API = '/expenses/expenses/';
const CATEGORIES_API = '/expenses/categories/';

export const expensesApi = {
  getExpenses(params: Record<string, any>) {
    return Axios.get<PaginatedResponse<Expense>>(EXPENSES_API, { params });
  },
  getExpense(id: number) {
    return Axios.get<Expense>(`${EXPENSES_API}${id}/`);
  },
  createExpense(formData: FormData) {
    return Axios.post<Expense>(EXPENSES_API, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateExpense(id: number, formData: FormData) {
    return Axios.patch<Expense>(`${EXPENSES_API}${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteExpense(id: number) {
    return Axios.delete(`${EXPENSES_API}${id}/`);
  },
  approveExpense(id: number) {
    return Axios.post<Expense>(`${EXPENSES_API}${id}/approve/`);
  },
  rejectExpense(id: number) {
    return Axios.post<Expense>(`${EXPENSES_API}${id}/reject/`);
  },
  markAsPaid(id: number, data: Record<string, any>) {
    return Axios.post<Expense>(`${EXPENSES_API}${id}/mark_as_paid/`, data);
  },
  exportToExcel(params: Record<string, any>) {
    return Axios.get<Blob>(`${EXPENSES_API}export_excel/`, {
      params,
      responseType: 'blob',
    });
  },
  getSummary() {
    return Axios.get(`${EXPENSES_API}summary/`);
  },
  getCategories() {
    return Axios.get<ExpenseCategory[]>(CATEGORIES_API, {
      params: { _t: Date.now() },
    });
  },
  getCategory(id: number) {
    return Axios.get<ExpenseCategory>(`${CATEGORIES_API}${id}/`);
  },
  createCategory(data: Partial<ExpenseCategory>) {
    return Axios.post<ExpenseCategory>(CATEGORIES_API, data);
  },
  updateCategory(id: number, data: Partial<ExpenseCategory>) {
    return Axios.patch<ExpenseCategory>(`${CATEGORIES_API}${id}/`, data);
  },
  deleteCategory(id: number) {
    return Axios.delete(`${CATEGORIES_API}${id}/`);
  },
};
