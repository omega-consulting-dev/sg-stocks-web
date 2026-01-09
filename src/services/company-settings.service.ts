import Axios from './axios.service'
import type { AxiosResponse } from 'axios'

const API_BASE = '/main/settings'

export interface CompanySettings {
  id: number
  company_name: string
  company_slogan: string
  company_email: string
  company_phone: string
  company_address: string
  company_website: string
  tax_id: string
  logo: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  text_color: string
  invoice_header_text: string
  show_logo_on_invoice: boolean
  invoice_footer_text: string
  invoice_footer_note: string
  bank_name: string
  bank_account: string
  mobile_money_number: string
  invoice_prefix: string
  show_tax_breakdown: boolean
  default_payment_terms: string
  created_at: string
  updated_at: string
}

export interface CompanySettingsUpdate {
  company_name?: string
  company_slogan?: string
  company_email?: string
  company_phone?: string
  company_address?: string
  company_website?: string
  tax_id?: string
  primary_color?: string
  secondary_color?: string
  text_color?: string
  invoice_header_text?: string
  show_logo_on_invoice?: boolean
  invoice_footer_text?: string
  invoice_footer_note?: string
  bank_name?: string
  bank_account?: string
  mobile_money_number?: string
  invoice_prefix?: string
  show_tax_breakdown?: boolean
  default_payment_terms?: string
}

const getSettings = (): Promise<AxiosResponse<CompanySettings>> => {
  return Axios.get(`${API_BASE}/`)
}

const updateSettings = (data: CompanySettingsUpdate): Promise<AxiosResponse<CompanySettings>> => {
  return Axios.patch(`${API_BASE}/1/`, data)
}

const uploadLogo = (file: File): Promise<AxiosResponse<CompanySettings>> => {
  const formData = new FormData()
  formData.append('logo', file)
  return Axios.post(`${API_BASE}/upload_logo/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

const removeLogo = (): Promise<AxiosResponse<CompanySettings>> => {
  return Axios.delete(`${API_BASE}/remove_logo/`)
}

export const CompanySettingsService = {
  getSettings,
  updateSettings,
  uploadLogo,
  removeLogo
}
