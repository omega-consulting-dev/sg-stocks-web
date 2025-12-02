<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, DollarSign, Calendar, Paperclip } from 'lucide-vue-next'
import type { Operation, CompteFournisseur } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  open: boolean
  compte?: CompteFournisseur | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<Operation, 'id' | 'created_at'>]
}>()

const formData = ref({
  intitule: '',
  montant: 0,
  date_reglement: '',
  piece_jointe: null as string | null,
})

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')

watch(() => props.open, (newValue) => {
  if (newValue) {
    formData.value = {
      intitule: '',
      montant: 0,
      date_reglement: new Date().toISOString().split('T')[0],
      piece_jointe: null,
    }
    fileName.value = ''
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    fileName.value = file.name
    // En mode mock, on simule juste le nom du fichier
    formData.value.piece_jointe = file.name
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleSubmit = () => {
  if (!formData.value.intitule || !formData.value.montant || !formData.value.date_reglement) {
    return
  }

  if (!props.compte) {
    return
  }

  emit('submit', {
    compte_id: props.compte.id,
    intitule: formData.value.intitule,
    montant: formData.value.montant,
    date_reglement: formData.value.date_reglement,
    piece_jointe: formData.value.piece_jointe,
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
          <div>
            <h2 class="text-lg sm:text-[21.76px] font-bold leading-[1.219] text-[#535353]" style="font-family: Montserrat">
              Nouvelle opération
            </h2>
            <p v-if="compte" class="text-sm text-muted-foreground">
              Compte : {{ compte.fournisseur_name }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-4 sm:px-[47px]">
        <!-- Intitulé -->
        <div class="mb-[10px]">
          <label for="intitule" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Intitulé * :
          </label>
          <div class="relative">
            <FileText class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="intitule"
              v-model="formData.intitule"
              type="text"
              placeholder="Ex : Paiement facture N°001"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Montant -->
        <div class="mb-[10px]">
          <label for="montant" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Montant * :
          </label>
          <div class="relative">
            <DollarSign class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="montant"
              v-model.number="formData.montant"
              type="number"
              min="1"
              step="1"
              placeholder="Ex : 50000"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px] placeholder:text-[rgba(120,120,120,0.48)]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Date règlement -->
        <div class="mb-[10px]">
          <label for="date_reglement" class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Date règlement * :
          </label>
          <div class="relative">
            <Calendar class="absolute left-[7px] top-1/2 -translate-y-1/2 h-6 w-6 text-[#616161]" />
            <Input
              id="date_reglement"
              v-model="formData.date_reglement"
              type="date"
              required
              :disabled="loading"
              class="h-[37px] w-full pl-[37px] border-[#BEBEBE] rounded-[10px] text-[14.76px]"
              style="font-family: 'Palanquin Dark'"
            />
          </div>
        </div>

        <!-- Pièce jointe -->
        <div class="mb-[15px]">
          <label class="block text-[18.76px] font-normal leading-[1.811] text-[#0E1420] mb-[7px]" style="font-family: 'Palanquin Dark'">
            Pièce jointe :
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              @click="triggerFileInput"
              :disabled="loading"
              class="h-[37px] border-[#BEBEBE] rounded-[10px]"
            >
              <Paperclip class="h-4 w-4 mr-2" />
              Choisir un fichier
            </Button>
            <span v-if="fileName" class="text-sm text-muted-foreground truncate max-w-[200px]">
              {{ fileName }}
            </span>
            <span v-else class="text-sm text-muted-foreground">
              Aucun fichier sélectionné
            </span>
          </div>
        </div>

        <!-- Bouton Sauver -->
        <div class="pb-[37px]">
          <Button
            type="submit"
            :disabled="loading || !formData.intitule || !formData.montant || !formData.date_reglement"
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
