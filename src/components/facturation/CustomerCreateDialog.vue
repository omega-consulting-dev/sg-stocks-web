<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCustomersStore } from '@/stores/customers.store'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': []
}>()

const customersStore = useCustomersStore()

const formData = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  credit_limit: 0,
  notes: ''
})

const isSubmitting = ref(false)

const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: 0,
    notes: ''
  }
}

const handleClose = (value: boolean) => {
  if (!value) {
    resetForm()
  }
  emit('update:open', value)
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    alert('Veuillez renseigner le nom du client')
    return
  }

  isSubmitting.value = true

  try {
    const customerData = {
      name: formData.value.name,
      phone: formData.value.phone || '',
      email: formData.value.email || '',
      address: formData.value.address || '',
      credit_limit: formData.value.credit_limit || 0,
      notes: formData.value.notes || ''
    }
    await customersStore.createCustomer(customerData)

    alert('Client créé avec succès!')
    resetForm()
    emit('update:open', false)
    emit('created')
  } catch (error: unknown) {
    let errorMessage = 'Erreur lors de la création du client'

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { detail?: string; [key: string]: unknown } } }
      if (axiosError.response?.data) {
        const data = axiosError.response.data
        if (data.detail) {
          errorMessage = data.detail
        } else {
          // Extraire les messages d'erreur pour chaque champ
          const errors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')
          errorMessage = errors || errorMessage
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Créer un nouveau client</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">Nom du client <span class="text-red-500">*</span></Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Nom du client"
          />
        </div>

        <div class="grid gap-2">
          <Label for="phone">Téléphone</Label>
          <Input
            id="phone"
            v-model="formData.phone"
            placeholder="+225 XX XX XX XX XX"
          />
        </div>

        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="email@example.com"
          />
        </div>

        <div class="grid gap-2">
          <Label for="address">Adresse</Label>
          <Input
            id="address"
            v-model="formData.address"
            placeholder="Adresse complète"
          />
        </div>

        <div class="grid gap-2">
          <Label for="credit_limit">Limite de crédit (FCFA)</Label>
          <Input
            id="credit_limit"
            v-model.number="formData.credit_limit"
            type="number"
            min="0"
            step="1000"
            placeholder="0"
          />
        </div>

        <div class="grid gap-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires..."
            rows="3"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleClose(false)"
          :disabled="isSubmitting"
        >
          Annuler
        </Button>
        <Button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Création...' : 'Créer le client' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
