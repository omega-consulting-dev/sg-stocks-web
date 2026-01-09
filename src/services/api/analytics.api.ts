import Axios from '../axios.service'
import type { AxiosResponse } from 'axios'

/**
 * Dashboard Overview Response
 */
export interface DashboardOverview {
  sales: {
    today: {
      amount: number
      count: number
    }
    this_month: {
      amount: number
      count: number
    }
    this_year: {
      amount: number
      count: number
    }
  }
  stock: {
    total_products: number
    low_stock: number
    out_of_stock: number
    total_stock_value: number
  }
  customers: {
    total: number
    new_this_month: number
  }
  cash: {
    balance: number
  }
  pending: {
    sales: number
    payments: number
    expenses: number
  }
}

/**
 * Sales Chart Data Point
 */
export interface SalesChartData {
  period: string
  total_amount: number
  total_sales: number
}

/**
 * Top Product
 */
export interface TopProduct {
  product__id: number
  product__name: string
  product__reference: string
  total_quantity: number
  total_amount: number
  sales_count: number
  current_stock: number  // Stock réel basé sur les stores accessibles
}

/**
 * Top Customer
 */
export interface TopCustomer {
  customer__id: number
  customer__name: string
  customer__customer_code: string
  total_amount: number
  sales_count: number
  avg_order: number
}

/**
 * Revenue by Category
 */
export interface RevenueByCategory {
  product__category__id: number
  product__category__name: string
  total_revenue: number
  total_quantity: number
}

/**
 * Cash Flow Data
 */
export interface CashFlowData {
  date: string
  in: number
  out: number
}

/**
 * Inventory Value by Store
 */
export interface InventoryValue {
  store__id: number
  store__name: string
  total_value: number
  total_products: number
  total_quantity: number
}

/**
 * Financial Summary
 */
export interface FinancialSummary {
  loans: {
    total_principal: number
    total_debt: number
    monthly_payment: number
  }
  expenses: {
    this_month: number
    pending: number
  }
  revenue: {
    this_month: number
  }
  profit: number
}

/**
 * Report Data
 */
export interface ReportData {
  [key: string]: any
}

/**
 * Analytics API Service
 */
export const analyticsApi = {
  /**
   * Get dashboard overview
   */
  async getOverview(): Promise<DashboardOverview> {
    const response: AxiosResponse<DashboardOverview> = await Axios.get(
      '/analytics/dashboard/overview/'
    )
    return response.data
  },

  /**
   * Get sales chart data
   * @param period - day, week, month, year
   */
  async getSalesChart(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesChartData[]> {
    const response: AxiosResponse<SalesChartData[]> = await Axios.get(
      '/analytics/dashboard/sales_chart/',
      { params: { period } }
    )
    return response.data
  },

  /**
   * Get top selling products
   * @param limit - Number of products to return
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response: AxiosResponse<TopProduct[]> = await Axios.get(
      '/analytics/dashboard/top_products/',
      { params: { limit } }
    )
    return response.data
  },

  /**
   * Get top customers by revenue
   * @param limit - Number of customers to return
   */
  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    const response: AxiosResponse<TopCustomer[]> = await Axios.get(
      '/analytics/dashboard/top_customers/',
      { params: { limit } }
    )
    return response.data
  },

  /**
   * Get revenue breakdown by category
   */
  async getRevenueByCategory(): Promise<RevenueByCategory[]> {
    const response: AxiosResponse<RevenueByCategory[]> = await Axios.get(
      '/analytics/dashboard/revenue_by_category/'
    )
    return response.data
  },

  /**
   * Get cash flow analysis
   * @param days - Number of days to analyze
   */
  async getCashFlow(days: number = 30): Promise<CashFlowData[]> {
    const response: AxiosResponse<CashFlowData[]> = await Axios.get(
      '/analytics/dashboard/cash_flow/',
      { params: { days } }
    )
    return response.data
  },

  /**
   * Get inventory value by store
   */
  async getInventoryValue(): Promise<InventoryValue[]> {
    const response: AxiosResponse<InventoryValue[]> = await Axios.get(
      '/analytics/dashboard/inventory_value/'
    )
    return response.data
  },

  /**
   * Get financial summary
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    const response: AxiosResponse<FinancialSummary> = await Axios.get(
      '/analytics/dashboard/financial_summary/'
    )
    return response.data
  },

  /**
   * Get reports
   * @param type - sales, expenses, cash
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getReports(
    type: 'sales' | 'expenses' | 'cash' = 'sales',
    startDate?: string,
    endDate?: string
  ): Promise<ReportData[]> {
    const response: AxiosResponse<ReportData[]> = await Axios.get(
      '/analytics/dashboard/reports/',
      {
        params: {
          type,
          start_date: startDate,
          end_date: endDate
        }
      }
    )
    return response.data
  }
}
