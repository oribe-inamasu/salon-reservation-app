import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 環境変数が読み込まれていない場合に備えて DATABASE_URL を明示的に設定
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

const adapter = new PrismaBetterSqlite3({
  url: dbUrl
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- 既存の生年月日データの修正を開始します ---');
  console.log(`使用するデータベース: ${dbUrl}`);

  const customers = await prisma.customer.findMany({
    where: {
      birth_date: {
        not: null,
      },
    },
  });

  console.log(`全 ${customers.length} 人の顧客データをチェック中...`);

  let fixCount = 0;

  for (const customer of customers) {
    const original = customer.birth_date;
    if (!original) continue;

    const trimmed = original.trim();
    let normalized = null;

    // 8桁数字 (YYYYMMDD) の場合
    if (/^\d{8}$/.test(trimmed)) {
      const y = trimmed.substring(0, 4);
      const m = trimmed.substring(4, 6);
      const d = trimmed.substring(6, 8);
      normalized = `${y}-${m}-${d}`;
    } 
    // スラッシュ区切り (YYYY/MM/DD) の場合
    else if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
      normalized = trimmed.replace(/\//g, '-');
    }

    if (normalized && normalized !== original) {
      console.log(`修正中: ID: ${customer.id} | ${original} -> ${normalized}`);
      await prisma.customer.update({
        where: { id: customer.id },
        data: { birth_date: normalized },
      });
      fixCount++;
    }
  }

  console.log(`--- 修正完了: ${fixCount} 件のデータを更新しました ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
