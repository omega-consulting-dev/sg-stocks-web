<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductFamiliesStore, type ProductFamily } from '@/stores/productFamilies'
import { useProductsStore } from '@/stores/products'
import ProductFamilySearchBar from '@/components/product-families/ProductFamilySearchBar.vue'
import ProductFamilyTable from '@/components/product-families/ProductFamilyTable.vue'
import ProductFamilyForm from '@/components/product-families/ProductFamilyForm.vue'
import ProductTable from '@/components/products/ProductTable.vue'
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
import { Card, CardContent } from '@/components/ui/card'

const store = useProductFamiliesStore()
const productsStore = useProductsStore()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isProductsDialogOpen = ref(false)
const selectedFamily = ref<ProductFamily | null>(null)
const familyToDelete = ref<ProductFamily | null>(null)
const selectedFamilyForProducts = ref<ProductFamily | null>(null)

// Computed
const filteredFamilies = computed(() => {
  if (!searchQuery.value) {
    return store.families
  }
  const query = searchQuery.value.toLowerCase()
  return store.families.filter(
    (family) =>
      String(family.id).includes(query) ||
      family.name.toLowerCase().includes(query) ||
      (family.description || '').toLowerCase().includes(query)
  )
})

// Produits de la famille sélectionnée
const familyProducts = computed(() => {
  if (!selectedFamilyForProducts.value) return []
  return productsStore.products.filter(
    (product) => product.familleId === selectedFamilyForProducts.value!.id
  )
})

// Charger les données au montage
onMounted(() => {
  store.fetchFamilies()
  productsStore.fetchProducts()
})

// Gestion de la recherche
const handleSearch = (query: string) => {
  searchQuery.value = query
}

// Gestion de l'ajout
const handleAdd = () => {
  selectedFamily.value = null
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
        alert(`Import terminé: ${result.created} créées, ${result.updated} mises à jour`)
      } catch (error) {
        console.error('Erreur lors de l\'import:', error)
        alert('Erreur lors de l\'import du fichier')
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
    console.error('Erreur lors de l\'export PDF:', error)
    alert('Erreur lors de l\'export PDF')
  }
}

// Gestion de l'export Excel
const handleExportExcel = async () => {
  try {
    await store.exportExcel()
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error)
    alert('Erreur lors de l\'export Excel')
  }
}

// Gestion de la sélection d'une famille pour voir ses produits
const handleSelectFamily = (family: ProductFamily) => {
  selectedFamilyForProducts.value = family
  isProductsDialogOpen.value = true
}

// Gestion de la modification
const handleEdit = (family: ProductFamily) => {
  selectedFamily.value = family
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (family: ProductFamily) => {
  familyToDelete.value = family
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!familyToDelete.value) return

  try {
    await store.deleteFamily(familyToDelete.value.id)
    isDeleteDialogOpen.value = false
    familyToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: { name: string; description: string }) => {
  try {
    if (selectedFamily.value) {
      // Modification
      await store.updateFamily(selectedFamily.value.id, data)
    } else {
      // Ajout
      await store.addFamily(data)
    }
    isFormOpen.value = false
    selectedFamily.value = null
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
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
          <BreadcrumbPage>Familles de produits</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions (avec titre intégré) -->
    <ProductFamilySearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import="handleImport"
      @export-pdf="handleExportPdf"
      @export-excel="handleExportExcel"
    />

    <!-- Tableau des familles -->
    <Card>
      <CardContent class="p-0">
        <ProductFamilyTable
          :families="filteredFamilies"
          :loading="store.loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @select="handleSelectFamily"
        />
      </CardContent>
    </Card>

    <!-- Statistiques -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Total:</span>
      <span class="font-semibold text-[#003FD8]">{{ store.familiesCount }} famille(s)</span>
      <span v-if="searchQuery" class="ml-2">
        · {{ filteredFamilies.length }} résultat(s) filtré(s)
      </span>
    </div>

    <!-- Formulaire d'ajout/modification -->
    <ProductFamilyForm
      v-model:open="isFormOpen"
      :family="selectedFamily"
      :loading="store.loading"
      @submit="handleFormSubmit"
    />

    <!-- Dialog de confirmation de suppression -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la famille
            <span class="font-semibold">{{ familyToDelete?.name }}</span> ?
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

    <!-- Dialog des produits de la famille -->
    <Dialog v-model:open="isProductsDialogOpen">
      <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle class="text-[#003FD8]">
            Produits de la famille "{{ selectedFamilyForProducts?.name }}"
          </DialogTitle>
          <DialogDescription>
            {{ familyProducts.length }} produit(s) dans cette famille
          </DialogDescription>
        </DialogHeader>
        <div class="flex-1 overflow-auto">
          <ProductTable
            v-if="familyProducts.length > 0"
            :products="familyProducts"
            :loading="productsStore.loading"
            :current-page="1"
            :page-size="familyProducts.length"
            :total="familyProducts.length"
            @edit="() => {}"
            @delete="() => {}"
          />
          <div v-else class="py-8 text-center text-muted-foreground">
            Aucun produit dans cette famille
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isProductsDialogOpen = false">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
