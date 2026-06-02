import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

async function getAuth(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  if (!token) return null
  return verifyToken(token)
}

// POST /api/posts/likes - Toggle like
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { postId } = await request.json()
    if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })

    const existing = await db.like.findUnique({
      where: { postId_userId: { postId, userId: payload.userId } },
    })

    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      await db.like.create({
        data: { postId, userId: payload.userId },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
