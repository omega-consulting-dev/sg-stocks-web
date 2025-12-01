<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, FileText, Camera, ChevronDown } from 'lucide-vue-next'
import type { Product } from '@/stores/products'
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
  submit: [data: Partial<Product>]
}>()

const formData = ref({
  designation: '',
  familleId: 1,
  familleLibelle: 'Électronique',
  prixVente: 0,
  image: '',
})

const imagePreview = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const isEditing = ref(false)

// Liste des familles disponibles (à terme, cela viendra du store des familles)
const famillesDisponibles = [
  { id: 1, libelle: 'Électronique' },
  { id: 2, libelle: 'Vêtements' },
  { id: 3, libelle: 'Alimentation' },
  { id: 4, libelle: 'Meubles' },
  { id: 5, libelle: 'Livres' },
]

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.product) {
      isEditing.value = true
      formData.value = {
        designation: props.product.designation,
        familleId: props.product.familleId,
        familleLibelle: props.product.familleLibelle,
        prixVente: props.product.prixVente,
        image: props.product.image || '',
      }
      imagePreview.value = props.product.image || ''
    } else {
      isEditing.value = false
      formData.value = {
        designation: '',
        familleId: 1,
        familleLibelle: 'Électronique',
        prixVente: 0,
        image: '',
      }
      imagePreview.value = ''
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
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      imagePreview.value = result
      formData.value.image = result
    }
    reader.readAsDataURL(file)
  }
}

const handleFamilleChange = (value: string) => {
  const famille = famillesDisponibles.find(f => f.id === parseInt(value))
  if (famille) {
    formData.value.familleId = famille.id
    formData.value.familleLibelle = famille.libelle
  }
}

const handleSubmit = () => {
  if (!formData.value.designation || !formData.value.prixVente) {
    return
  }
  emit('submit', {
    ...formData.value,
    // Ajouter des valeurs par défaut pour les champs manquants
    code: `PROD${Date.now()}`,
    prixAchat: 0,
    quantiteStock: 0,
    seuilAlerte: 5,
    description: '',
  })
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[95vw] sm:w-auto max-w-[463px] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[90vh] overflow-y-auto">
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
        <!-- Famille produit -->
        <div class="mb-[10px]">
          <label for="famille" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Famille produit :
          </label>
          <Select
            :model-value="formData.familleId.toString()"
            @update:model-value="handleFamilleChange"
            :disabled="loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <SelectValue placeholder="selectionner la famille" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="famille in famillesDisponibles"
                  :key="famille.id"
                  :value="famille.id.toString()"
                >
                  {{ famille.libelle }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Désignation -->
        <div class="mb-[10px]">
          <label for="designation" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Designation :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="designation"
              v-model="formData.designation"
              placeholder="Ex : Eletroménager"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Prix de vente -->
        <div class="mb-[15px]">
          <label for="prixVente" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Prix de vente :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="prixVente"
              v-model.number="formData.prixVente"
              type="number"
              step="0.01"
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
            :disabled="loading || !formData.designation || !formData.prixVente"
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
