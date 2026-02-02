/**
 * Loans Service
 */

import { loansApi } from './api/loans.api';
import type { Loan, LoanPayment, CreateLoanRequest, MakePaymentRequest, LoanFilters } from '@/types/loans';
import type { PaginatedResponse } from '@/types/common';

export const loansService = {
  // ===== LOANS ENDPOINTS =====

  /**
   * Get all loans with filtering and pagination
   */
  async getLoans(page = 1, filters?: LoanFilters): Promise<PaginatedResponse<Loan>> {
    const params: Record<string, any> = {
      page,
      ordering: 'start_date', // Tri du plus ancien au plus récent
      _t: Date.now(), // Cache busting
    };

    if (filters) {
      if (filters.loan_type) params.loan_type = filters.loan_type;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.dateFrom && filters.dateFrom.trim() !== '') {
        params.start_date__gte = filters.dateFrom;
      }
      if (filters.dateTo && filters.dateTo.trim() !== '') {
        params.start_date__lte = filters.dateTo;
      }
    }

    const response = await loansApi.getLoans(params);
    return response.data;
  },

  /**
   * Get a single loan by ID
   */
  async getLoan(id: number): Promise<Loan> {
    const response = await loansApi.getLoan(id);
    return response.data;
  },

  /**
   * Create a new loan
   */
  async createLoan(data: CreateLoanRequest): Promise<Loan> {
    const response = await loansApi.createLoan(data);
    return response.data;
  },

  /**
   * Update a loan
   */
  async updateLoan(id: number, data: Partial<CreateLoanRequest>): Promise<Loan> {
    const response = await loansApi.updateLoan(id, data);
    return response.data;
  },

  /**
   * Delete a loan
   */
  async deleteLoan(id: number): Promise<void> {
    await loansApi.deleteLoan(id);
  },

  /**
   * Make a payment on a loan
   */
  async makePayment(loanId: number, data: MakePaymentRequest): Promise<LoanPayment> {
    const response = await loansApi.makePayment(loanId, data);
    return response.data;
  },

  /**
   * Export loans to Excel
   */
  async exportToExcel(filters?: LoanFilters): Promise<Blob> {
    const params: Record<string, any> = {};

    if (filters) {
      if (filters.loan_type) params.loan_type = filters.loan_type;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.start_date__gte = filters.dateFrom;
      if (filters.dateTo) params.start_date__lte = filters.dateTo;
    }

    const response = await loansApi.exportToExcel(params);
    return response.data;
  },

  // ===== PAYMENTS ENDPOINTS =====

  /**
   * Get all payments for a loan
   */
  async getPayments(loanId?: number): Promise<LoanPayment[]> {
    const params: Record<string, any> = { _t: Date.now() };
    if (loanId) params.loan = loanId;

    const response = await loansApi.getPayments(params);
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },
};
