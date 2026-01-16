<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FileText, Camera } from 'lucide-vue-next'
import type { Product } from '@/stores/products'
import { useProductsStore } from '@/stores/products'
import type { CreateProductDto } from '@/services/api/products.api'
import { useProductFamiliesStore } from '@/stores/productFamilies'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
const fieldConfigStore = useFieldConfigStore()

// Computed properties pour vérifier la visibilité et obligation des champs
const fieldConfigs = computed(() => {
  const productConfigs = fieldConfigStore.configurations.filter(c => c.form_name === 'product')
  const configMap: Record<string, { visible: boolean; required: boolean }> = {}

  productConfigs.forEach(config => {
    configMap[config.field_name] = {
      visible: config.is_visible,
      required: config.is_required
    }
  })

  return configMap
})

const isFieldVisible = (fieldName: string) => fieldConfigs.value[fieldName]?.visible ?? true
const isFieldRequired = (fieldName: string) => fieldConfigs.value[fieldName]?.required ?? false

// Computed pour vérifier si le formulaire est valide
const isFormValid = computed(() => {
  const requiredFields = [
    { name: 'name', value: formData.value.name },
    { name: 'sale_price', value: formData.value.selling_price },
    { name: 'category', value: formData.value.category },
  ]

  for (const field of requiredFields) {
    const isVisible = isFieldVisible(field.name)
    const isRequired = isFieldRequired(field.name)

    // Si le champ est visible ET obligatoire ET vide → formulaire invalide
    if (isVisible && isRequired && !field.value) {
      return false
    }
  }

  return true
})

const formData = ref({
  reference: '',
  name: '',
  category: 0,
  purchase_price: 0,
  selling_price: 0,
  minimum_stock: 0,
  optimal_stock: 0,
  description: '',
  barcode: '',
})

