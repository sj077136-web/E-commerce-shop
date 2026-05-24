'use client'

import { Store } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CodeAlpha Shop</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop destination for premium products. Quality, affordability, and exceptional service guaranteed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['All Products', 'Electronics', 'Fashion', 'Lifestyle', 'Furniture'].map((link) => (
                <li key={link}>
                  <span className="text-sm text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {['Contact Us', 'Shipping Policy', 'Returns & Exchanges', 'FAQ', 'Track Order'].map((link) => (
                <li key={link}>
                  <span className="text-sm text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers and new arrivals.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2024 CodeAlpha Shop. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with Next.js &amp; Prisma
          </p>
        </div>
      </div>
    </footer>
  )
}
