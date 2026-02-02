<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore, type Product } from '@/stores/products'
import { useProductFamiliesStore } from '@/stores/productFamilies'
import { useStoresStore } from '@/stores/stores.store'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
import { inventoryApi, type StockLevel } from '@/services/api/inventory.api'
import type { CreateProductDto } from '@/services/api/products.api'
import ProductSearchBar from '@/components/products/ProductSearchBar.vue'
import ProductTable from '@/components/products/ProductTable.vue'
import ProductForm from '@/components/products/ProductForm.vue'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Store } from 'lucide-vue-next'

const store = useProductsStore()
const familiesStore = useProductFamiliesStore()
const storesStore = useStoresStore()
const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// État local
const searchQuery = ref('')
const selectedStoreId = ref<string>('all')
const storeStocks = ref<Map<number, number>>(new Map()) // Map: productId -> quantity pour le magasin sélectionné
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
const selectedProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

// Computed
const filteredProducts = computed(() => {
  let products = store.products

  // Filtre par magasin : remplacer current_stock par le stock du magasin sélectionné
  if (selectedStoreId.value !== 'all') {
    products = products.map(product => {
      const stockForStore = storeStocks.value.get(product.id) || 0
      return {
        ...product,
        current_stock: stockForStore,
        is_low_stock: stockForStore <= product.minimum_stock
      }
    })
  }

  // Filtre par recherche
  if (!searchQuery.value) {
    return products
  }
  const query = searchQuery.value.toLowerCase()
  return products.filter(
    (product) =>
      product.reference.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.category_name.toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query)
  )
})

// Fonction pour charger les stocks d'un magasin spécifique
const loadStoreStocks = async (storeId: number) => {
  try {
    // Récupérer tous les stocks du magasin
    const response = await inventoryApi.getStockLevels({ store: storeId }, 1)

    // Créer une Map productId -> quantity
    const stocksMap = new Map<number, number>()
    response.results.forEach((stock: StockLevel) => {
      const productId = typeof stock.product === 'number' ? stock.product : stock.product.id
      stocksMap.set(productId, stock.quantity)
    })

    storeStocks.value = stocksMap
  } catch (error) {
    storeStocks.value.clear()
  }
}

// Charger les données au montage
onMounted(async () => {
  await store.fetchProducts()
  if (storesStore.stores.length === 0) {
    await storesStore.fetchStores()
  }
})

// Watcher pour recharger les stocks quand le magasin change
watch(selectedStoreId, async (newValue) => {
  if (newValue !== 'all') {
    await loadStoreStocks(parseInt(newValue))
  } else {
    // Réinitialiser pour afficher les stocks globaux
    storeStocks.value.clear()
  }
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
}

// Gestion de l'ajout
const handleAdd = () => {
  // Vérifier les permissions avant d'ouvrir le formulaire
  if (!hasPermission('can_manage_products')) {
    toast.error(getPermissionErrorMessage('can_manage_products'), 'Accès refusé')
    return
  }

  selectedProduct.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const result = await store.importExcel(file)
        alert(`Import terminé: ${result.created} créés, ${result.updated} mis à jour`)
      } catch (error) {
        alert("Erreur lors de l'import du fichier")
      }
    }
  }
  input.click()
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  if (!hasPermission('can_export_data') && !hasPermission('can_view_products')) {
    toast.error("Vous n'avez pas les droits nécessaires pour exporter les données. Veuillez contacter votre supérieur.", 'Accès refusé')
    return
  }
  try {
    await store.exportPdf()
  } catch (error) {
    alert("Erreur lors de l'export PDF")
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  if (!hasPermission('can_export_data') && !hasPermission('can_view_products')) {
    toast.error("Vous n'avez pas les droits nécessaires pour exporter les données. Veuillez contacter votre supérieur.", 'Accès refusé')
    return
  }
  try {
    await store.exportExcel()
  } catch (error) {
    alert("Erreur lors de l'export Excel")
  }
}

