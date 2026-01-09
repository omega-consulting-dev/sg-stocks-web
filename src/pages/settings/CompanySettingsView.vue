<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CompanySettingsService, type CompanySettings, type CompanySettingsUpdate } from '@/services/company-settings.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Mail, Phone, MapPin, Palette, FileText, CreditCard, Upload, X, ArrowLeft } from 'lucide-vue-next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const router = useRouter()
const settings = ref<CompanySettings | null>(null)
const loading = ref(false)
const saving = ref(false)
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

const formData = ref({
  company_name: '',
  company_slogan: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  company_website: '',
  tax_id: '',
  primary_color: '#0769CF',
  secondary_color: '#003FD8',
  text_color: '#292D32',
  invoice_header_text: '',
  show_logo_on_invoice: true,
  invoice_footer_text: 'Merci pour votre confiance !',
  invoice_footer_note: '',
  bank_name: '',
  bank_account: '',
  mobile_money_number: '',
  invoice_prefix: 'FAC',
  show_tax_breakdown: true,
  default_payment_terms: 'Règlement à réception de facture'
})

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  loading.value = true
  try {
    const response = await CompanySettingsService.getSettings()
    settings.value = response.data

    // Populate form
    Object.keys(formData.value).forEach((key) => {
      if (key in response.data) {
        (formData.value as any)[key] = response.data[key as keyof CompanySettings]
      }
    })

    if (response.data.logo_url) {
      logoPreview.value = response.data.logo_url
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
    alert('Impossible de charger les paramètres')
  } finally {
    loading.value = false
  }
}

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    logoFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const uploadLogo = async () => {
  if (!logoFile.value) return

  try {
    await CompanySettingsService.uploadLogo(logoFile.value)
    alert('Logo téléchargé avec succès!')
    await loadSettings()
    logoFile.value = null
  } catch (error) {
    console.error('Erreur lors du téléchargement du logo:', error)
    alert('Impossible de télécharger le logo')
  }
}

