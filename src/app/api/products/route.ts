import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')

    const where: Record<string, unknown> = {}

    if (category && category !== 'All') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'price-asc') orderBy.price = 'asc'
    else if (sort === 'price-desc') orderBy.price = 'desc'
    else if (sort === 'rating') orderBy.rating = 'desc'
    else if (sort === 'newest') orderBy.createdAt = 'desc'
    else orderBy.name = 'asc'

    const products = await db.product.findMany({
      where,
      orderBy,
    })

    const categories = await db.product.findMany({
      select: { category: true },
      distinct: ['category'],
    })

    return NextResponse.json({
      products,
      categories: categories.map((c) => c.category),
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
