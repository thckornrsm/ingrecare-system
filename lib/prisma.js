import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient({ 
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // ✅ เพิ่ม connection pool และ timeout settings
    __internal: {
      engine: {
        connection_limit: 20, // เพิ่มจำนวน connection
        pool_timeout: 30, // timeout 30 วินาที
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ✅ เพิ่ม connection test และ cleanup
if (process.env.NODE_ENV !== 'production') {
  prisma.$connect()
    .then(() => console.log('✅ Prisma connected'))
    .catch((e) => console.error('❌ Prisma connection failed:', e));
}

// ✅ Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});