const removeLogo = async () => {
  if (!confirm('Voulez-vous vraiment supprimer le logo ?')) return

  try {
    await CompanySettingsService.removeLogo()
    logoPreview.value = null
    alert('Logo supprimé avec succès!')
    await loadSettings()
  } catch (error) {
    console.error('Erreur lors de la suppression du logo:', error)
    alert('Impossible de supprimer le logo')
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const updateData: CompanySettingsUpdate = { ...formData.value }
    await CompanySettingsService.updateSettings(updateData)

    // Upload logo if changed
    if (logoFile.value) {
      await uploadLogo()
    }

    alert('Paramètres enregistrés avec succès!')
    await loadSettings()
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert('Impossible d\'enregistrer les paramètres')
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
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Paramètres</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Paramètres d'entreprise</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-[32px] font-bold text-[#003FD8] font-inter leading-[38.73px] tracking-[-0.01em]">
        Configuration de l'entreprise
      </h1>
      <p class="text-[20px] font-normal text-[#85878D] font-inter leading-[24.2px]">
        Personnalisez vos factures et informations d'entreprise
      </p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0769CF]"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Informations de l'entreprise -->
      <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-blue-50 rounded-full p-3">
            <Building2 class="w-6 h-6 text-[#0769CF]" />
          </div>
          <h2 class="text-[20px] font-bold text-[#292D32] font-inter">Informations de l'entreprise</h2>
        </div>

        <div class="space-y-4">
          <div>
            <Label for="company_name">Nom de l'entreprise *</Label>
            <Input id="company_name" v-model="formData.company_name" placeholder="SG-STOCK" />
          </div>

          <div>
            <Label for="company_slogan">Slogan</Label>
            <Input id="company_slogan" v-model="formData.company_slogan" placeholder="Solution de Gestion Commerciale" />
          </div>

          <div>
            <Label for="company_email">Email *</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input id="company_email" v-model="formData.company_email" type="email" class="pl-10" placeholder="contact@sgstock.cm" />
            </div>
          </div>

          <div>
            <Label for="company_phone">Téléphone *</Label>
            <div class="relative">
              <Phone class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input id="company_phone" v-model="formData.company_phone" class="pl-10" placeholder="+237 XXX XXX XXX" />
            </div>
          </div>

          <div>
            <Label for="company_address">Adresse complète</Label>
            <div class="relative">
              <MapPin class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea id="company_address" v-model="formData.company_address" class="pl-10" placeholder="Adresse, Ville, Pays" rows="2" />
            </div>
          </div>

          <div>
            <Label for="company_website">Site web</Label>
            <Input id="company_website" v-model="formData.company_website" type="url" placeholder="https://www.sgstock.cm" />
          </div>

          <div>
            <Label for="tax_id">Numéro fiscal / RC</Label>
            <Input id="tax_id" v-model="formData.tax_id" placeholder="RC123456" />
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-purple-50 rounded-full p-3">
            <Upload class="w-6 h-6 text-purple-600" />
          </div>
          <h2 class="text-[20px] font-bold text-[#292D32] font-inter">Logo de l'entreprise</h2>
        </div>

        <div class="space-y-4">
          <div v-if="logoPreview" class="flex flex-col items-center gap-4">
            <img :src="logoPreview" alt="Logo" class="w-48 h-48 object-contain border rounded-lg" />
            <Button @click="removeLogo" variant="destructive" size="sm">
              <X class="w-4 h-4 mr-2" />
              Supprimer le logo
            </Button>
          </div>

          <div>
            <Label for="logo">Télécharger un nouveau logo</Label>
            <Input id="logo" type="file" accept="image/*" @change="handleLogoChange" />
            <p class="text-xs text-gray-500 mt-1">Format recommandé: PNG ou JPG (carré, max 2MB)</p>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="show_logo" v-model="formData.show_logo_on_invoice" class="rounded" />
            <Label for="show_logo">Afficher le logo sur les factures</Label>
          </div>
        </div>
      </div>

      <!-- Couleurs -->
      <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-pink-50 rounded-full p-3">
            <Palette class="w-6 h-6 text-pink-600" />
          </div>
          <h2 class="text-[20px] font-bold text-[#292D32] font-inter">Couleurs de la facture</h2>
        </div>

        <div class="space-y-4">
          <div>
            <Label for="primary_color">Couleur principale</Label>
            <div class="flex gap-2">
              <Input id="primary_color" v-model="formData.primary_color" type="color" class="w-20 h-10" />
              <Input v-model="formData.primary_color" placeholder="#0769CF" class="flex-1" />
            </div>
          </div>

          <div>
            <Label for="secondary_color">Couleur secondaire</Label>
            <div class="flex gap-2">
              <Input id="secondary_color" v-model="formData.secondary_color" type="color" class="w-20 h-10" />
              <Input v-model="formData.secondary_color" placeholder="#003FD8" class="flex-1" />
            </div>
          </div>

          <div>
            <Label for="text_color">Couleur du texte</Label>
            <div class="flex gap-2">
              <Input id="text_color" v-model="formData.text_color" type="color" class="w-20 h-10" />
              <Input v-model="formData.text_color" placeholder="#292D32" class="flex-1" />
            </div>
          </div>
        </div>
      </div>

      <!-- Personnalisation de la facture -->
      <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-green-50 rounded-full p-3">
            <FileText class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-[20px] font-bold text-[#292D32] font-inter">Personnalisation de la facture</h2>
        </div>

        <div class="space-y-4">
          <div>
            <Label for="invoice_prefix">Préfixe de facture</Label>
            <Input id="invoice_prefix" v-model="formData.invoice_prefix" placeholder="FAC" maxlength="10" />
          </div>

          <div>
            <Label for="invoice_header_text">Texte d'en-tête (optionnel)</Label>
            <Textarea id="invoice_header_text" v-model="formData.invoice_header_text" rows="2" placeholder="Texte personnalisé pour l'en-tête" />
          </div>

          <div>
            <Label for="invoice_footer_text">Message de pied de page</Label>
            <Input id="invoice_footer_text" v-model="formData.invoice_footer_text" placeholder="Merci pour votre confiance !" />
          </div>

          <div>
            <Label for="invoice_footer_note">Note additionnelle (optionnel)</Label>
            <Textarea id="invoice_footer_note" v-model="formData.invoice_footer_note" rows="2" placeholder="Informations supplémentaires" />
          </div>

          <div>
            <Label for="default_payment_terms">Conditions de paiement par défaut</Label>
            <Textarea id="default_payment_terms" v-model="formData.default_payment_terms" rows="2" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="show_tax" v-model="formData.show_tax_breakdown" class="rounded" />
            <Label for="show_tax">Afficher le détail de la TVA</Label>
          </div>
        </div>
      </div>

      <!-- Informations bancaires -->
      <div class="bg-white rounded-[20px] shadow-[0px_10px_60px_0px_rgba(226,236,249,0.5)] p-6 lg:col-span-2">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-orange-50 rounded-full p-3">
            <CreditCard class="w-6 h-6 text-orange-600" />
          </div>
          <h2 class="text-[20px] font-bold text-[#292D32] font-inter">Informations bancaires</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label for="bank_name">Nom de la banque</Label>
            <Input id="bank_name" v-model="formData.bank_name" placeholder="Banque XYZ" />
          </div>

          <div>
            <Label for="bank_account">Numéro de compte bancaire</Label>
            <Input id="bank_account" v-model="formData.bank_account" placeholder="IBAN ou numéro de compte" />
          </div>

          <div>
            <Label for="mobile_money">Numéro Mobile Money</Label>
            <Input id="mobile_money" v-model="formData.mobile_money_number" placeholder="+237 XXX XXX XXX" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-4">
      <Button @click="loadSettings" variant="outline" :disabled="saving">
        Annuler
      </Button>
      <Button @click="saveSettings" :disabled="saving" class="bg-[#0769CF] hover:bg-[#0769CF]/90">
        {{ saving ? 'Enregistrement...' : 'Enregistrer les paramètres' }}
      </Button>
    </div>
  </div>
</template>
