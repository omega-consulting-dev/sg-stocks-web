<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DatePicker from '@/components/ui/date-picker/DatePicker.vue'
import {
  X,
  Upload,
  Users,
  Package,
  ChevronDown,
  Trash2,
} from 'lucide-vue-next'

interface Props {
  open: boolean
}

interface ProduitAjoute {
  id: number
  nom: string
  quantiteAjoutee: number
  enStock: number
  selected: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: any]
}>()

// Formulaire - Section 1: Operation d'achat
const numeroPiece = ref('')
const intitule = ref('')
const montantFacture = ref('')
const naturePayement = ref('')
const montantVerse = ref('')
const pieceJointe = ref<File | null>(null)
const dateAchat = ref(new Date())
const fournisseur = ref('')
const dateLimiteReglement = ref(new Date())

// Formulaire - Section 2: Contenue de l'achat
const produitSelectionne = ref('')
const quantiteAjoutee = ref('')
const produitsAjoutes = ref<ProduitAjoute[]>([
  { id: 1, nom: 'Bidon Fongi', quantiteAjoutee: 25, enStock: 5, selected: false },
  { id: 2, nom: 'Bidon Super', quantiteAjoutee: 20, enStock: 5, selected: false },
])

// Computed
const montantTotal = computed(() => {
  return produitsAjoutes.value.reduce((sum, p) => sum + (p.quantiteAjoutee + p.enStock), 0) * 1000
})

const montantRestant = computed(() => {
  const verse = parseFloat(montantVerse.value) || 0
  return montantTotal.value - verse
})

const selectAll = ref(false)

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value
  produitsAjoutes.value.forEach(p => p.selected = selectAll.value)
}

const ajouterProduit = () => {
  if (!produitSelectionne.value || !quantiteAjoutee.value) return

  const newProduct: ProduitAjoute = {
    id: produitsAjoutes.value.length + 1,
    nom: produitSelectionne.value,
    quantiteAjoutee: parseInt(quantiteAjoutee.value),
    enStock: 0,
    selected: false,
  }

  produitsAjoutes.value.push(newProduct)
  produitSelectionne.value = ''
  quantiteAjoutee.value = ''
}

const supprimerSelectionnes = () => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => !p.selected)
  selectAll.value = false
}

const supprimerProduit = (id: number) => {
  produitsAjoutes.value = produitsAjoutes.value.filter(p => p.id !== id)
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    pieceJointe.value = target.files[0]
  }
}

