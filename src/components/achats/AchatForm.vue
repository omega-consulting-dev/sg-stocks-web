<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Plus, Trash2, Paperclip, Calendar } from 'lucide-vue-next'
import type { Achat } from '@/stores/achats'
import { useProductsStore } from '@/stores/products'
import { useAchatsStore } from '@/stores/achats'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Interface pour les produits ajoutés au panier
interface ProduitAjoute {
  id: number
  product_id: number
  product_name: string
  en_stock: number
  quantite_ajoutee: number
  total: number
  selected: boolean
}

const props = defineProps<{
  open: boolean
  achat?: Achat | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: any]
}>()

const router = useRouter()

// Stores
const productsStore = useProductsStore()
const achatsStore = useAchatsStore()
const fournisseursStore = useFournisseursStore()

// Zone 1: Informations générales
const formData = ref({
  numero_piece: '',
  intitule: '',
  date: new Date().toISOString().split('T')[0],
  montant_facture: 0,
  nature_paiement: 'cash',
  fournisseur_id: 0,
  montant_verse: 0,
  date_limite: '',
  piece_jointe: null as File | null,
  piece_jointe_name: '',
})

// Zone 2: Contenu produit
const produitSelectionne = ref(0)
const quantiteAjoutee = ref(1)

// Zone 3: Liste des produits ajoutés
const produitsAjoutes = ref<ProduitAjoute[]>([])

const isEditing = ref(false)

// Générer le prochain code séquentiel (ACH-001, ACH-002, etc.)
const generateNextCode = (allReferences: string[]): string => {
  const existingCodes = allReferences
    .filter(ref => ref && ref.startsWith('ACH-'))
    .map(ref => parseInt(ref.replace('ACH-', '')) || 0)

  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
  const nextNumber = maxCode + 1
  return `ACH-${nextNumber.toString().padStart(3, '0')}`
}

// Computed: Afficher la date limite seulement si crédit
const showDateLimite = computed(() => formData.value.nature_paiement === 'credit')

// Computed: Montant total des produits
const montantTotal = computed(() => formData.value.montant_facture)

// Computed: Montant payé
const montantPaye = computed(() => formData.value.montant_verse)

// Computed: Montant restant
const montantRestant = computed(() => formData.value.montant_facture - formData.value.montant_verse)

// Computed: Produit sélectionné
const selectedProduct = computed(() => {
  return productsStore.products.find(p => p.id === produitSelectionne.value)
})

// Computed: Vérifier si les champs obligatoires de Zone 1 sont remplis
const isZone1Valid = computed(() => {
  return (
    formData.value.intitule.trim() !== '' &&
    formData.value.date !== '' &&
    formData.value.montant_facture > 0 &&
    formData.value.fournisseur_id > 0
  )
})

// Computed: Peut ajouter un produit (Zone 1 valide + produit et quantité sélectionnés)
const canAddProduct = computed(() => {
  return isZone1Valid.value && produitSelectionne.value > 0 && quantiteAjoutee.value > 0
})

// Charger les données au montage
onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
  if (fournisseursStore.fournisseurs.length === 0) {
    fournisseursStore.fetchFournisseurs()
  }
})

watch(() => props.open, async (newValue) => {
  if (newValue) {
    if (props.achat) {
      isEditing.value = true
      // Mode édition - à implémenter selon les besoins
    } else {
      isEditing.value = false
      // Récupérer toutes les références pour générer un code unique
      const allReferences = await achatsStore.fetchAllReferences()
      formData.value = {
        numero_piece: generateNextCode(allReferences),
        intitule: '',
        date: new Date().toISOString().split('T')[0],
        montant_facture: 0,
        nature_paiement: 'cash',
        fournisseur_id: fournisseursStore.fournisseurs[0]?.id || 0,
        montant_verse: 0,
        date_limite: '',
        piece_jointe: null,
        piece_jointe_name: '',
      }
      produitSelectionne.value = productsStore.products[0]?.id || 0
      quantiteAjoutee.value = 1
      produitsAjoutes.value = []
    }
  }
})

// Gestion du fournisseur
const handleFournisseurChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.fournisseur_id = parseInt(String(value))
  }
}

