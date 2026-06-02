import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

// POST /api/users/follow - Toggle follow
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromCookies(request.headers.get('cookie'))
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    if (userId === payload.userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: payload.userId, followingId: userId } },
    })

    if (existing) {
      await db.follow.delete({ where: { id: existing.id } })
      return NextResponse.json({ following: false })
    } else {
      await db.follow.create({
        data: { followerId: payload.userId, followingId: userId },
      })
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
  }
}
