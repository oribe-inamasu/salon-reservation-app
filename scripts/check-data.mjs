import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      birth_date: true,
    },
    take: 20
  });

  console.log(JSON.stringify(customers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
