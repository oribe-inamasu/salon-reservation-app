import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (connectionString && (connectionString.startsWith('postgres') || connectionString.includes('vercel-storage.com'))) {
        const pool = new Pool({ connectionString })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }
    return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
