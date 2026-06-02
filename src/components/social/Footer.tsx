'use client'

import { Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Connecta</span>
        </div>
        <p className="text-xs text-gray-500">A mini social media platform built with Next.js, Prisma & Tailwind CSS</p>
        <p className="text-xs text-gray-600 mt-2">&copy; 2024 Connecta. CodeAlpha Internship Project.</p>
      </div>
    </footer>
  )
}
