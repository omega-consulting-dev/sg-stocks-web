import Axios from '../axios.service';
import type { Loan, LoanPayment, LoanSchedule, CreateLoanRequest, MakePaymentRequest } from '@/types/loans';
import type { PaginatedResponse } from '@/types/common';

const LOANS_API = '/loans/';
const PAYMENTS_API = '/loans/payments/';

export const loansApi = {
  // ===== LOANS ENDPOINTS =====
  getLoans(params: Record<string, any>) {
    return Axios.get<PaginatedResponse<Loan>>(`${LOANS_API}loans/`, { params });
  },
  getLoan(id: number) {
    return Axios.get<Loan>(`${LOANS_API}loans/${id}/`);
  },
  createLoan(data: CreateLoanRequest) {
    return Axios.post<Loan>(`${LOANS_API}loans/`, data);
  },
  updateLoan(id: number, data: Partial<CreateLoanRequest>) {
    return Axios.patch<Loan>(`${LOANS_API}loans/${id}/`, data);
  },
  deleteLoan(id: number) {
    return Axios.delete(`${LOANS_API}loans/${id}/`);
  },
  makePayment(loanId: number, data: MakePaymentRequest) {
    return Axios.post<LoanPayment>(`${LOANS_API}loans/${loanId}/make_payment/`, data);
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
