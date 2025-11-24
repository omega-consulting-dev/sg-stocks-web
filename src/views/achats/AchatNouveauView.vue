<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAchatsStore } from '@/stores/achats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Users, Package, Trash2, X } from 'lucide-vue-next'

const router = useRouter()
const store = useAchatsStore()

interface ProduitAjoute {
  id: number
  nom: string
  quantiteAjoutee: number
  enStock: number
  selected: boolean
}

// Formulaire - Section 1: Operation d'achat
const numeroPiece = ref('')
const intitule = ref('')
const montantFacture = ref('')
const naturePayement = ref('')
const montantVerse = ref('')
const pieceJointe = ref<File | null>(null)
const dateAchat = ref('')
const fournisseur = ref('')
const dateLimiteReglement = ref('')

// Formulaire - Section 2: Contenue de l'achat
const produitSelectionne = ref('')
const quantiteAjoutee = ref('')
const produitsAjoutes = ref<ProduitAjoute[]>([
  { id: 1, nom: 'Bidon Fongi', quantiteAjoutee: 25, enStock: 5, selected: false },
  { id: 2, nom: 'Bidon Super', quantiteAjoutee: 20, enStock: 5, selected: false },
])

// Computed
const montantTotal = computed(() => {
  return produitsAjoutes.value.reduce((sum, p) => sum + (p.quantiteAjoutee + p.enStock) * 1000, 0)
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

const handleSubmit = async () => {
  try {
    await store.addAchat({
      intitule: intitule.value,
      dateAchat: new Date(dateAchat.value),
      montantFacture: parseFloat(montantFacture.value),
      nbreProduits: produitsAjoutes.value.length,
      fournisseur: fournisseur.value,
    })
    router.push('/achats/entree-stock')
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
  }
}

const handleCancel = () => {
  router.push('/achats/entree-stock')
}
</script>

<template>
  <div class="flex-1 p-8">
    <!-- Container principal avec largeur fixe -->
    <div class="relative w-[1289px] mx-auto">
      <!-- Bouton fermer en haut à droite -->
      <Button
        @click="handleCancel"
        variant="ghost"
        size="icon"
        class="absolute -right-12 top-0 z-10"
      >
        <X class="h-6 w-6" />
      </Button>

      <!-- Section 1: Operation d'achat -->
      <div class="relative w-[1289px] h-[481px] bg-white border border-[#0072C1] rounded-[10px] mb-6">
        <!-- Icône -->
        <div class="absolute left-[30px] top-[27px] w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
          <Package class="w-[26px] h-[26px] text-gray-600" />
        </div>

        <!-- Titre -->
        <h2 class="absolute left-[95px] top-[36px] text-[21.76px] font-bold text-[#3D3D3D]">
          Operation d'achat
        </h2>

        <!-- N° de la pièce -->
        <div class="absolute left-[42px] top-[93px]">
          <label class="text-[18.76px] text-[#0E1420]">N* de la piece (Obligatoire) :</label>
        </div>
        <Input
          v-model="numeroPiece"
          placeholder="No référence"
          class="absolute left-[42px] top-[134px] w-[367px] h-[37px] border-[#BEBEBE] rounded-[10px]"
        />

        <!-- Intitulé de l'opération -->
        <div class="absolute left-[463px] top-[91px]">
          <label class="text-[18.76px] text-[#0E1420]">Intitulé de l'opération (Obligatoire) :</label>
        </div>
        <div class="absolute left-[463px] top-[132px] w-[367px] h-[37px]">
          <Package class="absolute left-[8px] top-[8px] w-5 h-5 text-gray-500 z-10" />
          <Input
            v-model="intitule"
            placeholder="Ex : Achat de Marchandises"
            class="w-full h-full pl-10 border-[#BEBEBE] rounded-[10px]"
          />
        </div>

        <!-- Montant de la facture -->
        <div class="absolute left-[46px] top-[177px]">
          <label class="text-[18.76px] text-[#0E1420]">Montant de la facture :</label>
        </div>
        <Input
          v-model="montantFacture"
          type="number"
          placeholder="Ex : douala Deido"
          class="absolute left-[46px] top-[220px] w-[363px] h-[37px] border-[#BEBEBE] rounded-[10px]"
        />

        <!-- Nature du payement -->
        <div class="absolute left-[463px] top-[177px]">
          <label class="text-[18.76px] text-[#0E1420]">Nature du payement :</label>
        </div>
        <Select v-model="naturePayement">
          <SelectTrigger class="absolute left-[463px] top-[221px] w-[367px] h-[36px] border-[#BEBEBE] rounded-[10px]">
            <SelectValue placeholder="Selectionner une méthode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="espece">Espèce</SelectItem>
            <SelectItem value="credit">Crédit</SelectItem>
            <SelectItem value="cheque">Chèque</SelectItem>
            <SelectItem value="virement">Virement</SelectItem>
          </SelectContent>
        </Select>

        <!-- Montant Versé -->
        <div class="absolute left-[46px] top-[268px]">
          <label class="text-[18.76px] text-[#0E1420]">Montant Versé (Obligatoire) :</label>
        </div>
        <Input
          v-model="montantVerse"
          type="number"
          placeholder="Ex : douala Deido"
          class="absolute left-[46px] top-[307px] w-[363px] h-[37px] border-[#BEBEBE] rounded-[10px]"
        />

        <!-- Date limite de règlement (si crédit) -->
        <div v-if="naturePayement === 'credit'" class="absolute left-[467px] top-[264px]">
          <label class="text-[18.76px] text-[#0E1420]">Date limite de reglement (Obligatoire) : si nat = credit</label>
        </div>
        <input
          v-if="naturePayement === 'credit'"
          v-model="dateLimiteReglement"
          type="date"
          placeholder="JJ/mm/aaaa"
          class="absolute left-[463px] top-[307px] w-[367px] h-[37px] px-4 border border-[#BEBEBE] rounded-[10px]"
        />

        <!-- Pièce jointe -->
        <div class="absolute left-[46px] top-[351px]">
          <label class="text-[18.76px] text-[#0E1420]">Piece jointe</label>
        </div>
        <div class="absolute left-[53px] top-[390px] w-[225px] h-[64px] border border-[#D9D9D9] bg-[#D9D9D9] rounded-[10px] flex items-center justify-center cursor-pointer">
          <input
            type="file"
            @change="handleFileUpload"
            class="hidden"
            id="file-upload"
          />
          <label for="file-upload" class="flex items-center gap-2 cursor-pointer">
            <Upload class="h-5 w-5 text-gray-600" />
            <span class="text-sm text-gray-600">
              {{ pieceJointe ? pieceJointe.name : 'Télécharger' }}
            </span>
          </label>
        </div>

        <!-- Date de réalisation -->
        <div class="absolute left-[888px] top-[88px]">
          <label class="text-[18.76px] text-[#0E1420]">Date de réalisation de l'achat</label>
        </div>
        <input
          v-model="dateAchat"
          type="date"
          placeholder="JJ/mm/aaaa"
          class="absolute left-[884px] top-[129px] w-[367px] h-[37px] px-4 border border-[#BEBEBE] rounded-[10px] text-[rgba(25,24,24,0.63)]"
        />

        <!-- Sélectionner le Fournisseur -->
        <div class="absolute left-[884px] top-[178px]">
          <label class="text-[18.76px] text-[#0E1420]">Sélectionner le Fournisseur :</label>
        </div>
        <div class="absolute left-[884px] top-[219px] w-[367px] h-[37px]">
          <Users class="absolute left-[8px] top-[8px] w-5 h-5 text-gray-500 z-10 pointer-events-none" />
          <Select v-model="fournisseur">
            <SelectTrigger class="w-full h-full pl-10 border-[#BEBEBE] rounded-[10px]">
              <SelectValue placeholder="Liste des Fournisseurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nova">nova plastique Sarl</SelectItem>
              <SelectItem value="graphic">graphic design</SelectItem>
              <SelectItem value="zone">zone sarl</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Le fournisseur n'existe pas encore ? -->
        <div class="absolute left-[884px] top-[266px]">
          <span class="text-[18.76px] text-[#0E1420]">Le fournisseur n'existe pas encore ?</span>
        </div>
        <Button
          variant="ghost"
          class="absolute left-[884px] top-[307px] w-[367px] h-[37px] bg-[#E4E4E6] text-[#7C7C7C] rounded-[10px] hover:bg-[#E4E4E6]/80 flex items-center justify-center"
        >
          Créer ici
        </Button>
      </div>

      <!-- Section 2: Contenue de l'achat -->
      <div class="relative w-[1289px] h-[848px] bg-white rounded-[10px]">
        <!-- Icône -->
        <div class="absolute left-[37px] top-[35px] w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
          <Package class="w-[26px] h-[26px] text-gray-600" />
        </div>

        <!-- Titre -->
        <h2 class="absolute left-[102px] top-[44px] text-[21.76px] font-bold text-[#3D3D3D]">
          Contenue de l'achat
        </h2>

        <!-- Produit -->
        <div class="absolute left-[48px] top-[99px]">
          <label class="text-[18.76px] text-[#0E1420]">Produit :</label>
        </div>
        <div class="absolute left-[48px] top-[140px] w-[367px] h-[37px]">
          <Package class="absolute left-[10px] top-[9px] w-5 h-5 text-gray-500 z-10 pointer-events-none" />
          <Select v-model="produitSelectionne">
            <SelectTrigger class="w-full h-full pl-10 border-[#BEBEBE] rounded-[10px]">
              <SelectValue placeholder="Liste des produits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bidon Fongi">Bidon Fongi</SelectItem>
              <SelectItem value="Bidon Super">Bidon Super</SelectItem>
              <SelectItem value="Autre bidon">Autre bidon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Le produit n'existe pas encore ? -->
        <div class="absolute left-[469px] top-[101px]">
          <span class="text-[18.76px] text-[#0E1420]">Le produit n'existe pas encore ?</span>
        </div>
        <Button
          variant="ghost"
          class="absolute left-[469px] top-[140px] w-[367px] h-[37px] bg-[#E4E4E6] text-[#7C7C7C] rounded-[10px] hover:bg-[#E4E4E6]/80 flex items-center justify-center"
        >
          Créer ici
        </Button>

        <!-- Quantité ajoutée -->
        <div class="absolute left-[891px] top-[98px]">
          <label class="text-[18.76px] text-[#0E1420]">Quantité ajoutée :</label>
        </div>
        <div class="absolute left-[891px] top-[139px] w-[367px] h-[37px]">
          <Package class="absolute left-[8px] top-[8px] w-5 h-5 text-gray-500 z-10" />
          <Input
            v-model="quantiteAjoutee"
            type="number"
            placeholder="Ex : 50"
            class="w-full h-full pl-10 border-[#BEBEBE] rounded-[10px]"
          />
        </div>

        <!-- Bouton Ajouter -->
        <Button
          @click="ajouterProduit"
          class="absolute left-[1069px] top-[205px] w-[189px] h-[37px] bg-[#474747] text-white rounded-[10px] hover:bg-[#474747]/90 font-bold text-[14.76px] uppercase"
        >
          Ajouter
        </Button>

        <!-- Ligne de séparation -->
        <div class="absolute left-[57px] top-[268px] w-[1193px] h-px bg-[#003FD8]"></div>

        <!-- Titre Liste des produits -->
        <h3 class="absolute left-[58px] top-[322px] text-[21.76px] font-bold text-[#3D3D3D]">
          Liste des produits achetés
        </h3>

        <!-- Tableau -->
        <div class="absolute left-[60px] top-[369px] w-[1186px]">
          <!-- Header du tableau -->
          <div class="relative w-[1185px] h-[40px] bg-[#0769CF] flex items-center">
            <div class="absolute left-[175px] text-[18.76px] font-normal text-white">Produit</div>
            <div class="absolute left-[589px] text-[18.76px] font-normal text-white">Ajoutée</div>
            <div class="absolute left-[355px] text-[18.76px] font-normal text-white">En stock</div>
            <div class="absolute left-[885px] text-[18.76px] font-normal text-white">Total</div>
            <div class="absolute left-[1085px] text-[18.76px] font-normal text-white">Action</div>
          </div>

          <!-- Lignes du tableau -->
          <div
            v-for="(produit, index) in produitsAjoutes"
            :key="produit.id"
            class="absolute w-[1183px] h-[40px] bg-[rgba(178,217,252,0.59)] border-t border-[rgba(0,0,0,0.37)] flex items-center"
            :style="{ top: (43 + index * 42) + 'px' }"
          >
            <div class="absolute left-[35px] w-[23px] h-[22px] flex items-center justify-center">
              <input
                type="checkbox"
                v-model="produit.selected"
                class="w-5 h-5 rounded border-[rgba(0,0,0,0.2)]"
              />
            </div>
            <div class="absolute left-[149px] text-[18.76px] text-black">{{ produit.nom }}</div>
            <div class="absolute left-[378px] text-[18.76px] text-black">{{ produit.quantiteAjoutee }}</div>
            <div class="absolute left-[619px] text-[18.76px] text-black">{{ produit.enStock }}</div>
            <div class="absolute left-[894px] text-[18.76px] text-black">
              {{ produit.quantiteAjoutee + produit.enStock }}
            </div>
            <button
              @click="supprimerProduit(produit.id)"
              class="absolute left-[1101px] w-6 h-6 flex items-center justify-center"
            >
              <Trash2 class="w-5 h-5 text-[#F52F2F]" />
            </button>
          </div>
        </div>

        <!-- Bouton Supprimer -->
        <Button
          @click="supprimerSelectionnes"
          variant="outline"
          class="absolute right-[39px] top-[315px] h-[37px] px-4 border border-[rgba(7,105,207,0.23)] text-[#0769CF] rounded-[10px]"
        >
          Supprimer
        </Button>

        <!-- Footer avec totaux -->
        <div class="absolute left-[610px] top-[523px] w-[669px]">
          <!-- Montant Total -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-[29.76px] font-bold text-emerald-700 leading-[1.083]">Montant Total:</span>
            <span class="text-[29.76px] font-bold text-emerald-600 leading-[1.083]">{{ montantTotal.toFixed(2) }}</span>
          </div>
          <div class="w-full h-px bg-[#929090] mb-4"></div>

          <!-- Montant payé -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-[29.76px] font-bold text-gray-500 leading-[1.083]">Montant payé:</span>
            <span class="text-[29.76px] font-bold text-gray-500 leading-[1.083]">{{ montantVerse || '0.00' }}</span>
          </div>
          <div class="w-full h-px bg-[#929090] mb-4"></div>

          <!-- Montant Restant -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-[29.76px] font-bold text-red-600 leading-[1.083]">Montant Restant:</span>
            <span class="text-[29.76px] font-bold text-red-600 leading-[1.083]">{{ montantRestant.toFixed(2) }}</span>
          </div>
          <div class="w-full h-px bg-[#929090]"></div>

          <!-- Date fixe demandée par le design -->
          <p class="mt-4 text-[16.76px] text-[#8F8F8F]">avant le 07/08/2025</p>
        </div>

        <!-- Date limite si crédit -->
        <p v-if="naturePayement === 'credit' && dateLimiteReglement"
           class="absolute left-[1014px] top-[696px] text-[16.76px] text-[#8F8F8F]">
          avant le {{ new Date(dateLimiteReglement).toLocaleDateString('fr-FR') }}
        </p>

        <!-- Bouton Valider -->
        <Button
          @click="handleSubmit"
          class="absolute left-[1042px] top-[768px] w-[189px] h-[37px] bg-[#0769CF] text-white rounded-[10px] hover:bg-[#0769CF]/90 font-bold text-[14.76px] uppercase"
        >
          Valider
        </Button>
      </div>
    </div>
  </div>
</template>