// Gestion du produit
const handleProduitChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    produitSelectionne.value = parseInt(String(value))
  }
}

// Gestion de la nature de paiement
const handleNaturePaiementChange = (value: unknown) => {
  if (value !== null && value !== undefined) {
    formData.value.nature_paiement = String(value) as 'cash' | 'credit'
    if (formData.value.nature_paiement === 'cash') {
      formData.value.date_limite = ''
    }
  }
}

// Gestion du fichier joint
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.value.piece_jointe = target.files[0]
    formData.value.piece_jointe_name = target.files[0].name
  }
}

// Ajouter un produit à la liste
const ajouterProduit = () => {
  if (!produitSelectionne.value || quantiteAjoutee.value <= 0) return

  const product = productsStore.products.find(p => p.id === produitSelectionne.value)
  if (!product) return

  // Vérifier si le produit existe déjà
  const existingIndex = produitsAjoutes.value.findIndex(p => p.product_id === product.id)
  if (existingIndex !== -1) {
    // Mettre à jour la quantité
    produitsAjoutes.value[existingIndex].quantite_ajoutee += quantiteAjoutee.value
    produitsAjoutes.value[existingIndex].total =
      produitsAjoutes.value[existingIndex].en_stock + produitsAjoutes.value[existingIndex].quantite_ajoutee
  } else {
    // Ajouter nouveau produit
    produitsAjoutes.value.push({
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      en_stock: product.current_stock || 0,
      quantite_ajoutee: quantiteAjoutee.value,
      total: (product.current_stock || 0) + quantiteAjoutee.value,
      selected: false,
    })
  }

  // Reset quantité
  quantiteAjoutee.value = 1
}

// Supprimer un produit de la liste
const supprimerProduit = (id: number) => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => p.id !== id)
}

// Toggle sélection produit
const toggleProduitSelection = (id: number, checked: boolean) => {
  const produit = produitsAjoutes.value.find(p => p.id === id)
  if (produit) {
    produit.selected = checked
  }
}

// Navigation vers création fournisseur
const allerCreerFournisseur = () => {
  emit('update:open', false)
  router.push('/fournisseurs/comptes')
}

// Navigation vers création produit
const allerCreerProduit = () => {
  emit('update:open', false)
  router.push('/produits')
}

// Formater un montant
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(montant)
}

