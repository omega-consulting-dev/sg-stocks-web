import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Product {
  id: number
  code: string
  designation: string
  familleId: number
  familleLibelle: string
  prixAchat: number
  prixVente: number
  quantiteStock: number
  seuilAlerte: number
  image?: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export const useProductsStore = defineStore('products', () => {
  // État
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Données mock pour le développement
  const mockProducts: Product[] = [
    {
      id: 1,
      code: 'PROD001',
      designation: 'MacBook Pro 16"',
      familleId: 1,
      familleLibelle: 'Électronique',
      prixAchat: 2000,
      prixVente: 2500,
      quantiteStock: 15,
      seuilAlerte: 5,
      image: 'https://picsum.photos/seed/macbook/100/100',
      description: 'MacBook Pro 16 pouces avec processeur M3',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      code: 'PROD002',
      designation: 'iPhone 15 Pro',
      familleId: 1,
      familleLibelle: 'Électronique',
      prixAchat: 900,
      prixVente: 1200,
      quantiteStock: 30,
      seuilAlerte: 10,
      image: 'https://picsum.photos/seed/iphone/100/100',
      description: 'iPhone 15 Pro 256GB',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: 3,
      code: 'PROD003',
      designation: 'AirPods Pro',
      familleId: 1,
      familleLibelle: 'Électronique',
      prixAchat: 180,
      prixVente: 250,
      quantiteStock: 50,
      seuilAlerte: 15,
      image: 'https://picsum.photos/seed/airpods/100/100',
      description: 'AirPods Pro 2ème génération',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
    {
      id: 4,
      code: 'PROD004',
      designation: 'Table en Chêne',
      familleId: 4,
      familleLibelle: 'Meubles',
      prixAchat: 300,
      prixVente: 450,
      quantiteStock: 8,
      seuilAlerte: 3,
      image: 'https://picsum.photos/seed/table/100/100',
      description: 'Table en chêne massif 180x90cm',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-03-01'),
    },
    {
      id: 5,
      code: 'PROD005',
      designation: 'Chaise de Bureau',
      familleId: 4,
      familleLibelle: 'Meubles',
      prixAchat: 120,
      prixVente: 180,
      quantiteStock: 25,
      seuilAlerte: 5,
      image: 'https://picsum.photos/seed/chair/100/100',
      description: 'Chaise ergonomique avec support lombaire',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
    },
    {
      id: 6,
      code: 'PROD006',
      designation: 'T-Shirt Coton',
      familleId: 3,
      familleLibelle: 'Vêtements',
      prixAchat: 8,
      prixVente: 15,
      quantiteStock: 100,
      seuilAlerte: 20,
      image: 'https://picsum.photos/seed/tshirt/100/100',
      description: 'T-shirt en coton bio disponible en plusieurs couleurs',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-10'),
    },
    {
      id: 7,
      code: 'PROD007',
      designation: 'Jean Slim',
      familleId: 3,
      familleLibelle: 'Vêtements',
      prixAchat: 25,
      prixVente: 45,
      quantiteStock: 60,
      seuilAlerte: 15,
      image: 'https://picsum.photos/seed/jeans/100/100',
      description: 'Jean slim fit en denim stretch',
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-12'),
    },
    {
      id: 8,
      code: 'PROD008',
      designation: 'Ballon de Football',
      familleId: 5,
      familleLibelle: 'Sport',
      prixAchat: 15,
      prixVente: 25,
      quantiteStock: 40,
      seuilAlerte: 10,
      image: 'https://picsum.photos/seed/football/100/100',
      description: 'Ballon de football taille 5 officiel',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
    },
  ]

  // Computed
  const productsCount = computed(() => products.value.length)
  const lowStockProducts = computed(() =>
    products.value.filter((p) => p.quantiteStock <= p.seuilAlerte)
  )

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 500))
      products.value = mockProducts
    } catch (e) {
      error.value = 'Erreur lors du chargement des produits'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newProduct: Product = {
        ...product,
        id: Math.max(...products.value.map((p) => p.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      products.value.push(newProduct)
      return newProduct
    } catch (e) {
      error.value = "Erreur lors de l'ajout du produit"
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (
    id: number,
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...updates,
          updatedAt: new Date(),
        }
        return products.value[index]
      }
      throw new Error('Produit non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la modification du produit'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value.splice(index, 1)
        return true
      }
      throw new Error('Produit non trouvé')
    } catch (e) {
      error.value = 'Erreur lors de la suppression du produit'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getProductById = (id: number) => {
    return products.value.find((p) => p.id === id)
  }

  return {
    // État
    products,
    loading,
    error,
    // Computed
    productsCount,
    lowStockProducts,
    // Actions
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  }
})
