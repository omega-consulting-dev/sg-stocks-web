<template>
  <div>
    <!-- Main Category Management Dialog -->
    <Dialog :open="true" @update:open="$emit('close')">
      <DialogContent class="max-w-4xl rounded-xl border-none shadow-2xl">
        <DialogHeader class="border-b pb-4">
          <DialogTitle class="text-2xl font-bold bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] bg-clip-text text-transparent">
            Gestion des Catégories
          </DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">Créez et gérez vos catégories de dépenses</p>
        </DialogHeader>

        <div class="space-y-6 mt-4">
          <!-- Create new category form -->
          <Card class="rounded-xl border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow">
            <CardContent class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5932EA] to-[#7B5AFF] flex items-center justify-center">
                  <Plus class="h-4 w-4 text-white" />
                </div>
                <h3 class="text-base font-semibold">Nouvelle Catégorie</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <Label for="new-cat-name" class="text-[13px] font-medium text-[#9197B3]">Nom de la catégorie</Label>
                  <Input
                    id="new-cat-name"
                    v-model="newCategory.name"
                    placeholder="Ex: Loyer, Électricité..."
                    class="h-[40px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <Label for="new-cat-code" class="text-[13px] font-medium text-[#9197B3]">Code unique</Label>
                  <Input
                    id="new-cat-code"
                    v-model="newCategory.code"
                    placeholder="Ex: RENT, ELEC..."
                    class="h-[40px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all uppercase"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-2 mt-4">
                <Label for="new-cat-desc" class="text-[13px] font-medium text-[#9197B3]">Description (optionnelle)</Label>
                <Textarea
                  id="new-cat-desc"
                  v-model="newCategory.description"
                  placeholder="Décrivez l'utilisation de cette catégorie..."
                  class="rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] resize-none transition-all"
                  rows="2"
                />
              </div>
              <div class="flex justify-end mt-5">
                <Button
                  @click="createNewCategory"
                  :disabled="!newCategory.name || !newCategory.code || isCreating"
                  class="h-[40px] px-6 rounded-[10px] bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] hover:from-[#4526c5] hover:to-[#6849e8] transition-all shadow-md hover:shadow-lg"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  {{ isCreating ? 'Création...' : 'Créer la catégorie' }}
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Categories list -->
          <Card class="rounded-xl border-[#E5E5E5] shadow-sm">
            <CardContent class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FolderTree class="h-4 w-4 text-blue-600" />
                </div>
                <h3 class="text-base font-semibold">Catégories Existantes</h3>
                <Badge variant="secondary" class="ml-auto">{{ expensesStore.categories.length }}</Badge>
              </div>

              <div v-if="expensesStore.categories.length === 0" class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FolderTree class="h-8 w-8 text-gray-400" />
                </div>
                <p class="text-muted-foreground text-sm">Aucune catégorie disponible</p>
                <p class="text-xs text-muted-foreground mt-1">Créez votre première catégorie ci-dessus</p>
              </div>

              <div v-else class="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                <div
                  v-for="category in expensesStore.categories"
                  :key="category.id"
                  class="group flex items-center justify-between p-4 rounded-xl border border-[#E5E5E5] hover:border-[#5932EA] hover:bg-gradient-to-r hover:from-[#5932EA]/5 hover:to-transparent transition-all cursor-pointer"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <Badge variant="secondary" class="text-[11px] font-mono px-2 py-1">{{ category.code }}</Badge>
                      <span class="font-medium text-[15px]">{{ category.name }}</span>
                    </div>
                    <p v-if="category.description" class="text-xs text-muted-foreground mt-2 ml-0">
                      {{ category.description }}
                    </p>
                  </div>

                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      @click="editCategory(category)"
                      variant="ghost"
                      size="sm"
                      class="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      @click="confirmDeleteCategory(category.id)"
                      variant="ghost"
                      size="sm"
                      class="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter class="border-t pt-4">
          <Button
            @click="$emit('close')"
            variant="outline"
            class="h-[40px] px-6 rounded-[10px] hover:bg-gray-100 transition-all"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Category Dialog -->
    <Dialog v-if="editingCategory" :open="true" @update:open="editingCategory = null">
      <DialogContent class="max-w-md rounded-xl border-none shadow-2xl">
        <DialogHeader class="border-b pb-4">
          <DialogTitle class="text-xl font-bold">Modifier la Catégorie</DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">Mettez à jour les informations</p>
        </DialogHeader>

        <div class="space-y-4 mt-4">
          <div class="flex flex-col gap-2">
            <Label for="edit-cat-name" class="text-[13px] font-medium text-[#9197B3]">Nom de la catégorie</Label>
            <Input
              id="edit-cat-name"
              v-model="editingCategory.name"
              class="h-[40px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="edit-cat-code" class="text-[13px] font-medium text-[#9197B3]">Code unique</Label>
            <Input
              id="edit-cat-code"
              v-model="editingCategory.code"
              class="h-[40px] rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] transition-all uppercase"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="edit-cat-desc" class="text-[13px] font-medium text-[#9197B3]">Description (optionnelle)</Label>
            <Textarea
              id="edit-cat-desc"
              v-model="editingCategory.description"
              class="rounded-[10px] border-[#E5E5E5] focus:border-[#5932EA] focus:ring-[#5932EA] resize-none transition-all"
              rows="2"
            />
          </div>
        </div>

        <DialogFooter class="gap-3 border-t pt-4 mt-6">
          <Button
            @click="editingCategory = null"
            variant="outline"
            class="h-[40px] px-6 rounded-[10px] hover:bg-gray-100 transition-all"
          >
            Annuler
          </Button>
          <Button
            @click="saveEditCategory"
            :disabled="!editingCategory.name || !editingCategory.code || isUpdating"
            class="h-[40px] px-6 rounded-[10px] bg-gradient-to-r from-[#5932EA] to-[#7B5AFF] hover:from-[#4526c5] hover:to-[#6849e8] transition-all shadow-md hover:shadow-lg"
          >
            {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import type { ExpenseCategory } from '@/types/expenses'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-vue-next'

defineEmits<{
  close: []
}>()

const expensesStore = useExpensesStore()

const newCategory = ref({
  name: '',
  code: '',
  description: '',
})

const editingCategory = ref<ExpenseCategory | null>(null)
const isCreating = ref(false)
const isUpdating = ref(false)

async function createNewCategory() {
  if (!newCategory.value.name || !newCategory.value.code) return

  isCreating.value = true
  try {
    await expensesStore.createCategory({
      name: newCategory.value.name,
      code: newCategory.value.code.toUpperCase(),
      description: newCategory.value.description,
      is_active: true,
    })

    // Reset form
    newCategory.value = {
      name: '',
      code: '',
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
      code: editingCategory.value.code.toUpperCase(),
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
