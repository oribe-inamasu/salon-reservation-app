/* eslint-disable @typescript-eslint/no-require-imports */

try {
  const prismaClientPath = require.resolve('@prisma/client');
  console.log('Prisma client resolved to:', prismaClientPath);
  
  const fs = require('fs');
  // @prisma/client resolves to its directory, we need the actual .d.ts which is usually in .prisma/client
  const dotPrismaPath = require.resolve('.prisma/client');
  console.log('.prisma/client resolved to:', dotPrismaPath);
  
  if (fs.existsSync(dotPrismaPath)) {
    const content = fs.readFileSync(dotPrismaPath, 'utf8');
    console.log('payment_method in .prisma/client/index.d.ts:', content.includes('payment_method'));
  }
} catch (e) {
  console.error('Error resolving prisma client:', e.message);
  console.error(e.stack);
}
