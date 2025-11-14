import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FamilleProduitsView from '../views/FamilleProduitsView.vue'
import ProduitsView from '../views/ProduitsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
  ],
})

export default router
