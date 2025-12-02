<script setup lang="ts">
import { ref, watch } from 'vue'
import { User, Phone, Mail, MapPin, Building2 } from 'lucide-vue-next'
import type { Fournisseur } from '@/stores/fournisseurs'
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
  fournisseur?: Fournisseur | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<Fournisseur, 'id' | 'created_at' | 'updated_at'>]
}>()

const formData = ref({
  name: '',
  phone: '',
  email: '',
  location: '',
  legal_form: 'SARL',
})

const legalForms = [
  { value: 'SARL', label: 'SARL - Société à responsabilité limitée' },
  { value: 'SA', label: 'SA - Société anonyme' },
  { value: 'SAS', label: 'SAS - Société par actions simplifiée' },
  { value: 'EI', label: 'EI - Entreprise individuelle' },
  { value: 'GIE', label: 'GIE - Groupement d\'intérêt économique' },
  { value: 'SNC', label: 'SNC - Société en nom collectif' },
  { value: 'Autre', label: 'Autre' },
]

const isEditing = ref(false)

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.fournisseur) {
      isEditing.value = true
      formData.value = {
        name: props.fournisseur.name,
        phone: props.fournisseur.phone,
        email: props.fournisseur.email,
        location: props.fournisseur.location,
        legal_form: props.fournisseur.legal_form,
      }
    } else {
      isEditing.value = false
      formData.value = {
        name: '',
        phone: '',
        email: '',
        location: '',
        legal_form: 'SARL',
      }
    }
  }
})

const handleLegalFormChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.legal_form = String(value)
  }
}

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.phone || !formData.value.location || !formData.value.legal_form) {
    return
  }

  emit('submit', {
    name: formData.value.name,
    phone: formData.value.phone,
    email: formData.value.email,
    location: formData.value.location,
    legal_form: formData.value.legal_form,
  })
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
            <User class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
            {{ isEditing ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}
          </h2>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Nom du fournisseur -->
        <div class="mb-[10px]">
          <label for="name" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Nom du fournisseur * :
          </label>
          <div class="relative">
            <User class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ex : Nkadon Landry"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Téléphone -->
        <div class="mb-[10px]">
          <label for="phone" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Téléphone * :
          </label>
          <div class="relative">
            <Phone class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="Ex : +237 699 99 99 99"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- E-mail -->
        <div class="mb-[10px]">
          <label for="email" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            E-mail :
          </label>
          <div class="relative">
            <Mail class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Ex : exemple@email.com"
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Localisation -->
        <div class="mb-[10px]">
          <label for="location" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Localisation * :
          </label>
          <div class="relative">
            <MapPin class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="location"
              v-model="formData.location"
              type="text"
              placeholder="Ex : Douala Akwa"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Forme juridique -->
        <div class="mb-[15px]">
          <label for="legal_form" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Forme juridique * :
          </label>
          <Select
            :model-value="formData.legal_form"
            @update:model-value="handleLegalFormChange"
            :disabled="loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <Building2 class="h-5 w-5 text-[#616161] mr-2" />
              <SelectValue placeholder="Sélectionner une forme juridique" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="form in legalForms"
                  :key="form.value"
                  :value="form.value"
                >
                  {{ form.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.name || !formData.phone || !formData.location || !formData.legal_form"
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
