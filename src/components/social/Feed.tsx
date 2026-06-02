'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import PostCard from './PostCard'
import { PenSquare, Loader2 } from 'lucide-react'

interface PostData {
  id: string
  content: string
  image: string
  createdAt: string
  author: { id: string; name: string; username: string; avatar: string }
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string; username: string; avatar: string } }[]
  liked: boolean
  likeCount: number
  commentCount: number
}

export default function Feed() {
  const { user, navigate } = useAppStore()
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleCreatePost = async () => {
    if (!user) { navigate('login'); return }
    if (!newPost.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      })
      if (res.ok) {
        const data = await res.json()
        setPosts([data.post, ...posts])
        setNewPost('')
        setShowPostForm(false)
      }
    } catch {} finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to Connecta</h1>
          <p className="text-violet-200 text-sm sm:text-base">Share your thoughts, connect with people, and join the conversation.</p>
        </div>
      </div>

      {/* Create Post */}
      {user ? (
        <div className="mb-6">
          {!showPostForm ? (
            <button
              onClick={() => setShowPostForm(true)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <img src={user.avatar || '/avatars/default.svg'} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
              <span className="text-gray-400 text-sm">What&apos;s on your mind, {user.name.split(' ')[0]}?</span>
              <PenSquare className="w-5 h-5 text-violet-400 ml-auto" />
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex gap-3 mb-3">
                <img src={user.avatar || '/avatars/default.svg'} alt="" className="w-10 h-10 rounded-full bg-gray-100" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                rows={3}
                className="w-full text-[15px] text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <button onClick={() => { setShowPostForm(false); setNewPost('') }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-600 mb-3">Sign in to create posts and interact with the community</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate('login')} className="px-5 py-2 text-sm font-medium text-violet-600 border border-violet-200 rounded-full hover:bg-violet-50">Sign In</button>
            <button onClick={() => navigate('register')} className="px-5 py-2 text-sm font-medium text-white bg-violet-600 rounded-full hover:bg-violet-700">Sign Up</button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  )
}
