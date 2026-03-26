import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";

console.log(`📡 Connecting to SQLite (dev.db) via PrismaBetterSqlite3`);
const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@example.com";
  const password = "password";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: "管理者",
      password: hashedPassword,
    },
  });

  console.log(`✅ ユーザー作成完了: ${user.email}`);
  console.log(`🔑 初期ログイン情報:`);
  console.log(`   メールアドレス: ${email}`);
  console.log(`   パスワード: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
