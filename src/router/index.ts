import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import FamilleProduitsView from '../pages/products/FamilleProduitsView.vue'
import FamilleServicesView from '../pages/products/FamilleServicesView.vue'
import ProduitsView from '../pages/products/ProduitsView.vue'
import ServicesView from '../pages/services/ServicesView.vue'
import EntreeStockView from '../pages/achats/EntreeStockView.vue'
import FacturationProduitView from '../pages/facturation/FacturationProduitView.vue'
import FacturationServiceView from '../pages/facturation/FacturationServiceView.vue'
import EncaissementsView from '../pages/encaissements/EncaissementsView.vue'
import DecaissementsView from '../pages/decaissements/DecaissementsView.vue'
import LoginView from '../pages/auth/LoginView.vue'
import FournisseursView from '../pages/fournisseurs/FournisseursView.vue'
import ComptesFournisseursView from '../pages/fournisseurs/ComptesFournisseursView.vue'
import ClientsView from '../pages/clients/ClientsView.vue'
import CustomersView from '../pages/customers/CustomersView.vue'
import SettingsView from '../pages/SettingsView.vue'
import CompanySettingsView from '../pages/settings/CompanySettingsView.vue'
import SubscriptionView from '../pages/settings/SubscriptionView.vue'
import ComingSoonView from '../pages/ComingSoonView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'auth', requiresAuth: false }
    },

    // App routes
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },

    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/settings/company',
      name: 'company-settings',
      component: CompanySettingsView,
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/settings/users-roles',
      name: 'users-roles-settings',
      component: () => import('@/pages/settings/UsersRolesSettingsView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/settings/field-config',
      name: 'field-config-settings',
      component: () => import('@/pages/settings/FieldConfigView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/settings/invoice-config',
      name: 'invoice-config-settings',
      component: () => import('@/pages/settings/InvoiceConfigView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/settings/subscription',
      name: 'subscription-settings',
      component: SubscriptionView,
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('@/pages/stores/StoresView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/customer',
      name: 'customer',
      component: () => import('@/pages/users/CustomerView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categories/produits',
      name: 'categories-produits',
      component: FamilleProduitsView,
      meta: { requiresAuth: true, permissions: ['can_manage_categories', 'can_view_categories'] }
    },
    {
      path: '/categories/services',
      name: 'categories-services',
      component: FamilleServicesView,
      meta: { requiresAuth: true, permissions: ['can_manage_categories', 'can_view_categories'] }
    },
    {
      path: '/produits',
      name: 'produits',
      component: ProduitsView,
      meta: { requiresAuth: true, permissions: ['can_manage_products', 'can_view_products'] }
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
      meta: { requiresAuth: true, permissions: ['can_manage_services', 'can_view_services'] }
    },
    {
      path: '/achats/entree-stock',
      name: 'entree-stock',
      component: EntreeStockView,
      meta: { requiresAuth: true, permissions: ['can_manage_inventory', 'can_view_inventory'] }
    },
    {
      path: '/achats/entree-stock/nouveau',
      name: 'achat-nouveau',
      component: () => import('@/pages/achats/AchatNouveauView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_inventory'] }
    },
    {
      path: '/transfers',
      name: 'transfers',
      component: () => import('@/pages/transfers/TransfersListView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_inventory'] }
    },
    {
      path: '/stock/levels',
      name: 'stock-levels',
      component: () => import('@/pages/inventory/StockView.vue'),
      meta: { requiresAuth: true, permissions: ['can_view_inventory'] }
    },
    {
      path: '/stock/inventories',
      name: 'inventories',
      component: () => import('@/pages/inventory/InventoriesView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_inventory'] }
    },
    {
      path: '/stock/diagnostic',
      name: 'stock-diagnostic',
      component: () => import('@/pages/inventory/StockDiagnosticView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_inventory'] }
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('@/pages/stores/StoresView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/facturation/produit',
      name: 'facturation-produit',
      component: FacturationProduitView,
      meta: { requiresAuth: true, permissions: ['can_manage_sales'] }
    },
    {
      path: '/facturation/service',
      name: 'facturation-service',
      component: FacturationServiceView,
      meta: { requiresAuth: true, permissions: ['can_manage_sales'] }
    },
    {
      path: '/encaissements',
      name: 'encaissements',
      component: EncaissementsView,
      meta: { requiresAuth: true, permissions: ['can_manage_cashbox'] }
    },
    {
      path: '/fournisseurs',
      name: 'fournisseurs',
      component: FournisseursView,
      meta: { requiresAuth: true, permissions: ['can_manage_suppliers'] }
    },
    {
      path: '/fournisseurs/comptes',
      name: 'comptes-fournisseurs',
      component: ComptesFournisseursView,
      meta: { requiresAuth: true, permissions: ['can_manage_suppliers'] }
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsView,
      meta: { requiresAuth: true, permissions: ['can_manage_customers'] }
    },
    {
      path: '/clients/dettes',
      name: 'dettes-clients',
      component: CustomersView,
      meta: { requiresAuth: true, permissions: ['can_manage_customers'] }
    },
    // Routes pour les fonctionnalités à venir
    {
      path: '/decaissements',
      name: 'decaissements',
      component: DecaissementsView,
      meta: { requiresAuth: true, permissions: ['can_manage_cashbox'] }
    },
    {
      path: '/mouvements',
      name: 'mouvements',
      component: () => import('@/pages/mouvements/MouvementsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mouvements/entree',
      name: 'mouvements-entree',
      component: () => import('@/pages/mouvements/MouvementsEntreeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mouvements/sortie',
      name: 'mouvements-sortie',
      component: () => import('@/pages/mouvements/MouvementsSortieView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mouvements/inventaire',
      name: 'mouvements-inventaire',
      component: () => import('@/pages/inventaire/InventaireView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/statistiques',
      name: 'statistiques',
      component: ComingSoonView,
      meta: { requiresAuth: true }
    },
    {
      path: '/statistiques/ventes',
      name: 'statistiques-ventes',
      component: () => import('@/pages/statistiques/VentesStatistiquesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/statistiques/charges',
      name: 'statistiques-charges',
      component: () => import('@/pages/statistiques/ChargesStatistiquesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/depenses',
      name: 'expenses',
      component: () => import('@/pages/expenses/ExpensesView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_expenses'] }
    },
    {
      path: '/depenses/categories',
      name: 'expense-categories',
      component: () => import('@/pages/expenses/CategoriesView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_expenses'] }
    },
    {
      path: '/emprunts',
      name: 'loans',
      component: () => import('@/pages/loans/LoansView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_loans'] }
    },
    {
      path: '/banque',
      name: 'banque',
      component: () => import('@/pages/banque/BanqueView.vue'),
      meta: { requiresAuth: true, permissions: ['can_manage_cashbox'] }
    },
    {
      path: '/reporting',
      name: 'reporting',
      component: () => import('@/pages/reporting/ReportingView.vue'),
      meta: { requiresAuth: true, permissions: ['can_view_analytics'] }
    },
    // 404 - Cette route doit être la dernière
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundView.vue'),
      meta: { requiresAuth: false }
    }
  ],
})

