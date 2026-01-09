export interface InvoiceLine {
  id?: number
  product?: number
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount_percentage: number
  subtotal?: number
  tax_amount?: number
  total?: number
}

export interface Invoice {
  id: number
  invoice_number: string
  customer: number
  customer_name: string
  store: number
  store_name: string
  sale?: number | null
  invoice_date: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  status_display: string
  payment_term: 'immediate' | '15_days' | '30_days' | '60_days'
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  is_fully_paid: boolean
  is_overdue: boolean
  total_items?: number
  notes: string
  lines?: InvoiceLine[]
  payments?: InvoicePayment[]
  created_at: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface InvoicePayment {
  id: number
  payment_number: string
  invoice: number
  payment_date: string
  amount: number
  payment_method: 'cash' | 'card' | 'check' | 'transfer' | 'mobile'
  reference: string
  notes: string
  created_at: string
}

export interface InvoiceListParams {
  store?: number | null
  search?: string
  status?: string
  customer?: number
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export interface InvoiceCreateData {
  customer: number
  store: number
  sale?: number | null
  invoice_date: string
  payment_term: string
  discount_amount?: number
  notes?: string
  lines: Omit<InvoiceLine, 'id' | 'subtotal' | 'tax_amount' | 'total'>[]
}
