/**
 * API service pour la gestion du tenant (société)
 */

import Axios from '../axios.service'
import type { Tenant, TenantUpdateData } from '@/types/tenant.types'

const TENANT_ENDPOINT = '/tenants/current/'

export const tenantApi = {
  /**
   * Récupérer les informations du tenant actuel
   */
  async getCurrentTenant() {
    const response = await Axios.get<Tenant>(TENANT_ENDPOINT)
    return response.data
  },

  /**
   * Mettre à jour les informations du tenant
   */
  async updateTenant(data: TenantUpdateData) {
    const response = await Axios.patch<Tenant>(TENANT_ENDPOINT, data)
    return response.data
  }
}
