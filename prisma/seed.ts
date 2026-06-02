import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const users = [
    { email: 'demo@codealpha.tech', name: 'Jagan Sahu', username: 'jagan', bio: 'Full-stack developer & tech enthusiast. Building cool stuff at CodeAlpha! 🚀', avatar: '/avatars/jagan.svg' },
    { email: 'alice@example.com', name: 'Alice Chen', username: 'alice', bio: 'UI/UX designer | Coffee lover | Cat person 🐱', avatar: '/avatars/alice.svg' },
    { email: 'bob@example.com', name: 'Bob Martinez', username: 'bob', bio: 'Software engineer at Google. Open source contributor.', avatar: '/avatars/bob.svg' },
    { email: 'carol@example.com', name: 'Carol Wang', username: 'carol', bio: 'Data scientist | ML researcher | Bookworm 📚', avatar: '/avatars/carol.svg' },
    { email: 'dave@example.com', name: 'Dave Kim', username: 'dave', bio: 'Startup founder. Building the future, one line at a time.', avatar: '/avatars/dave.svg' },
    { email: 'eve@example.com', name: 'Eve Johnson', username: 'eve', bio: 'Photographer | Traveler | Foodie 🌍📷', avatar: '/avatars/eve.svg' },
  ]

  const createdUsers = []
  for (const u of users) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await db.user.create({
      data: { ...u, passwordHash: hashedPassword },
    })
    createdUsers.push(user)
  }
  console.log(`Created ${createdUsers.length} users`)

  // Create follows (jagan follows alice, bob, carol; alice follows jagan, dave; etc.)
  const followPairs = [
    [0, 1], [0, 2], [0, 3], // jagan follows alice, bob, carol
    [1, 0], [1, 4],         // alice follows jagan, dave
    [2, 0], [2, 3], [2, 5], // bob follows jagan, carol, eve
    [3, 1], [3, 4],         // carol follows alice, dave
    [4, 0], [4, 5],         // dave follows jagan, eve
    [5, 1], [5, 2],         // eve follows alice, bob
  ]

  for (const [followerIdx, followingIdx] of followPairs) {
    await db.follow.create({
      data: {
        followerId: createdUsers[followerIdx].id,
        followingId: createdUsers[followingIdx].id,
      },
    })
  }
  console.log('Created follow relationships')

  // Create posts
  const postsData = [
    { authorIdx: 0, content: 'Just launched my new e-commerce project! Built with Next.js and Prisma. The stack is incredibly fast. 🔥 #webdev #nextjs' },
    { authorIdx: 1, content: 'Design tip: White space is not empty space. It\'s a powerful design element that gives your content room to breathe. ✨ #uxdesign' },
    { authorIdx: 2, content: 'Open source is not just about code. It\'s about community, collaboration, and making technology accessible to everyone. 🌐 #opensource' },
    { authorIdx: 3, content: 'Just published my research paper on transformer architectures. The field of NLP is evolving so rapidly! 📝 #machinelearning #nlp' },
    { authorIdx: 4, content: 'Startup lesson #47: Build something people want, not something you think they need. Listen to your users early and often. 💡 #startups' },
    { authorIdx: 5, content: 'Captured the most beautiful sunset in Santorini today. Sometimes the best moments are unplanned. 🌅 #travel #photography' },
    { authorIdx: 0, content: 'Learning Rust this weekend. The ownership model is mind-bending but makes so much sense once it clicks. 🦀 #rustlang' },
    { authorIdx: 1, content: 'New Figma plugin just dropped! It auto-generates color palettes from images. Game changer for mood boards. 🎨 #figma #design' },
    { authorIdx: 2, content: 'Just hit 1000 GitHub stars on my side project! Never expected this kind of community support. Thank you all! ⭐ #milestone' },
    { authorIdx: 3, content: 'Reading "Designing Data-Intensive Applications" by Martin Kleppmann. Every engineer should read this book. 📖 #bookrecommendation' },
    { authorIdx: 4, content: 'Pitched to 5 investors today. 3 said yes. Sometimes persistence really does pay off. 🎯 #fundraising' },
    { authorIdx: 5, content: 'Street food in Bangkok is on another level. Pad Thai from a cart > fancy restaurant any day. 🍜 #foodie #bangkok' },
    { authorIdx: 0, content: 'TypeScript tip: Use `satisfies` operator for type checking without widening. It\'s been a game changer for our codebase. #typescript' },
    { authorIdx: 2, content: 'Just migrated our microservices from Docker to Kubernetes. The learning curve was steep but the orchestration capabilities are incredible. ☸️ #k8s #devops' },
    { authorIdx: 3, content: 'Women in Tech meetup was amazing tonight! So inspired by all the incredible engineers sharing their journeys. 💪 #womenintech' },
  ]

  const createdPosts = []
  for (const p of postsData) {
    const post = await db.post.create({
      data: { content: p.content, authorId: createdUsers[p.authorIdx].id },
    })
    createdPosts.push(post)
  }
  console.log(`Created ${createdPosts.length} posts`)

  // Create likes
  const likePairs = [
    [0, 0], [0, 2], [0, 5], // jagan likes posts
    [1, 0], [1, 1], [1, 7], // alice likes posts
    [2, 2], [2, 6], [2, 8], // bob likes posts
    [3, 3], [3, 9], [3, 14], // carol likes posts
    [4, 4], [4, 8], [4, 10], // dave likes posts
    [5, 5], [5, 11], [5, 14], // eve likes posts
    [0, 8], [1, 6], [2, 13], // more likes
    [3, 7], [4, 0], [5, 1],
  ]

  for (const [userIdx, postIdx] of likePairs) {
    await db.like.create({
      data: { userId: createdUsers[userIdx].id, postId: createdPosts[postIdx].id },
    })
  }
  console.log('Created likes')

  // Create comments
  const commentsData = [
    { authorIdx: 1, postIdx: 0, content: 'This looks amazing! Love the tech stack choice. 🙌' },
    { authorIdx: 2, postIdx: 0, content: 'Next.js + Prisma is such a solid combo. Well done!' },
    { authorIdx: 0, postIdx: 1, content: 'So true! White space can make or break a design.' },
    { authorIdx: 3, postIdx: 2, content: 'Couldn\'t agree more. Community is what makes open source special.' },
    { authorIdx: 4, postIdx: 8, content: 'Congrats on 1k stars! Well deserved! 🎉' },
    { authorIdx: 5, postIdx: 5, content: 'Santorini is magical! Was there last summer. 💙' },
    { authorIdx: 0, postIdx: 6, content: 'Rust is worth the learning curve. Stick with it!' },
    { authorIdx: 1, postIdx: 7, content: 'Ooh, dropping the link? 👀' },
    { authorIdx: 2, postIdx: 13, content: 'K8s is a beast but so powerful once you get the hang of it.' },
    { authorIdx: 3, postIdx: 9, content: 'One of my favorite tech books! DDIA is essential reading.' },
  ]

  for (const c of commentsData) {
    await db.comment.create({
      data: {
        content: c.content,
        postId: createdPosts[c.postIdx].id,
        authorId: createdUsers[c.authorIdx].id,
      },
    })
  }
  console.log('Created comments')

  // Generate avatar SVGs
  const fs = await import('fs')
  const path = await import('path')
  const avatarDir = path.join(process.cwd(), 'public', 'avatars')
  if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true })

  const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6']
  const avatarNames = ['jagan', 'alice', 'bob', 'carol', 'dave', 'eve']
  const initials = ['JS', 'AC', 'BM', 'CW', 'DK', 'EJ']

  for (let i = 0; i < avatarNames.length; i++) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${avatarColors[i]}" rx="100"/>
  <text x="100" y="115" text-anchor="middle" font-family="system-ui" font-size="72" font-weight="700" fill="white">${initials[i]}</text>
</svg>`
    fs.writeFileSync(path.join(avatarDir, `${avatarNames[i]}.svg`), svg)
  }
  console.log('Created avatar SVGs')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
