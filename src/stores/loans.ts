/**
 * Loans Store (Pinia)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loansService } from '@/services/loans.service';
import type { Loan, LoanPayment, CreateLoanRequest, MakePaymentRequest, LoanFilters } from '@/types/loans';
import type { PaginationMeta } from '@/types/common';

export const useLoansStore = defineStore('loans', () => {
  // State
  const loans = ref<Loan[]>([]);
  const currentLoan = ref<Loan | null>(null);
  const payments = ref<LoanPayment[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<LoanFilters>({});
  const pagination = ref<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    page_size: 20,
    total_count: 0,
    next: null,
    previous: null,
  });

  // Computed
  const activeLoans = computed(() => loans.value.filter(loan => loan.status === 'active'));
  const paidLoans = computed(() => loans.value.filter(loan => loan.status === 'paid'));
  const defaultedLoans = computed(() => loans.value.filter(loan => loan.status === 'defaulted'));

  const totalBorrowed = computed(() => {
    return loans.value.reduce((sum, loan) => sum + Number(loan.principal_amount), 0);
  });

  const totalDue = computed(() => {
    return activeLoans.value.reduce((sum, loan) => sum + Number(loan.balance_due), 0);
  });

  const totalPaid = computed(() => {
    return loans.value.reduce((sum, loan) => sum + Number(loan.paid_amount), 0);
  });

  const totalBalance = computed(() => {
    return loans.value.reduce((sum, loan) => sum + Number(loan.balance_due), 0);
  });

  // Actions

  /**
   * Fetch all loans with optional filters
   */
  async function fetchLoans(page = 1, filtersData?: LoanFilters) {
    isLoading.value = true;
    error.value = null;

    try {
      if (filtersData) {
        filters.value = filtersData;
      }

      const response = await loansService.getLoans(page, filters.value);
      // Sort by loan_number in ascending order
      loans.value = response.results.sort((a, b) => {
        return a.loan_number.localeCompare(b.loan_number, undefined, { numeric: true });
      });
      pagination.value = {
        current_page: page,
        total_pages: Math.ceil(response.count / 20),
        page_size: 20,
        total_count: response.count,
        next: response.next,
        previous: response.previous,
      };
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des emprunts';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single loan by ID
   */
  async function fetchLoan(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      currentLoan.value = await loansService.getLoan(id);
      return currentLoan.value;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement de l\'emprunt';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new loan
   */
  async function createLoan(data: CreateLoanRequest) {
    isLoading.value = true;
    error.value = null;

    try {
      const newLoan = await loansService.createLoan(data);
      loans.value.unshift(newLoan);
      return newLoan;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création de l\'emprunt';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a loan
   */
  async function updateLoan(id: number, data: Partial<CreateLoanRequest>) {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedLoan = await loansService.updateLoan(id, data);
      const index = loans.value.findIndex(loan => loan.id === id);
      if (index !== -1) {
        loans.value[index] = updatedLoan;
      }
      return updatedLoan;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour de l\'emprunt';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a loan
   */
  async function deleteLoan(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await loansService.deleteLoan(id);
      loans.value = loans.value.filter(loan => loan.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la suppression de l\'emprunt';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Make a payment on a loan
   */
  async function makePayment(loanId: number, data: MakePaymentRequest) {
    isLoading.value = true;
    error.value = null;

    try {
      const payment = await loansService.makePayment(loanId, data);

      // Update loan in the list
      const loanIndex = loans.value.findIndex(loan => loan.id === loanId);
      if (loanIndex !== -1) {
        const updatedLoan = await loansService.getLoan(loanId);
        loans.value[loanIndex] = updatedLoan;
      }

      return payment;
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de l\'enregistrement du paiement';
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
      const blob = await loansService.exportToExcel(filters.value);

      if (!blob || blob.size === 0) {
        throw new Error('Le fichier exporté est vide');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emprunts_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.style.display = 'none';

      // Ajouter au DOM pour compatibilité navigateur
      document.body.appendChild(link);

      // Forcer le téléchargement
      setTimeout(() => {
        link.click();

        // Nettoyer après un délai
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }, 100);
    } catch (err: any) {
      error.value = err.response?.data?.detail || err.message || 'Erreur lors de l\'export';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch payments for a loan
   */
  async function fetchPayments(loanId?: number) {
    isLoading.value = true;
    error.value = null;

    try {
      payments.value = await loansService.getPayments(loanId);
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des paiements';
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
   * Force refresh loans (cache-busting)
   */
  async function forceRefresh() {
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchLoans(pagination.value.current_page, filters.value);
  }

  return {
    // State
    loans,
    currentLoan,
    payments,
    isLoading,
    error,
    pagination,
    filters,

    // Computed
    activeLoans,
    paidLoans,
    defaultedLoans,
    totalBorrowed,
    totalDue,
    totalPaid,
    totalBalance,

    // Actions
    fetchLoans,
    fetchLoan,
    createLoan,
    updateLoan,
    deleteLoan,
    makePayment,
    exportToExcel,
    fetchPayments,
    clearFilters,
    forceRefresh,
  };
});
