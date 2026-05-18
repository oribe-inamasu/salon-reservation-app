import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db"
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const customers = await prisma.customer.findMany();
    if (customers.length === 0) {
        console.log("顧客データが見つかりません。");
        return;
    }

    const categories = ["鍼治療", "美容鍼", "マッサージ", "矯正・関節調整"];
    const paymentMethods = ["現金", "カード", "電子マネー"];
    const staffs = ["院長（スタッフA）", "スタッフB", "スタッフC"];

    console.log(`2026年4月分の予約データと来店履歴を50件生成します...`);

    for (let i = 0; i < 50; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        
        const day = Math.floor(Math.random() * 30) + 1;
        const hour = Math.floor(Math.random() * 9) + 10;
        const minute = Math.random() > 0.5 ? 0 : 30;
        
        const startTime = new Date(2026, 3, day, hour, minute);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1時間後
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = 4000 + Math.floor(Math.random() * 6) * 1000;
        const staff = staffs[Math.floor(Math.random() * staffs.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // 1. 予約作成
        const booking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                start_time: startTime,
                end_time: endTime,
                treatment_category: category,
                treatment_content: `${category}コース`,
                price: price,
                status: "completed", // 来店済みステータス
                staff: staff,
                payment_method: paymentMethod,
                memo: "テスト用予約データ",
            }
        });

        // 2. 来店履歴作成（予約と紐付け）
        await prisma.visitHistory.create({
            data: {
                customerId: customer.id,
                bookingId: booking.id,
                visit_date: startTime,
                treatment_category: category,
                treatment_content: `${category}コース`,
                price: price,
                staff: staff,
                payment_method: paymentMethod,
                staff_memo: "テスト用来店履歴",
            }
        });
    }

    console.log("50件の予約と来店履歴を生成しました。");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
