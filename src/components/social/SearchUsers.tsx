'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Search, UserPlus } from 'lucide-react'

interface SearchUser {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
}

export default function SearchUsers() {
  const { navigate, user } = useAppStore()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch {} finally {
      setSearching(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find People</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or username..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button onClick={handleSearch} className="px-5 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors text-sm">
          Search
        </button>
      </div>

      {/* Results */}
      {searching ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : searched && users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No users found for &quot;{query}&quot;</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Search for people to follow</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => navigate('profile', u.id)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow text-left"
            >
              <img src={u.avatar || '/avatars/default.svg'} alt={u.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
                {u.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{u.bio}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
