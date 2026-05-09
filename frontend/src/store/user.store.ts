import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  isVerified: boolean
  twoFactorMethod: 'NONE' | 'EMAIL' | 'TOTP'
  createdAt: string
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
