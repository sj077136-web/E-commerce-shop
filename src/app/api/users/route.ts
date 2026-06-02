import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

async function getAuth(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  if (!token) return null
  return verifyToken(token)
}

// GET /api/users?username=xxx or /api/users?id=xxx
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('id')

    let user
    if (username) {
      user = await db.user.findUnique({ where: { username } })
    } else if (userId) {
      user = await db.user.findUnique({ where: { id: userId } })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get follower/following counts
    const followerCount = await db.follow.count({ where: { followingId: user.id } })
    const followingCount = await db.follow.count({ where: { followerId: user.id } })
    const postCount = await db.post.count({ where: { authorId: user.id } })

    // Check if current user follows this user
    let isFollowing = false
    if (payload) {
      const follow = await db.follow.findUnique({
        where: { followerId_followingId: { followerId: payload.userId, followingId: user.id } },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        createdAt: user.createdAt,
        followerCount,
        followingCount,
        postCount,
        isFollowing,
        isSelf: payload ? payload.userId === user.id : false,
      },
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT /api/users - Update profile
export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { name, bio, avatar } = await request.json()
    const user = await db.user.update({
      where: { id: payload.userId },
      data: { name, bio, avatar },
      select: { id: true, name: true, username: true, email: true, bio: true, avatar: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
