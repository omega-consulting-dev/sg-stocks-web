<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFieldConfigStore } from '@/stores/field-config.store'
import type { FieldConfiguration } from '@/services/api/field-config.api'
import { useToast } from '@/composables/useToast'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Save, RotateCw } from 'lucide-vue-next'

const fieldConfigStore = useFieldConfigStore()
const toast = useToast()

const activeEntity = ref('product') // Entité active (product, customer, supplier, service)
const activeConfigType = ref<'form' | 'table'>('form') // Type de config (form ou table)
const isSaving = ref(false)
const hasChanges = ref(false)

// Use a truly local copy that won't be affected by store updates
const localConfigs = ref<FieldConfiguration[]>([])
const isEditMode = ref(false)  // Track if we're in edit mode

// Entities configuration
const entities = [
  {
    value: 'product',
    label: 'Produits',
    icon: '📦',
    hasForm: true,
    hasTable: true
  },
  {
    value: 'service',
    label: 'Services',
    icon: '🛠️',
    hasForm: true,
    hasTable: true
  },
  {
    value: 'purchase',
    label: 'Achats',
    icon: '📥',
    hasForm: true,
    hasTable: true
  },
  {
    value: 'loan',
    label: 'Emprunts',
    icon: '💰',
    hasForm: true,
    hasTable: true
  },
  {
    value: 'invoice',
    label: 'Facture Produit',
    icon: '🧾',
    hasForm: true,
    hasTable: false
  },
  {
    value: 'invoice_service',
    label: 'Facture Service',
    icon: '🧾',
    hasForm: true,
    hasTable: false
  },
  {
    value: 'customer',
    label: 'Clients',
    icon: '👥',
    hasForm: true,
    hasTable: false
  },
  {
    value: 'supplier',
    label: 'Fournisseurs',
    icon: '🏢',
    hasForm: true,
    hasTable: false
  },
]

// Current active entity
const currentEntity = computed(() =>
  entities.find(e => e.value === activeEntity.value)
)

// Current form name based on entity and config type
const currentFormName = computed(() => {
  if (activeConfigType.value === 'table') {
    return `${activeEntity.value}_table`
  }
  return activeEntity.value
})

// Helper to check if current config is for a table
const isTableConfig = computed(() => activeConfigType.value === 'table')

// Watch for entity changes to reset to 'form' tab
watch(activeEntity, () => {
  activeConfigType.value = 'form'
})

