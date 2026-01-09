/**
 * Loan (Emprunt) Types
 */

export type LoanType = 'bank' | 'supplier' | 'personal' | 'other';
export type LoanStatus = 'active' | 'paid' | 'defaulted' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
export type ScheduleStatus = 'pending' | 'paid' | 'overdue' | 'partial';

export interface Loan {
  id: number;
  loan_number: string;
  loan_type: LoanType;
  loan_type_display: string;
  lender_name: string;
  lender_contact?: string;
  store?: number | null;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: LoanStatus;
  status_display: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  is_fully_paid?: boolean;
  purpose?: string;
  notes?: string;
  schedule?: LoanSchedule[];
  payments?: LoanPayment[];
  created_at?: string;
  updated_at?: string;
}

export interface LoanPayment {
  id: number;
  payment_number: string;
  loan: number;
  payment_date: string;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  payment_method: PaymentMethod;
  payment_method_display?: string;
  reference?: string;
  notes?: string;
  created_at?: string;
}

export interface LoanSchedule {
  id: number;
  loan: number;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: ScheduleStatus;
  status_display?: string;
  payment_date?: string;
  is_overdue: boolean;
}

export interface CreateLoanRequest {
  loan_type: LoanType;
  lender_name: string;
  lender_contact?: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  purpose?: string;
  notes?: string;
  store?: number | null;
}

export interface MakePaymentRequest {
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface LoanFilters {
  loan_type?: LoanType;
  status?: LoanStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  bank: 'Prêt bancaire',
  supplier: 'Crédit fournisseur',
  personal: 'Prêt personnel',
  other: 'Autre',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Actif',
  paid: 'Remboursé',
  defaulted: 'En défaut',
  cancelled: 'Annulé',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  mobile_money: 'Mobile Money',
};

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  pending: 'À payer',
  paid: 'Payé',
  overdue: 'En retard',
  partial: 'Partiellement payé',
};
