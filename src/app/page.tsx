'use client'

import { useAppStore } from '@/lib/store'
import Header from '@/components/social/Header'
import Footer from '@/components/social/Footer'
import Feed from '@/components/social/Feed'
import Profile from '@/components/social/Profile'
import AuthForm from '@/components/social/AuthForm'
import SearchUsers from '@/components/social/SearchUsers'

export default function Home() {
  const { currentView, viewingUserId } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return viewingUserId ? <Profile userId={viewingUserId} /> : null
      case 'login':
        return <AuthForm mode="login" />
      case 'register':
        return <AuthForm mode="register" />
      case 'search':
        return <SearchUsers />
      case 'feed':
      default:
        return <Feed />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
    </div>
  )
}
