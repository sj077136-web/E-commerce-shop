import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

async function getAuth(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  if (!token) return null
  return verifyToken(token)
}

// GET /api/posts - Get feed posts
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const where: Record<string, unknown> = {}
    if (userId) where.authorId = userId

    // If authenticated, include user's liked status
    const posts = await db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          include: { author: { select: { id: true, name: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const postsWithLiked = posts.map((post) => ({
      ...post,
      liked: payload ? post.likes.some((l) => l.userId === payload.userId) : false,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    }))

    return NextResponse.json({ posts: postsWithLiked })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { content, image } = await request.json()
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    const post = await db.post.create({
      data: { content: content.trim(), image: image || '', authorId: payload.userId },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        comments: { include: { author: { select: { id: true, name: true, username: true, avatar: true } } } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json({
      post: {
        ...post,
        liked: false,
        likeCount: 0,
        commentCount: 0,
      },
    })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

// DELETE /api/posts?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 })

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.authorId !== payload.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await db.post.delete({ where: { id: postId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
