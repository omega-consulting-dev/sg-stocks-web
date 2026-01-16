<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenantStore } from '@/stores/tenant.store'
import { useToast } from '@/composables/useToast'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, DollarSign, AlertCircle } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const router = useRouter()
const tenantStore = useTenantStore()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const allowFlexiblePricing = ref(false)

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  loading.value = true
  try {
    const tenant = await tenantStore.fetchCurrentTenant()
    if (tenant) {
      allowFlexiblePricing.value = tenant.allow_flexible_pricing || false
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    toast.error('Impossible de charger les paramètres', 'Erreur')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  console.log('[InvoiceConfig] Tentative de sauvegarde, allow_flexible_pricing:', allowFlexiblePricing.value)

  try {
    // Mettre à jour via l'API tenant
    const result = await tenantStore.updateTenant({
      allow_flexible_pricing: allowFlexiblePricing.value
    })

    console.log('[InvoiceConfig] Sauvegarde réussie:', result)
    toast.success('Paramètres enregistrés avec succès!', 'Succès')
  } catch (error) {
    console.error('[InvoiceConfig] Erreur lors de l\'enregistrement:', error)
    toast.error('Impossible d\'enregistrer les paramètres', 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 bg-[#F5F6FA] min-h-screen">
    <!-- Breadcrumb with Back Button -->
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        @click="router.push('/settings')"
        class="hover:bg-blue-50"
      >
        <ArrowLeft class="w-5 h-5 text-[#0769CF]" />
      </Button>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings" class="text-gray-600 hover:text-gray-900">
              Paramètres
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage class="text-[#0769CF] font-medium">
              Configuration de la facturation
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Configuration de la facturation</h1>
        <p class="text-gray-600 mt-2">Gérez le comportement de la facturation</p>
      </div>

      <Button
        @click="saveSettings"
        :disabled="saving || loading"
        class="bg-[#0769CF] hover:bg-[#003FD8] text-white"
      >
        <Save class="w-4 h-4 mr-2" />
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </Button>
    </div>

    <!-- Main Content -->
    <div v-if="!loading" class="grid gap-6">
      <!-- Prix flexible -->
      <Card>
        <CardHeader>
          <div class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1">
              <CardTitle>Prix de vente flexibles</CardTitle>
              <CardDescription class="mt-1">
                Contrôlez la manière dont les prix de vente sont gérés lors de la facturation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Switch principal -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex-1 pr-4">
              <Label class="text-base font-medium text-gray-900">
                Autoriser la modification des prix en facturation
              </Label>
              <p class="text-sm text-gray-600 mt-1">
                Active ou désactive la possibilité de modifier le prix unitaire lors de la création d'une facture
              </p>
            </div>
            <Switch
              :checked="allowFlexiblePricing"
              @update:checked="allowFlexiblePricing = $event"
              class="data-[state=checked]:bg-green-500"
            />
          </div>

          <!-- Explication des modes -->
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Mode Prix fixes -->
            <div
              @click="allowFlexiblePricing = false"
              class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
              :class="!allowFlexiblePricing ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-blue-300'"
            >
              <div class="flex items-center gap-2 mb-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="!allowFlexiblePricing ? 'bg-blue-500' : 'bg-gray-300'">
                  <span class="text-white font-bold text-sm">1</span>
                </div>
                <h3 class="font-semibold text-gray-900">Mode: Prix fixes</h3>
                <span v-if="!allowFlexiblePricing" class="ml-auto text-xs bg-blue-500 text-white px-2 py-1 rounded">ACTIF</span>
              </div>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-0.5">✓</span>
                  <span>Le prix unitaire du produit est <strong>verrouillé</strong></span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-0.5">✓</span>
                  <span>Le total calculé = Quantité × Prix unitaire du produit</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-0.5">✓</span>
                  <span>Si montant payé &gt; total → <strong>Solde restant négatif</strong></span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-0.5">✓</span>
                  <span>Si montant payé &lt; total → <strong>Dette (crédit client)</strong></span>
                </li>
              </ul>
              <div class="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                <strong>Exemple:</strong> Produit à 10 000 XOF, client paie 15 000 XOF → Solde restant: -5 000 XOF
              </div>
            </div>

            <!-- Mode Prix flexibles -->
            <div
              @click="allowFlexiblePricing = true"
              class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
              :class="allowFlexiblePricing ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white hover:border-green-300'"
            >
              <div class="flex items-center gap-2 mb-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="allowFlexiblePricing ? 'bg-green-500' : 'bg-gray-300'">
                  <span class="text-white font-bold text-sm">2</span>
                </div>
                <h3 class="font-semibold text-gray-900">Mode: Prix flexibles</h3>
                <span v-if="allowFlexiblePricing" class="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded">ACTIF</span>
              </div>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Le prix unitaire peut être <strong>modifié</strong> lors de la facturation</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Le montant saisi devient le <strong>prix de vente réel</strong></span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Pas de solde restant négatif, le prix s'ajuste</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span>
                  <span>Idéal pour les <strong>prix négociables</strong> ou promotions</span>
                </li>
              </ul>
              <div class="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                <strong>Exemple:</strong> Produit à 10 000 XOF, vendu à 50 000 XOF → Prix unitaire ajusté à 50 000 XOF
              </div>
            </div>
          </div>

          <!-- Avertissement -->
          <div class="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-orange-800">
              <strong>Important:</strong> La modification de ce paramètre affectera le comportement de toutes les futures factures.
              Les factures existantes ne seront pas modifiées.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement des paramètres...</p>
      </div>
    </div>
  </div>
</template>
