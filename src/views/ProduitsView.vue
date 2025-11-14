<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore, type Product } from '@/stores/products'
import ProductSearchBar from '@/components/ProductSearchBar.vue'
import ProductTable from '@/components/ProductTable.vue'
import ProductForm from '@/components/ProductForm.vue'
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
import { Button } from '@/components/ui/button'

const store = useProductsStore()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return store.products
  }
  const query = searchQuery.value.toLowerCase()
  return store.products.filter(
    (product) =>
      product.code.toLowerCase().includes(query) ||
      product.designation.toLowerCase().includes(query) ||
      product.familleLibelle.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
  )
})

// Charger les données au montage
onMounted(() => {
  store.fetchProducts()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedProduct.value = null
  isFormOpen.value = true
}

// Gestion de l'import
const handleImport = () => {
  console.log('Import clicked')
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  console.log('Export PDF clicked')
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  console.log('Export Excel clicked')
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
    isDeleteDialogOpen.value = false
    productToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: Partial<Product>) => {
  try {
    if (selectedProduct.value) {
      // Modification
      await store.updateProduct(selectedProduct.value.id, data)
    } else {
      // Ajout
      await store.addProduct(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>)
    }
    isFormOpen.value = false
    selectedProduct.value = null
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
  }
}
</script>

<template>
  <div class="flex-1 space-y-6 p-6">
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

    <!-- Barre de recherche et actions -->
    <ProductSearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import="handleImport"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le produit
            <span class="font-semibold">{{ productToDelete?.designation }}</span> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="isDeleteDialogOpen = false"
            :disabled="store.loading"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="store.loading"
          >
            {{ store.loading ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
