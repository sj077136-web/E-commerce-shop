import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, getTokenFromCookies } from '@/lib/auth'

async function getAuthUser(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get('cookie'))
  if (!token) return null
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 400 })
    }

    // Upsert: if item exists in cart, increase quantity
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId: payload.userId, productId } },
    })

    let cartItem
    if (existing) {
      const newQuantity = existing.quantity + quantity
      if (newQuantity > product.stock) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 })
      }
      cartItem = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true },
      })
    } else {
      cartItem = await db.cartItem.create({
        data: {
          userId: payload.userId,
          productId,
          quantity,
        },
        include: { product: true },
      })
    }

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { cartItemId, quantity } = await request.json()

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'Cart item ID and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: cartItemId } })
      return NextResponse.json({ success: true, removed: true })
    }

    const cartItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
