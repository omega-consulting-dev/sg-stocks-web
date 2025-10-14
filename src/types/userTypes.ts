export interface User {
    id: number
    username: string
    email: string
    is_staff?: boolean
    is_active: boolean
    accessToken?: string | null
    refreshToken?: string | null
}