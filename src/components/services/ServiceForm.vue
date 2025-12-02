<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FileText, Camera } from 'lucide-vue-next'
import type { Service } from '@/stores/services'
import { useServicesStore } from '@/stores/services'
import type { CreateServiceDto } from '@/services/api/services.api'
import { useServiceFamiliesStore } from '@/stores/serviceFamilies'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  service?: Service | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateServiceDto]
}>()

// Stores
const familiesStore = useServiceFamiliesStore()
const servicesStore = useServicesStore()

const formData = ref({
  reference: '',
  name: '',
  category: 0,
  unit_price: 0,
  description: '',
})

// Générer le prochain code séquentiel (SRV001, SRV002, etc.)
const generateNextCode = (): string => {
  const existingCodes = servicesStore.services
    .map(s => s.reference)
    .filter(ref => ref && ref.startsWith('SRV'))
    .map(ref => parseInt(ref.replace('SRV', '')) || 0)

  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
  const nextNumber = maxCode + 1
  return `SRV${nextNumber.toString().padStart(3, '0')}`
}

// Obtenir le nom de la catégorie sélectionnée
const selectedCategoryName = computed(() => {
  const family = familiesStore.families.find(f => f.id === formData.value.category)
  return family?.name || ''
})

const isEditing = ref(false)

// Charger les catégories au montage
onMounted(() => {
  if (familiesStore.families.length === 0) {
    familiesStore.fetchFamilies()
  }
})

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.service) {
      isEditing.value = true
      formData.value = {
        reference: props.service.reference,
        name: props.service.name,
        category: props.service.category,
        unit_price: props.service.unit_price,
        description: '',
      }
    } else {
      isEditing.value = false
      formData.value = {
        reference: generateNextCode(),
        name: '',
        category: familiesStore.families[0]?.id || 0,
        unit_price: 0,
        description: '',
      }
    }
  }
})

const handleCategoryChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.category = parseInt(String(value))
  }
}

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.unit_price || !formData.value.category) {
    return
  }

  const data: CreateServiceDto = {
    reference: formData.value.reference,
    name: formData.value.name,
    category: formData.value.category,
    unit_price: formData.value.unit_price,
    description: formData.value.description || '',
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
        <div class="flex items-center gap-3 sm:gap-5 mb-4">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Camera class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
            Fiche de service
          </h2>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Code service (auto-généré) -->
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

        <!-- Catégorie de service -->
        <div class="mb-[10px]">
          <label for="category" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Catégorie :
          </label>
          <Select
            :model-value="formData.category.toString()"
            @update:model-value="handleCategoryChange"
            :disabled="loading || familiesStore.loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <SelectValue placeholder="Sélectionner la catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="family in familiesStore.families"
                  :key="family.id"
                  :value="family.id.toString()"
                >
                  {{ family.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="selectedCategoryName" class="text-sm text-muted-foreground mt-1">
            Catégorie : <span class="font-medium text-[#0769CF]">{{ selectedCategoryName }}</span>
          </p>
        </div>

        <!-- Nom du service -->
        <div class="mb-[10px]">
          <label for="name" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Désignation :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : Conception de site web"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Prix unitaire -->
        <div class="mb-[10px]">
          <label for="unit_price" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Prix unitaire :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="unit_price"
              v-model.number="formData.unit_price"
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

        <!-- Description -->
        <div class="mb-[15px]">
          <label for="description" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Description :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-4 h-6 w-6 text-[#616161]" />
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Description du service..."
              :disabled="loading"
              class="w-full min-h-[80px] pl-[37px] pt-3 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.name || !formData.unit_price || !formData.category"
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