// Gestion de la modification
const handleEdit = (product: Product) => {
  selectedProduct.value = product
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (product: Product) => {
  productToDelete.value = product
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  try {
    await store.deleteProduct(productToDelete.value.id)
    // Recharger les familles pour mettre à jour les compteurs
    await familiesStore.fetchFamilies()
    isDeleteDialogOpen.value = false
    productToDelete.value = null
    successMessage.value = 'Produit supprimé avec succès !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    successMessage.value = 'Erreur lors de la suppression du produit'
    isSuccessDialogOpen.value = true
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: CreateProductDto) => {
  try {
    if (selectedProduct.value) {
      // Modification
      if (!selectedProduct.value.id) {
        successMessage.value = 'Erreur: ID du produit manquant'
        isSuccessDialogOpen.value = true
        return
      }

      await store.updateProduct(selectedProduct.value.id, data)
      // Recharger la liste des produits pour obtenir les données complètes du backend
      await store.fetchProducts()
      // Recharger les familles pour mettre à jour les compteurs
      await familiesStore.fetchFamilies()
      isFormOpen.value = false
      selectedProduct.value = null
      successMessage.value = 'Produit modifié avec succès !'
      isSuccessDialogOpen.value = true
    } else {
      // Ajout
      await store.addProduct(data)
      // Recharger la liste des produits pour obtenir les données complètes du backend
      await store.fetchProducts()
      // Recharger les familles pour mettre à jour les compteurs
      await familiesStore.fetchFamilies()
      isFormOpen.value = false
      selectedProduct.value = null
      successMessage.value = 'Produit ajouté avec succès !'
      isSuccessDialogOpen.value = true
    }
  } catch (error) {
    successMessage.value = 'Erreur lors de l\'enregistrement du produit'
    isSuccessDialogOpen.value = true
  }
}
</script>

<template>
  <div class="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Produits</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Filtre par magasin -->
    <Card class="border-none bg-white/80 shadow-xl backdrop-blur-sm">
      <CardContent class="p-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-slate-700">
            <Store class="h-5 w-5" />
            <Label htmlFor="store-filter" class="font-semibold">
              Filtrer par magasin :
            </Label>
          </div>
          <Select v-model="selectedStoreId">
            <SelectTrigger id="store-filter" class="w-[300px]">
              <SelectValue placeholder="Sélectionner un magasin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div class="flex items-center gap-2">
                  <Store class="h-4 w-4" />
                  <span class="font-medium">Tous les magasins (Stock global)</span>
                </div>
              </SelectItem>
              <SelectItem
                v-for="store in storesStore.stores"
                :key="store.id"
                :value="store.id.toString()"
              >
                <div class="flex items-center gap-2">
                  <Store class="h-4 w-4" />
                  <span>{{ store.name }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Barre de recherche et actions -->
    <ProductSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des produits -->
    <ProductTable
      :products="filteredProducts"
      :loading="store.loading"
      :current-page="1"
      :page-size="8"
      :total="store.productsCount"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Formulaire d'ajout/modification -->
    <ProductForm
      v-model:open="isFormOpen"
      :product="selectedProduct"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg">Confirmer la suppression</DialogTitle>
          <DialogDescription class="text-sm">
            Supprimer <span class="font-semibold text-gray-900">{{ productToDelete?.name }}</span> ?
            <br>
            <span class="text-xs text-red-600">Action irréversible.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-2">
          <Button
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="store.loading"
            class="text-sm"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="store.loading"
            class="text-sm"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de succès -->
    <Dialog v-model:open="isSuccessDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <span v-if="successMessage.includes('Erreur')" class="text-red-600">❌</span>
            <span v-else class="text-green-600">✅</span>
            {{ successMessage.includes('Erreur') ? 'Erreur' : 'Succès' }}
          </DialogTitle>
          <DialogDescription>
            {{ successMessage }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isSuccessDialogOpen = false">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
