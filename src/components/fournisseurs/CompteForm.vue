<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { User, DollarSign, Calendar } from 'lucide-vue-next'
import type { CompteFournisseur } from '@/stores/fournisseurs'
import { useFournisseursStore } from '@/stores/fournisseurs'
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
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<CompteFournisseur, 'id' | 'created_at'>]
}>()

const fournisseursStore = useFournisseursStore()

const formData = ref({
  fournisseur_id: 0,
  montant_facture: 0,
  date_facture: '',
  montant_encaissement: 0,
  date_encaissement: '',
})

// Obtenir le nom du fournisseur sélectionné
const selectedFournisseurName = computed(() => {
  const fournisseur = fournisseursStore.fournisseurs.find(f => f.id === formData.value.fournisseur_id)
  return fournisseur?.name || ''
})

onMounted(() => {
  if (fournisseursStore.fournisseurs.length === 0) {
    fournisseursStore.fetchFournisseurs()
  }
})

watch(() => props.open, (newValue) => {
  if (newValue) {
    formData.value = {
      fournisseur_id: fournisseursStore.fournisseurs[0]?.id || 0,
      montant_facture: 0,
      date_facture: new Date().toISOString().split('T')[0],
      montant_encaissement: 0,
      date_encaissement: new Date().toISOString().split('T')[0],
    }
  }
})

const handleFournisseurChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.fournisseur_id = parseInt(String(value))
  }
}

const handleSubmit = () => {
  if (!formData.value.fournisseur_id || !formData.value.montant_facture || !formData.value.date_facture) {
    return
  }

  emit('submit', {
    fournisseur_id: formData.value.fournisseur_id,
    fournisseur_name: selectedFournisseurName.value,
    montant_facture: formData.value.montant_facture,
    date_facture: formData.value.date_facture,
    montant_encaissement: formData.value.montant_encaissement,
    date_encaissement: formData.value.date_encaissement,
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
            <DollarSign class="w-4 h-4 sm:w-[21px] sm:h-[21px] text-gray-500" />
          </div>
          <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
            Nouveau compte fournisseur
          </h2>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Fournisseur -->
        <div class="mb-[10px]">
          <label for="fournisseur" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Fournisseur * :
          </label>
          <Select
            :model-value="formData.fournisseur_id.toString()"
            @update:model-value="handleFournisseurChange"
            :disabled="loading"
          >
            <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]" style="font-family: 'Palanquin Dark'">
              <User class="h-5 w-5 text-[#616161] mr-2" />
              <SelectValue placeholder="Sélectionner un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="fournisseur in fournisseursStore.fournisseurs"
                  :key="fournisseur.id"
                  :value="fournisseur.id.toString()"
                >
                  {{ fournisseur.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Montant facture -->
        <div class="mb-[10px]">
          <label for="montant_facture" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Montant facture * :
          </label>
          <div class="relative">
            <DollarSign class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="montant_facture"
              v-model.number="formData.montant_facture"
              type="number"
              min="1"
              step="1"
              placeholder="Ex : 250000"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Date facture -->
        <div class="mb-[10px]">
          <label for="date_facture" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Date facture * :
          </label>
          <div class="relative">
            <Calendar class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="date_facture"
              v-model="formData.date_facture"
              type="date"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Montant encaissement -->
        <div class="mb-[10px]">
          <label for="montant_encaissement" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Montant encaissement :
          </label>
          <div class="relative">
            <DollarSign class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="montant_encaissement"
              v-model.number="formData.montant_encaissement"
              type="number"
              min="0"
              step="1"
              placeholder="Ex : 150000"
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Date encaissement -->
        <div class="mb-[15px]">
          <label for="date_encaissement" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Date encaissement :
          </label>
          <div class="relative">
            <Calendar class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="date_encaissement"
              v-model="formData.date_encaissement"
              type="date"
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.fournisseur_id || !formData.montant_facture || !formData.date_facture"
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
