import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ users: [] })
    }

    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { username: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