// Formater une date
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Soumission du formulaire
const handleSubmit = () => {
  if (produitsAjoutes.value.length === 0) {
    alert('Veuillez ajouter au moins un produit')
    return
  }

  const data = {
    ...formData.value,
    produits: produitsAjoutes.value.map(p => ({
      product_id: p.product_id,
      quantity: p.quantite_ajoutee,
    })),
  }

  emit('submit', data)
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="w-[1289px] max-w-[95vw] p-0 gap-0 border border-[#0072C1] rounded-[10px] max-h-[95vh] overflow-y-auto">
      <!-- Header -->
      <div class="relative px-6 sm:px-10 pt-6 pb-5 border-b bg-gradient-to-r from-[#0769CF]/5 to-transparent">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-white border-2 border-[#0769CF] flex items-center justify-center shadow-sm">
            <Package class="w-6 h-6 text-[#0769CF]" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-[#535353]" style="font-family: Montserrat">
              {{ isEditing ? "Modifier l'opération" : "Opération d'achat" }}
            </h2>
            <p class="text-sm text-muted-foreground">Remplissez les informations pour enregistrer l'opération</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-6 sm:px-10 py-6">
        <!-- ZONE 1: Informations générales -->
        <div class="mb-8 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
          <h3 class="text-base font-semibold text-[#0769CF] mb-4 uppercase tracking-wide flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#0769CF] text-white text-xs flex items-center justify-center">1</span>
            Informations générales
          </h3>

          <!-- Ligne 1: N° pièce, Intitulé, Date -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <!-- N° pièce -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">N° pièce</label>
              <Input
                v-model="formData.numero_piece"
                disabled
                class="h-11 bg-gray-100 font-semibold text-base"
              />
            </div>

            <!-- Intitulé -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">
                Intitulé <span class="text-red-500">*</span>
              </label>
              <Input
                v-model="formData.intitule"
                placeholder="Intitulé de l'opération"
                class="h-11 text-base"
                :class="{ 'border-red-300': !formData.intitule.trim() && produitsAjoutes.length === 0 }"
              />
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Date</label>
              <div class="relative">
                <Input
                  v-model="formData.date"
                  type="date"
                  class="h-11 text-base"
                />
              </div>
            </div>
          </div>

          <!-- Ligne 2: Montant facture, Nature paiement, Fournisseur -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <!-- Montant facture -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">
                Montant facture <span class="text-red-500">*</span>
              </label>
              <Input
                v-model.number="formData.montant_facture"
                type="number"
                min="0"
                placeholder="0"
                class="h-11 text-base"
                :class="{ 'border-red-300': formData.montant_facture <= 0 && produitsAjoutes.length === 0 }"
              />
            </div>

            <!-- Nature paiement -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Nature paiement</label>
              <Select
                :model-value="formData.nature_paiement"
                @update:model-value="handleNaturePaiementChange"
              >
                <SelectTrigger class="h-11 text-base">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="cash">Paiement cash</SelectItem>
                    <SelectItem value="credit">Paiement crédit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <!-- Fournisseur -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">
                Fournisseur <span class="text-red-500">*</span>
              </label>
              <Select
                :model-value="formData.fournisseur_id.toString()"
                @update:model-value="handleFournisseurChange"
              >
                <SelectTrigger class="h-11 text-base">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="fournisseur in fournisseursStore.fournisseurs"
                      :key="fournisseur.id"
                      :value="fournisseur.id.toString()"
                    >
                      {{ fournisseur.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <button
                type="button"
                class="text-xs text-[#0769CF] hover:underline mt-1"
                @click="allerCreerFournisseur"
              >
                + Créer un fournisseur
              </button>
            </div>
          </div>

          <!-- Ligne 3: Montant versé, Date limite, Pièce jointe -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Montant versé -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Montant versé</label>
              <Input
                v-model.number="formData.montant_verse"
                type="number"
                min="0"
                placeholder="0"
                class="h-11 text-base"
              />
            </div>

            <!-- Date limite (visible seulement si crédit) -->
            <div v-if="showDateLimite">
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Date limite</label>
              <Input
                v-model="formData.date_limite"
                type="date"
                class="h-11 text-base"
              />
            </div>
            <div v-else></div>

            <!-- Pièce jointe -->
            <div>
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Pièce jointe</label>
              <div class="relative">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="h-11 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#0769CF] file:text-white cursor-pointer"
                  @change="handleFileChange"
                />
              </div>
              <p v-if="formData.piece_jointe_name" class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Paperclip class="w-3 h-3" />
                {{ formData.piece_jointe_name }}
              </p>
            </div>
          </div>
        </div>

        <!-- ZONE 2: Contenu produit -->
        <div class="mb-6 p-6 bg-blue-50/30 rounded-xl border border-blue-100">
          <h3 class="text-base font-semibold text-[#0769CF] mb-4 uppercase tracking-wide flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#0769CF] text-white text-xs flex items-center justify-center">2</span>
            Contenu produit
          </h3>

          <!-- Message d'avertissement si Zone 1 non valide -->
          <div v-if="!isZone1Valid" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-sm text-amber-700">
            <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">Veuillez remplir les champs obligatoires (Intitulé, Montant facture, Fournisseur) avant d'ajouter des produits.</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <!-- Produit -->
            <div class="md:col-span-6">
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Produit</label>
              <Select
                :model-value="produitSelectionne.toString()"
                @update:model-value="handleProduitChange"
              >
                <SelectTrigger class="h-11 text-base">
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="product in productsStore.products"
                      :key="product.id"
                      :value="product.id.toString()"
                    >
                      {{ product.reference }} - {{ product.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <button
                type="button"
                class="text-xs text-[#0769CF] hover:underline mt-1"
                @click="allerCreerProduit"
              >
                + Créer un produit
              </button>
            </div>

            <!-- Quantité -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-[#0E1420] mb-2">Quantité</label>
              <Input
                v-model.number="quantiteAjoutee"
                type="number"
                min="1"
                placeholder="1"
                class="h-11 text-base"
              />
            </div>

            <!-- Bouton Ajouter -->
            <div class="md:col-span-3">
              <Button
                type="button"
                class="w-full h-11 bg-[#0769CF] hover:bg-[#0558b0] text-base"
                @click="ajouterProduit"
                :disabled="!canAddProduct"
                :title="!isZone1Valid ? 'Veuillez remplir tous les champs obligatoires (Intitulé, Date, Montant facture, Fournisseur)' : ''"
              >
                <Plus class="w-5 h-5 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        <!-- Séparateur bleu -->
        <div class="h-1 bg-gradient-to-r from-[#0769CF] to-[#0769CF]/30 rounded-full mb-6"></div>

        <!-- ZONE 3: Tableau des produits -->
        <div class="mb-6">
          <h3 class="text-base font-semibold text-[#0769CF] mb-4 uppercase tracking-wide flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#0769CF] text-white text-xs flex items-center justify-center">3</span>
            Produits sélectionnés
          </h3>
          <div class="border-2 border-[#0769CF]/20 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader class="bg-[#0769CF]">
                <TableRow>
                  <TableHead class="text-white w-10"></TableHead>
                  <TableHead class="text-white">Produit</TableHead>
                  <TableHead class="text-white text-center">En stock</TableHead>
                  <TableHead class="text-white text-center">Ajoutée</TableHead>
                  <TableHead class="text-white text-center">Total</TableHead>
                  <TableHead class="text-white w-16 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="produit in produitsAjoutes" :key="produit.id">
                  <TableCell class="text-center">
                    <Checkbox
                      :checked="produit.selected"
                      @update:checked="(checked: boolean | 'indeterminate') => toggleProduitSelection(produit.id, checked === true)"
                    />
                  </TableCell>
                  <TableCell class="font-medium">{{ produit.product_name }}</TableCell>
                  <TableCell class="text-center">{{ produit.en_stock }}</TableCell>
                  <TableCell class="text-center text-[#0769CF] font-semibold">
                    +{{ produit.quantite_ajoutee }}
                  </TableCell>
                  <TableCell class="text-center font-semibold">{{ produit.total }}</TableCell>
                  <TableCell class="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      @click="supprimerProduit(produit.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="produitsAjoutes.length === 0">
                  <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                    Aucun produit ajouté
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- ZONE 4: Totaux -->
        <div class="mb-8">
          <h3 class="text-base font-semibold text-[#0769CF] mb-4 uppercase tracking-wide flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#0769CF] text-white text-xs flex items-center justify-center">4</span>
            Récapitulatif financier
          </h3>
          <div class="flex justify-end">
            <div class="w-full md:w-96 space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Montant Total</span>
                <span class="font-semibold text-lg">{{ formatMontant(montantTotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Montant payé</span>
                <span class="font-semibold text-lg text-green-600">{{ formatMontant(montantPaye) }}</span>
              </div>
              <div class="h-px bg-gray-300"></div>
              <div class="flex justify-between">
                <span class="text-base font-medium">Montant Restant</span>
                <span class="font-bold text-xl text-[#0769CF]">{{ formatMontant(montantRestant) }}</span>
              </div>
              <div v-if="showDateLimite && formData.date_limite" class="flex items-center gap-2 text-sm text-orange-600 mt-2 pt-2 border-t border-orange-200">
                <Calendar class="w-4 h-4" />
                <span>Date limite : {{ formatDate(formData.date_limite) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton Valider -->
        <div class="pb-6">
          <Button
            type="submit"
            :disabled="loading || produitsAjoutes.length === 0"
            class="w-full h-12 bg-[#0769CF] hover:bg-[#0558b0] text-white rounded-xl text-lg font-bold uppercase shadow-lg hover:shadow-xl transition-all"
            style="font-family: Montserrat"
          >
            {{ loading ? 'VALIDATION EN COURS...' : 'VALIDER L\'OPÉRATION' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
