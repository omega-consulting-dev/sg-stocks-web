<template>
  <div class="expenses-dashboard">
    <h3>Résumé des Dépenses</h3>

    <div v-if="isLoading" class="loading">
      Chargement des dépenses...
    </div>

    <div v-else class="stats-grid">
      <div class="stat-box">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-label">Total Dépenses</div>
          <div class="stat-value">{{ formatCurrency(expensesStore.totalAmount) }}</div>
          <div class="stat-count">{{ expensesStore.expenses.length }} dépenses</div>
        </div>
      </div>

      <div class="stat-box success">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-label">Payées</div>
          <div class="stat-value">{{ formatCurrency(expensesStore.totalPaid) }}</div>
          <div class="stat-count">{{ expensesStore.paidExpenses.length }} dépenses</div>
        </div>
      </div>

      <div class="stat-box warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-label">En Attente</div>
          <div class="stat-value">{{ formatCurrency(expensesStore.totalPending) }}</div>
          <div class="stat-count">{{ pendingCount }} dépenses</div>
        </div>
      </div>

      <div class="stat-box danger">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-label">Rejetées</div>
          <div class="stat-value">{{ expensesStore.rejectedExpenses.length }}</div>
          <div class="stat-count">dépenses</div>
        </div>
      </div>
    </div>

    <!-- Recent expenses -->
    <div v-if="recentExpenses.length > 0" class="recent-expenses">
      <h4>Dernières Dépenses</h4>
      <table class="recent-table">
        <thead>
          <tr>
            <th>N° Dépense</th>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Montant</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in recentExpenses" :key="expense.id">
            <td>{{ expense.expense_number }}</td>
            <td>{{ formatDate(expense.expense_date) }}</td>
            <td>{{ expense.category_name }}</td>
            <td class="amount">{{ formatCurrency(expense.amount) }}</td>
            <td>
              <span :class="`badge badge-${expense.status}`">
                {{ expense.status_display }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="no-data">
      Aucune dépense enregistrée
    </div>

    <!-- Action button -->
    <div class="action-button">
      <router-link to="/depenses" class="btn btn-primary">
        Voir toutes les dépenses →
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import { formatCurrency, formatDate } from '@/lib/formatters';

const expensesStore = useExpensesStore();

const isLoading = computed(() => expensesStore.isLoading);

const pendingCount = computed(() =>
  expensesStore.draftExpenses.length +
  expensesStore.pendingExpenses.length +
  expensesStore.approvedExpenses.length
);

const recentExpenses = computed(() =>
  expensesStore.expenses.slice(0, 5)
);

onMounted(async () => {
  if (expensesStore.expenses.length === 0) {
    await expensesStore.fetchExpenses();
  }
});
</script>

<style scoped>
.expenses-dashboard {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.expenses-dashboard h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.75rem;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.stat-box.success {
  border-left-color: #27ae60;
}

.stat-box.warning {
  border-left-color: #f39c12;
}

.stat-box.danger {
  border-left-color: #e74c3c;
}

.stat-icon {
  font-size: 2rem;
  line-height: 1;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-count {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.recent-expenses {
  margin-bottom: 1.5rem;
}

.recent-expenses h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #333;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.recent-table thead {
  background: #f5f5f5;
}

.recent-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #666;
}

.recent-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.recent-table .amount {
  text-align: right;
  font-weight: 600;
  color: #27ae60;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-draft {
  background: #e0e0e0;
  color: #666;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.badge-approved {
  background: #d4edda;
  color: #155724;
}

.badge-paid {
  background: #cfe2ff;
  color: #084298;
}

.badge-rejected {
  background: #f8d7da;
  color: #842029;
}

.no-data {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.action-button {
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}
</style>
