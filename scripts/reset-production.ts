import { PrismaClient } from "@prisma/client";

async function main() {
    // Note: This relies on the DATABASE_URL in the current environment's .env file
    const prisma = new PrismaClient();

    console.log("🚀 データベースのリセットを開始します（プロダクション用）...");

    try {
        // 1. 予約データの削除
        const deletedBookings = await prisma.booking.deleteMany();
        console.log(`✅ 予約データを削除しました (${deletedBookings.count}件)`);

        // 2. 来店履歴データの削除
        const deletedVisits = await prisma.visitHistory.deleteMany();
        console.log(`✅ 来店履歴データを削除しました (${deletedVisits.count}件)`);

        // 3. 顧客データの削除
        const deletedCustomers = await prisma.customer.deleteMany();
        console.log(`✅ 顧客データを削除しました (${deletedCustomers.count}件)`);

        console.log("\n✨ リセットが正常に完了しました。設定とユーザーアカウントは保持されています。");
    } catch (error) {
        console.error("❌ エラーが発生しました:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
