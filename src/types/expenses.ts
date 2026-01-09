/**
 * Expense and Expense Category types
 */

export interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Expense {
  id: number;
  expense_number: string;
  category: number;
  category_name: string;
  store: number | null;
  store_name?: string;
  expense_date: string;
  description: string;
  amount: number;
  beneficiary: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'mobile_money' | 'card' | null;
  payment_reference: string;
  payment_date: string | null;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'rejected';
  status_display: string;
  is_paid: boolean;
  approved_by: number | null;
  approval_date: string | null;
  receipt: string | null;
  notes: string;
  created_at: string;
  created_by?: number;
}

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'rejected';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_money' | 'card';

export interface CreateExpenseRequest {
  expense_number?: string; // Optional, will be auto-generated if not provided
  category: number;
  store?: number;
  expense_date: string;
  description: string;
  amount: number;
  beneficiary: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  notes?: string;
  receipt?: File;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  id: number;
}

export interface ExpenseFilters {
  category?: number;
  store?: number;
  status?: ExpenseStatus;
  expense_date?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvé',
  paid: 'Payé',
  rejected: 'Rejeté',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
};
