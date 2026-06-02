'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react'

interface Author {
  id: string
  name: string
  username: string
  avatar: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: Author
}

interface PostProps {
  id: string
  content: string
  image: string
  createdAt: string
  author: Author
  comments: Comment[]
  liked: boolean
  likeCount: number
  commentCount: number
  onUpdate?: () => void
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PostCard({ id, content, image, createdAt, author, comments: initialComments, liked: initialLiked, likeCount: initialLikeCount, commentCount: initialCommentCount, onUpdate }: PostProps) {
  const { user, navigate } = useAppStore()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)

  const handleLike = async () => {
    if (!user) { navigate('login'); return }
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 300)
    try {
      await fetch('/api/posts/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      })
    } catch {}
  }

  const handleComment = async () => {
    if (!user) { navigate('login'); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, content: commentText }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments([...comments, data.comment])
        setCommentText('')
      }
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok && onUpdate) onUpdate()
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate('profile', author.id)} className="flex-shrink-0">
          <img src={author.avatar || '/avatars/default.svg'} alt={author.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={() => navigate('profile', author.id)} className="font-semibold text-sm text-gray-900 hover:text-violet-600 transition-colors">
            {author.name}
          </button>
          <p className="text-xs text-gray-400">@{author.username} · {timeAgo(createdAt)}</p>
        </div>
        {user && user.id === author.id && (
          <button onClick={handleDeletePost} className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pb-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            liked ? 'text-rose-500 bg-rose-50' : 'text-gray-500 hover:bg-gray-50'
          } ${likeAnim ? 'scale-110' : ''}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-50">
          {/* Comment List */}
          {comments.length > 0 && (
            <div className="max-h-60 overflow-y-auto px-4 py-3 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <button onClick={() => navigate('profile', comment.author.id)} className="flex-shrink-0">
                    <img src={comment.author.avatar || '/avatars/default.svg'} alt={comment.author.name} className="w-7 h-7 rounded-full object-cover bg-gray-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <button onClick={() => navigate('profile', comment.author.id)} className="font-semibold text-xs text-gray-900 hover:text-violet-600">
                        {comment.author.name}
                      </button>
                      <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">{timeAgo(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          {user && (
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50">
              <img src={user.avatar || '/avatars/default.svg'} alt={user.name} className="w-7 h-7 rounded-full object-cover bg-gray-100" />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 text-sm bg-gray-50 border-0 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="p-2 text-violet-600 hover:bg-violet-50 rounded-full transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
