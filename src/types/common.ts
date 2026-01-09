/**
 * Common types used across the application
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorResponse {
  detail?: string;
  [key: string]: any;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
}

export interface Tenant {
  id: number;
  name: string;
  schema_name: string;
}