// 🔒 Navigation Guard - Vérification de l'authentification et des permissions
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Restaurer la session depuis localStorage au premier chargement
  if (!userStore.user && localStorage.getItem('access_token')) {
    userStore.loadUserFromStorage()
  }

  // Vérifier si la route nécessite une authentification
  const requiresAuth = to.meta.requiresAuth !== false // Par défaut true sauf si explicitement false

  if (requiresAuth && !userStore.isAuthenticated) {
    // Rediriger vers login avec redirection de retour
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  }
  // Si déjà authentifié et tente d'accéder à /login, rediriger vers home
  else if (to.name === 'login' && userStore.isAuthenticated) {
    next({ name: 'home' })
  }
  // Vérifier si la route nécessite des droits admin
  else if (to.meta.adminOnly) {
    const user = userStore.user

    // Vérifier si l'utilisateur est superadmin ou admin du tenant
    if (user?.is_superuser || user?.is_staff) {
      next()
    } else {
      // Rediriger vers le dashboard avec un message d'erreur
      console.warn('⚠️ Accès refusé: droits admin requis')
      next({ name: 'home' })
    }
  }
  // Vérifier les permissions si la route en requiert
  else if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
    const user = userStore.user

    // Super admin a tous les droits
    if (user?.is_superuser) {
      next()
      return
    }

    // Vérifier si l'utilisateur a au moins une des permissions requises
    const hasPermission = (to.meta.permissions as string[]).some(permission => {
      return user?.role && (user.role as any)[permission] === true
    })

    if (hasPermission) {
      next()
    } else {
      // Rediriger vers une page d'accès refusé ou le dashboard
      next({ name: 'home' })
    }
  }
  // Autoriser la navigation
  else {
    next()
  }
})

export default router
