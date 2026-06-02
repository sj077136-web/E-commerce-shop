import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

async function getAuth(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  if (!token) return null
  return verifyToken(token)
}

// POST /api/posts/comments - Add a comment
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { postId, content } = await request.json()
    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 })
    }

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const comment = await db.comment.create({
      data: { content: content.trim(), postId, authorId: payload.userId },
      include: { author: { select: { id: true, name: true, username: true, avatar: true } } },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}

// DELETE /api/posts/comments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getAuth(request)
    if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    if (!commentId) return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })

    const comment = await db.comment.findUnique({ where: { id: commentId } })
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    if (comment.authorId !== payload.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await db.comment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
