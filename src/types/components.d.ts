// Déclarations TypeScript pour les composants UI et stores

// Composants UI Button
declare module '@/components/ui/button' {
  import type { DefineComponent } from 'vue'
  export const Button: DefineComponent<any, any, any>
  export const buttonVariants: any
}

// Composants UI Card
declare module '@/components/ui/card' {
  import type { DefineComponent } from 'vue'
  export const Card: DefineComponent<any, any, any>
  export const CardHeader: DefineComponent<any, any, any>
  export const CardTitle: DefineComponent<any, any, any>
  export const CardDescription: DefineComponent<any, any, any>
  export const CardContent: DefineComponent<any, any, any>
  export const CardFooter: DefineComponent<any, any, any>
}

// Composants UI Dialog
declare module '@/components/ui/dialog' {
  import type { DefineComponent } from 'vue'
  export const Dialog: DefineComponent<any, any, any>
  export const DialogContent: DefineComponent<any, any, any>
  export const DialogDescription: DefineComponent<any, any, any>
  export const DialogFooter: DefineComponent<any, any, any>
  export const DialogHeader: DefineComponent<any, any, any>
  export const DialogTitle: DefineComponent<any, any, any>
  export const DialogTrigger: DefineComponent<any, any, any>
  export const DialogClose: DefineComponent<any, any, any>
}

// Composants UI Input
declare module '@/components/ui/input' {
  import type { DefineComponent } from 'vue'
  export const Input: DefineComponent<any, any, any>
}

// Composants UI Label
declare module '@/components/ui/label' {
  import type { DefineComponent } from 'vue'
  export const Label: DefineComponent<any, any, any>
}

// Composants UI Textarea
declare module '@/components/ui/textarea' {
  import type { DefineComponent } from 'vue'
  export const Textarea: DefineComponent<any, any, any>
}

// Composants UI Select
declare module '@/components/ui/select' {
  import type { DefineComponent } from 'vue'
  export const Select: DefineComponent<any, any, any>
  export const SelectContent: DefineComponent<any, any, any>
  export const SelectGroup: DefineComponent<any, any, any>
  export const SelectItem: DefineComponent<any, any, any>
  export const SelectLabel: DefineComponent<any, any, any>
  export const SelectTrigger: DefineComponent<any, any, any>
  export const SelectValue: DefineComponent<any, any, any>
  export const SelectSeparator: DefineComponent<any, any, any>
  export const SelectScrollUpButton: DefineComponent<any, any, any>
  export const SelectScrollDownButton: DefineComponent<any, any, any>
}

// Composants UI Avatar
declare module '@/components/ui/avatar' {
  import type { DefineComponent } from 'vue'
  export const Avatar: DefineComponent<any, any, any>
  export const AvatarImage: DefineComponent<any, any, any>
  export const AvatarFallback: DefineComponent<any, any, any>
}

// Composants UI Switch
declare module '@/components/ui/switch' {
  import type { DefineComponent } from 'vue'
  export const Switch: DefineComponent<any, any, any>
}

// Composants UI Separator
declare module '@/components/ui/separator' {
  import type { DefineComponent } from 'vue'
  export const Separator: DefineComponent<any, any, any>
}

// Composants UI Collapsible
declare module '@/components/ui/collapsible' {
  import type { DefineComponent } from 'vue'
  export const Collapsible: DefineComponent<any, any, any>
  export const CollapsibleContent: DefineComponent<any, any, any>
  export const CollapsibleTrigger: DefineComponent<any, any, any>
}

// Composants UI Popover
declare module '@/components/ui/popover' {
  import type { DefineComponent } from 'vue'
  export const Popover: DefineComponent<any, any, any>
  export const PopoverContent: DefineComponent<any, any, any>
  export const PopoverTrigger: DefineComponent<any, any, any>
}

// Composants UI Loading
declare module '@/components/ui/loading/LoadingState.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

// Composants UI Empty
declare module '@/components/ui/empty/EmptyState.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<any, any, any>
  export default component
}

// Stores
declare module '@/stores/users.store' {
  export function useUsersStore(): any
}

declare module '@/stores/stores.store' {
  export function useStoresStore(): any
}

declare module '@/stores/fournisseurs' {
  export function useFournisseursStore(): any
  export interface Supplier {
    id: number
    code: string
    name: string
    [key: string]: any
  }
  export interface CreateSupplierDto {
    name: string
    [key: string]: any
  }
}

// Types
declare module '@/types/user.types' {
  export interface User {
    id: number
    username: string
    email: string
    [key: string]: any
  }
  export interface UserCreateData {
    username: string
    email: string
    [key: string]: any
  }
  export interface UserUpdateData {
    [key: string]: any
  }
}

declare module '@/types/store.types' {
  export interface Store {
    id: number
    name: string
    code: string
    [key: string]: any
  }
  export interface StoreCreateData {
    name: string
    [key: string]: any
  }
  export interface StoreUpdateData {
    [key: string]: any
  }
}

// Utilitaires
declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void
}
