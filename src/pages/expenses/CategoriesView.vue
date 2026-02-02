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
          <BreadcrumbLink href="/depenses">Dépenses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Catégories</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with title and back button -->
    <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] bg-clip-text text-transparent">
          Catégories de Dépenses
        </h1>
        <p class="opacity-60 text-xs sm:text-sm">Gérez vos catégories de dépenses</p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          @click="$router.push('/depenses')"
          variant="outline"
          class="gap-2 h-[38px] rounded-[10px] border-[#E5E5E5] hover:bg-gray-50 transition-all"
        >
          <ArrowLeft class="h-4 w-4" />
          <span class="hidden sm:inline">Retour</span>
        </Button>
      </div>
    </header>

    <!-- Create new category form -->
    <Card class="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/30">
      <CardContent class="p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5932EA] to-[#7B5AFF] flex items-center justify-center shadow-md">
            <Plus class="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">Créer une nouvelle catégorie</h3>
            <p class="text-xs text-muted-foreground">Ajoutez une catégorie pour organiser vos dépenses</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="new-cat-code" class="text-[13px] font-medium text-[#9197B3]">
              Code unique <span class="text-red-500">*</span>
            </Label>
            <Input
              id="new-cat-code"
              :value="generatedCode"
              disabled
              class="h-[42px] rounded-[10px] border-[#E5E5E5] bg-gray-50 text-gray-600 font-mono cursor-not-allowed"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="new-cat-name" class="text-[13px] font-medium text-[#9197B3]">
              Nom de la catégorie <span class="text-red-500">*</span>
            </Label>
            <Input
              id="new-cat-name"
              v-model="newCategory.name"
              placeholder="Ex: Loyer, Électricité, Salaires..."
              class="h-[42px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all"
              @keyup.enter="createNewCategory"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="new-cat-desc" class="text-[13px] font-medium text-[#9197B3]">Description (optionnelle)</Label>
            <Input
              id="new-cat-desc"
              v-model="newCategory.description"
              placeholder="Décrivez l'usage de cette catégorie..."
              class="h-[42px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all"
              @keyup.enter="createNewCategory"
            />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <Button
            @click="createNewCategory"
            :disabled="!newCategory.name || isCreating"
            class="h-[42px] px-8 rounded-[10px] bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] hover:from-[#4526c5] hover:to-[#6849e8] transition-all shadow-md hover:shadow-lg"
          >
            <Plus class="h-4 w-4 mr-2" />
            {{ isCreating ? 'Création...' : 'Créer la catégorie' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Categories list -->
    <Card class="rounded-xl border-none shadow-sm">
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FolderTree class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold">Catégories existantes</h3>
              <p class="text-xs text-muted-foreground">
                {{ expensesStore.categories.length }} catégorie{{ expensesStore.categories.length > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="expensesStore.isLoading" class="flex items-center justify-center py-12">
          <Skeleton class="h-12 w-12 rounded-full" />
        </div>

        <!-- Empty state -->
        <div v-else-if="expensesStore.categories.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <FolderTree class="h-10 w-10 text-purple-400" />
          </div>
          <p class="text-lg font-medium text-gray-700 mb-2">Aucune catégorie disponible</p>
          <p class="text-sm text-muted-foreground">Créez votre première catégorie ci-dessus pour commencer</p>
        </div>

        <!-- Categories grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="category in expensesStore.categories"
            :key="category.id"
            class="group relative rounded-xl border-[#E5E5E5] hover:border-[#5932EA] hover:shadow-lg transition-all cursor-pointer overflow-hidden"
          >
            <!-- Gradient background on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-[#5932EA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardContent class="relative p-5">
              <div class="flex items-start justify-between mb-3">
                <Badge variant="secondary" class="text-[11px] font-mono px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-none">
                  {{ category.code }}
                </Badge>

                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    @click="editCategory(category)"
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="confirmDeleteCategory(category.id)"
                    variant="ghost"
                    size="sm"
                    class="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h4 class="font-semibold text-[16px] mb-2 group-hover:text-[#5932EA] transition-colors">
                {{ category.name }}
              </h4>

              <p v-if="category.description" class="text-xs text-muted-foreground line-clamp-2">
                {{ category.description }}
              </p>
              <p v-else class="text-xs text-muted-foreground italic">
                Aucune description
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Edit Category Dialog -->
    <Dialog v-if="editingCategory" :open="true" @update:open="editingCategory = null">
      <DialogContent class="max-w-md rounded-xl border-none shadow-2xl">
        <DialogHeader class="border-b pb-4">
          <DialogTitle class="text-xl font-bold">Modifier la catégorie</DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">Mettez à jour les informations</p>
        </DialogHeader>

        <div class="space-y-4 mt-4">
          <div class="flex flex-col gap-2">
            <Label for="edit-cat-code" class="text-[13px] font-medium text-[#9197B3]">
              Code unique <span class="text-red-500">*</span>
            </Label>
            <Input
              id="edit-cat-code"
              :value="editingCategory.code"
              disabled
              class="h-[42px] rounded-[10px] border-[#E5E5E5] bg-gray-50 text-gray-600 font-mono cursor-not-allowed"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="edit-cat-name" class="text-[13px] font-medium text-[#9197B3]">
              Nom de la catégorie <span class="text-red-500">*</span>
            </Label>
            <Input
              id="edit-cat-name"
              v-model="editingCategory.name"
              class="h-[42px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="edit-cat-desc" class="text-[13px] font-medium text-[#9197B3]">Description (optionnelle)</Label>
            <Textarea
              id="edit-cat-desc"
              v-model="editingCategory.description"
              class="rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] resize-none transition-all"
              rows="3"
            />
          </div>
        </div>

        <DialogFooter class="gap-3 border-t pt-4 mt-6">
          <Button
            @click="editingCategory = null"
            variant="outline"
            class="h-[42px] px-6 rounded-[10px] hover:bg-gray-100 transition-all"
          >
            Annuler
          </Button>
          <Button
            @click="saveEditCategory"
            :disabled="!editingCategory.name || isUpdating"
            class="h-[42px] px-6 rounded-[10px] bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] hover:from-[#4526c5] hover:to-[#6849e8] transition-all shadow-md hover:shadow-lg"
          >
            {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpensesStore } from '@/stores/expenses'
import type { ExpenseCategory } from '@/types/expenses'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, FolderTree, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const expensesStore = useExpensesStore()

const newCategory = ref({
  name: '',
  description: '',
})

const editingCategory = ref<ExpenseCategory | null>(null)
const isCreating = ref(false)
const isUpdating = ref(false)

// Generate next category code automatically
const generatedCode = computed(() => {
  const categories = expensesStore.categories
  if (categories.length === 0) {
    return 'CG001'
  }

  // Extract all numeric parts from existing codes (e.g., CG001 -> 001, CG002 -> 002)
  const existingNumbers = categories
    .map(cat => {
      const match = cat.code.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    })
    .filter(num => num > 0)

  // Find the highest number and increment
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
  const nextNumber = maxNumber + 1

  // Format with leading zeros (e.g., 1 -> 001, 10 -> 010)
  return `CG${nextNumber.toString().padStart(3, '0')}`
})

onMounted(async () => {
  await expensesStore.fetchCategories()
})

async function createNewCategory() {
  if (!newCategory.value.name) return

  isCreating.value = true
  try {
    await expensesStore.createCategory({
      name: newCategory.value.name,
      code: generatedCode.value,
      description: newCategory.value.description,
      is_active: true,
    })

    // Reset form
    newCategory.value = {
      name: '',
      description: '',
    }
  } catch (error) {
  } finally {
    isCreating.value = false
  }
}

function editCategory(category: ExpenseCategory) {
  editingCategory.value = { ...category }
}

async function saveEditCategory() {
  if (!editingCategory.value) return

  isUpdating.value = true
  try {
    await expensesStore.updateCategory(editingCategory.value.id, {
      name: editingCategory.value.name,
      code: editingCategory.value.code, // Code is not modifiable, just pass it as-is
      description: editingCategory.value.description,
    })
    editingCategory.value = null
  } catch (error) {
  } finally {
    isUpdating.value = false
  }
}

async function confirmDeleteCategory(id: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) {
    try {
      await expensesStore.deleteCategory(id)
    } catch (error) {
    }
  }
}
</script>
