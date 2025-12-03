<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAchatsStore } from '@/stores/achats'
import { useProductsStore } from '@/stores/products'
import { useFournisseursStore } from '@/stores/fournisseurs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Users, Package, Trash2, X, FileText, RefreshCw } from 'lucide-vue-next'

const router = useRouter()
const achatsStore = useAchatsStore()
const productsStore = useProductsStore()
const fournisseursStore = useFournisseursStore()

// Interface pour les produits ajoutés
interface ProduitAjoute {
  id: number
  product_id: number
  nom: string
  enStock: number
  quantiteAjoutee: number
  total: number
  selected: boolean
}

// ========== ZONE 1 : Informations générales ==========
const numeroPiece = ref('')
const intitule = ref('')
const dateAchat = ref(new Date().toISOString().split('T')[0])
const montantFacture = ref<number | null>(null)
const naturePayement = ref('')
const fournisseurId = ref<number | null>(null)
const montantVerse = ref<number | null>(null)
const dateLimiteReglement = ref('')
const pieceJointe = ref<File | null>(null)
const pieceJointeName = ref('')

// ========== ZONE 2 : Contenu de l'achat ==========
const produitSelectionne = ref<number | null>(null)
const quantiteAjoutee = ref<number | null>(null)

// ========== ZONE 3 : Liste des produits ==========
const produitsAjoutes = ref<ProduitAjoute[]>([])

// ========== Computed ==========

// Afficher date limite seulement si crédit
const showDateLimite = computed(() => naturePayement.value === 'credit')

// Montant Total
const montantTotal = computed(() => montantFacture.value || 0)

// Montant payé
const montantPaye = computed(() => montantVerse.value || 0)

// Montant Restant
const montantRestant = computed(() => montantTotal.value - montantPaye.value)

// Produits sélectionnés pour suppression
const hasSelectedProducts = computed(() => produitsAjoutes.value.some(p => p.selected))

// Validation Zone 1
const isZone1Valid = computed(() => {
  return (
    numeroPiece.value.trim() !== '' &&
    intitule.value.trim() !== '' &&
    montantVerse.value !== null && montantVerse.value >= 0
  )
})

// Peut ajouter un produit
const canAddProduct = computed(() => {
  return produitSelectionne.value !== null && quantiteAjoutee.value !== null && quantiteAjoutee.value > 0
})

// ========== Lifecycle ==========
onMounted(async () => {
  if (productsStore.products.length === 0) {
    await productsStore.fetchProducts()
  }
  if (fournisseursStore.fournisseurs.length === 0) {
    await fournisseursStore.fetchFournisseurs()
  }
  // Générer N° pièce automatique
  const allReferences = await achatsStore.fetchAllReferences()
  numeroPiece.value = generateNextCode(allReferences)
})

// ========== Méthodes ==========

// Générer le prochain code séquentiel
const generateNextCode = (allReferences: string[]): string => {
  const existingCodes = allReferences
    .filter(ref => ref && ref.startsWith('ACH-'))
    .map(ref => parseInt(ref.replace('ACH-', '')) || 0)
  const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
  return `ACH-${(maxCode + 1).toString().padStart(3, '0')}`
}

// Gestion changements
const handleNaturePayementChange = (value: string) => {
  naturePayement.value = value
  if (value !== 'credit') {
    dateLimiteReglement.value = ''
  }
}

const handleFournisseurChange = (value: string) => {
  fournisseurId.value = parseInt(value)
}

const handleProduitChange = (value: string) => {
  produitSelectionne.value = parseInt(value)
}

// Upload fichier
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    pieceJointe.value = target.files[0]
    pieceJointeName.value = target.files[0].name
  }
}

// Ajouter produit au tableau
const ajouterProduit = () => {
  if (!canAddProduct.value) return

  const product = productsStore.products.find(p => p.id === produitSelectionne.value)
  if (!product) return

  // Vérifier si produit déjà dans la liste
  const existingIndex = produitsAjoutes.value.findIndex(p => p.product_id === product.id)
  if (existingIndex !== -1) {
    produitsAjoutes.value[existingIndex].quantiteAjoutee += quantiteAjoutee.value!
    produitsAjoutes.value[existingIndex].total =
      produitsAjoutes.value[existingIndex].enStock + produitsAjoutes.value[existingIndex].quantiteAjoutee
  } else {
    produitsAjoutes.value.push({
      id: Date.now(),
      product_id: product.id,
      nom: product.name,
      enStock: product.current_stock || 0,
      quantiteAjoutee: quantiteAjoutee.value!,
      total: (product.current_stock || 0) + quantiteAjoutee.value!,
      selected: false,
    })
  }

  // Reset
  produitSelectionne.value = null
  quantiteAjoutee.value = null
}

