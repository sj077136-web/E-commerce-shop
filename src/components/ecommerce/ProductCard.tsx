'use client'

import { useAppStore } from '@/lib/store'
import { Star, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  rating: number
}

export default function ProductCard({ product }: { product: Product }) {
  const { navigate, user } = useAppStore()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      navigate('login')
      return
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      if (res.ok) {
        useAppStore.getState().incrementCartItemCount(1)
      }
    } catch {
      // Handle error
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.floor(rating)
                ? 'text-amber-400 fill-amber-400'
                : star <= rating
                ? 'text-amber-400 fill-amber-200'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">{rating}</span>
      </div>
    )
  }

  return (
    <div
      onClick={() => navigate('product', product.id)}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
            Out of Stock
          </span>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {renderStars(product.rating)}
        </div>
      </div>
    </div>
  )
}
