/**
 * Types pour Vue Router avec meta personnalisées
 */

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Si true, la route nécessite une authentification
     * @default true (sauf pour /login)
     */
    requiresAuth?: boolean

    /**
     * Layout à utiliser pour cette route
     * @example 'auth' | 'default' | 'empty'
     */
    layout?: string

    /**
     * Permissions requises pour accéder à cette route
     */
    permissions?: string[]

    /**
     * Rôles requis pour accéder à cette route
     */
    roles?: string[]

    /**
     * Titre de la page pour SEO
     */
    title?: string

    /**
     * Si true, la route est accessible uniquement aux admins
     */
    adminOnly?: boolean
  }
}