// Supprimer un produit
const supprimerProduit = (id: number) => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => p.id !== id)
}

// Supprimer les produits sélectionnés
const supprimerSelectionnes = () => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => !p.selected)
}

// Toggle sélection produit
const toggleProduitSelection = (id: number, checked: boolean) => {
  const produit = produitsAjoutes.value.find(p => p.id === id)
  if (produit) {
    produit.selected = checked
  }
}

// Navigation
const allerCreerFournisseur = () => {
  router.push('/fournisseurs/comptes')
}

const allerCreerProduit = () => {
  router.push('/produits')
}

const handleClose = () => {
  router.push('/achats/entree-stock')
}

// Formatage
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Validation et soumission
const handleSubmit = async () => {
  // Validation
  if (!numeroPiece.value.trim()) {
    alert('Le N° de la pièce est obligatoire')
    return
  }
  if (!intitule.value.trim()) {
    alert("L'intitulé de l'opération est obligatoire")
    return
  }
  if (montantVerse.value === null) {
    alert('Le montant versé est obligatoire')
    return
  }
  if (showDateLimite.value && !dateLimiteReglement.value) {
    alert('La date limite de règlement est obligatoire pour un paiement à crédit')
    return
  }
  if (produitsAjoutes.value.length === 0) {
    alert('Veuillez ajouter au moins un produit')
    return
  }

  try {
    // Créer les entrées de stock pour chaque produit
    for (const produit of produitsAjoutes.value) {
      await achatsStore.addAchat({
        product: produit.product_id,
        store: 1,
        quantity: produit.quantiteAjoutee,
        reference: numeroPiece.value,
        notes: `${intitule.value} - Fournisseur ID: ${fournisseurId.value}`,
      })
    }

    router.push('/achats/entree-stock')
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
  }
}
</script>

