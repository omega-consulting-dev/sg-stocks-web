/**
 * Store Types (Point de vente)
 */

export interface Store {
  id: number;
  name: string;
  code: string;
  location: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreStats {
  store_id: number;
  store_name: string;
  total_sales: number;
  total_expenses: number;
  total_balance: number;
  expense_count: number;
}

export interface StoresBalance {
  stores: StoreStats[];
  grand_total_sales: number;
  grand_total_expenses: number;
  grand_total_balance: number;
}
