<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { InvoiceServices } from '@/services'
import type { Invoice } from '@/types/invoice.types'
import StoreSelector from '@/components/common/StoreSelector.vue'
import InvoiceTable from '@/components/invoicing/InvoiceTable.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Plus, FileText } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'

const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

// État
const selectedStore = ref<number | null>(null)
const searchQuery = ref('')
const statusFilter = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)
const invoices = ref<Invoice[]>([])

// Initialiser le store par défaut selon le rôle
onMounted(() => {
  if (authStore.accessScope === 'assigned' && authStore.defaultStore) {
    selectedStore.value = authStore.defaultStore.id
  }
  loadInvoices()
})

// Recharger les factures quand le store ou le statut change
watch([selectedStore, statusFilter], () => {
  loadInvoices()
})

// Vérifications de permissions
const canCreate = computed(() => {
  return authStore.canManageInvoices
})

const canExport = computed(() => {
  return authStore.canExportData
})

// Chargement des factures
const loadInvoices = async () => {
  loading.value = true
  error.value = null

  try {
    const params: any = {}

    // Filtrer par store si sélectionné
    if (selectedStore.value) {
      params.store = selectedStore.value
    }

    // Filtrer par statut si sélectionné
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    // Ajouter recherche si présente
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await InvoiceServices.getInvoices(params)
    invoices.value = response.data.results

    console.log('Factures chargées:', invoices.value.length, 'factures')
    console.log('Paramètres de recherche:', params)

    toast({
      title: 'Factures chargées',
      description: `${invoices.value.length} facture(s) trouvée(s)`,
    })
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Erreur lors du chargement des factures'
    toast({
      title: 'Erreur',
      description: error.value,
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

// Actions
const handleNewInvoice = () => {
  router.push('/facturation/nouveau')
}

const handleExport = async () => {
  try {
    const params: any = {}
    if (selectedStore.value) {
      params.store = selectedStore.value
    }

    const response = await InvoiceServices.exportExcel(params)

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast({
      title: 'Export réussi',
      description: 'Les factures ont été exportées',
    })
  } catch (e: any) {
    toast({
      title: 'Erreur d\'export',
      description: e.message,
      variant: 'destructive'
    })
  }
}

const handleViewInvoice = (invoice: Invoice) => {
  router.push(`/facturation/${invoice.id}`)
}

const handleDeleteInvoice = async (invoice: Invoice) => {
  if (!confirm(`Supprimer la facture ${invoice.invoice_number} ?`)) {
    return
  }

  try {
    await InvoiceServices.deleteInvoice(invoice.id)
    toast({
      title: 'Facture supprimée',
      description: `La facture ${invoice.invoice_number} a été supprimée`,
    })
    await loadInvoices()
  } catch (e: any) {
    toast({
      title: 'Erreur',
      description: e.response?.data?.message || 'Impossible de supprimer la facture',
      variant: 'destructive'
    })
  }
}

const handleSendEmail = async (invoice: Invoice) => {
  try {
    await InvoiceServices.sendByEmail(invoice.id)
    toast({
      title: 'Email envoyé',
      description: `La facture ${invoice.invoice_number} a été envoyée par email`,
    })
  } catch (e: any) {
    toast({
      title: 'Erreur',
      description: e.response?.data?.message || 'Impossible d\'envoyer l\'email',
      variant: 'destructive'
    })
  }
}

const handleExportPdf = async (invoice: Invoice) => {
  try {
    const response = await InvoiceServices.exportPdf(invoice.id)

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `facture_${invoice.invoice_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast({
      title: 'PDF généré',
      description: `La facture ${invoice.invoice_number} a été téléchargée`,
    })
  } catch (e: any) {
    toast({
      title: 'Erreur',
      description: 'Impossible de générer le PDF',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 bg-[#F5F6FA] min-h-screen">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Facturation</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- En-tête avec contrôles -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Factures</h1>
          <p class="text-gray-500 mt-1">
            <span v-if="authStore.isAdmin">
              Vue administrateur - Tous les points de vente
            </span>
            <span v-else-if="authStore.isCashier">
              Vue caissier - {{ authStore.defaultStore?.name }}
            </span>
            <span v-else-if="authStore.isWarehouseKeeper">
              Vue magasinier - Sorties de stock
            </span>
            <span v-else>
              Points de vente assignés
            </span>
          </p>
        </div>

        <div class="flex gap-3">
          <Button
            v-if="canExport"
            variant="outline"
            @click="handleExport"
          >
            <FileText class="mr-2 h-4 w-4" />
            Exporter
          </Button>

          <Button
            v-if="canCreate"
            @click="handleNewInvoice"
          >
            <Plus class="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Filtre par store (admin uniquement) -->
        <StoreSelector
          v-if="authStore.accessScope === 'all'"
          v-model="selectedStore"
          placeholder="Tous les points de vente"
        />

        <!-- Store assigné (lecture seule pour non-admin) -->
        <div v-else-if="authStore.defaultStore" class="space-y-2">
          <label class="text-sm font-medium">Point de vente</label>
          <Input
            :model-value="`${authStore.defaultStore.code} - ${authStore.defaultStore.name}`"
            disabled
            class="bg-gray-50"
          />
        </div>

        <!-- Filtre par statut -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Statut</label>
          <select
            v-model="statusFilter"
            class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Toutes les factures</option>
            <option value="paid">Payées</option>
            <option value="partial">Partiellement payées</option>
            <option value="pending">En attente</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <!-- Recherche -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Recherche</label>
          <Input
            v-model="searchQuery"
            placeholder="Numéro, client..."
            @input="loadInvoices"
          />
        </div>
      </div>
    </div>

    <!-- Alerte si pas de store assigné -->
    <Alert v-if="!authStore.isAdmin && !authStore.defaultStore" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Accès restreint</AlertTitle>
      <AlertDescription>
        Vous n'avez aucun point de vente assigné. Contactez votre administrateur.
      </AlertDescription>
    </Alert>

    <!-- Affichage conditionnel selon le rôle -->
    <div v-if="authStore.isWarehouseKeeper" class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-4">Sorties de Stock (Facturations)</h2>
      <p class="text-gray-500">
        En tant que magasinier, vous consultez les mouvements de sortie générés automatiquement
        par les factures. Ces sorties sont enregistrées dans le module Inventaire.
      </p>
      <Button
        variant="outline"
        class="mt-4"
        @click="router.push('/inventaire/mouvements')"
      >
        Voir les mouvements de stock
      </Button>
    </div>

    <!-- Table des factures (caissier, admin) -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <InvoiceTable
        :invoices="invoices"
        :loading="loading"
        @view="handleViewInvoice"
        @delete="handleDeleteInvoice"
        @send-email="handleSendEmail"
        @export-pdf="handleExportPdf"
      />
    </div>

    <!-- Message d'erreur -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
  </div>
</template>
