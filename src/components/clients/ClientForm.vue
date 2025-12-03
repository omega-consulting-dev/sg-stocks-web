<script setup lang="ts">
import { ref, watch } from 'vue'
import { Users, User, Phone, Mail, MapPin, Scale, X } from 'lucide-vue-next'
import type { Client } from '@/stores/clients'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  client?: Client | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: Omit<Client, 'id' | 'created_at' | 'updated_at'>]
}>()

const formData = ref({
  name: '',
  phone: '',
  email: '',
  location: '',
  legal_form: '',
})

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      if (props.client) {
        formData.value = {
          name: props.client.name,
          phone: props.client.phone,
          email: props.client.email,
          location: props.client.location,
          legal_form: props.client.legal_form,
        }
      } else {
        formData.value = {
          name: '',
          phone: '',
          email: '',
          location: '',
          legal_form: '',
        }
      }
    }
  }
)

const handleSubmit = () => {
  if (!formData.value.name) return
  emit('submit', { ...formData.value })
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
            <Users class="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 class="text-xl font-semibold">Fiche Client</h2>
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
        <!-- Nom client/R_social -->
        <div class="space-y-2">
          <Label for="name" class="font-semibold">Nom client/R_social :</Label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : Nkadon Landry"
              class="pl-10 h-12"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Telephone -->
        <div class="space-y-2">
          <Label for="phone" class="font-semibold">Telephone :</Label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              v-model="formData.phone"
              placeholder="+237 6xx xx xx xx"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- email -->
        <div class="space-y-2">
          <Label for="email" class="font-semibold">email :</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Ex : Nkado@gmail.com"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Localisation -->
        <div class="space-y-2">
          <Label for="location" class="font-semibold">Localisation :</Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              v-model="formData.location"
              placeholder="Ex : douala akwa"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Forme Juridique -->
        <div class="space-y-2">
          <Label for="legal_form" class="font-semibold">Forme Juridique :</Label>
          <div class="relative">
            <Scale class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="legal_form"
              v-model="formData.legal_form"
              placeholder="Ex : SARL"
              class="pl-10 h-12"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          class="w-full h-12 mt-6 text-base font-semibold"
          :disabled="loading || !formData.name"
        >
          {{ loading ? 'Enregistrement...' : 'SAUVER' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
