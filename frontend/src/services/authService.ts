import { apiClient } from './apiClient'
import type { AuthUser, LoginResponse } from '../types/auth'

export const authService = {
  login: (username: string, password: string) => apiClient.post<LoginResponse>('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) => apiClient.post<LoginResponse>('/auth/register', { username, email, password }),
  guest: () => apiClient.post<LoginResponse>('/auth/guest'),
  me: () => apiClient.get<AuthUser>('/auth/me'),
}
