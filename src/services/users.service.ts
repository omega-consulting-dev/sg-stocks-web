import Axios from "./axios.service";
import type { AxiosResponse } from "axios";
import type { User } from "@/types/auth.types";
import type {
  UserDetail,
  UserList,
  UserCreate,
  UserUpdate,
  Role,
  RoleCreate,
  RoleUpdate,
  Permission,
  ChangePasswordData,
  ResetPasswordData,
  PaginatedResponse,
  Store
} from "@/types/users-roles.types";

const login = (data: { email: string; password: string }): Promise<AxiosResponse<User>> => {
  return Axios.post('/v1/auth/login/', data);
};

// Users API
const getUsers = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}): Promise<AxiosResponse<PaginatedResponse<UserList>>> => {
  return Axios.get('/v1/auth/users/', { params });
};

const getUserById = (id: number): Promise<AxiosResponse<UserDetail>> => {
  return Axios.get(`/v1/auth/users/${id}/`);
};

const createUser = (data: UserCreate): Promise<AxiosResponse<UserDetail>> => {
  return Axios.post('/v1/auth/users/', data);
};

const updateUser = (id: number, data: UserUpdate): Promise<AxiosResponse<UserDetail>> => {
  return Axios.patch(`/v1/auth/users/${id}/`, data);
};

const deleteUser = (id: number): Promise<AxiosResponse<void>> => {
  return Axios.delete(`/v1/auth/users/${id}/`);
};

const changePassword = (data: ChangePasswordData): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post('/v1/auth/users/change_password/', data);
};

const resetPassword = (userId: number, data: ResetPasswordData): Promise<AxiosResponse<{ message: string }>> => {
  return Axios.post(`/v1/auth/users/${userId}/reset_password/`, data);
};

const getCurrentUser = (): Promise<AxiosResponse<UserDetail>> => {
  return Axios.get('/v1/auth/users/me/');
};

// Roles API
const getRoles = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<AxiosResponse<PaginatedResponse<Role>>> => {
  return Axios.get('/v1/auth/roles/', { params });
};

const getRoleById = (id: number): Promise<AxiosResponse<Role>> => {
  return Axios.get(`/v1/auth/roles/${id}/`);
};

const createRole = (data: RoleCreate): Promise<AxiosResponse<Role>> => {
  return Axios.post('/v1/auth/roles/', data);
};

const updateRole = (id: number, data: RoleUpdate): Promise<AxiosResponse<Role>> => {
  return Axios.patch(`/v1/auth/roles/${id}/`, data);
};

const deleteRole = (id: number): Promise<AxiosResponse<void>> => {
  return Axios.delete(`/v1/auth/roles/${id}/`);
};

// Permissions API
const getPermissions = (params?: {
  page?: number;
  page_size?: number;
}): Promise<AxiosResponse<PaginatedResponse<Permission>>> => {
  return Axios.get('/v1/auth/permissions/', { params });
};

// Stores API (for assignment)
const getStores = (): Promise<AxiosResponse<Store[]>> => {
  return Axios.get('/v1/inventory/stores/');
};

export const UserServices = {
  login,
  // Users
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  getCurrentUser,
  // Roles
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  // Permissions
  getPermissions,
  // Stores
  getStores,
};
