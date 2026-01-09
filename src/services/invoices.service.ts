import Axios from './axios.service'
import type { AxiosResponse } from 'axios'
import type { Invoice, InvoiceListParams, InvoiceCreateData } from '@/types/invoice.types'

const API_BASE = '/invoicing/invoices'

const getInvoices = (params?: InvoiceListParams): Promise<AxiosResponse<{ results: Invoice[], count: number }>> => {
  return Axios.get(`${API_BASE}/`, { params })
}

const getInvoice = (id: number): Promise<AxiosResponse<Invoice>> => {
  return Axios.get(`${API_BASE}/${id}/`)
}

const createInvoice = (data: InvoiceCreateData): Promise<AxiosResponse<Invoice>> => {
  return Axios.post(`${API_BASE}/`, data)
}

const updateInvoice = (id: number, data: Partial<InvoiceCreateData>): Promise<AxiosResponse<Invoice>> => {
  return Axios.patch(`${API_BASE}/${id}/`, data)
}

const deleteInvoice = (id: number): Promise<AxiosResponse<void>> => {
  return Axios.delete(`${API_BASE}/${id}/`)
}

const updateStatus = (id: number, status: string): Promise<AxiosResponse<Invoice>> => {
  return Axios.patch(`${API_BASE}/${id}/update_status/`, { status })
}

const sendByEmail = (id: number): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post(`${API_BASE}/${id}/send_email/`)
}

const exportExcel = (params?: InvoiceListParams): Promise<AxiosResponse<Blob>> => {
  return Axios.get(`${API_BASE}/export_excel/`, {
    params,
    responseType: 'blob'
  })
}

const exportPdf = (id: number): Promise<AxiosResponse<Blob>> => {
  return Axios.get(`${API_BASE}/${id}/generate_pdf/`, {
    responseType: 'blob'
  })
}

interface InvoicePaymentCreateData {
  invoice: number
  payment_date: string
  amount: number
  payment_method: 'cash' | 'card' | 'check' | 'bank_transfer' | 'mobile_money'
  reference: string
  notes: string
}

const createPayment = (data: InvoicePaymentCreateData): Promise<AxiosResponse<any>> => {
  return Axios.post('/invoicing/payments/', data)
}

export const InvoiceServices = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateStatus,
  sendByEmail,
  exportExcel,
  exportPdf,
  createPayment
}
