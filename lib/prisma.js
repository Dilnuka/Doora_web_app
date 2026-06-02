import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Lazy client so `next build` does not require DATABASE_URL at module load.
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrisma()
      const value = client[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
)
