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

    const orders = await db.order.findMany({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { name, email, address, city, zip } = await request.json()

    if (!name || !email || !address || !city || !zip) {
      return NextResponse.json({ error: 'All shipping fields are required' }, { status: 400 })
    }

    // Get cart items
    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.userId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${item.product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId,
          total,
          status: 'confirmed',
          name,
          email,
          address,
          city,
          zip,
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      })

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: payload.userId },
      })

      return newOrder
    })

    // Fetch the complete order with items
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json({ order: completeOrder })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
