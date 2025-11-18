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
      family.code.toLowerCase().includes(query) ||
      family.libelle.toLowerCase().includes(query) ||
      family.description.toLowerCase().includes(query)
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
  // TODO: Implémenter l'import de données
  console.log('Import clicked')
}

// Gestion de l'export PDF
const handleExportPdf = () => {
  // TODO: Implémenter l'export PDF
  console.log('Export PDF clicked')
}

// Gestion de l'export Excel
const handleExportExcel = () => {
  // TODO: Implémenter l'export Excel
  console.log('Export Excel clicked')
}

// Gestion de la sélection d'une famille pour voir ses produits
const handleSelectFamily = (family: ProductFamily) => {
  if (selectedFamilyForProducts.value?.id === family.id) {
    // Si on clique sur la même famille, on la désélectionne
    selectedFamilyForProducts.value = null
  } else {
    selectedFamilyForProducts.value = family
  }
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
const handleFormSubmit = async (data: { code: string; libelle: string; description: string }) => {
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
  <div class="flex-1 space-y-6 p-6">
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
          :selected-family-id="selectedFamilyForProducts?.id"
          @edit="handleEdit"
          @delete="handleDelete"
          @select="handleSelectFamily"
        />
      </CardContent>
    </Card>

    <!-- Produits de la famille sélectionnée -->
    <div v-if="selectedFamilyForProducts" class="space-y-4">
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-bold text-[#003FD8]">
          Produits de la famille "{{ selectedFamilyForProducts.libelle }}"
        </h3>
        <span class="text-sm text-muted-foreground">
          {{ familyProducts.length }} produit(s)
        </span>
      </div>

      <ProductTable
        :products="familyProducts"
        :loading="productsStore.loading"
        :current-page="1"
        :page-size="10"
        :total="familyProducts.length"
        @edit="() => {}"
        @delete="() => {}"
      />
    </div>

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
            <span class="font-semibold">{{ familyToDelete?.libelle }}</span> ?
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
