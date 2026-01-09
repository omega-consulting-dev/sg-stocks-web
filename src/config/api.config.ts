/**
 * Configuration de l'API et URLs de base
 */

export const API_CONFIG = {
  // Base URL sera construite dynamiquement par axios.service.ts
  BASE_DOMAIN: import.meta.env.VITE_API_BASE_DOMAIN || 'localhost',
  PORT: import.meta.env.VITE_API_PORT || '8000',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login/',
      LOGOUT: '/auth/logout/',
      REFRESH: '/auth/token/refresh/',
      ME: '/auth/me/'
    },
    USERS: {
      BASE: '/accounts/users/',
      ROLES: '/accounts/roles/',
      PERMISSIONS: '/accounts/permissions/'
    },
    PRODUCTS: {
      BASE: '/products/',
      CATEGORIES: '/products/categories/',
      FAMILIES: '/products/families/'
    },
    SERVICES: {
      BASE: '/services/',
      CATEGORIES: '/services/categories/',
      FAMILIES: '/services/families/'
    },
    INVENTORY: {
      BASE: '/inventory/',
      STORES: '/inventory/stores/',
      MOVEMENTS: '/inventory/movements/'
    },
    SALES: {
      BASE: '/sales/',
      INVOICES: '/sales/invoices/'
    },
    CUSTOMERS: {
      BASE: '/customers/',
      ACCOUNTS: '/customers/accounts/'
    },
    SUPPLIERS: {
      BASE: '/suppliers/',
      ACCOUNTS: '/suppliers/accounts/'
    },
    CASHBOX: {
      BASE: '/cashbox/',
      TRANSACTIONS: '/cashbox/transactions/'
    },
    EXPENSES: {
      BASE: '/expenses/'
    },
    ANALYTICS: {
      BASE: '/analytics/',
      DASHBOARD: '/analytics/dashboard/'
    }
  }
}

/**
 * Messages d'erreur par défaut
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer',
  VALIDATION_ERROR: 'Données invalides',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite'
}

/**
 * Configuration de la pagination
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

/**
 * Configuration des dates
 */
export const DATE_CONFIG = {
  LOCALE: 'fr-FR',
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm'
}
