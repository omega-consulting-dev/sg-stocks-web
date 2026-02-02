import Axios from '../axios.service';
import type { Loan, LoanPayment, LoanSchedule, CreateLoanRequest, MakePaymentRequest } from '@/types/loans';
import type { PaginatedResponse } from '@/types/common';

const LOANS_API = '/loans/loans/';
const PAYMENTS_API = '/loans/payments/';

export const loansApi = {
  // ===== LOANS ENDPOINTS =====
  getLoans(params: Record<string, any>) {
    return Axios.get<PaginatedResponse<Loan>>(LOANS_API, { params });
  },
  getLoan(id: number) {
    return Axios.get<Loan>(`${LOANS_API}${id}/`);
  },
  createLoan(data: CreateLoanRequest) {
    return Axios.post<Loan>(LOANS_API, data);
  },
  updateLoan(id: number, data: Partial<CreateLoanRequest>) {
    return Axios.patch<Loan>(`${LOANS_API}${id}/`, data);
  },
  deleteLoan(id: number) {
    return Axios.delete(`${LOANS_API}${id}/`);
  },
  makePayment(loanId: number, data: MakePaymentRequest) {
    return Axios.post<LoanPayment>(`${LOANS_API}${loanId}/make_payment/`, data);
  },
  getPaymentHistory(loanId: number) {
    return Axios.get<LoanPayment[]>(`${LOANS_API}${loanId}/payment_history/`);
  },
  exportToExcel(params: Record<string, any>) {
    return Axios.get<Blob>(`${LOANS_API}export_excel/`, {
      params,
      responseType: 'blob',
    });
  },

  // ===== PAYMENTS ENDPOINTS =====
  getPayments(params: Record<string, any>) {
    return Axios.get<PaginatedResponse<LoanPayment>>(PAYMENTS_API, { params });
  },
  getPayment(id: number) {
    return Axios.get<LoanPayment>(`${PAYMENTS_API}${id}/`);
  },
};
