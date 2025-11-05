export interface User {
    id: number
    username: string
    email: string
    is_staff?: boolean
    is_active: boolean
    access?: string | null
    refresh?: string | null
}