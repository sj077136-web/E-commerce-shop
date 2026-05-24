import { create } from 'zustand'

export type View = 
  | 'home' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'login' 
  | 'register' 
  | 'orders' 
  | 'profile'

interface AppState {
  // Navigation
  currentView: View
  selectedProductId: string | null
  
  // User
  user: { id: string; email: string; name: string } | null
  
  // Cart (client-side cache for quick access)
  cartItemCount: number
  
  // Actions
  navigate: (view: View, productId?: string | null) => void
  setUser: (user: { id: string; email: string; name: string } | null) => void
  setCartItemCount: (count: number) => void
  incrementCartItemCount: (by?: number) => void
  decrementCartItemCount: (by?: number) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  selectedProductId: null,
  user: null,
  cartItemCount: 0,

  navigate: (view, productId = null) => {
    set({ currentView: view, selectedProductId: productId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  setUser: (user) => set({ user }),

  setCartItemCount: (count) => set({ cartItemCount: count }),

  incrementCartItemCount: (by = 1) => 
    set((state) => ({ cartItemCount: state.cartItemCount + by })),

  decrementCartItemCount: (by = 1) => 
    set((state) => ({ cartItemCount: Math.max(0, state.cartItemCount - by) })),

  logout: () => set({ user: null, cartItemCount: 0 }),
}))
