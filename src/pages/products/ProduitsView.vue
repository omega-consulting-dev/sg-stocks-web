<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductsStore, type Product } from '@/stores/products'
import { useProductFamiliesStore } from '@/stores/productFamilies'
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
import { Button } from '@/components/ui/button'

const store = useProductsStore()
const familiesStore = useProductFamiliesStore()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
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
      product.reference.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.category_name.toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query)
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
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const result = await store.importExcel(file)
        console.log('Import réussi:', result)
        alert(`Import terminé: ${result.created} créés, ${result.updated} mis à jour`)
      } catch (error) {
        console.error("Erreur lors de l'import:", error)
        alert("Erreur lors de l'import du fichier")
      }
    }
  }
  input.click()
}

// Gestion de l'export PDF
const handleExportPdf = async () => {
  try {
    await store.exportPdf()
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error)
    alert("Erreur lors de l'export PDF")
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    await store.exportExcel()
  } catch (error) {
    console.error("Erreur lors de l'export Excel:", error)
    alert("Erreur lors de l'export Excel")
  }
}

// Gestion de la modification
const handleEdit = (product: Product) => {
  console.log('ProduitsView handleEdit appelé avec:', product)
  console.log('isFormOpen avant:', isFormOpen.value)
  selectedProduct.value = product
  isFormOpen.value = true
  console.log('isFormOpen après:', isFormOpen.value)
  console.log('selectedProduct:', selectedProduct.value)
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
    console.error('Erreur lors de la suppression:', error)
    successMessage.value = 'Erreur lors de la suppression du produit'
    isSuccessDialogOpen.value = true
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: CreateProductDto) => {
  try {
    if (selectedProduct.value) {
      // Modification
      console.log('Modification du produit:', selectedProduct.value)
      console.log('ID du produit:', selectedProduct.value.id)
      console.log('Data à envoyer:', data)

      if (!selectedProduct.value.id) {
        console.error('ERREUR: ID du produit est undefined!', selectedProduct.value)
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
    console.error("Erreur lors de l'enregistrement:", error)
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