const handleSubmit = () => {
  const data = {
    numeroPiece: numeroPiece.value,
    intitule: intitule.value,
    montantFacture: parseFloat(montantFacture.value),
    naturePayement: naturePayement.value,
    montantVerse: parseFloat(montantVerse.value),
    pieceJointe: pieceJointe.value,
    dateAchat: dateAchat.value,
    fournisseur: fournisseur.value,
    dateLimiteReglement: dateLimiteReglement.value,
    produits: produitsAjoutes.value,
  }

  emit('submit', data)
  handleClose()
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-[1320px] w-[95vw] max-h-[95vh] overflow-y-auto p-0">
      <div class="relative">
        <!-- Bouton fermer -->
        <Button
          @click="handleClose"
          variant="ghost"
          size="icon"
          class="absolute right-4 top-4 z-10"
        >
          <X class="h-6 w-6" />
        </Button>

        <!-- Section 1: Operation d'achat -->
        <div class="border border-[#0072C1] rounded-[10px] m-6 p-8 bg-white">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
              <Package class="h-6 w-6 text-gray-600" />
            </div>
            <h2 class="text-[21.76px] font-bold text-[#3D3D3D]">Operation d'achat</h2>
          </div>

          <div class="grid grid-cols-2 gap-x-12 gap-y-6">
            <!-- N° de la pièce -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                N° de la piece (Obligatoire) :
              </Label>
              <Input
                v-model="numeroPiece"
                placeholder="No référence"
                class="mt-2 h-[37px] border-[#BEBEBE] rounded-[10px]"
              />
            </div>

            <!-- Date de réalisation -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Date de réalisation de l'achat
              </Label>
              <DatePicker
                v-model="dateAchat"
                placeholder="JJ/mm/aaaa"
                class="mt-2 w-full"
              />
            </div>

            <!-- Intitulé de l'opération -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Intitulé de l'opération (Obligatoire) :
              </Label>
              <div class="relative mt-2">
                <Input
                  v-model="intitule"
                  placeholder="Ex : Achat de Marchandises"
                  class="h-[37px] border-[#BEBEBE] rounded-[10px] pl-10"
                />
                <Package class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <!-- Sélectionner le Fournisseur -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Sélectionner le Fournisseur :
              </Label>
              <div class="relative mt-2">
                <Select v-model="fournisseur">
                  <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] pl-10">
                    <SelectValue placeholder="Liste des Fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">nova plastique Sarl</SelectItem>
                    <SelectItem value="graphic">graphic design</SelectItem>
                    <SelectItem value="zone">zone sarl</SelectItem>
                  </SelectContent>
                </Select>
                <Users class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[18.76px] text-[#0E1420]">Le fournisseur n'existe pas encore ?</span>
                <Button
                  variant="ghost"
                  class="h-[37px] px-4 bg-[#E4E4E6] text-[#7C7C7C] rounded-[10px] hover:bg-[#E4E4E6]/80"
                >
                  Créer ici
                </Button>
              </div>
            </div>

            <!-- Montant de la facture -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Montant de la facture :
              </Label>
              <Input
                v-model="montantFacture"
                type="number"
                placeholder="Ex : douala Deido"
                class="mt-2 h-[37px] border-[#BEBEBE] rounded-[10px]"
              />
            </div>

            <!-- Nature du payement -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Nature du payement :
              </Label>
              <Select v-model="naturePayement" class="mt-2">
                <SelectTrigger class="h-[36px] border-[#BEBEBE] rounded-[10px]">
                  <SelectValue placeholder="Selectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="espece">Espèce</SelectItem>
                  <SelectItem value="credit">Crédit</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Montant Versé -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">
                Montant Versé (Obligatoire) :
              </Label>
              <Input
                v-model="montantVerse"
                type="number"
                placeholder="Ex : douala Deido"
                class="mt-2 h-[37px] border-[#BEBEBE] rounded-[10px]"
              />
            </div>

            <!-- Date limite de règlement -->
            <div v-if="naturePayement === 'credit'">
              <Label class="text-[18.76px] text-[#0E1420]">
                Date limite de reglement (Obligatoire) : si nat = credit
              </Label>
              <DatePicker
                v-model="dateLimiteReglement"
                placeholder="JJ/mm/aaaa"
                class="mt-2 w-full"
              />
            </div>

            <!-- Pièce jointe -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">Piece jointe</Label>
              <div class="mt-2 h-[64px] border border-dashed border-[#BEBEBE] rounded-[10px] bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#D9D9D9]/80">
                <input
                  type="file"
                  @change="handleFileUpload"
                  class="hidden"
                  id="file-upload"
                />
                <label for="file-upload" class="flex items-center gap-2 cursor-pointer">
                  <Upload class="h-5 w-5 text-gray-600" />
                  <span class="text-sm text-gray-600">
                    {{ pieceJointe ? pieceJointe.name : 'Cliquer pour télécharger' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Contenue de l'achat -->
        <div class="border-0 rounded-[10px] mx-6 mb-6 p-8 bg-white">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
              <Package class="h-6 w-6 text-gray-600" />
            </div>
            <h2 class="text-[21.76px] font-bold text-[#3D3D3D]">Contenue de l'achat</h2>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <!-- Produit -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">Produit :</Label>
              <div class="relative mt-2">
                <Select v-model="produitSelectionne">
                  <SelectTrigger class="h-[37px] border-[#BEBEBE] rounded-[10px] pl-10">
                    <SelectValue placeholder="Liste des produits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bidon-fongi">Bidon Fongi</SelectItem>
                    <SelectItem value="bidon-super">Bidon Super</SelectItem>
                    <SelectItem value="bidon-autre">Autre bidon</SelectItem>
                  </SelectContent>
                </Select>
                <Package class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[18.76px] text-[#0E1420]">Le produit n'existe pas encore ?</span>
                <Button
                  variant="ghost"
                  class="h-[37px] px-4 bg-[#E4E4E6] text-[#7C7C7C] rounded-[10px] hover:bg-[#E4E4E6]/80"
                >
                  Créer ici
                </Button>
              </div>
            </div>

            <!-- Quantité ajoutée -->
            <div>
              <Label class="text-[18.76px] text-[#0E1420]">Quantité ajoutée :</Label>
              <div class="relative mt-2">
                <Input
                  v-model="quantiteAjoutee"
                  type="number"
                  placeholder="Ex : 50"
                  class="h-[37px] border-[#BEBEBE] rounded-[10px] pl-10"
                />
                <Package class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <!-- Bouton Ajouter -->
            <div class="flex items-end">
              <Button
                @click="ajouterProduit"
                class="h-[37px] px-8 bg-[#474747] text-white rounded-[10px] hover:bg-[#474747]/90 font-bold text-sm uppercase"
              >
                Ajouter
              </Button>
            </div>
          </div>

          <!-- Séparateur -->
          <div class="border-t border-[#003FD8] my-8"></div>

          <!-- Liste des produits achetés -->
          <h3 class="text-[21.76px] font-bold text-[#3D3D3D] mb-4">
            Liste des produits achetés
          </h3>

          <!-- Tableau -->
          <div class="bg-[#FFFEFF] border border-[#007ACE] rounded-md overflow-hidden">
            <!-- Header -->
            <div class="bg-[#0769CF] text-white flex items-center p-3">
              <div class="w-12 flex items-center justify-center">
                <input
                  type="checkbox"
                  :checked="selectAll"
                  @change="toggleSelectAll"
                  class="w-5 h-5 rounded border-[#D9D9D9]"
                />
              </div>
              <div class="flex-1 font-normal text-[18.76px]">Produit</div>
              <div class="w-32 font-normal text-[18.76px]">Ajoutée</div>
              <div class="w-32 font-normal text-[18.76px]">En stock</div>
              <div class="w-32 font-normal text-[18.76px]">Total</div>
              <div class="w-32 font-normal text-[18.76px]">Action</div>
            </div>

            <!-- Lignes -->
            <div
              v-for="(produit, index) in produitsAjoutes"
              :key="produit.id"
              :class="[
                'flex items-center p-3 border-b border-[rgba(0,0,0,0.37)]',
                index % 2 === 0 ? 'bg-[rgba(178,217,252,0.59)]' : 'bg-[rgba(178,217,252,0.59)]'
              ]"
            >
              <div class="w-12 flex items-center justify-center">
                <input
                  type="checkbox"
                  v-model="produit.selected"
                  class="w-5 h-5 rounded border-[rgba(0,0,0,0.2)]"
                />
              </div>
              <div class="flex-1 text-[18.76px] text-black">{{ produit.nom }}</div>
              <div class="w-32 text-[18.76px] text-black">{{ produit.quantiteAjoutee }}</div>
              <div class="w-32 text-[18.76px] text-black">{{ produit.enStock }}</div>
              <div class="w-32 text-[18.76px] text-black">
                {{ produit.quantiteAjoutee + produit.enStock }}
              </div>
              <div class="w-32">
                <Button
                  @click="supprimerProduit(produit.id)"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                >
                  <Trash2 class="h-5 w-5 text-[#F52F2F]" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Bouton Supprimer sélectionnés -->
          <div class="flex justify-end mt-4">
            <Button
              @click="supprimerSelectionnes"
              variant="outline"
              class="h-[37px] px-4 border border-[rgba(7,105,207,0.23)] text-[#0769CF] rounded-[10px]"
            >
              Supprimer
            </Button>
          </div>
        </div>

        <!-- Footer avec totaux et bouton Valider -->
        <div class="mx-6 mb-6 p-6 bg-white rounded-[10px]">
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <div class="flex items-center gap-8">
                <span class="text-[29.76px] font-bold text-black">Montant Total:</span>
                <span class="text-[29.76px] font-bold text-black">{{ montantTotal.toFixed(2) }}</span>
              </div>
              <div class="border-t border-[#929090] my-2"></div>
              <div class="flex items-center gap-8">
                <span class="text-[29.76px] font-bold text-black">Montant payé:</span>
                <span class="text-[29.76px] font-bold text-black">{{ montantVerse || '0.00' }}</span>
              </div>
              <div class="border-t border-[#929090] my-2"></div>
              <div class="flex items-center gap-8">
                <span class="text-[29.76px] font-bold text-black">Montant Restant:</span>
                <span class="text-[29.76px] font-bold text-black">{{ montantRestant.toFixed(2) }}</span>
              </div>
              <div class="border-t border-[#929090] my-2"></div>
              <p v-if="naturePayement === 'credit'" class="text-[16.76px] text-[#8F8F8F] mt-4">
                avant le {{ dateLimiteReglement ? new Date(dateLimiteReglement).toLocaleDateString('fr-FR') : '' }}
              </p>
            </div>

            <Button
              @click="handleSubmit"
              class="h-[37px] px-12 bg-[#0769CF] text-white rounded-[10px] hover:bg-[#0769CF]/90 font-bold text-sm uppercase"
            >
              Valider
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
