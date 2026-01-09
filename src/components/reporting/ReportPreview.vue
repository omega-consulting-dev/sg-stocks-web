<template>
  <div v-if="reportData" class="report-preview">
    <!-- Header -->
    <div class="report-header">
      <div class="company-info">
        <h1>{{ reportData.title }}</h1>
        <p class="period">{{ reportData.period }}</p>
      </div>
      <div class="logo-placeholder">
        <span>LOGO</span>
      </div>
    </div>

    <!-- Profit/Loss Report -->
    <div v-if="reportData.type === 'profit_loss'" class="report-content">
      <div class="summary-card">
        <h3>Résultat de la période</h3>
        <div class="summary-grid">
          <div class="summary-item revenue">
            <label>Chiffre d'affaires</label>
            <span class="amount">{{ formatAmount(reportData.data.revenue) }} FCFA</span>
          </div>
          <div class="summary-item expense">
            <label>Dépenses</label>
            <span class="amount">{{ formatAmount(reportData.data.expenses) }} FCFA</span>
          </div>
          <div class="summary-item profit" :class="{ negative: reportData.data.profit < 0 }">
            <label>Bénéfice</label>
            <span class="amount">{{ formatAmount(reportData.data.profit) }} FCFA</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Report -->
    <div v-if="reportData.type === 'sales'" class="report-content">
      <table class="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>N° Vente</th>
            <th>Client</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reportData.items" :key="index">
            <td>{{ item.date }}</td>
            <td>{{ item.number }}</td>
            <td>{{ item.customer }}</td>
            <td class="text-right">{{ formatAmount(item.amount) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3"><strong>Total Ventes</strong></td>
            <td class="text-right"><strong>{{ formatAmount(reportData.total) }} FCFA</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Expenses Report -->
    <div v-if="reportData.type === 'expenses'" class="report-content">
      <table class="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>N° Dépense</th>
            <th>Catégorie</th>
            <th>Bénéficiaire</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reportData.items" :key="index">
            <td>{{ item.date }}</td>
            <td>{{ item.number }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.beneficiary }}</td>
            <td class="text-right">{{ formatAmount(item.amount) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4"><strong>Total Dépenses</strong></td>
            <td class="text-right"><strong>{{ formatAmount(reportData.total) }} FCFA</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Inventory Report -->
    <div v-if="reportData.type === 'inventory'" class="report-content">
      <table class="report-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th class="text-right">Quantité</th>
            <th class="text-right">Prix Unitaire</th>
            <th class="text-right">Valeur Totale</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reportData.items" :key="index">
            <td>{{ item.product }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">{{ formatAmount(item.unit_price) }}</td>
            <td class="text-right">{{ formatAmount(item.total_value) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3"><strong>Valeur Totale Stock</strong></td>
            <td class="text-right"><strong>{{ formatAmount(reportData.total_value) }} FCFA</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Action Buttons -->
    <div class="report-actions">
      <button @click="handlePrint" class="btn btn-secondary">
        <i class="fas fa-print"></i> Imprimer
      </button>
      <button @click="handleExport('pdf')" class="btn btn-primary" :disabled="isExporting">
        <i class="fas fa-file-pdf"></i> Exporter PDF
      </button>
      <button @click="handleExport('excel')" class="btn btn-success" :disabled="isExporting">
        <i class="fas fa-file-excel"></i> Exporter Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  reportData: any
  reportParams: any
}>()

const emit = defineEmits(['export'])

const isExporting = ref(false)

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const handlePrint = () => {
  window.print()
}

const handleExport = async (format: 'pdf' | 'excel') => {
  isExporting.value = true
  try {
    emit('export', { format, ...props.reportParams })
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.report-preview {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.company-info h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.period {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.logo-placeholder {
  width: 120px;
  height: 80px;
  background: #f5f5f5;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-weight: 500;
}

/* Summary Card for Profit/Loss */
.summary-card {
  margin: 20px 0;
}

.summary-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.summary-grid {
  display: grid;
  gap: 20px;
}

.summary-item {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
}

.summary-item.revenue {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.summary-item.expense {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.summary-item.profit {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.summary-item.profit.negative {
  background: #ffebee;
  border-left-color: #f44336;
}

.summary-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.summary-item .amount {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Table Styles */
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.report-table thead {
  background: #2c3e50;
  color: white;
}

.report-table th,
.report-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.report-table th {
  font-weight: 600;
  font-size: 14px;
}

.report-table tbody tr:hover {
  background: #f8f9fa;
}

.report-table .text-right {
  text-align: right;
}

.report-table tfoot {
  background: #f8f9fa;
}

.report-table .total-row td {
  padding: 16px 12px;
  font-size: 16px;
  border-top: 2px solid #2c3e50;
  border-bottom: 2px solid #2c3e50;
}

/* Action Buttons */
.report-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #dc3545;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

/* Print Styles */
@media print {
  .report-actions {
    display: none;
  }
  
  .report-preview {
    box-shadow: none;
    padding: 0;
  }
}
</style>
