'use client'

import { useAppStore } from '@/lib/store'
import { useState, useEffect, useCallback } from 'react'
import { Home, Search, User, LogOut, Menu, X, PenSquare, Users } from 'lucide-react'

export default function Header() {
  const { user, navigate, currentView, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) useAppStore.getState().setUser(data.user)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    navigate('feed')
  }

  const navItems = user
    ? [
        { label: 'Feed', view: 'feed' as const, icon: Home },
        { label: 'Search', view: 'search' as const, icon: Search },
        { label: 'Profile', view: 'profile' as const, icon: User },
      ]
    : []

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button onClick={() => navigate('feed')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Connecta
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  if (item.view === 'profile') navigate('profile', user?.id)
                  else navigate(item.view)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === item.view || (item.view === 'profile' && currentView === 'profile')
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">Sign In</button>
                <button onClick={() => navigate('register')} className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm">Sign Up</button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-2 text-gray-600">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    if (item.view === 'profile') navigate('profile', user?.id)
                    else navigate(item.view)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentView === item.view ? 'bg-violet-50 text-violet-700' : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {user ? (
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 rounded-xl">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <button onClick={() => { navigate('login'); setMobileMenuOpen(false) }} className="w-full py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl">Sign In</button>
                  <button onClick={() => { navigate('register'); setMobileMenuOpen(false) }} className="w-full py-2.5 text-sm text-white bg-violet-600 rounded-xl">Sign Up</button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
