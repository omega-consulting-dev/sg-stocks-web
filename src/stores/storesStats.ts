/**
 * Stores Statistics Store (Pinia)
 * Gère les statistiques de vente et dépenses par point de vente
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storesApi } from '@/services/api/stores.api';
import { expensesApi } from '@/services/api/expenses.api';
import type { Store, StoreStats, StoresBalance } from '@/types/stores';
import type { Expense } from '@/types/expenses';

export const useStoresStatsStore = defineStore('storesStats', () => {
  // State
  const stores = ref<Store[]>([]);
  const expenses = ref<Expense[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const storesStats = computed((): StoreStats[] => {
    return stores.value.map((store) => {
      // Récupérer les dépenses pour ce store
      const storeExpenses = expenses.value.filter(exp => exp.store === store.id);
      const totalExpenses = storeExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      // TODO: Récupérer les ventes pour ce store (quand le module vente sera disponible)
      // Pour l'instant, on suppose les ventes à 0
      const totalSales = 0;

      return {
        store_id: store.id,
        store_name: store.name,
        total_sales: totalSales,
        total_expenses: totalExpenses,
        total_balance: totalSales - totalExpenses,
        expense_count: storeExpenses.length,
      };
    });
  });

  const storesBalance = computed((): StoresBalance => {
    const stats = storesStats.value;
    const grandTotalSales = stats.reduce((sum, s) => sum + s.total_sales, 0);
    const grandTotalExpenses = stats.reduce((sum, s) => sum + s.total_expenses, 0);

    return {
      stores: stats,
      grand_total_sales: grandTotalSales,
      grand_total_expenses: grandTotalExpenses,
      grand_total_balance: grandTotalSales - grandTotalExpenses,
    };
  });

  // Actions

  /**
   * Charger tous les stores et les dépenses
   */
  async function fetchStoresAndExpenses() {
    isLoading.value = true;
    error.value = null;

    try {
      // Charger les stores
      const storesResponse = await storesApi.getStores({ page_size: 100 });
      stores.value = (storesResponse.data && 'results' in storesResponse.data)
        ? (storesResponse.data as any).results
        : [];

      // Charger toutes les dépenses (on va chercher plusieurs pages si nécessaire)
      const expensesData: Expense[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await expensesApi.getExpenses({ page, page_size: 100 });
        const results = (response.data && 'results' in response.data) ? (response.data as any).results : [];
        expensesData.push(...results);
        hasMore = (response.data as any).next !== null;
        page++;
      }

      expenses.value = expensesData;
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des données';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Recalculer les statistiques (utile après ajout/suppression d'une dépense)
   */
  async function refreshStats() {
    await fetchStoresAndExpenses();
  }

  /**
   * Récupérer les statistiques d'un store spécifique
   */
  function getStoreStats(storeId: number): StoreStats | undefined {
    return storesStats.value.find(s => s.store_id === storeId);
  }

  return {
    // State
    stores,
    expenses,
    isLoading,
    error,

    // Computed
    storesStats,
    storesBalance,

    // Actions
    fetchStoresAndExpenses,
    refreshStats,
    getStoreStats,
  };
});
