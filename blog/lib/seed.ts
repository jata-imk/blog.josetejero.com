import type { Payload } from 'payload'

interface SeedUser {
  email: string
  password: string
  name: string
  role: 'admin' | 'editor'
}

const TEST_USERS: SeedUser[] = [
  {
    email: 'admin@test.local',
    password: 'admin123',
    name: 'Admin QA',
    role: 'admin',
  },
  {
    email: 'editor@test.local',
    password: 'editor123',
    name: 'Editor QA',
    role: 'editor',
  },
]

export async function seedUsers(payload: Payload): Promise<void> {
  for (const user of TEST_USERS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
    })

    if (existing.totalDocs > 0) continue

    await payload.create({
      collection: 'users',
      data: user,
    })

    payload.logger.info(`[seed] Created test user: ${user.email} (${user.role})`)
  }
}
