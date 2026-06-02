'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import PostCard from './PostCard'
import { UserPlus, UserCheck, Calendar, ArrowLeft, MapPin } from 'lucide-react'

interface ProfileUser {
  id: string
  name: string
  username: string
  bio: string
  avatar: string
  coverImage: string
  createdAt: string
  followerCount: number
  followingCount: number
  postCount: number
  isFollowing: boolean
  isSelf: boolean
}

export default function Profile({ userId }: { userId: string }) {
  const { user, navigate } = useAppStore()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/users?id=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfileUser(data.user)
          setEditForm({ name: data.user.name, bio: data.user.bio })
        }
        const postsRes = await fetch(`/api/posts?userId=${userId}`)
        if (postsRes.ok) {
          const data = await postsRes.json()
          setPosts(data.posts)
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  const handleFollow = async () => {
    if (!user) { navigate('login'); return }
    setFollowLoading(true)
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfileUser(prev => prev ? {
          ...prev,
          isFollowing: data.following,
          followerCount: prev.followerCount + (data.following ? 1 : -1),
        } : null)
      }
    } catch {} finally {
      setFollowLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        useAppStore.getState().setUser({ ...user!, name: data.user.name, bio: data.user.bio })
        setProfileUser(prev => prev ? { ...prev, name: data.user.name, bio: data.user.bio } : null)
        setEditMode(false)
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl mb-4" />
        <div className="px-4 space-y-3">
          <div className="h-6 bg-gray-100 rounded w-40" />
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
        <button onClick={() => navigate('feed')} className="px-5 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700">Back to Feed</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate('feed')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Cover + Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />
        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-10">
            <img src={profileUser.avatar || '/avatars/default.svg'} alt={profileUser.name} className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white shadow-lg" />
            <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
              <h1 className="text-xl font-bold text-gray-900">{profileUser.name}</h1>
              <p className="text-sm text-gray-500">@{profileUser.username}</p>
            </div>
            {profileUser.isSelf ? (
              <button onClick={() => setEditMode(!editMode)} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : user ? (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                  profileUser.isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                    : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                }`}
              >
                {profileUser.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {profileUser.isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>

          {/* Edit Mode */}
          {editMode ? (
            <div className="mt-4 space-y-3">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Name" />
              <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" rows={3} placeholder="Bio" />
              <button onClick={handleSaveProfile} className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-full hover:bg-violet-700">Save</button>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-sm mt-3 leading-relaxed">{profileUser.bio}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-sm text-gray-500"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
            <div className="text-center">
              <p className="font-bold text-gray-900">{profileUser.postCount}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">{profileUser.followerCount}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">{profileUser.followingCount}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}
