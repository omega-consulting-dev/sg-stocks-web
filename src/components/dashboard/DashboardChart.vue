<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, ArrowRight } from 'lucide-vue-next'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()

interface PopularProduct {
  id: number
  name: string
  reference: string
  price: number
  sales: number
  stock: number
}

// Transformer les données du backend
const products = computed<PopularProduct[]>(() => {
  if (!dashboardStore.topProducts.length) {
    // Retourner un tableau vide pendant le chargement
    return []
  }

  return dashboardStore.topProducts.slice(0, 3).map(product => ({
    id: product.product__id,
    name: product.product__name,
    reference: product.product__reference,
    price: product.total_amount / product.total_quantity, // Prix moyen
    sales: product.sales_count,
    stock: product.current_stock  // Stock réel du/des store(s)
  }))
})

const hasRealData = computed(() => dashboardStore.topProducts.length > 0)

const formatPrice = (price: number): string => {
  return `${price.toFixed(2)}`
}
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 shadow-lg border border-blue-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <TrendingUp class="w-4 h-4 text-white" />
        </div>
        <h3 class="text-base font-semibold text-gray-800">Produits Populaires</h3>
      </div>
      <button class="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium">
        Voir Tout
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Message dynamique -->
    <div v-if="hasRealData" class="text-xs text-emerald-600 mb-3 flex items-center gap-1">
      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span>{{ products.length }} produit(s) chargé(s)</span>
    </div>
    <div v-else class="text-xs text-gray-500 mb-3 flex items-center gap-1">
      <div class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
      <span>Aucun produit vendu pour le moment</span>
    </div>

    <!-- Table -->
    <div class="overflow-hidden">
      <table class="w-full" v-if="products.length > 0">
        <thead>
          <tr class="border-b border-blue-200">
            <th class="text-left py-2 px-3 text-xs font-medium text-gray-600">Produit</th>
            <th class="text-right py-2 px-3 text-xs font-medium text-gray-600">Prix</th>
            <th class="text-center py-2 px-3 text-xs font-medium text-gray-600">Ventes</th>
            <th class="text-center py-2 px-3 text-xs font-medium text-gray-600">Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="border-b border-blue-100 hover:bg-blue-100/50 transition-colors"
          >
            <td class="py-3 px-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-blue-100">
                  <span class="text-lg">📦</span>
                </div>
                <span class="text-sm font-medium text-gray-800">{{ product.name }}</span>
              </div>
            </td>
            <td class="py-3 px-3 text-right text-sm font-semibold text-gray-800">
              {{ formatPrice(product.price) }}
            </td>
            <td class="py-3 px-3 text-center">
              <span class="inline-flex items-center justify-center w-11 h-7 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {{ product.sales }}
              </span>
            </td>
            <td class="py-3 px-3 text-center">
              <span class="inline-flex items-center justify-center w-11 h-7 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                {{ product.stock }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Message si pas de produits -->
      <div v-else class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-sm text-gray-600">Aucun produit vendu</p>
        <p class="text-xs text-gray-500 mt-1">Les produits apparaîtront après les premières ventes</p>
      </div>
    </div>
  </div>
</template>
