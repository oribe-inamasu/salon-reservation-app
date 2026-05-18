import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db"
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const customers = await prisma.customer.findMany();
    if (customers.length === 0) {
        console.log("顧客データが見つかりません。先に顧客を登録してください。");
        return;
    }

    const categories = ["鍼治療", "美容鍼", "マッサージ", "矯正・関節調整"];
    const paymentMethods = ["現金", "カード", "電子マネー"];
    const staffs = ["院長（スタッフA）", "スタッフB", "スタッフC"];

    console.log(`2026年4月分のダミー来店履歴を50件生成します...`);

    for (let i = 0; i < 50; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        
        // 4月のランダムな日（1日〜30日）
        const day = Math.floor(Math.random() * 30) + 1;
        const hour = Math.floor(Math.random() * 9) + 10; // 10:00 - 19:00
        const minute = Math.random() > 0.5 ? 0 : 30;
        
        const visitDate = new Date(2026, 3, day, hour, minute); // JSの月は0始まりなので 3 = 4月
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = 4000 + Math.floor(Math.random() * 6) * 1000; // 4000〜9000円

        await prisma.visitHistory.create({
            data: {
                customerId: customer.id,
                visit_date: visitDate,
                treatment_category: category,
                treatment_content: `${category}スタンダードコース`,
                price: price,
                staff: staffs[Math.floor(Math.random() * staffs.length)],
                payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                staff_memo: "これは自動生成されたテストデータです。",
            }
        });
    }

    console.log("50件の来店履歴を生成しました。");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
