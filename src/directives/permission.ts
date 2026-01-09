import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * Directive v-permission
 * Masque l'élément si l'utilisateur n'a pas la permission requise
 *
 * Usage:
 * <button v-permission="'can_manage_users'">Créer utilisateur</button>
 * <button v-permission="['can_manage_products', 'can_view_products']">Voir produits</button>
 * <button v-permission.any="['can_manage_products', 'can_view_products']">Voir produits</button>
 * <button v-permission.all="['can_manage_products', 'can_manage_inventory']">Action</button>
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const userStore = useUserStore()
  const user = userStore.user

  // Si pas d'utilisateur, masquer l'élément
  if (!user) {
    el.style.display = 'none'
    return
  }

  // Super admin a tous les droits (vérifier AVANT le rôle)
  if (user.is_superuser || user.is_staff) {
    el.style.display = ''
    return
  }

  // Si pas de rôle et pas superuser, masquer
  if (!user.role) {
    el.style.display = 'none'
    return
  }

  const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]
  const role = user.role as any

  let hasPermission = false

  // Vérifier le modificateur (any, all)
  if (binding.modifiers.all) {
    // Toutes les permissions sont requises
    hasPermission = permissions.every(permission => role[permission] === true)
  } else {
    // Au moins une permission est requise (par défaut)
    hasPermission = permissions.some(permission => role[permission] === true)
  }

  // Afficher/masquer l'élément
  el.style.display = hasPermission ? '' : 'none'
}
