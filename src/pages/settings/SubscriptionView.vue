<template>
  <div class="max-w-6xl mx-auto p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
        <CreditCard class="h-8 w-8 text-blue-600" />
        Gestion de l'Abonnement
      </h1>
      <p class="text-gray-600">Gérez votre plan d'abonnement et vos fonctionnalités</p>
    </div>

    <!-- Current Subscription Info -->
    <section class="mb-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Abonnement Actuel</h2>
            <p class="text-sm text-gray-600">Informations sur votre plan actuel</p>
          </div>
          <div v-if="subscription" :class="[
            'px-4 py-2 rounded-full text-sm font-medium',
            subscription.is_expired ? 'bg-red-100 text-red-700' :
            subscription.days_remaining <= 7 ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          ]">
            {{ subscription.is_expired ? 'Expiré' : subscription.is_trial ? 'Période d\'essai' : 'Actif' }}
          </div>
        </div>

        <div v-if="loadingSubscription" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="subscription" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Plan -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Plan</p>
            <p class="text-2xl font-bold text-gray-900 capitalize">{{ subscription.plan }}</p>
            <p class="text-sm text-gray-500">{{ subscription.monthly_price }} XAF/mois</p>
          </div>

          <!-- Expiration -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">{{ subscription.is_trial ? 'Fin d\'essai' : 'Expire le' }}</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ subscription.end_date ? formatDate(subscription.end_date) : 'Non défini' }}
            </p>
            <p v-if="subscription.end_date" :class="[
              'text-sm font-medium',
              subscription.days_remaining <= 7 ? 'text-orange-600' : 'text-green-600'
            ]">
              {{ subscription.days_remaining }} jours restants
            </p>
            <p v-else class="text-sm font-medium text-gray-500">
              Aucune date d'expiration
            </p>
          </div>

          <!-- Users -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Utilisateurs</p>
            <p class="text-xl font-semibold text-gray-900">{{ subscription.current_users }} / {{ subscription.max_users }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :style="{ width: `${(subscription.current_users / subscription.max_users) * 100}%` }"
                   class="bg-blue-600 h-2 rounded-full"></div>
            </div>
          </div>

          <!-- Storage -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Stockage</p>
            <p class="text-xl font-semibold text-gray-900">{{ subscription.storage_used }} / {{ subscription.max_storage }} MB</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :style="{ width: `${(subscription.storage_used / subscription.max_storage) * 100}%` }"
                   class="bg-green-600 h-2 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Renewal Warning -->
        <div v-if="subscription && !subscription.is_expired && subscription.days_remaining <= 30"
             class="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-orange-900">Renouvellement proche</h3>
            <p class="text-sm text-orange-700 mt-1">
              Votre abonnement expire dans {{ subscription.days_remaining }} jours. Renouvelez dès maintenant pour éviter toute interruption de service.
            </p>
          </div>
        </div>

        <!-- Expiration Alert -->
        <div v-if="subscription && subscription.is_expired"
             class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-red-900">Abonnement expiré</h3>
            <p class="text-sm text-red-700 mt-1">
              Votre abonnement a expiré. Renouvelez maintenant pour continuer à utiliser tous les services.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Available Plans -->
    <section class="mb-8">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-900">Plans Disponibles</h2>
        <p class="text-sm text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Starter Plan -->
        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer',
          subscription?.plan === 'starter' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'starter'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Starter</h3>
            <div v-if="subscription?.plan === 'starter'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">15 000</span>
            <span class="text-gray-600"> XAF/mois</span>
          </div>
          <ul class="space-y-3 mb-6">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>3 utilisateurs max</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>1 point de vente</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>1000 produits max</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>1 GB de stockage</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-400">
              <X class="h-4 w-4 text-gray-400" />
              <span>Module services</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'starter'"
            @click="confirmPlanChange('starter')"
            class="w-full"
            variant="outline">
            Passer à Starter
          </Button>
        </div>

        <!-- Business Plan -->
        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer relative',
          subscription?.plan === 'business' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'business'">
          <div class="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
            POPULAIRE
          </div>
          <div class="flex items-center justify-between mb-4 mt-2">
            <h3 class="text-xl font-bold text-gray-900">Business</h3>
            <div v-if="subscription?.plan === 'business'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">35 000</span>
            <span class="text-gray-600"> XAF/mois</span>
          </div>
          <ul class="space-y-3 mb-6">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>10 utilisateurs max</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>5 points de vente</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Produits illimités</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>10 GB de stockage</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Module services</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Analytics avancés</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'business'"
            @click="confirmPlanChange('business')"
            class="w-full"
            variant="default">
            Passer à Business
          </Button>
        </div>

        <!-- Enterprise Plan -->
        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer',
          subscription?.plan === 'enterprise' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'enterprise'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Enterprise</h3>
            <div v-if="subscription?.plan === 'enterprise'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-6">
            <span class="text-4xl font-bold text-gray-900">75 000</span>
            <span class="text-gray-600"> XAF/mois</span>
          </div>
          <ul class="space-y-3 mb-6">
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Utilisateurs illimités</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Points de vente illimités</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Produits illimités</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Stockage illimité</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Tous les modules</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Support prioritaire</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-700">
              <Check class="h-4 w-4 text-green-600" />
              <span>Accès API</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'enterprise'"
            @click="confirmPlanChange('enterprise')"
            class="w-full"
            variant="default">
            Passer à Enterprise
          </Button>
        </div>
      </div>
    </section>

    <!-- Actions -->
    <section>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            @click="handleRenewSubscription"
            :disabled="processingRenewal"
            size="lg"
            class="w-full"
            variant="default">
            <RefreshCw :class="['mr-2 h-5 w-5', processingRenewal ? 'animate-spin' : '']" />
            {{ processingRenewal ? 'Renouvellement en cours...' : 'Renouveler l\'abonnement' }}
          </Button>
          <Button
            @click="handleContactSupport"
            size="lg"
            class="w-full"
            variant="outline">
            <Mail class="mr-2 h-5 w-5" />
            Contacter le support
          </Button>
        </div>
      </div>
    </section>

    <!-- Renewal Confirmation Dialog -->
    <Dialog :open="showRenewDialog" @update:open="showRenewDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <RefreshCw class="h-5 w-5 text-blue-600" />
            Renouveler l'abonnement
          </DialogTitle>
          <DialogDescription>
            Voulez-vous renouveler votre abonnement pour 30 jours supplémentaires ?
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm text-blue-900 font-medium">Détails du renouvellement</p>
                <p class="text-sm text-blue-700 mt-1">
                  • Durée : 30 jours<br>
                  • Prix : {{ subscription?.monthly_price }} XAF<br>
                  • Plan actuel : {{ subscription?.plan?.toUpperCase() }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter class="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            @click="showRenewDialog = false"
            :disabled="processingRenewal">
            Annuler
          </Button>
          <Button
            type="button"
            @click="confirmRenewal"
            :disabled="processingRenewal">
            <RefreshCw :class="['mr-2 h-4 w-4', processingRenewal ? 'animate-spin' : '']" />
            {{ processingRenewal ? 'Traitement...' : 'Confirmer le renouvellement' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Plan Change Confirmation Dialog -->
    <Dialog :open="showPlanChangeDialog" @update:open="showPlanChangeDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <CreditCard class="h-5 w-5 text-blue-600" />
            Changer de plan
          </DialogTitle>
          <DialogDescription>
            Voulez-vous changer votre plan d'abonnement ?
          </DialogDescription>
        </DialogHeader>
        <div class="py-4 space-y-4">
          <div v-if="isDowngrade()" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm text-orange-900 font-medium">⚠️ Attention : Rétrogradation</p>
                <p class="text-sm text-orange-700 mt-1">
                  Passer au plan {{ pendingPlanChange.toUpperCase() }} réduira vos fonctionnalités et limites.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan actuel :</span>
                <span class="font-semibold text-gray-900">{{ subscription?.plan?.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nouveau plan :</span>
                <span class="font-semibold text-blue-600">{{ pendingPlanChange.toUpperCase() }}</span>
              </div>
              <div class="border-t border-blue-200 my-2"></div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nouveau prix :</span>
                <span class="font-semibold text-gray-900">{{ getPlanPrice(pendingPlanChange).toLocaleString() }} XAF/mois</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter class="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            @click="showPlanChangeDialog = false">
            Annuler
          </Button>
          <Button
            type="button"
            @click="executePlanChange">
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CreditCard, Check, X, AlertTriangle, XCircle, RefreshCw, Mail } from 'lucide-vue-next'
import { useTenantStore } from '@/stores/tenant.store'
import { useToast } from '@/composables/useToast'
import Axios from '@/services/axios.service'

const tenantStore = useTenantStore()
const toast = useToast()

// State
const loadingSubscription = ref(false)
const processingRenewal = ref(false)
const selectedPlan = ref<string>('')
const showRenewDialog = ref(false)
const showPlanChangeDialog = ref(false)
const pendingPlanChange = ref<string>('')

// Subscription data
const subscription = ref<{
  plan: string
  monthly_price: number
  end_date: string
  days_remaining: number
  is_expired: boolean
  is_trial: boolean
  max_users: number
  current_users: number
  max_storage: number
  storage_used: number
} | null>(null)

// Load subscription on mount
onMounted(async () => {
  await loadSubscription()
})

// Subscription management
async function loadSubscription() {
  loadingSubscription.value = true
  try {
    const tenant = await tenantStore.fetchCurrentTenant()
    if (tenant) {
      subscription.value = {
        plan: tenant.plan || 'starter',
        monthly_price: tenant.monthly_price || 0,
        end_date: tenant.subscription_end_date || '',
        days_remaining: calculateDaysRemaining(tenant.subscription_end_date),
        is_expired: isExpired(tenant.subscription_end_date),
        is_trial: !!(tenant.trial_end_date && !tenant.subscription_end_date),
        max_users: tenant.max_users || 3,
        current_users: tenant.total_users_count || 0,
        max_storage: tenant.max_storage_mb || 1000,
        storage_used: tenant.storage_used_mb || 0
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'abonnement:', error)
    toast.error('Erreur lors du chargement des informations d\'abonnement', 'Erreur')
  } finally {
    loadingSubscription.value = false
  }
}

function calculateDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0
  const end = new Date(endDate)
  const today = new Date()
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function isExpired(endDate: string | null): boolean {
  if (!endDate) return false
  return new Date(endDate) < new Date()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function handleRenewSubscription() {
  if (!subscription.value) return
  showRenewDialog.value = true
}

async function confirmRenewal() {
  showRenewDialog.value = false
  processingRenewal.value = true
  try {
    await Axios.post('/tenants/subscription/renew/')
    toast.success('Abonnement renouvelé avec succès !', 'Succès')
    await loadSubscription()
  } catch (error: any) {
    console.error('Erreur lors du renouvellement:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors du renouvellement'
    toast.error(errorMsg, 'Erreur', 8000)
  } finally {
    processingRenewal.value = false
  }
}

function confirmPlanChange(newPlan: string) {
  if (!subscription.value) return
  pendingPlanChange.value = newPlan
  showPlanChangeDialog.value = true
}

function getPlanPrice(plan: string): number {
  const planPrices: Record<string, number> = {
    'starter': 15000,
    'business': 35000,
    'enterprise': 75000
  }
  return planPrices[plan] || 0
}

function isDowngrade(): boolean {
  if (!subscription.value || !pendingPlanChange.value) return false
  const currentPrice = getPlanPrice(subscription.value.plan)
  const newPrice = getPlanPrice(pendingPlanChange.value)
  return newPrice < currentPrice
}

async function executePlanChange() {
  showPlanChangeDialog.value = false
  const newPlan = pendingPlanChange.value

  try {
    await Axios.post('/tenants/subscription/change-plan/', { plan: newPlan })
    toast.success(`Plan changé avec succès vers ${newPlan.toUpperCase()} !`, 'Succès')
    await loadSubscription()
  } catch (error: any) {
    console.error('Erreur lors du changement de plan:', error)
    const errorMsg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors du changement de plan'
    toast.error(errorMsg, 'Erreur', 8000)
  } finally {
    pendingPlanChange.value = ''
  }
}

function handleContactSupport() {
  window.location.href = 'mailto:support@sg-stock.com?subject=Question sur l\'abonnement'
}
</script>
