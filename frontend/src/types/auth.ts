export type Role = 'GUEST' | 'CUSTOMER' | 'EMPLOYEE' | 'MANAGER' | 'OWNER'
export type AuthenticationType = 'LOCAL' | 'GOOGLE' | 'GUEST'
export interface AuthUser { id: number | null; email: string | null; username: string; role: Role; authenticationType: AuthenticationType }
export interface LoginResponse { accessToken: string; tokenType: 'Bearer'; user: AuthUser }
