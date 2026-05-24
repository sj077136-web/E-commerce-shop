import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const user = await db.user.upsert({
    where: { email: 'demo@codealpha.tech' },
    update: {},
    create: {
      email: 'demo@codealpha.tech',
      name: 'Demo User',
      passwordHash: hashedPassword,
    },
  })

  console.log('Created demo user:', user.email)

  // Create products
  const products = await Promise.all([
    db.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Features comfortable memory foam ear cushions and a built-in microphone for hands-free calls.',
        price: 79.99,
        image: '/products/headphones.svg',
        category: 'Electronics',
        stock: 45,
        rating: 4.5,
      },
    }),
    db.product.create({
      data: {
        name: 'Smart Fitness Watch',
        description: 'Track your health and fitness goals with this advanced smartwatch. Includes heart rate monitoring, GPS tracking, sleep analysis, and 50+ workout modes. Water-resistant up to 50 meters with a 7-day battery life.',
        price: 149.99,
        image: '/products/watch.svg',
        category: 'Electronics',
        stock: 30,
        rating: 4.3,
      },
    }),
    db.product.create({
      data: {
        name: 'Portable Bluetooth Speaker',
        description: 'Compact and powerful portable speaker with 360-degree sound. Waterproof design (IPX7) makes it perfect for outdoor adventures. Features 12-hour battery life and the ability to pair two speakers for stereo sound.',
        price: 49.99,
        image: '/products/speaker.svg',
        category: 'Electronics',
        stock: 60,
        rating: 4.7,
      },
    }),
    db.product.create({
      data: {
        name: 'Mechanical Gaming Keyboard',
        description: 'Full-size mechanical keyboard with customizable RGB backlighting and hot-swappable switches. Features anti-ghosting, programmable macro keys, and a durable aluminum frame. Perfect for gaming and productivity.',
        price: 89.99,
        image: '/products/keyboard.svg',
        category: 'Electronics',
        stock: 25,
        rating: 4.6,
      },
    }),
    db.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Premium ergonomic office chair with adjustable lumbar support, breathable mesh back, and 4D armrests. Features a tilt mechanism with lock positions and smooth-rolling casters for all floor types.',
        price: 299.99,
        image: '/products/chair.svg',
        category: 'Furniture',
        stock: 15,
        rating: 4.8,
      },
    }),
    db.product.create({
      data: {
        name: 'Minimalist Desk Lamp',
        description: 'Modern LED desk lamp with adjustable color temperature and brightness levels. Features a sleek aluminum design, USB charging port, and touch-sensitive controls. Energy-efficient with a lifespan of 50,000 hours.',
        price: 39.99,
        image: '/products/lamp.svg',
        category: 'Furniture',
        stock: 40,
        rating: 4.2,
      },
    }),
    db.product.create({
      data: {
        name: 'Premium Leather Backpack',
        description: 'Handcrafted genuine leather backpack with a padded laptop compartment (fits up to 15.6 inches). Features multiple organizer pockets, water-resistant lining, and comfortable padded shoulder straps.',
        price: 129.99,
        image: '/products/backpack.svg',
        category: 'Fashion',
        stock: 20,
        rating: 4.4,
      },
    }),
    db.product.create({
      data: {
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Features a durable rubber outsole with enhanced grip, reflective details for visibility, and a secure lace-up closure system.',
        price: 109.99,
        image: '/products/shoes.svg',
        category: 'Fashion',
        stock: 35,
        rating: 4.6,
      },
    }),
    db.product.create({
      data: {
        name: 'Stainless Steel Water Bottle',
        description: 'Double-wall vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Made from food-grade 18/8 stainless steel with a leak-proof lid and BPA-free materials.',
        price: 24.99,
        image: '/products/bottle.svg',
        category: 'Lifestyle',
        stock: 80,
        rating: 4.9,
      },
    }),
    db.product.create({
      data: {
        name: 'Aroma Diffuser Set',
        description: 'Ultrasonic essential oil diffuser with 7 color LED mood lighting. Includes a set of 3 premium essential oils (lavender, eucalyptus, and sweet orange). Features auto shut-off and whisper-quiet operation.',
        price: 34.99,
        image: '/products/diffuser.svg',
        category: 'Lifestyle',
        stock: 50,
        rating: 4.3,
      },
    }),
    db.product.create({
      data: {
        name: 'Wireless Charging Pad',
        description: 'Ultra-slim wireless charging pad compatible with all Qi-enabled devices. Features fast charging up to 15W, built-in safety protection against overcharging and overheating, and an anti-slip silicone surface.',
        price: 19.99,
        image: '/products/charger.svg',
        category: 'Electronics',
        stock: 70,
        rating: 4.1,
      },
    }),
    db.product.create({
      data: {
        name: 'Yoga Mat Premium',
        description: 'Extra-thick 6mm yoga mat with non-slip texture on both sides. Made from eco-friendly TPE material with a carrying strap included. Features alignment markings and excellent cushioning for joints.',
        price: 29.99,
        image: '/products/yogamat.svg',
        category: 'Lifestyle',
        stock: 55,
        rating: 4.5,
      },
    }),
  ])

  console.log(`Created ${products.length} products`)

  // Create product SVG images
  const fs = await import('fs')
  const path = await import('path')
  
  const productsDir = path.join(process.cwd(), 'public', 'products')
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true })
  }

  // Generate simple SVG placeholders for each product
  const productColors: Record<string, string> = {
    headphones: '#6366f1',
    watch: '#8b5cf6',
    speaker: '#ec4899',
    keyboard: '#f59e0b',
    chair: '#10b981',
    lamp: '#f97316',
    backpack: '#a855f7',
    shoes: '#14b8a6',
    bottle: '#3b82f6',
    diffuser: '#84cc16',
    charger: '#64748b',
    yogamat: '#e879f9',
  }

  const productIcons: Record<string, string> = {
    headphones: '🎧',
    watch: '⌚',
    speaker: '🔊',
    keyboard: '⌨️',
    chair: '🪑',
    lamp: '💡',
    backpack: '🎒',
    shoes: '👟',
    bottle: '🍶',
    diffuser: '🌿',
    charger: '⚡',
    yogamat: '🧘',
  }

  for (const [name, color] of Object.entries(productColors)) {
    const icon = productIcons[name] || '📦'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-${name})" rx="20"/>
  <circle cx="200" cy="180" r="80" fill="${color}" opacity="0.15"/>
  <text x="200" y="200" text-anchor="middle" font-size="80">${icon}</text>
  <text x="200" y="320" text-anchor="middle" font-family="system-ui" font-size="16" fill="${color}" font-weight="600">${name.charAt(0).toUpperCase() + name.slice(1)}</text>
</svg>`
    fs.writeFileSync(path.join(productsDir, `${name}.svg`), svg)
  }

  console.log('Created product SVG images')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
