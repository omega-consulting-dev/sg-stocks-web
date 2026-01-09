<script setup lang="ts">
import { onMounted } from 'vue';
import { useStoresStatsStore } from '@/stores/storesStats';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-vue-next';

const storesStatsStore = useStoresStatsStore();

onMounted(async () => {
  await storesStatsStore.fetchStoresAndExpenses();
});

/**
 * Déterminer la couleur du badge en fonction du bilan
 */
function getBalanceBadgeVariant(balance: number): 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | undefined {
  if (balance > 0) return 'success';
  if (balance < 0) return 'error';
  return 'secondary';
}
</script>

<template>
  <div class="space-y-6">
    <!-- Global Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Ventes Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-blue-700/70">Total Ventes</p>
              <p class="text-[28px] font-bold text-blue-900">{{ formatCurrency(storesStatsStore.storesBalance.grand_total_sales) }}</p>
              <p class="text-[11px] text-blue-600/60">Tous les points de vente</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Total Dépenses Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-red-700/70">Total Dépenses</p>
              <p class="text-[28px] font-bold text-red-900">{{ formatCurrency(storesStatsStore.storesBalance.grand_total_expenses) }}</p>
              <p class="text-[11px] text-red-600/60">Tous les points de vente</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown class="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Bilan Net Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-green-700/70">Bilan Net</p>
              <p class="text-[28px] font-bold text-green-900">{{ formatCurrency(storesStatsStore.storesBalance.grand_total_balance) }}</p>
              <p class="text-[11px] text-green-600/60">Ventes - Dépenses</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              💰
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Nombre de Points de Vente Card -->
      <Card class="rounded-xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-2">
              <p class="text-[13px] font-medium text-purple-700/70">Points de Vente</p>
              <p class="text-[28px] font-bold text-purple-900">{{ storesStatsStore.stores.length }}</p>
              <p class="text-[11px] text-purple-600/60">Actifs</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              🏪
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Detailed Table -->
    <Card class="rounded-xl">
      <CardContent class="pt-6">
        <div class="text-lg font-semibold mb-4">Bilan par Point de Vente</div>
        <div v-if="storesStatsStore.isLoading" class="flex items-center justify-center py-12">
          <Skeleton class="h-12 w-12 rounded-full" />
        </div>
        <div v-else-if="storesStatsStore.storesStats.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Aucun point de vente trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Point de Vente</TableHead>
                <TableHead class="text-right">Ventes</TableHead>
                <TableHead class="text-right">Dépenses</TableHead>
                <TableHead class="text-right">Bilan Net</TableHead>
                <TableHead class="text-center">Nb Dépenses</TableHead>
                <TableHead class="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="stat in storesStatsStore.storesStats" :key="stat.store_id">
                <TableCell class="font-medium">{{ stat.store_name }}</TableCell>
                <TableCell class="text-right font-medium text-blue-600">{{ formatCurrency(stat.total_sales) }}</TableCell>
                <TableCell class="text-right font-medium text-red-600">{{ formatCurrency(stat.total_expenses) }}</TableCell>
                <TableCell class="text-right font-bold" :class="stat.total_balance > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(stat.total_balance) }}
                </TableCell>
                <TableCell class="text-center">
                  <Badge variant="outline">{{ stat.expense_count }}</Badge>
                </TableCell>
                <TableCell class="text-center">
                  <Badge :variant="getBalanceBadgeVariant(stat.total_balance)">
                    {{ stat.total_balance > 0 ? 'Positif' : stat.total_balance < 0 ? 'Négatif' : 'Neutre' }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
