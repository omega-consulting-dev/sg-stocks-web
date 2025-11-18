<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Calendar, FileText, User, Hash, DollarSign, CreditCard } from 'lucide-vue-next'
import type { Service } from '@/stores/services'
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
  submit: [data: Partial<Service>]
}>()

const formData = ref({
  dateOperation: new Date().toISOString().split('T')[0],
  intitule: '',
  client: '',
  quantite: '',
  montantFacture: '',
  naturePaiement: '',
  description: '',
  familleId: 1,
  familleLibelle: 'Développement Web',
})

const isEditing = ref(false)

// Liste des familles de services disponibles
const famillesDisponibles = [
  { id: 1, libelle: 'Développement Web' },
  { id: 2, libelle: 'Marketing Digital' },
  { id: 3, libelle: 'Production Vidéo' },
  { id: 4, libelle: 'Design Graphique' },
  { id: 5, libelle: 'Consulting' },
]

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      if (props.service) {
        isEditing.value = true
        formData.value = {
          dateOperation: new Date(props.service.dateOperation).toISOString().split('T')[0],
          intitule: props.service.intitule,
          client: props.service.client,
          quantite: props.service.quantite.toString(),
          montantFacture: props.service.montantFacture.toString(),
          naturePaiement: '',
          description: '',
          familleId: props.service.familleId,
          familleLibelle: props.service.familleLibelle,
        }
      } else {
        isEditing.value = false
        formData.value = {
          dateOperation: new Date().toISOString().split('T')[0],
          intitule: '',
          client: '',
          quantite: '',
          montantFacture: '',
          naturePaiement: '',
          description: '',
          familleId: 1,
          familleLibelle: 'Développement Web',
        }
      }
    }
  }
)

const handleFamilleChange = (value: string) => {
  const famille = famillesDisponibles.find((f) => f.id === parseInt(value))
  if (famille) {
    formData.value.familleId = famille.id
    formData.value.familleLibelle = famille.libelle
  }
}

const handleSubmit = () => {
  const data: Partial<Service> = {
    dateOperation: new Date(formData.value.dateOperation),
    intitule: formData.value.intitule,
    client: formData.value.client,
    quantite: parseInt(formData.value.quantite) || 0,
    montantFacture: parseFloat(formData.value.montantFacture) || 0,
    familleId: formData.value.familleId,
    familleLibelle: formData.value.familleLibelle,
  }
  emit('submit', data)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="max-w-[836px] p-0 border-[#0072C1]">
      <div class="relative bg-white rounded-[10px]">
        <!-- Avatar circle -->
        <div class="absolute left-[33.88px] top-[27px] w-[44px] h-[44px] rounded-full bg-[#FBFBFB] border border-[#BABABA]"></div>

        <!-- Bouton X en haut à droite -->
        <button
          @click="handleClose"
          class="absolute right-[21px] top-[20px] w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
        >
          <X class="h-4 w-4 text-black" />
        </button>

        <!-- Titre -->
        <div class="pt-[36px] pb-6 text-center">
          <h2 class="text-[21.76px] font-bold text-[#3D3D3D]" style="font-family: Montserrat">
            Enregistrement Services
          </h2>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="px-[46px] pb-8 space-y-6">
          <!-- Première ligne : Date et Client -->
          <div class="grid grid-cols-2 gap-[14px]">
            <!-- Date -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Date
              </label>
              <div class="relative">
                <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  v-model="formData.dateOperation"
                  type="date"
                  required
                  class="h-[37px] pl-10 border-[#BEBEBE] rounded-[10px] text-[14.76px] font-medium"
                  style="font-family: Palanquin Dark"
                />
              </div>
            </div>

            <!-- Client -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Client :
              </label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  v-model="formData.client"
                  type="text"
                  placeholder="Selectionner un client"
                  required
                  class="h-[37px] pl-10 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
                  style="font-family: Palanquin Dark"
                />
              </div>
            </div>
          </div>

          <!-- Deuxième ligne : Intitulé et Quantité -->
          <div class="grid grid-cols-2 gap-[14px]">
            <!-- Intitulé de l'opération -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Intitulé de l'operation (Obligatoire) :
              </label>
              <div class="relative">
                <FileText class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Select
                  :model-value="formData.familleId.toString()"
                  @update:model-value="handleFamilleChange"
                >
                  <SelectTrigger class="h-[36px] pl-10 border-[#BEBEBE] rounded-[10px]">
                    <SelectValue placeholder="Selectionner un motif" />
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
            </div>

            <!-- Quantité -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Quantité :
              </label>
              <div class="relative">
                <Hash class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  v-model="formData.quantite"
                  type="text"
                  placeholder="Ex : Salaire de Mr Kon Romeo"
                  required
                  class="h-[37px] pl-10 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
                  style="font-family: Palanquin Dark"
                />
              </div>
            </div>
          </div>

          <!-- Troisième ligne : Montant et Nature de paiement -->
          <div class="grid grid-cols-2 gap-[14px]">
            <!-- Montant -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Montant :
              </label>
              <div class="relative">
                <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  v-model="formData.montantFacture"
                  type="text"
                  placeholder="Ex : 25 000"
                  required
                  class="h-[37px] pl-10 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
                  style="font-family: Palanquin Dark"
                />
              </div>
            </div>

            <!-- Nature de paiement -->
            <div class="space-y-2">
              <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
                Nature de paiement :
              </label>
              <div class="relative">
                <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  v-model="formData.naturePaiement"
                  type="text"
                  placeholder="Ex : especes"
                  class="h-[37px] pl-10 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
                  style="font-family: Palanquin Dark"
                />
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="text-[18.76px] text-[#0E1420]" style="font-family: Palanquin Dark">
              Description :
            </label>
            <div class="relative">
              <FileText class="absolute left-3 top-4 h-5 w-5 text-gray-500" />
              <Textarea
                v-model="formData.description"
                placeholder="Ex : Salaire du mois de janvier 2025"
                class="min-h-[130px] pl-10 pt-3 border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] resize-none"
                style="font-family: Palanquin Dark"
              />
            </div>
          </div>

          <!-- Bouton Sauver -->
          <div class="flex justify-center pt-4">
            <Button
              type="submit"
              class="w-[367px] h-[37px] bg-[#0769CF] hover:bg-[#0558b0] rounded-[10px] text-white text-[14.76px] font-bold uppercase"
              style="font-family: Montserrat"
              :disabled="loading"
            >
              {{ loading ? 'Enregistrement...' : 'Sauver' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
