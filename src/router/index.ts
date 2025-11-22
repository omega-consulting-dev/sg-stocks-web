import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FamilleProduitsView from '../views/products/FamilleProduitsView.vue'
import ProduitsView from '../views/products/ProduitsView.vue'
import ServicesView from '../views/services/ServicesView.vue'
import EntreeStockView from '../views/achats/EntreeStockView.vue'
import FacturationProduitView from '../views/facturation/FacturationProduitView.vue'
import FacturationServiceView from '../views/facturation/FacturationServiceView.vue'
import FacturationProduitNouveauView from '../views/facturation/FacturationProduitNouveauView.vue'
import EncaissementsView from '../views/encaissements/EncaissementsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', name: 'home', component: HomeView },

    {
      path: '/users/customer',
      name: 'customer',
      component: () => import('@/views/users/CustomerView.vue'),
    },
    {
      path: '/familles-produits',
      name: 'familles-produits',
      component: FamilleProduitsView,
    },
    {
      path: '/produits',
      name: 'produits',
      component: ProduitsView,
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
    },
    {
      path: '/achats/entree-stock',
      name: 'entree-stock',
      component: EntreeStockView,
    },
    {
      path: '/achats/entree-stock/nouveau',
      name: 'achat-nouveau',
      component: () => import('@/views/achats/AchatNouveauView.vue'),
    },
    {
      path: '/facturation/produit',
      name: 'facturation-produit',
      component: FacturationProduitView,
    },
    {
      path: '/facturation/service',
      name: 'facturation-service',
      component: FacturationServiceView,
    },
    {
      path: '/facturation/produit/nouveau',
      name: 'facturation-produit-nouveau',
      component: FacturationProduitNouveauView,
    },
    {
      path: '/encaissements',
      name: 'encaissements',
      component: EncaissementsView,
    },
  ],
})

export default router
