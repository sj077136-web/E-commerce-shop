'use client'

import { useAppStore } from '@/lib/store'
import Header from '@/components/ecommerce/Header'
import Footer from '@/components/ecommerce/Footer'
import ProductGrid from '@/components/ecommerce/ProductGrid'
import ProductDetail from '@/components/ecommerce/ProductDetail'
import Cart from '@/components/ecommerce/Cart'
import Checkout from '@/components/ecommerce/Checkout'
import AuthForm from '@/components/ecommerce/AuthForm'
import OrderHistory from '@/components/ecommerce/OrderHistory'

export default function Home() {
  const { currentView, selectedProductId } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'product':
        return selectedProductId ? (
          <ProductDetail productId={selectedProductId} />
        ) : null
      case 'cart':
        return <Cart />
      case 'checkout':
        return <Checkout />
      case 'login':
        return <AuthForm mode="login" />
      case 'register':
        return <AuthForm mode="register" />
      case 'orders':
        return <OrderHistory />
      case 'home':
      default:
        return <ProductGrid />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
    </div>
  )
}
