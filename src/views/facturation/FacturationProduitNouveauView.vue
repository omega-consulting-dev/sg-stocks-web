<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { X, Trash2, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const router = useRouter()

// Mock data for products
const products = ref([
  { id: 1, name: 'Bidon Fongi', price: 17500, stock: 25 },
  { id: 2, name: 'Bidon Super', price: 15000, stock: 20 },
  { id: 3, name: 'Bidon Premium', price: 20000, stock: 30 },
  { id: 4, name: 'Bidon Standard', price: 12000, stock: 50 }
])

const selectedProductId = ref<string>()
const quantity = ref<number>()
const attachedFile = ref<File | null>(null)

// Liste des ventes ajoutées
interface VenteItem {
  id: number
  productId: number
  productName: string
  stock: number
  quantity: number
  unitPrice: number
  total: number
}

const ventesItems = ref<VenteItem[]>([
  { id: 1, productId: 1, productName: 'Bidon Fongi', stock: 25, quantity: 5, unitPrice: 17500, total: 30 },
  { id: 2, productId: 2, productName: 'Bidon Super', stock: 20, quantity: 5, unitPrice: 15000, total: 25 }
])

const selectedProduct = computed(() => {
  if (!selectedProductId.value) return null
  return products.value.find((p) => p.id === parseInt(selectedProductId.value!))
})

const montantTotal = computed(() => {
  return ventesItems.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
})

function handleAddProduct() {
  if (!selectedProduct.value || !quantity.value) {
    alert('Veuillez sélectionner un produit et entrer une quantité')
    return
  }

  if (quantity.value > selectedProduct.value.stock) {
    alert('La quantité demandée dépasse le stock disponible')
    return
  }

  const newItem: VenteItem = {
    id: Date.now(),
    productId: selectedProduct.value.id,
    productName: selectedProduct.value.name,
    stock: selectedProduct.value.stock,
    quantity: quantity.value,
    unitPrice: selectedProduct.value.price,
    total: selectedProduct.value.stock + quantity.value
  }

  ventesItems.value.push(newItem)

  // Reset form
  selectedProductId.value = undefined
  quantity.value = undefined
}

function handleRemoveItem(id: number) {
  ventesItems.value = ventesItems.value.filter((item) => item.id !== id)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    attachedFile.value = target.files[0]
  }
}

function handleRetour() {
  router.push('/facturation/produit')
}

function handleSuivant() {
  console.log('Enregistrer la facturation:', {
    items: ventesItems.value,
    total: montantTotal.value,
    file: attachedFile.value
  })
  // TODO: Save to store
  router.push('/facturation/produit')
}
</script>

<template>
  <div class="min-h-screen bg-white p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300"
        >
          <Upload class="w-6 h-6 text-gray-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Nouvelle operation de vente</h1>
      </div>
      <button @click="handleRetour" class="text-gray-400 hover:text-gray-600">
        <X class="w-6 h-6" />
      </button>
    </div>

    <!-- Main Content - 2 Columns -->
    <div class="grid grid-cols-2 gap-8">
      <!-- Left Column - Contenue de la vente -->
      <div class="space-y-6">
        <h2 class="text-xl font-bold text-gray-900">Contenue de la vente</h2>

        <!-- Product Selection -->
        <div class="space-y-2">
          <Label class="text-base font-semibold text-gray-900"
            >Choix du produit (Obligatoire) :</Label
          >
          <div class="flex items-center gap-4">
            <Select v-model="selectedProductId">
              <SelectTrigger class="flex-1 bg-white border-gray-300">
                <SelectValue placeholder="Liste des produits" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="product in products" :key="product.id" :value="String(product.id)">
                    {{ product.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <!-- Stock Badge -->
            <div
              v-if="selectedProduct"
              class="bg-gray-400 text-white px-6 py-3 rounded-lg text-center min-w-[120px]"
            >
              <div class="text-2xl font-bold">{{ selectedProduct.stock }}</div>
              <div class="text-sm">en stock</div>
            </div>
          </div>
        </div>

        <!-- Prix unitaire (readonly) -->
        <div v-if="selectedProduct" class="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg text-center">
          <span class="font-semibold">Prix unitaire : {{ selectedProduct.price.toLocaleString() }}</span>
        </div>

        <!-- Quantité ajoutée -->
        <div class="space-y-2">
          <Label class="text-base font-semibold text-gray-900">Quantité ajoutée :</Label>
          <Input
            v-model.number="quantity"
            type="number"
            placeholder="Ex : 50"
            class="bg-white border-gray-300"
            min="1"
            :max="selectedProduct?.stock"
          />
        </div>

        <!-- Ajouter Button -->
        <div class="flex justify-center pt-4">
          <Button
            @click="handleAddProduct"
            class="bg-gray-800 hover:bg-gray-700 text-white px-12 py-6 text-lg font-semibold rounded-lg"
          >
            AJOUTER
          </Button>
        </div>
      </div>

      <!-- Right Column - Liste des ventes -->
      <div class="space-y-6">
        <h2 class="text-xl font-bold text-gray-900">Liste des ventes</h2>

        <!-- Table -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#0769CF] text-white">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Produit</th>
                <th class="px-4 py-3 text-left font-semibold">En stock</th>
                <th class="px-4 py-3 text-left font-semibold">Ajoutée</th>
                <th class="px-4 py-3 text-left font-semibold">Total</th>
                <th class="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in ventesItems"
                :key="item.id"
                class="border-b border-gray-200 last:border-0 bg-blue-50"
              >
                <td class="px-4 py-3 text-gray-900">{{ item.productName }}</td>
                <td class="px-4 py-3 text-gray-900">{{ item.stock }}</td>
                <td class="px-4 py-3 text-gray-900">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-gray-900">{{ item.total }}</td>
                <td class="px-4 py-3">
                  <button
                    @click="handleRemoveItem(item.id)"
                    class="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="ventesItems.length === 0"
            class="text-center py-8 text-gray-400 text-sm"
          >
            Aucun produit ajouté
          </div>
        </div>

        <!-- Montant Total -->
        <div class="border-t-2 border-gray-300 pt-4 flex justify-between items-center">
          <span class="text-xl font-bold text-green-600">Montant Total:</span>
          <span class="text-3xl font-bold text-green-600">
            {{ montantTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }}
          </span>
        </div>

        <!-- Pièce jointe -->
        <div class="space-y-2">
          <Label class="text-base font-semibold text-gray-900 block text-right">Piece jointe</Label>
          <div class="bg-gray-200 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
            <input
              type="file"
              @change="handleFileChange"
              class="hidden"
              id="file-upload"
            />
            <label
              for="file-upload"
              class="cursor-pointer text-gray-500 hover:text-gray-700 text-sm"
            >
              {{ attachedFile ? attachedFile.name : 'Cliquer pour ajouter un fichier' }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <div class="flex justify-between mt-8">
      <Button
        @click="handleRetour"
        variant="outline"
        class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-12 py-6 text-lg font-semibold rounded-lg border-0"
      >
        RETOUR
      </Button>
      <Button
        @click="handleSuivant"
        class="bg-[#0769CF] hover:bg-[#0769CF]/90 text-white px-12 py-6 text-lg font-semibold rounded-lg"
      >
        SUIVANT
      </Button>
    </div>
  </div>
</template>
