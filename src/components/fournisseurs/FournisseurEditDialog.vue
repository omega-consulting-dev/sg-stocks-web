<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Supplier, CreateSupplierDto } from '@/stores/fournisseurs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  open: boolean
  supplier?: Supplier | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateSupplierDto]
}>()

// État du formulaire
const formData = ref<CreateSupplierDto>({
  name: '',
  supplier_code: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  payment_terms: '',
  credit_limit: undefined,
  rating: undefined,
  notes: '',
})

// Réinitialiser le formulaire quand on ouvre/ferme ou change de fournisseur
watch([() => props.open, () => props.supplier], ([isOpen, supplier]) => {
  if (isOpen && supplier) {
    // Mode édition - remplir avec les données du fournisseur
    formData.value = {
      name: supplier.name,
      supplier_code: supplier.supplier_code,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      payment_terms: supplier.payment_terms || '',
      credit_limit: supplier.credit_limit || undefined,
      rating: supplier.rating || undefined,
      notes: supplier.notes || '',
    }
  } else if (isOpen && !supplier) {
    // Mode création - formulaire vide
    formData.value = {
      name: '',
      supplier_code: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      payment_terms: '',
      credit_limit: undefined,
      rating: undefined,
      notes: '',
    }
  }
})

const dialogTitle = computed(() => {
  return props.supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'
})

const handleSubmit = () => {
  emit('submit', formData.value)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ supplier ? 'Modifiez les informations du fournisseur' : 'Ajoutez un nouveau fournisseur' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nom -->
          <div class="space-y-2">
            <Label for="name">Nom du fournisseur *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Nom de l'entreprise"
              required
            />
          </div>

          <!-- Code fournisseur -->
          <div class="space-y-2">
            <Label for="supplier_code">Code fournisseur *</Label>
            <Input
              id="supplier_code"
              v-model="formData.supplier_code"
              placeholder="Ex: FOURG001"
              required
              :disabled="!!supplier"
            />
          </div>

          <!-- Personne de contact -->
          <div class="space-y-2">
            <Label for="contact_person">Personne de contact</Label>
            <Input
              id="contact_person"
              v-model="formData.contact_person"
              placeholder="Nom de la personne"
            />
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="email@exemple.com"
            />
          </div>

          <!-- Téléphone -->
          <div class="space-y-2">
            <Label for="phone">Téléphone</Label>
            <Input
              id="phone"
              v-model="formData.phone"
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <!-- Ville -->
          <div class="space-y-2">
            <Label for="city">Ville</Label>
            <Input
              id="city"
              v-model="formData.city"
              placeholder="Ville"
            />
          </div>

          <!-- Pays -->
          <div class="space-y-2">
            <Label for="country">Pays</Label>
            <Input
              id="country"
              v-model="formData.country"
              placeholder="Pays"
            />
          </div>

          <!-- Conditions de paiement -->
          <div class="space-y-2">
            <Label for="payment_terms">Conditions de paiement</Label>
            <Input
              id="payment_terms"
              v-model="formData.payment_terms"
              placeholder="Ex: 30 jours"
            />
          </div>

          <!-- Limite de crédit -->
          <div class="space-y-2">
            <Label for="credit_limit">Limite de crédit</Label>
            <Input
              id="credit_limit"
              v-model.number="formData.credit_limit"
              type="number"
              placeholder="Montant"
            />
          </div>

          <!-- Rating -->
          <div class="space-y-2">
            <Label for="rating">Évaluation</Label>
            <Select v-model="formData.rating">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="1">⭐</SelectItem>
                <SelectItem :value="2">⭐⭐</SelectItem>
                <SelectItem :value="3">⭐⭐⭐</SelectItem>
                <SelectItem :value="4">⭐⭐⭐⭐</SelectItem>
                <SelectItem :value="5">⭐⭐⭐⭐⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Adresse (pleine largeur) -->
        <div class="space-y-2">
          <Label for="address">Adresse complète</Label>
          <Textarea
            id="address"
            v-model="formData.address"
            placeholder="Adresse du fournisseur"
            rows="2"
          />
        </div>

        <!-- Notes (pleine largeur) -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Notes supplémentaires"
            rows="3"
          />
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="handleClose">
            Annuler
          </Button>
          <Button type="submit">
            {{ supplier ? 'Modifier' : 'Créer' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
