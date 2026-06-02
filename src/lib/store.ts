import { create } from 'zustand'

export type View = 
  | 'feed' 
  | 'profile' 
  | 'login' 
  | 'register' 
  | 'search'
  | 'edit-profile'

interface User {
  id: string
  email: string
  name: string
  username: string
  avatar: string
  bio: string
}

interface AppState {
  currentView: View
  viewingUserId: string | null
  user: User | null

  navigate: (view: View, userId?: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'feed',
  viewingUserId: null,
  user: null,

  navigate: (view, userId = null) => {
    set({ currentView: view, viewingUserId: userId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),
}))