// Initialize local copy from store ONCE and never update it until save completes
onMounted(async () => {
  // CRITICAL: Don't reload if we already have data (component re-mounted during edit)
  if (localConfigs.value.length > 0) {
    console.log('⚠️ onMounted skipped - already have local data')
    return
  }

  try {
    await fieldConfigStore.fetchConfigurations()
    // Create deep copy that won't be affected by any store changes
    localConfigs.value = JSON.parse(JSON.stringify(fieldConfigStore.configurations))
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
})

// Current form configurations - filter from local copy
const currentConfigs = computed(() => {
  const formName = currentFormName.value
  return localConfigs.value.filter(config => config.form_name === formName)
})

// Field name mappings between form and table (when names differ)
const fieldMappings: Record<string, Record<string, string>> = {
  // Product mappings
  'product': {
    'name': 'designation',
    'reference': 'code',
    'category': 'family',
    'purchase_price': 'purchase_price',
    'sale_price': 'sale_price',
    'minimum_stock': 'minimum_stock'
  },
  'product_table': {
    'designation': 'name',
    'code': 'reference',
    'family': 'category',
    'purchase_price': 'purchase_price',
    'sale_price': 'sale_price',
    'minimum_stock': 'minimum_stock'
  },
  // Purchase mappings (Achats/Entrée Stock)
  'purchase': {
    'store': 'store_name',
    'supplier': 'supplier_name',
    'receipt_number': 'receipt_number',
    'reference': 'reference',
    'invoice_amount': 'invoice_amount',
    'date': 'created_at'
  },
  'purchase_table': {
    'store_name': 'store',
    'supplier_name': 'supplier',
    'receipt_number': 'receipt_number',
    'reference': 'reference',
    'invoice_amount': 'invoice_amount',
    'created_at': 'date'
  }
}

// Handle visibility change
const onVisibilityChange = (config: FieldConfiguration) => {
  // Mark we're in edit mode
  isEditMode.value = true

  // The config object is from localConfigs, so the change is already applied by v-model
  // Just need to handle the required constraint
  if (!config.is_visible) {
    config.is_required = false
  }

  // 🔗 SYNC: Synchronize with corresponding form/table config
  // Determine if this is a form or table config
  const isTableConfig = config.form_name.endsWith('_table')
  const baseFormName = isTableConfig ? config.form_name.replace('_table', '') : config.form_name
  const correspondingFormName = isTableConfig ? baseFormName : `${baseFormName}_table`

  // Get the corresponding field name (might be different for products)
  const fieldMapping = fieldMappings[config.form_name]
  const correspondingFieldName = fieldMapping?.[config.field_name] || config.field_name

  // Find and update the corresponding config
  const correspondingConfig = localConfigs.value.find(
    c => c.form_name === correspondingFormName && c.field_name === correspondingFieldName
  )

  if (correspondingConfig) {
    correspondingConfig.is_visible = config.is_visible
    if (!correspondingConfig.is_visible) {
      correspondingConfig.is_required = false
    }
  }

  hasChanges.value = true
}

// Handle required change
const onRequiredChange = (config: FieldConfiguration) => {
  // Mark we're in edit mode
  isEditMode.value = true

  // If required, it must be visible
  if (config.is_required) {
    config.is_visible = true
  }

  // 🔗 SYNC: Synchronize with corresponding form/table config
  const isTableConfig = config.form_name.endsWith('_table')
  const baseFormName = isTableConfig ? config.form_name.replace('_table', '') : config.form_name
  const correspondingFormName = isTableConfig ? baseFormName : `${baseFormName}_table`

  // Get the corresponding field name (might be different for products)
  const fieldMapping = fieldMappings[config.form_name]
  const correspondingFieldName = fieldMapping?.[config.field_name] || config.field_name

  // Find and update the corresponding config
  const correspondingConfig = localConfigs.value.find(
    c => c.form_name === correspondingFormName && c.field_name === correspondingFieldName
  )

  if (correspondingConfig) {
    correspondingConfig.is_required = config.is_required
    if (correspondingConfig.is_required) {
      correspondingConfig.is_visible = true
    }
  }

  hasChanges.value = true
}

// Toggle visibility (keeping for backward compatibility if needed)
const toggleVisibility = (configId: number) => {
  const config = localConfigs.value.find(c => c.id === configId)
  if (config) {
    config.is_visible = !config.is_visible
    // If not visible, it can't be required
    if (!config.is_visible) {
      config.is_required = false
    }
    hasChanges.value = true
  }
}

// Toggle required
const toggleRequired = (configId: number) => {
  const config = localConfigs.value.find(c => c.id === configId)
  if (config) {
    config.is_required = !config.is_required
    // If required, it must be visible
    if (config.is_required) {
      config.is_visible = true
    }
    hasChanges.value = true
  }
}

// Save changes
const saveChanges = async () => {
  isSaving.value = true

  try {
    const updates = localConfigs.value.map(config => ({
      id: config.id,
      is_visible: config.is_visible,
      is_required: config.is_required,
      display_order: config.display_order
    }))

    await fieldConfigStore.bulkUpdate(updates)

    // Reload fresh data from server and update local copy
    await fieldConfigStore.fetchConfigurations()
    localConfigs.value = JSON.parse(JSON.stringify(fieldConfigStore.configurations))

    isEditMode.value = false
    hasChanges.value = false
    toast.success('Configurations sauvegardées avec succès!', 'Succès')
  } catch (error) {
    console.error('❌ Save error:', error)
    toast.error('Une erreur est survenue lors de la sauvegarde', 'Erreur')
  } finally {
    isSaving.value = false
  }
}

// Reset to defaults
const resetToDefaults = async () => {
  if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les configurations ?')) {
    return
  }

  try {
    await fieldConfigStore.initializeDefaults()
    hasChanges.value = false
    toast.success('Configurations réinitialisées avec succès!', 'Succès')
  } catch (error) {
    toast.error('Une erreur est survenue lors de la réinitialisation', 'Erreur')
  }
}
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[#003FD8]">Configuration des Formulaires & Tableaux</h1>
      <p class="text-gray-600 mt-2">
        Personnalisez l'affichage des champs dans vos formulaires et colonnes dans vos tableaux
      </p>
    </div>

    <div class="flex gap-4 mb-6">
      <Button
        @click="saveChanges"
        :disabled="!hasChanges || isSaving"
        class="bg-[#003FD8] hover:bg-[#002FA8]"
      >
        <Save class="w-4 h-4 mr-2" />
        {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
      </Button>

      <Button
        @click="resetToDefaults"
        variant="outline"
      >
        <RotateCw class="w-4 h-4 mr-2" />
        Réinitialiser
      </Button>
    </div>

    <!-- Entity Selection (Main Tabs) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <button
        v-for="entity in entities"
        :key="entity.value"
        @click="activeEntity = entity.value"
        :class="[
          'p-4 rounded-lg border-2 transition-all text-left',
          activeEntity === entity.value
            ? 'border-[#003FD8] bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300'
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ entity.icon }}</span>
          <div>
            <h3 class="font-bold text-lg" :class="activeEntity === entity.value ? 'text-[#003FD8]' : 'text-gray-900'">
              {{ entity.label }}
            </h3>
            <p class="text-xs text-gray-500">
              {{ entity.hasForm && entity.hasTable ? 'Formulaire & Tableau' : entity.hasForm ? 'Formulaire' : 'Tableau' }}
            </p>
          </div>
        </div>
      </button>
    </div>

    <!-- Config Type Selection (Form / Table) -->
    <Tabs :value="activeConfigType" @update:value="(val) => activeConfigType = val as 'form' | 'table'" class="w-full">
      <TabsList class="grid w-full" :class="currentEntity?.hasForm && currentEntity?.hasTable ? 'grid-cols-2' : 'grid-cols-1'">
        <TabsTrigger
          v-if="currentEntity?.hasForm"
          value="form"
          class="gap-2"
        >
          📝 Formulaire
        </TabsTrigger>
        <TabsTrigger
          v-if="currentEntity?.hasTable"
          value="table"
          class="gap-2"
        >
          📊 Tableau
        </TabsTrigger>
      </TabsList>

      <!-- Form Configuration -->
      <TabsContent value="form">
        <Card>
          <CardHeader>
            <CardTitle>Configuration du formulaire {{ currentEntity?.label }}</CardTitle>
            <CardDescription>
              Gérez la visibilité et l'obligation des champs du formulaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="fieldConfigStore.loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003FD8] mx-auto"></div>
              <p class="text-gray-500 mt-2">Chargement...</p>
            </div>

            <div v-else-if="currentConfigs.length === 0" class="text-center py-8 text-gray-500">
              Aucune configuration disponible
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="config in currentConfigs"
                :key="config.id"
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ config.field_label }}</h3>
                  <p class="text-sm text-gray-500">{{ config.field_name }}</p>
                </div>

                <div class="flex items-center gap-6">
                  <!-- Visible Switch -->
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="config.is_visible"
                      @change="() => onVisibilityChange(config)"
                      :id="`visible-${config.id}`"
                      class="w-4 h-4"
                    />
                    <Label :for="`visible-${config.id}`" class="text-sm font-medium cursor-pointer">
                      Visible ({{ config.is_visible ? 'OUI' : 'NON' }})
                    </Label>
                  </div>

                  <!-- Required Switch -->
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="config.is_required"
                      @change="() => onRequiredChange(config)"
                      :disabled="!config.is_visible"
                      :id="`required-${config.id}`"
                      class="w-4 h-4"
                    />
                    <Label
                      :for="`required-${config.id}`"
                      class="text-sm font-medium cursor-pointer"
                      :class="{ 'opacity-50': !config.is_visible }"
                    >
                      Obligatoire ({{ config.is_required ? 'OUI' : 'NON' }})
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Table Configuration -->
      <TabsContent value="table">
        <Card>
          <CardHeader>
            <CardTitle>Configuration du tableau {{ currentEntity?.label }}</CardTitle>
            <CardDescription>
              Gérez la visibilité des colonnes du tableau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="fieldConfigStore.loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003FD8] mx-auto"></div>
              <p class="text-gray-500 mt-2">Chargement...</p>
            </div>

            <div v-else-if="currentConfigs.length === 0" class="text-center py-8 text-gray-500">
              Aucune configuration disponible
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="config in currentConfigs"
                :key="config.id"
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ config.field_label }}</h3>
                  <p class="text-sm text-gray-500">{{ config.field_name }}</p>
                </div>

                <div class="flex items-center gap-6">
                  <!-- Visible Switch (only for tables) -->
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="config.is_visible"
                      @change="() => onVisibilityChange(config)"
                      :id="`visible-${config.id}`"
                      class="w-4 h-4"
                    />
                    <Label :for="`visible-${config.id}`" class="text-sm font-medium cursor-pointer">
                      Visible ({{ config.is_visible ? 'OUI' : 'NON' }})
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <div v-if="hasChanges" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-yellow-800 text-sm">
        ⚠️ Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur "Sauvegarder".
      </p>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
}
</style>
