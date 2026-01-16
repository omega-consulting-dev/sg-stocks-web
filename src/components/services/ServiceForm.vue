<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Briefcase, FileText, DollarSign, AlignLeft, X, Tag } from 'lucide-vue-next'
import type { Service } from '@/stores/services'
import { useServicesStore } from '@/stores/services'
import type { CreateServiceDto } from '@/services/api/services.api'
import { useServiceFamiliesStore } from '@/stores/serviceFamilies'
import { useFieldConfigStore } from '@/stores/field-config.store'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
const fieldConfigStore = useFieldConfigStore()

// Computed properties pour vérifier la visibilité et obligation des champs
const fieldConfigs = computed(() => {
  const serviceConfigs = fieldConfigStore.configurations.filter(c => c.form_name === 'service')
  const configMap: Record<string, { visible: boolean; required: boolean }> = {}

  serviceConfigs.forEach(config => {
    configMap[config.field_name] = {
      visible: config.is_visible,
      required: config.is_required
    }
  })

  return configMap
})

const isFieldVisible = (fieldName: string) => fieldConfigs.value[fieldName]?.visible ?? true
const isFieldRequired = (fieldName: string) => fieldConfigs.value[fieldName]?.required ?? false

const formData = ref({
  reference: '',
  name: '',
  category: 0,
  unit_price: 0,
  description: '',
})