<template>
  <div class="flex-1 p-6 bg-gray-50 min-h-screen">
    <!-- Container principal -->
    <div class="relative w-[1100px] max-w-full mx-auto">

      <!-- Bouton fermer X -->
      <Button
        @click="handleClose"
        variant="ghost"
        size="icon"
        class="absolute -right-2 -top-2 z-10 bg-white shadow-md rounded-full hover:bg-gray-100"
      >
        <X class="h-5 w-5 text-gray-500" />
      </Button>

      <!-- ========== ZONE 1 : Opération d'achat ========== -->
      <div class="bg-white border border-[#0072C1] rounded-[10px] p-6 mb-6">
        <!-- Header Zone 1 -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 rounded-full bg-[#EEEEEE] flex items-center justify-center">
            <Users class="w-5 h-5 text-gray-600" />
          </div>
          <h2 class="text-xl font-semibold text-[#212121]">Opération d'achat</h2>
        </div>

        <!-- Grille 3 colonnes -->
        <div class="grid grid-cols-3 gap-x-5 gap-y-4">

          <!-- Ligne 1 -->
          <!-- N° de la pièce -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              N° de la piece <span class="text-[#F44336]">(Obligatoire)</span> :
            </label>
            <Input
              v-model="numeroPiece"
              placeholder="No référence"
              class="h-10 border-[#E0E0E0] rounded-md"
            />
          </div>

          <!-- Intitulé de l'opération -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Intitulé de l'opération <span class="text-[#F44336]">(Obligatoire)</span> :
            </label>
            <div class="relative">
              <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                v-model="intitule"
                placeholder="Ex : Achat de Marchandises"
                class="h-10 pl-10 border-[#E0E0E0] rounded-md"
              />
            </div>
          </div>

          <!-- Date de réalisation -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Date de réalisation de l'achat :
            </label>
            <Input
              v-model="dateAchat"
              type="date"
              class="h-10 border-[#E0E0E0] rounded-md"
            />
          </div>

          <!-- Ligne 2 -->
          <!-- Montant de la facture -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Montant de la facture :
            </label>
            <Input
              v-model.number="montantFacture"
              type="number"
              placeholder="Ex : 50000"
              class="h-10 border-[#E0E0E0] rounded-md"
            />
          </div>

          <!-- Nature du payement -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Nature du payement :
            </label>
            <div class="relative">
              <RefreshCw class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
              <Select :model-value="naturePayement" @update:model-value="handleNaturePayementChange">
                <SelectTrigger class="h-10 pl-10 border-[#E0E0E0] rounded-md">
                  <SelectValue placeholder="Selectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comptant">Comptant</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Sélectionner le Fournisseur -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Sélectionner le Fournisseur :
            </label>
            <div class="relative">
              <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
              <Select :model-value="fournisseurId?.toString() || ''" @update:model-value="handleFournisseurChange">
                <SelectTrigger class="h-10 pl-10 border-[#E0E0E0] rounded-md">
                  <SelectValue placeholder="Liste des Fournisseurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="f in fournisseursStore.fournisseurs"
                    :key="f.id"
                    :value="f.id.toString()"
                  >
                    {{ f.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Ligne 3 -->
          <!-- Montant Versé -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Montant Versé <span class="text-[#F44336]">(Obligatoire)</span> :
            </label>
            <Input
              v-model.number="montantVerse"
              type="number"
              placeholder="Ex : 50000"
              class="h-10 border-[#E0E0E0] rounded-md"
            />
          </div>

          <!-- Date limite de reglement -->
          <div>
            <label class="block text-sm font-medium text-[#0E1420] mb-1">
              Date limite de reglement
              <span v-if="showDateLimite" class="text-[#F44336]">(Obligatoire)</span>
              <span class="text-gray-400 text-xs ml-1">si crédit</span>
            </label>
            <Input
              v-model="dateLimiteReglement"
              type="date"
              class="h-10 border-[#E0E0E0] rounded-md"
            />
          </div>

          <!-- Le fournisseur n'existe pas encore ? -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              Le fournisseur n'existe pas encore ?
            </label>
            <Button
              @click="allerCreerFournisseur"
              variant="ghost"
              class="w-full h-10 bg-[#EEEEEE] text-[#424242] rounded-md hover:bg-[#E0E0E0]"
            >
              Créer ici
            </Button>
          </div>

          <!-- Ligne 4 -->
          <!-- Piece jointe -->
          <div>
            <label class="block text-sm font-semibold text-[#0E1420] mb-1">
              Piece jointe
            </label>
            <div
              class="w-[200px] h-[80px] bg-[#424242] rounded-md flex items-center justify-center cursor-pointer hover:bg-[#616161] transition-colors"
            >
              <input
                type="file"
                @change="handleFileUpload"
                class="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <label for="file-upload" class="flex flex-col items-center gap-1 cursor-pointer text-white">
                <Upload class="h-5 w-5" />
                <span class="text-xs">
                  {{ pieceJointeName || 'Télécharger' }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== ZONE 2 : Contenu de l'achat ========== -->
      <div class="bg-white rounded-[10px] p-6 mb-6">
        <!-- Header Zone 2 -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 rounded-full bg-[#EEEEEE] flex items-center justify-center">
            <Package class="w-5 h-5 text-gray-600" />
          </div>
          <h2 class="text-lg font-semibold text-[#212121]">Contenu de l'achat</h2>
        </div>

        <!-- Grille champs -->
        <div class="flex items-end gap-5">
          <!-- Produit -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-[#0E1420] mb-1">Produit :</label>
            <div class="relative">
              <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
              <Select :model-value="produitSelectionne?.toString() || ''" @update:model-value="handleProduitChange">
                <SelectTrigger class="h-10 pl-10 border-[#E0E0E0] rounded-md">
                  <SelectValue placeholder="Liste des produits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="p in productsStore.products"
                    :key="p.id"
                    :value="p.id.toString()"
                  >
                    {{ p.reference }} - {{ p.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Le produit n'existe pas encore ? -->
          <div class="w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">
              Le produit n'existe pas encore ?
            </label>
            <Button
              @click="allerCreerProduit"
              variant="ghost"
              class="w-full h-10 bg-[#BDBDBD] text-[#424242] rounded-md hover:bg-[#9E9E9E]"
            >
              Créer ici
            </Button>
          </div>

          <!-- Quantité ajoutée -->
          <div class="w-[200px]">
            <label class="block text-sm font-medium text-[#0E1420] mb-1">Quantité ajoutée :</label>
            <div class="relative">
              <Package class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                v-model.number="quantiteAjoutee"
                type="number"
                placeholder="Ex : 50"
                min="1"
                class="h-10 pl-10 border-[#E0E0E0] rounded-md"
              />
            </div>
          </div>

          <!-- Bouton AJOUTER -->
          <Button
            @click="ajouterProduit"
            :disabled="!canAddProduct"
            class="h-10 px-8 bg-[#424242] text-white rounded-md hover:bg-[#616161] uppercase font-semibold"
          >
            Ajouter
          </Button>
        </div>
      </div>

      <!-- ========== SÉPARATEUR BLEU ========== -->
      <div class="h-[2px] bg-[#1976D2] my-6"></div>

      <!-- ========== ZONE 3 : Liste des produits achetés ========== -->
      <div class="bg-white rounded-[10px] p-6 mb-6">
        <!-- Header Zone 3 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-[#212121]">Liste des produits achetés</h3>
          <Button
            @click="supprimerSelectionnes"
            :disabled="!hasSelectedProducts"
            variant="outline"
            class="h-9 px-4 border-[#1976D2] text-[#1976D2] rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Supprimer
          </Button>
        </div>

        <!-- Tableau -->
        <div class="overflow-hidden rounded-t-lg">
          <!-- Header tableau -->
          <div class="grid grid-cols-[50px_1fr_1fr_1fr_1fr_80px] bg-[#1976D2] text-white font-semibold">
            <div class="p-3 flex items-center justify-center"></div>
            <div class="p-3 text-center">Produit</div>
            <div class="p-3 text-center">En stock</div>
            <div class="p-3 text-center">Ajoutée</div>
            <div class="p-3 text-center">Total</div>
            <div class="p-3 text-center">Action</div>
          </div>

          <!-- Body tableau -->
          <div v-if="produitsAjoutes.length > 0">
            <div
              v-for="(produit, index) in produitsAjoutes"
              :key="produit.id"
              class="grid grid-cols-[50px_1fr_1fr_1fr_1fr_80px] text-[#424242]"
              :class="index % 2 === 0 ? 'bg-[#E3F2FD]' : 'bg-[#BBDEFB]'"
            >
              <div class="p-3 flex items-center justify-center">
                <Checkbox
                  :checked="produit.selected"
                  @update:checked="(checked: boolean | 'indeterminate') => toggleProduitSelection(produit.id, checked === true)"
                  class="border-[#BDBDBD]"
                />
              </div>
              <div class="p-3 text-center">{{ produit.nom }}</div>
              <div class="p-3 text-center">{{ produit.enStock }}</div>
              <div class="p-3 text-center">{{ produit.quantiteAjoutee }}</div>
              <div class="p-3 text-center font-medium">{{ produit.total }}</div>
              <div class="p-3 flex items-center justify-center">
                <button
                  @click="supprimerProduit(produit.id)"
                  class="text-[#F44336] hover:text-red-700 cursor-pointer"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Aucun produit -->
          <div v-else class="bg-[#E3F2FD] p-8 text-center text-gray-500">
            Aucun produit ajouté
          </div>
        </div>
      </div>

      <!-- ========== ZONE 4 : Récapitulatif financier ========== -->
      <div class="flex justify-end mb-6">
        <div class="w-[350px]">
          <!-- Montant Total -->
          <div class="flex justify-between items-center py-3">
            <span class="text-lg font-semibold text-emerald-600">Montant Total:</span>
            <span class="text-lg font-bold text-emerald-600">{{ formatMontant(montantTotal) }}</span>
          </div>
          <div class="h-px bg-[#E0E0E0]"></div>

          <!-- Montant payé -->
          <div class="flex justify-between items-center py-3">
            <span class="text-lg font-medium text-[#757575]">Montant payé:</span>
            <span class="text-lg font-semibold text-[#424242]">{{ formatMontant(montantPaye) }}</span>
          </div>
          <div class="h-px bg-[#E0E0E0]"></div>

          <!-- Montant Restant -->
          <div class="flex justify-between items-center py-3">
            <span class="text-lg font-semibold text-[#F44336]">Montant Restant:</span>
            <span class="text-lg font-bold text-[#F44336]">{{ formatMontant(montantRestant) }}</span>
          </div>
          <div class="h-px bg-[#E0E0E0]"></div>

          <!-- Date limite -->
          <p v-if="dateLimiteReglement" class="text-right text-sm text-[#9E9E9E] italic mt-3">
            avant le {{ formatDate(dateLimiteReglement) }}
          </p>
        </div>
      </div>

      <!-- ========== BOUTON VALIDER ========== -->
      <div class="flex justify-end">
        <Button
          @click="handleSubmit"
          :disabled="achatsStore.loading"
          class="h-12 px-12 bg-[#1976D2] text-white rounded-lg hover:bg-[#1565C0] uppercase font-semibold text-base"
        >
          {{ achatsStore.loading ? 'Validation...' : 'Valider' }}
        </Button>
      </div>

    </div>
  </div>
</template>
