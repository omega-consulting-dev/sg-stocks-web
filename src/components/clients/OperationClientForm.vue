<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, Calendar, DollarSign, Paperclip, X } from 'lucide-vue-next'
import type { OperationClient, CompteClient } from '@/stores/clients'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  compte?: CompteClient | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<OperationClient, 'id' | 'created_at'>]
}>()

const formData = ref({
  intitule: '',
  montant: 0,
  date_reglement: '',
  piece_jointe: null as string | null,
})

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      formData.value = {
        intitule: '',
        montant: 0,
        date_reglement: new Date().toISOString().split('T')[0],
        piece_jointe: null,
      }
      fileName.value = ''
    }
  }
)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    fileName.value = file.name
    formData.value.piece_jointe = file.name
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  fileName.value = ''
  formData.value.piece_jointe = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = () => {
  if (!props.compte || !formData.value.intitule || !formData.value.montant || !formData.value.date_reglement) {
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
    <DialogContent class="sm:max-w-[450px] p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
            <FileText class="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 class="text-xl font-semibold">Nouvelle Opération</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-full"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Client info -->
      <div v-if="compte" class="px-6 pb-4">
        <p class="text-sm text-muted-foreground">
          Client : <span class="font-medium text-foreground">{{ compte.client_name }}</span>
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
        <!-- Intitulé de l'opération -->
        <div class="space-y-2">
          <Label for="intitule" class="font-semibold">
            Intitulé de l'operation (Obligatoire) :
          </Label>
          <div class="relative">
            <FileText class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="intitule"
              v-model="formData.intitule"
              placeholder="Ex : achat a credit machandise"
              class="pl-10 h-12"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Montant -->
        <div class="space-y-2">
          <Label for="montant" class="font-semibold">Montant (Obligatoire) :</Label>
          <div class="relative">
            <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="montant"
              v-model.number="formData.montant"
              type="number"
              min="1"
              placeholder="0"
              class="pl-10 h-12"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Date de règlement -->
        <div class="space-y-2">
          <Label for="date_reglement" class="font-semibold">
            Date de reglement (Obligatoire) :
          </Label>
          <div class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="date_reglement"
              v-model="formData.date_reglement"
              type="date"
              class="pl-10 h-12"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Pièce jointe -->
        <div class="space-y-2">
          <Label class="font-semibold">Piece jointe :</Label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="!fileName" class="flex justify-end">
            <div
              @click="triggerFileInput"
              class="w-[250px] h-[100px] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
            >
              <div class="text-center">
                <Paperclip class="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <span class="text-sm text-muted-foreground">image</span>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
            <FileText class="w-5 h-5 text-primary" />
            <span class="flex-1 text-sm truncate">{{ fileName }}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-6 w-6"
              @click="clearFile"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          class="w-full h-12 mt-6 text-base font-semibold"
          :disabled="loading || !formData.intitule || !formData.montant || !formData.date_reglement"
        >
          {{ loading ? 'Enregistrement...' : 'VALIDER' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