// Générer le prochain code séquentiel (SRV001, SRV002, etc.)
// Utilise la liste de toutes les références (actifs + inactifs) pour ne jamais réutiliser un code
const generateNextCode = (allReferences: string[]): string => {
  const existingCodes = allReferences
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

// Gestion des erreurs de validation
const fieldErrors = ref<Record<string, string>>({})

const clearFieldError = (fieldName: string) => {
  delete fieldErrors.value[fieldName]
}

const getFieldError = (fieldName: string) => fieldErrors.value[fieldName] || ''

// Charger les catégories au montage
onMounted(async () => {
  if (familiesStore.families.length === 0) {
    familiesStore.fetchFamilies()
  }

  // Charger les configurations de champs
  if (fieldConfigStore.configurations.length === 0) {
    await fieldConfigStore.fetchConfigurations()
  }
})

watch(() => props.open, async (newValue) => {
  if (newValue) {
    if (props.service) {
      isEditing.value = true
      formData.value = {
        reference: props.service.reference,
        name: props.service.name,
        category: props.service.category,
        unit_price: props.service.unit_price,
        description: props.service.description || '',
      }
    } else {
      isEditing.value = false
      // Récupérer TOUTES les références (actifs + inactifs) pour générer un code unique
      const allReferences = await servicesStore.fetchAllReferences()
      formData.value = {
        reference: generateNextCode(allReferences),
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
  // Validation dynamique : vérifier TOUS les champs configurés comme obligatoires
  const fieldMapping: Record<string, { value: any; label: string }> = {
    'name': { value: formData.value.name, label: 'Désignation' },
    'reference': { value: formData.value.reference, label: 'Code' },
    'category': { value: formData.value.category, label: 'Catégorie' },
    'unit_price': { value: formData.value.unit_price, label: 'Prix unitaire' },
    'description': { value: formData.value.description, label: 'Description' },
  }

  // Réinitialiser les erreurs
  fieldErrors.value = {}

  // Vérifier tous les champs qui sont visibles ET obligatoires
  for (const [fieldName, fieldData] of Object.entries(fieldMapping)) {
    const isVisible = isFieldVisible(fieldName)
    const isRequired = isFieldRequired(fieldName)

    if (isVisible && isRequired && !fieldData.value) {
      fieldErrors.value[fieldName] = `Le champ "${fieldData.label}" est obligatoire`
    }
  }

  // Si des erreurs existent, arrêter la soumission
  if (Object.keys(fieldErrors.value).length > 0) {
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
    <DialogContent class="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
            <Briefcase class="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <DialogTitle class="text-xl font-semibold">Fiche de Service</DialogTitle>
            <DialogDescription class="sr-only">
              Formulaire de {{ isEditing ? 'modification' : 'création' }} d'un service
            </DialogDescription>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">

        <div v-if="isFieldVisible('reference')" class="space-y-2">
          <Label for="reference" class="font-semibold">
            Code :
            <span v-if="isFieldRequired('reference')" class="text-destructive ml-1">(Obligatoire)</span>
          </Label>
          <div class="relative">
            <Tag class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reference"
              v-model="formData.reference"
              :disabled="true"
              class="pl-10 h-12 bg-muted font-semibold"
            />
          </div>
        </div>

        <!-- Catégorie de service -->
        <div v-if="isFieldVisible('category')" class="space-y-2">
          <Label for="category" class="font-semibold">
            Catégorie :
            <span v-if="isFieldRequired('category')" class="text-destructive ml-1">(Obligatoire)</span>
          </Label>
          <Select
            :model-value="formData.category?.toString() || ''"
            @update:model-value="(v) => { handleCategoryChange(v); clearFieldError('category'); }"
            :disabled="loading || familiesStore.loading"
          >
            <SelectTrigger :class="['h-12', getFieldError('category') && 'border-red-500']">
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
          <p v-if="selectedCategoryName" class="text-sm text-muted-foreground">
            Catégorie : <span class="font-medium text-primary">{{ selectedCategoryName }}</span>
          </p>
          <p v-if="getFieldError('category')" class="text-sm text-red-500">
            {{ getFieldError('category') }}
          </p>
        </div>

        <!-- Nom du service -->
        <div v-if="isFieldVisible('name')" class="space-y-2">
          <Label for="name" class="font-semibold">
            Désignation :
            <span v-if="isFieldRequired('name')" class="text-destructive ml-1">(Obligatoire)</span>
          </Label>
          <div class="relative">
            <FileText class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              v-model="formData.name"
              @input="clearFieldError('name')"
              placeholder="Ex : Conception de site web"
              :class="['pl-10 h-12', getFieldError('name') && 'border-red-500']"
              :disabled="loading"
            />
          </div>
          <p v-if="getFieldError('name')" class="text-sm text-red-500">
            {{ getFieldError('name') }}
          </p>
        </div>

        <!-- Prix unitaire -->
        <div v-if="isFieldVisible('unit_price')" class="space-y-2">
          <Label for="unit_price" class="font-semibold">
            Prix unitaire :
            <span v-if="isFieldRequired('unit_price')" class="text-destructive ml-1">(Obligatoire)</span>
          </Label>
          <div class="relative">
            <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="unit_price"
              v-model.number="formData.unit_price"
              @input="clearFieldError('unit_price')"
              type="number"
              step="1"
              placeholder="Ex : 25 000"
              :class="['pl-10 h-12', getFieldError('unit_price') && 'border-red-500']"
              :disabled="loading"
            />
          </div>
          <p v-if="getFieldError('unit_price')" class="text-sm text-red-500">
            {{ getFieldError('unit_price') }}
          </p>
        </div>

        <!-- Description -->
        <div v-if="isFieldVisible('description')" class="space-y-2">
          <Label for="description" class="font-semibold">
            Description :
            <span v-if="isFieldRequired('description')" class="text-destructive ml-1">(Obligatoire)</span>
          </Label>
          <div class="relative">
            <AlignLeft class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="description"
              v-model="formData.description"
              @input="clearFieldError('description')"
              placeholder="Description du service..."
              :class="['pl-10 min-h-[100px] resize-none', getFieldError('description') && 'border-red-500']"
              :disabled="loading"
            />
          </div>
          <p v-if="getFieldError('description')" class="text-sm text-red-500">
            {{ getFieldError('description') }}
          </p>
        </div>

        <!-- Submit button -->
        <Button
          type="submit"
          class="w-full h-12 mt-6 text-base font-semibold"
          :disabled="loading"
        >
          {{ loading ? 'ENREGISTREMENT...' : 'SAUVER' }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
