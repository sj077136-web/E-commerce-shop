'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'

interface CartItemWithProduct {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function Cart() {
  const { navigate, user } = useAppStore()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchCart()
  }, [user])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.cartItems)
        const count = data.cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0)
        useAppStore.getState().setCartItemCount(count)
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(itemId)
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId: itemId, quantity }),
      })
      if (res.ok) {
        await fetchCart()
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchCart()
      }
    } catch {
      // Handle error
    } finally {
      setUpdating(null)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shipping

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to add items to your cart</p>
        <button
          onClick={() => navigate('login')}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border">
              <div className="w-24 h-24 bg-gray-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Start adding some products to your cart</p>
          <button
            onClick={() => navigate('home')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
              >
                {/* Product Image */}
                <div
                  className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => navigate('product', item.product.id)}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-emerald-600 transition-colors truncate"
                    onClick={() => navigate('product', item.product.id)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    ${item.product.price.toFixed(2)} each
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.product.stock}
                        className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-emerald-600">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900 text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('checkout')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
