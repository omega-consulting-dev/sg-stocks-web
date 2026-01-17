<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductFamiliesStore, type ProductFamily } from '@/stores/productFamilies'
import { useProductsStore } from '@/stores/products'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
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

const { permissions, hasPermission, getPermissionErrorMessage } = usePermissions()
const toast = useToast()

// État local
const searchQuery = ref('')
const isFormOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isProductsDialogOpen = ref(false)
const isSuccessDialogOpen = ref(false)
const successMessage = ref('')
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
  if (!hasPermission('can_manage_categories')) {
    toast.error(getPermissionErrorMessage('can_manage_categories'), 'Accès refusé')
    return
  }
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
  if (!hasPermission('can_manage_categories')) {
    toast.error(getPermissionErrorMessage('can_manage_categories'), 'Accès refusé')
    return
  }
  selectedFamily.value = family
  isFormOpen.value = true
}

// Gestion de la suppression
const handleDelete = (family: ProductFamily) => {
  if (!hasPermission('can_manage_categories')) {
    toast.error(getPermissionErrorMessage('can_manage_categories'), 'Accès refusé')
    return
  }
  familyToDelete.value = family
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!familyToDelete.value) return

  try {
    await store.deleteFamily(familyToDelete.value.id)
    isDeleteDialogOpen.value = false
    familyToDelete.value = null
    successMessage.value = 'Famille de produits supprimée avec succès !'
    isSuccessDialogOpen.value = true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    successMessage.value = 'Erreur lors de la suppression'
    isSuccessDialogOpen.value = true
  }
}

// Soumission du formulaire
const handleFormSubmit = async (data: { name: string; description: string }) => {
  try {
    if (selectedFamily.value) {
      // Modification
      await store.updateFamily(selectedFamily.value.id, data)
      isFormOpen.value = false
      selectedFamily.value = null
      successMessage.value = 'Famille de produits modifiée avec succès !'
      isSuccessDialogOpen.value = true
    } else {
      // Ajout
      await store.addFamily(data)
      isFormOpen.value = false
      selectedFamily.value = null
      successMessage.value = 'Famille de produits ajoutée avec succès !'
      isSuccessDialogOpen.value = true
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    successMessage.value = 'Erreur lors de l\'enregistrement'
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
          <BreadcrumbPage>Familles de produits</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Barre de recherche et actions (avec titre intégré) -->
    <ProductFamilySearchBar
      @search="handleSearch"
      @add="handleAdd"
      @import-excel="handleImport"
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
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg">Confirmer la suppression</DialogTitle>
          <DialogDescription class="text-sm">
            Supprimer <span class="font-semibold text-gray-900">{{ familyToDelete?.name }}</span> ?
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

    <!-- Success Dialog -->
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
          <Button @click="isSuccessDialogOpen = false">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
