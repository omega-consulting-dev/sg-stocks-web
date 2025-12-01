<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FileText, Camera } from 'lucide-vue-next'
import type { Product } from '@/stores/products'
import { useProductsStore } from '@/stores/products'
import type { CreateProductDto } from '@/services/api/products.api'
import { useProductFamiliesStore } from '@/stores/productFamilies'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  open: boolean
  product?: Product | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateProductDto]
}>()

// Stores
const categoriesStore = useProductFamiliesStore()
const productsStore = useProductsStore()

const formData = ref({
  reference: '',
  name: '',
  category: 0,
  selling_price: 0,
})

// Générer le prochain code séquentiel (PROD001, PROD002, etc.)
const generateNextCode = (): string => {
  const existingCodes = productsStore.products
    .map(p => p.reference)
    .filter(ref => ref && ref.startsWith('PROD'))
    .map(ref => parseInt(ref.replace('PROD', '')) || 0)

  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
  const nextNumber = maxCode + 1
  return `PROD${nextNumber.toString().padStart(3, '0')}`
}

// Obtenir le nom de la catégorie sélectionnée
const selectedCategoryName = computed(() => {
  const category = categoriesStore.families.find(c => c.id === formData.value.category)
  return category?.name || ''
})

const imagePreview = ref<string>('')
const imageFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isEditing = ref(false)

// Charger les catégories au montage
onMounted(() => {
  if (categoriesStore.families.length === 0) {
    categoriesStore.fetchFamilies()
  }
})

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.product) {
      isEditing.value = true
      formData.value = {
        reference: props.product.reference,
        name: props.product.name,
        category: props.product.category,
        selling_price: props.product.selling_price,
      }
      imagePreview.value = props.product.primary_image || ''
    } else {
      isEditing.value = false
      formData.value = {
        reference: generateNextCode(),
        name: '',
        category: categoriesStore.families[0]?.id || 0,
        selling_price: 0,
      }
      imagePreview.value = ''
      imageFile.value = null
    }
  }
})

const handleImageClick = () => {
  fileInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleCategoryChange = (value: string) => {
  formData.value.category = parseInt(value)
}

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.selling_price || !formData.value.category) {
    return
  }

  const data: CreateProductDto = {
    reference: formData.value.reference,
    name: formData.value.name,
    category: formData.value.category,
    cost_price: 0,
    selling_price: formData.value.selling_price,
  }

  emit('submit', data)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[600px] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[90vh] overflow-y-auto">
      <div class="relative px-4 sm:px-[47px] pt-[27px] pb-[20px]">
        <!-- <button
          @click="handleClose"
          class="absolute right-[15px] top-[15px] w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          type="button"
        >
          <X class="h-4 w-4 text-gray-600" />
        </button> -->

        <div class="flex items-center gap-3 sm:gap-5 mb-4">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Camera class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
            Fiche de produits
          </h2>
        </div>

        <!-- Zone d'upload d'image -->
        <div
          @click="handleImageClick"
          class="relative mx-auto w-[136px] h-[119px] mb-6 cursor-pointer group"
        >
          <div
            v-if="!imagePreview"
            class="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Camera class="w-12 h-12 text-gray-400 mb-2" />
            <p class="text-[14.76px] text-center leading-[1.811] text-[rgba(120,120,120,0.48)] px-2" style="font-family: 'Palanquin Dark'">
              Cliquez pour choisie une image
            </p>
          </div>
          <div v-else class="w-full h-full relative">
            <img :src="imagePreview" alt="Aperçu" class="w-full h-full object-cover rounded-lg" />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
              <Camera class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="hidden"
          />
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Code produit (auto-généré) -->
        <div class="mb-[10px]">
          <label for="reference" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Code :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="reference"
              v-model="formData.reference"
              :disabled="true"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] bg-gray-100 font-semibold"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Catégorie produit -->
        <div class="mb-[10px]">
          <label for="category" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Catégorie :
          </label>
          <Select
            :model-value="formData.category.toString()"
            @update:model-value="handleCategoryChange"
            :disabled="loading || categoriesStore.loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <SelectValue placeholder="Sélectionner la catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="category in categoriesStore.families"
                  :key="category.id"
                  :value="category.id.toString()"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="selectedCategoryName" class="text-sm text-muted-foreground mt-1">
            Famille : <span class="font-medium text-[#0769CF]">{{ selectedCategoryName }}</span>
          </p>
        </div>

        <!-- Nom du produit -->
        <div class="mb-[10px]">
          <label for="name" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Désignation :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : Samsung Galaxy S24"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Prix de vente -->
        <div class="mb-[15px]">
          <label for="selling_price" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Prix de vente :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="selling_price"
              v-model.number="formData.selling_price"
              type="number"
              step="1"
              placeholder="Ex : 25 000"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.name || !formData.selling_price || !formData.category"
            class="w-full h-[37px] bg-[#0769CF] hover:bg-[#0558b0] text-white rounded-[10px] text-[14.76px] font-bold uppercase"
            style="font-family: Montserrat"
          >
            {{ loading ? 'ENREGISTREMENT...' : 'SAUVER' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
