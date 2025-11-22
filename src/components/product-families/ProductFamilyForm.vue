<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, FileText, Camera } from 'lucide-vue-next'
import type { ProductFamily } from '@/stores/productFamilies'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  family?: ProductFamily | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { code: string; libelle: string; description: string }]
}>()

const formData = ref({
  code: '',
  libelle: '',
  description: '',
})

const isEditing = ref(false)

// Réinitialiser ou remplir le formulaire quand le dialog s'ouvre
watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.family) {
      isEditing.value = true
      formData.value = {
        code: props.family.code,
        libelle: props.family.libelle,
        description: props.family.description,
      }
    } else {
      isEditing.value = false
      formData.value = {
        code: '',
        libelle: '',
        description: '',
      }
    }
  }
})

const handleSubmit = () => {
  if (!formData.value.code || !formData.value.libelle) {
    return
  }
  emit('submit', { ...formData.value })
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-[457px] p-0 gap-0 border border-[#0072C1] rounded-[10px]">
      <!-- En-tête avec avatar et titre -->
      <div class="relative px-[46px] pt-[27px] pb-[20px]">
        <!-- Bouton fermer -->
        <!-- <button
          @click="handleClose"
          class="absolute right-[15px] top-[15px] w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          type="button"
        >
          <X class="h-4 w-4 text-gray-600" />
        </button> -->

        <!-- Avatar/Icône -->
        <div class="flex items-center gap-5 mb-1">
          <div class="w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Camera class="w-[14px] h-[19px] text-gray-500" />
          </div>

          <!-- Titre -->
          <h2 class="text-[21.76px] font-bold leading-[1.219] text-[#3D3D3D]" style="font-family: Montserrat">
            Fiche Famille de produits
          </h2>
        </div>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="px-[46px]">
        <!-- Champ Designation -->
        <div class="mb-[13px]">
          <label
            for="designation"
            class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]"
            style="font-family: 'Palanquin Dark'"
          >
            Designation :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="designation"
              v-model="formData.libelle"
              placeholder="Ex : Eletroménager"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
              maxlength="100"
            />
          </div>
        </div>

        <!-- Champ Description -->
        <div class="mb-[36px]">
          <label
            for="description"
            class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[12px]"
            style="font-family: 'Palanquin Dark'"
          >
            Description :
          </label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter la designation"
            :disabled="loading"
            class="h-[186px] w-full border-[#BEBEBE] rounded-[10px] resize-none text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] p-3"
            style="font-family: 'Palanquin Dark'"
            maxlength="500"
          />
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[39px]">
          <Button
            type="submit"
            :disabled="loading || !formData.libelle"
            class="w-full h-[37px] bg-[#0769CF] hover:bg-[#0558b0] text-white rounded-[10px] text-[14.76px] font-bold uppercase tracking-wide"
            style="font-family: Montserrat"
          >
            {{ loading ? 'ENREGISTREMENT...' : 'ENREGISTRER' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Ajustements pour matcher exactement le design */
:deep(.ui-dialog-content) {
  padding: 0 !important;
}
</style>
