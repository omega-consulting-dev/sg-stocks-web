<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Calendar, FileText, User, Hash, DollarSign, CreditCard, ChevronDown } from 'lucide-vue-next'
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

// Liste des clients disponibles
const clientsDisponibles = [
  { id: 1, nom: 'Client A' },
  { id: 2, nom: 'Client B' },
  { id: 3, nom: 'Client C' },
]

// Liste des familles de services disponibles (pour intitulé)
const motifsDisponibles = [
  { id: 1, libelle: 'Développement Web' },
  { id: 2, libelle: 'Marketing Digital' },
  { id: 3, libelle: 'Production Vidéo' },
  { id: 4, libelle: 'Design Graphique' },
  { id: 5, libelle: 'Consulting' },
]

// Liste des natures de paiement
const naturesPaiement = [
  { id: 1, libelle: 'Espèces' },
  { id: 2, libelle: 'Virement' },
  { id: 3, libelle: 'Chèque' },
  { id: 4, libelle: 'Mobile Money' },
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

const handleMotifChange = (value: string) => {
  const motif = motifsDisponibles.find((m) => m.id === parseInt(value))
  if (motif) {
    formData.value.familleId = motif.id
    formData.value.familleLibelle = motif.libelle
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
    <DialogContent
      class="w-[95vw] sm:w-[836px] sm:max-w-[836px] h-auto sm:min-h-[621px] p-0 border border-[#0072C1] rounded-[10px] bg-white max-h-[90vh] overflow-y-auto"
    >
      <div class="relative">
        <!-- Avatar circle - position: left 33.88px, top 27px -->
        <div
          class="absolute left-[33.88px] top-[27px] w-[44px] h-[44px] rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center"
        >
          <User class="w-5 h-5 text-gray-500" />
        </div>

        <!-- Bouton X en haut à droite - position: right 21px, top 20px -->
        <button
          @click="handleClose"
          type="button"
          class="absolute right-[21px] top-[20px] w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
        >
          <X class="h-4 w-4 text-black" />
        </button>

        <!-- Titre - centré -->
        <div class="pt-[36px] pb-6 text-center">
          <h2
            class="text-[21.76px] font-bold text-[#3D3D3D]"
            style="font-family: 'Montserrat', sans-serif"
          >
            Enregistrement Services
          </h2>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="px-4 sm:px-[46px] pb-[27px]">
          <!-- Grille 2 colonnes avec gap de 40px -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-[40px]">

            <!-- Ligne 1: Date (gauche) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Date
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <Input
                  v-model="formData.dateOperation"
                  type="date"
                  required
                  class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] font-medium bg-white"
                  style="font-family: 'Palanquin Dark', sans-serif"
                />
              </div>
            </div>

            <!-- Ligne 1: Client (droite) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Client :
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none z-10" />
                <Select v-model="formData.client">
                  <SelectTrigger
                    class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] bg-white"
                    style="font-family: 'Palanquin Dark', sans-serif"
                  >
                    <SelectValue placeholder="Selectionner un client" class="text-[rgba(120,120,120,0.48)]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="client in clientsDisponibles"
                        :key="client.id"
                        :value="client.nom"
                      >
                        {{ client.nom }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Ligne 2: Intitulé de l'opération (gauche) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Intitulé de l'operation <span class="text-[#707070]">(Obligatoire)</span> :
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none z-10" />
                <Select
                  :model-value="formData.familleId.toString()"
                  @update:model-value="handleMotifChange"
                >
                  <SelectTrigger
                    class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] bg-white"
                    style="font-family: 'Palanquin Dark', sans-serif"
                  >
                    <SelectValue placeholder="Selectionner un motif" class="text-[rgba(120,120,120,0.48)]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="motif in motifsDisponibles"
                        :key="motif.id"
                        :value="motif.id.toString()"
                      >
                        {{ motif.libelle }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Ligne 2: Quantité (droite) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Quantité :
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <Input
                  v-model="formData.quantite"
                  type="text"
                  placeholder="Ex : Salaire de Mr Kon Romeo"
                  required
                  class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] bg-white"
                  style="font-family: 'Palanquin Dark', sans-serif"
                />
              </div>
            </div>

            <!-- Ligne 3: Montant (gauche) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Montant :
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <Input
                  v-model="formData.montantFacture"
                  type="text"
                  placeholder="Ex : 25 000"
                  required
                  class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] bg-white"
                  style="font-family: 'Palanquin Dark', sans-serif"
                />
              </div>
            </div>

            <!-- Ligne 3: Nature de paiement (droite) -->
            <div class="space-y-[7px]">
              <label
                class="block text-[18.76px] text-[#0E1420]"
                style="font-family: 'Palanquin Dark', sans-serif"
              >
                Nature de paiement :
              </label>
              <div class="relative">
                <FileText class="absolute left-[10px] top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none z-10" />
                <Select v-model="formData.naturePaiement">
                  <SelectTrigger
                    class="w-full sm:w-[367px] h-[37px] pl-10 border border-[#BEBEBE] rounded-[10px] text-[14.76px] bg-white"
                    style="font-family: 'Palanquin Dark', sans-serif"
                  >
                    <SelectValue placeholder="Ex : especes" class="text-[rgba(120,120,120,0.48)]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="nature in naturesPaiement"
                        :key="nature.id"
                        :value="nature.libelle"
                      >
                        {{ nature.libelle }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Description - pleine largeur -->
          <div class="mt-5 space-y-[7px]">
            <label
              class="block text-[18.76px] text-[#0E1420]"
              style="font-family: 'Palanquin Dark', sans-serif"
            >
              Description :
            </label>
            <div class="relative">
              <FileText class="absolute left-[10px] top-4 h-5 w-5 text-gray-500 pointer-events-none" />
              <Textarea
                v-model="formData.description"
                placeholder="Ex : Salaire du mois de janvier 2025"
                class="w-full sm:w-[747px] min-h-[130px] pl-10 pt-3 border border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)] bg-white resize"
                style="font-family: 'Palanquin Dark', sans-serif"
              />
            </div>
          </div>

          <!-- Bouton Sauver - centré, 367px × 37px -->
          <div class="flex justify-center mt-6">
            <Button
              type="submit"
              class="w-full sm:w-[367px] h-[37px] bg-[#0769CF] hover:bg-[#0558b0] rounded-[10px] text-white text-[14.762px] font-bold uppercase tracking-wide"
              style="font-family: 'Montserrat', sans-serif"
              :disabled="loading"
            >
              {{ loading ? 'ENREGISTREMENT...' : 'SAUVER' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