// Générer le prochain code séquentiel (PROD001, PROD002, etc.)
// Utilise la liste de toutes les références (actifs + inactifs) pour ne jamais réutiliser un code
const generateNextCode = (allReferences: string[]): string => {
  const existingCodes = allReferences
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

// Gestion des erreurs de validation
const fieldErrors = ref<Record<string, string>>({})

const clearFieldError = (fieldName: string) => {
  delete fieldErrors.value[fieldName]
}

const getFieldError = (fieldName: string) => fieldErrors.value[fieldName] || ''

// Charger les catégories au montage
onMounted(async () => {
  if (categoriesStore.families.length === 0) {
    categoriesStore.fetchFamilies()
  }

  // Charger les configurations de champs
  if (fieldConfigStore.configurations.length === 0) {
    await fieldConfigStore.fetchConfigurations()
  }
})

watch(() => props.open, async (newValue) => {
  console.log('ProductForm watch open:', newValue, 'product:', props.product)
  if (newValue) {
    if (props.product) {
      console.log('Mode édition - Chargement des données du produit')
      isEditing.value = true
      formData.value = {
        reference: props.product.reference || '',
        name: props.product.name || '',
        category: props.product.category || 0,
        purchase_price: props.product.purchase_price || 0,
        selling_price: props.product.selling_price || 0,
        minimum_stock: props.product.minimum_stock || 0,
        optimal_stock: props.product.optimal_stock || 0,
        description: props.product.description || '',
        barcode: props.product.barcode || '',
      }
      imagePreview.value = props.product.primary_image || ''
      console.log('formData chargé:', formData.value)
    } else {
      console.log('Mode création - Génération nouveau code')
      isEditing.value = false
      // Récupérer TOUTES les références (actifs + inactifs) pour générer un code unique
      const allReferences = await productsStore.fetchAllReferences()
      formData.value = {
        reference: generateNextCode(allReferences),
        name: '',
        category: categoriesStore.families[0]?.id || 0,
        purchase_price: 0,
        selling_price: 0,
        minimum_stock: 10,
        optimal_stock: 50,
        description: '',
        barcode: '',
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
  console.log('📸 handleImageChange appelé, fichier:', file)

  if (file) {
    console.log('✅ Fichier sélectionné:', file.name, file.type, file.size)
    imageFile.value = file

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      console.error('❌ Le fichier n\'est pas une image')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('✅ Image chargée, longueur:', result?.length)
      console.log('🖼️ Début de l\'image:', result?.substring(0, 50))
      imagePreview.value = result
      console.log('✅ imagePreview.value mis à jour, v-if devrait basculer')
    }
    reader.onerror = (error) => {
      console.error('❌ Erreur de lecture du fichier:', error)
    }
    reader.readAsDataURL(file)
  } else {
    console.log('⚠️ Aucun fichier sélectionné')
  }
}

const handleCategoryChange = (value: string) => {
  formData.value.category = parseInt(value)
}

const handleSubmit = () => {
  // Validation dynamique : vérifier TOUS les champs configurés comme obligatoires
  const fieldMapping: Record<string, { value: any; label: string }> = {
    'name': { value: formData.value.name, label: 'Nom' },
    'reference': { value: formData.value.reference, label: 'Référence' },
    'category': { value: formData.value.category, label: 'Catégorie' },
    'purchase_price': { value: formData.value.purchase_price, label: 'Prix d\'achat' },
    'sale_price': { value: formData.value.selling_price, label: 'Prix de vente' },
    'minimum_stock': { value: formData.value.minimum_stock, label: 'Stock minimum' },
    'description': { value: formData.value.description, label: 'Description' },
    'barcode': { value: formData.value.barcode, label: 'Code-barres' },
  }

  // Réinitialiser les erreurs
  fieldErrors.value = {}

  // Vérifier tous les champs qui sont visibles ET obligatoires
  for (const [fieldName, fieldData] of Object.entries(fieldMapping)) {
    const isVisible = isFieldVisible(fieldName)
    const isRequired = isFieldRequired(fieldName)

    if (isVisible && isRequired && !fieldData.value) {
      fieldErrors.value[fieldName] = `Le champ "${fieldData.label}" est obligatoire`
    }
  }

  // Si des erreurs existent, arrêter la soumission
  if (Object.keys(fieldErrors.value).length > 0) {
    return
  }

  // Construire les données en incluant uniquement les champs visibles
  // Mais toujours fournir les valeurs obligatoires pour le backend
  const data: CreateProductDto = {
    name: formData.value.name,
    category: formData.value.category,
    reference: isFieldVisible('reference') ? formData.value.reference : '',
    cost_price: isFieldVisible('purchase_price') ? (formData.value.purchase_price || 0) : 0,
    selling_price: isFieldVisible('sale_price') ? formData.value.selling_price : 0,
  }

  // Ajouter les champs optionnels
  if (isFieldVisible('description') && formData.value.description) {
    data.description = formData.value.description
  }
  if (isFieldVisible('barcode') && formData.value.barcode) {
    data.barcode = formData.value.barcode
  }
  if (isFieldVisible('minimum_stock')) {
    data.minimum_stock = formData.value.minimum_stock
  }

  // optimal_stock n'est pas dans les configs, donc on l'ajoute toujours
  data.optimal_stock = formData.value.optimal_stock

  console.log('📦 Données envoyées au backend:', data)

  // Ajouter l'image si elle existe
  if (imageFile.value) {
    (data as any).image = imageFile.value
  }

  emit('submit', data)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[700px] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[80vh] overflow-hidden flex flex-col">
      <div class="relative px-4 sm:px-[47px] pt-[27px] pb-[20px] border-b border-gray-100">
        <div class="flex items-center gap-3 sm:gap-5">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Camera class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <div>
            <DialogTitle class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
              Fiche de produits
            </DialogTitle>
            <DialogDescription class="sr-only">
              Formulaire de {{ isEditing ? 'modification' : 'création' }} d'un produit
            </DialogDescription>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col overflow-hidden">
      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-[47px] py-6">
        <!-- Zone d'upload d'image -->
        <div class="relative mx-auto w-full max-w-[300px] h-[120px] mb-6">

          <!-- Placeholder quand pas d'image -->
          <div
            v-show="!imagePreview"
            @click="handleImageClick"
            class="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
          >
            <Camera class="w-12 h-12 text-gray-400 mb-2" />
            <p class="text-sm text-center text-gray-500 px-2">
              Cliquez pour choisir une image
            </p>
          </div>

          <!-- Aperçu de l'image -->
          <div
            v-show="imagePreview"
            @click="handleImageClick"
            class="w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 flex items-center justify-center p-2 hover:border-gray-400 transition-colors"
          >
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Aperçu produit"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="hidden"
          />
        </div>

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
            :model-value="formData.category?.toString() || ''"
            @update:model-value="(v) => { handleCategoryChange(v); clearFieldError('category'); }"
            :disabled="loading || categoriesStore.loading"
          >
            <SelectTrigger :class="['h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]', getFieldError('category') && 'border-red-500']" style="font-family: 'Palanquin Dark'">
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
          <p v-if="getFieldError('category')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('category') }}
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
              @input="clearFieldError('name')"
              placeholder="Ex : Samsung Galaxy S24"
              :disabled="loading"
              :class="['h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]', getFieldError('name') && 'border-red-500']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('name')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('name') }}
          </p>
        </div>

        <!-- Description du produit -->
        <div v-if="isFieldVisible('description')" class="mb-[10px]">
          <label for="description" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Description :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-[12px] h-6 w-6 text-[#616161]" />
            <textarea
              id="description"
              v-model="formData.description"
              @input="clearFieldError('description')"
              placeholder="Description du produit..."
              :disabled="loading"
              rows="3"
              :class="['w-full pl-[37px] pt-2 border rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] resize-none', getFieldError('description') ? 'border-red-500' : 'border-[#BEBEBE]']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('description')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('description') }}
          </p>
        </div>

        <!-- Code-barres -->
        <div v-if="isFieldVisible('barcode')" class="mb-[10px]">
          <label for="barcode" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Code-barres :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="barcode"
              v-model="formData.barcode"
              @input="clearFieldError('barcode')"
              placeholder="Ex : 123456789012"
              :disabled="loading"
              :class="['h-[37px] w-full pl-[37px] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]', getFieldError('barcode') ? 'border-red-500' : 'border-[#BEBEBE]']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('barcode')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('barcode') }}
          </p>
        </div>

        <!-- Prix d'achat -->
        <div v-if="isFieldVisible('purchase_price')" class="mb-[10px]">
          <label for="purchase_price" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Prix d'achat :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="purchase_price"
              v-model.number="formData.purchase_price"
              @input="clearFieldError('purchase_price')"
              type="number"
              step="1"
              placeholder="Ex : 15 000"
              :disabled="loading"
              :class="['h-[37px] w-full pl-[37px] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]', getFieldError('purchase_price') ? 'border-red-500' : 'border-[#BEBEBE]']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('purchase_price')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('purchase_price') }}
          </p>
        </div>

        <!-- Prix de vente -->
        <div v-if="isFieldVisible('sale_price')" class="mb-[10px]">
          <label for="selling_price" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Prix de vente :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="selling_price"
              v-model.number="formData.selling_price"
              @input="clearFieldError('sale_price')"
              type="number"
              step="1"
              placeholder="Ex : 25 000"
              :disabled="loading"
              :class="['h-[37px] w-full pl-[37px] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]', getFieldError('sale_price') ? 'border-red-500' : 'border-[#BEBEBE]']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('sale_price')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('sale_price') }}
          </p>
        </div>

        <!-- Stock minimum -->
        <div v-if="isFieldVisible('minimum_stock')" class="mb-[10px]">
          <label for="minimum_stock" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Stock minimum (alerte) :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="minimum_stock"
              v-model.number="formData.minimum_stock"
              @input="clearFieldError('minimum_stock')"
              type="number"
              step="1"
              min="0"
              placeholder="Ex : 10"
              :disabled="loading"
              :class="['h-[37px] w-full pl-[37px] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]', getFieldError('minimum_stock') ? 'border-red-500' : 'border-[#BEBEBE]']"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
          <p v-if="getFieldError('minimum_stock')" class="text-sm text-red-500 mt-1">
            {{ getFieldError('minimum_stock') }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            Une notification sera envoyée quand le stock atteint ce seuil
          </p>
        </div>

        <!-- Stock optimal -->
        <div class="mb-[15px]">
          <label for="optimal_stock" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Stock optimal (recommandé) :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="optimal_stock"
              v-model.number="formData.optimal_stock"
              type="number"
              step="1"
              min="0"
              placeholder="Ex : 50"
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>
      </div>

      <!-- Footer avec bouton fixe -->
      <div class="border-t border-gray-100 px-4 sm:px-[47px] py-4">
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
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
