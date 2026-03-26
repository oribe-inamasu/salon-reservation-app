import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

const dummyCustomers = [
    {
        name: "田中 太郎",
        furigana: "タナカ タロウ",
        birth_date: "1985-04-12",
        phone_number: "090-1234-5678",
        address: "東京都渋谷区神宮前1-2-3",
        occupation: "会社員",
        pain_area: "肩・首",
        symptoms: "慢性的な肩こり、デスクワークによる首の痛み",
        desired_treatment: "リラクゼーションマッサージ・指圧",
        desired_duration: "60分",
        referral_source: "Google検索",
    },
    {
        name: "鈴木 花子",
        furigana: "スズキ ハナコ",
        birth_date: "1990-08-23",
        phone_number: "080-2345-6789",
        address: "東京都目黒区自由が丘2-3-4",
        occupation: "フリーランス",
        pain_area: "腰",
        symptoms: "座り仕事が多く、腰が重い",
        desired_treatment: "矯正・関節調整",
        desired_duration: "90分",
        referral_source: "友人の紹介",
    },
    {
        name: "佐藤 美咲",
        furigana: "サトウ ミサキ",
        birth_date: "1995-01-15",
        phone_number: "070-3456-7890",
        address: "東京都世田谷区三軒茶屋1-5-6",
        occupation: "看護師",
        pain_area: "背中全体",
        symptoms: "夜勤による疲労と背中の張り",
        desired_treatment: "鍼治療",
        desired_duration: "60分",
        referral_source: "Instagram",
    },
    {
        name: "高橋 健一",
        furigana: "タカハシ ケンイチ",
        birth_date: "1978-11-30",
        phone_number: "090-4567-8901",
        address: "東京都新宿区西新宿3-7-8",
        occupation: "エンジニア",
        pain_area: "首・肩・目の奥",
        symptoms: "長時間のPC作業による眼精疲労と肩こり",
        desired_treatment: "ヘッドマッサージ",
        desired_duration: "45分",
        referral_source: "ホットペッパー",
    },
    {
        name: "伊藤 さくら",
        furigana: "イトウ サクラ",
        birth_date: "1988-03-03",
        phone_number: "080-5678-9012",
        address: "東京都港区麻布十番2-4-6",
        occupation: "主婦",
        pain_area: "顔・フェイスライン",
        symptoms: "たるみが気になる、小顔になりたい",
        desired_treatment: "美容鍼",
        desired_duration: "60分",
        referral_source: "Instagram",
    },
    {
        name: "渡辺 大輔",
        furigana: "ワタナベ ダイスケ",
        birth_date: "1972-07-18",
        phone_number: "090-6789-0123",
        address: "東京都中野区中野5-1-2",
        occupation: "自営業",
        pain_area: "腰・膝",
        symptoms: "立ち仕事で腰と膝が痛む",
        desired_treatment: "矯正・関節調整",
        desired_duration: "90分",
        referral_source: "チラシ",
    },
    {
        name: "山本 由美子",
        furigana: "ヤマモト ユミコ",
        birth_date: "1965-12-25",
        phone_number: "080-7890-1234",
        address: "東京都杉並区荻窪4-3-2",
        occupation: "パート",
        pain_area: "全身",
        symptoms: "更年期による全身の不調、冷え性",
        desired_treatment: "鍼治療",
        desired_duration: "60分",
        referral_source: "口コミ",
    },
    {
        name: "中村 翔太",
        furigana: "ナカムラ ショウタ",
        birth_date: "2000-05-05",
        phone_number: "070-8901-2345",
        address: "東京都豊島区池袋2-8-9",
        occupation: "大学生",
        pain_area: "首・肩",
        symptoms: "スマホ首、猫背が気になる",
        desired_treatment: "矯正・関節調整",
        desired_duration: "45分",
        referral_source: "TikTok",
    },
    {
        name: "小林 幸恵",
        furigana: "コバヤシ サチエ",
        birth_date: "1982-09-14",
        phone_number: "090-9012-3456",
        address: "東京都品川区大井町3-6-7",
        occupation: "事務職",
        pain_area: "肩甲骨まわり",
        symptoms: "肩甲骨が固い、腕が上がりにくい",
        desired_treatment: "リラクゼーションマッサージ・指圧",
        desired_duration: "60分",
        referral_source: "Google検索",
    },
    {
        name: "加藤 真理",
        furigana: "カトウ マリ",
        birth_date: "1993-06-20",
        phone_number: "080-0123-4567",
        address: "東京都文京区本郷7-1-2",
        occupation: "医師",
        pain_area: "顔・首",
        symptoms: "美容目的、リフトアップ希望",
        desired_treatment: "美容鍼",
        desired_duration: "60分",
        referral_source: "友人の紹介",
    },
    {
        name: "吉田 勇気",
        furigana: "ヨシダ ユウキ",
        birth_date: "1998-02-28",
        phone_number: "070-1111-2222",
        address: "東京都墨田区錦糸町1-4-5",
        occupation: "営業職",
        pain_area: "腰・ふくらはぎ",
        symptoms: "外回りが多く、足のむくみと腰痛",
        desired_treatment: "リラクゼーションマッサージ・指圧",
        desired_duration: "90分",
        referral_source: "Google検索",
    },
    {
        name: "山田 裕子",
        furigana: "ヤマダ ユウコ",
        birth_date: "1975-10-08",
        phone_number: "090-2222-3333",
        address: "東京都大田区蒲田5-2-3",
        occupation: "教師",
        pain_area: "首・肩・頭",
        symptoms: "偏頭痛が頻繁、肩こりからくる頭痛",
        desired_treatment: "ヘッドマッサージ",
        desired_duration: "45分",
        referral_source: "口コミ",
    },
    {
        name: "松本 亮",
        furigana: "マツモト リョウ",
        birth_date: "1980-04-01",
        phone_number: "080-3333-4444",
        address: "東京都板橋区成増3-7-8",
        occupation: "建築士",
        pain_area: "腰・股関節",
        symptoms: "ヘルニア持ち、定期的なメンテナンス希望",
        desired_treatment: "鍼治療",
        desired_duration: "60分",
        referral_source: "ホットペッパー",
        visited_hospital: "はい",
        hospital_diagnosis: "腰椎椎間板ヘルニア",
    },
    {
        name: "井上 瞳",
        furigana: "イノウエ ヒトミ",
        birth_date: "1992-07-07",
        phone_number: "070-4444-5555",
        address: "東京都練馬区石神井公園2-1-4",
        occupation: "デザイナー",
        pain_area: "手首・肩",
        symptoms: "腱鞘炎気味、マウス操作での手首の痛み",
        desired_treatment: "鍼治療",
        desired_duration: "45分",
        referral_source: "Twitter",
    },
    {
        name: "木村 早紀",
        furigana: "キムラ サキ",
        birth_date: "1987-11-11",
        phone_number: "090-5555-6666",
        address: "東京都台東区上野6-3-2",
        occupation: "主婦",
        pain_area: "骨盤・腰",
        symptoms: "産後の骨盤の歪みが気になる",
        desired_treatment: "産後骨盤矯正",
        desired_duration: "60分",
        referral_source: "ママ友の紹介",
    },
    {
        name: "林 哲也",
        furigana: "ハヤシ テツヤ",
        birth_date: "1968-08-15",
        phone_number: "080-6666-7777",
        address: "東京都足立区北千住3-5-1",
        occupation: "タクシー運転手",
        pain_area: "腰・背中",
        symptoms: "長時間の運転で慢性的な腰痛",
        desired_treatment: "リラクゼーションマッサージ・指圧",
        desired_duration: "90分",
        referral_source: "看板を見て",
    },
    {
        name: "清水 麻衣",
        furigana: "シミズ マイ",
        birth_date: "1996-03-21",
        phone_number: "070-7777-8888",
        address: "東京都江東区豊洲2-4-9",
        occupation: "IT企業勤務",
        pain_area: "顔・顎",
        symptoms: "顎関節が気になる、食いしばりがある",
        desired_treatment: "お顔周りの調整",
        desired_duration: "45分",
        referral_source: "Instagram",
    },
    {
        name: "森 俊介",
        furigana: "モリ シュンスケ",
        birth_date: "1983-01-20",
        phone_number: "090-8888-9999",
        address: "東京都江戸川区葛西5-7-2",
        occupation: "飲食店経営",
        pain_area: "肩・腕",
        symptoms: "調理作業による肩と腕の疲労",
        desired_treatment: "リラクゼーションマッサージ・指圧",
        desired_duration: "60分",
        referral_source: "食べログ経由",
    },
    {
        name: "池田 美穂",
        furigana: "イケダ ミホ",
        birth_date: "1991-12-03",
        phone_number: "080-9999-0000",
        address: "東京都北区赤羽1-8-3",
        occupation: "ヨガインストラクター",
        pain_area: "股関節・腰",
        symptoms: "柔軟性は高いが関節に違和感",
        desired_treatment: "矯正・関節調整",
        desired_duration: "60分",
        referral_source: "Google検索",
    },
    {
        name: "藤田 誠",
        furigana: "フジタ マコト",
        birth_date: "1960-05-30",
        phone_number: "090-0000-1111",
        address: "東京都荒川区西日暮里4-2-6",
        occupation: "退職",
        pain_area: "膝・腰・肩",
        symptoms: "加齢による関節の痛み、全身の不調",
        desired_treatment: "鍼治療",
        desired_duration: "60分",
        referral_source: "近所の方の紹介",
    },
];

// Visit history data - varied dates and treatments
const treatmentCategories = [
    "リラクゼーションマッサージ・指圧",
    "鍼治療",
    "美容鍼",
    "矯正・関節調整",
    "産後骨盤矯正",
    "ヘッドマッサージ",
    "お顔周りの調整",
];

const prices = [3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000];

function randomDate(start: Date, end: Date): Date {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
}

async function main() {
    console.log("🌱 シードデータの投入を開始します...\n");

    // Stagger createdAt to make sorting meaningful
    const baseDate = new Date("2025-06-01");

    for (let i = 0; i < dummyCustomers.length; i++) {
        const c = dummyCustomers[i];
        // Each customer registered a few days apart
        const createdAt = new Date(baseDate);
        createdAt.setDate(baseDate.getDate() + i * 3 + Math.floor(Math.random() * 3));

        const customer = await prisma.customer.create({
            data: {
                name: c.name,
                furigana: c.furigana,
                birth_date: c.birth_date,
                phone_number: c.phone_number,
                address: c.address,
                occupation: c.occupation,
                pain_area: c.pain_area,
                symptoms: c.symptoms,
                desired_treatment: c.desired_treatment,
                desired_duration: c.desired_duration,
                referral_source: c.referral_source,
                visited_hospital: (c as Record<string, string>).visited_hospital || null,
                hospital_diagnosis: (c as Record<string, string>).hospital_diagnosis || null,
                createdAt: createdAt,
            },
        });

        // Add 0-5 visit histories per customer
        const visitCount = Math.floor(Math.random() * 5) + 1;
        for (let v = 0; v < visitCount; v++) {
            const visitDate = randomDate(createdAt, new Date("2026-03-08"));
            const categoryIndex = Math.floor(Math.random() * treatmentCategories.length);
            const priceIndex = Math.floor(Math.random() * prices.length);

            await prisma.visitHistory.create({
                data: {
                    customerId: customer.id,
                    visit_date: visitDate,
                    treatment_category: c.desired_treatment || treatmentCategories[categoryIndex],
                    treatment_content: `${treatmentCategories[categoryIndex]} ${[30, 45, 60, 90][Math.floor(Math.random() * 4)]}分コース`,
                    price: prices[priceIndex],
                    staff_memo:
                        v === 0
                            ? "初回来店。カウンセリング実施。"
                            : Math.random() > 0.5
                                ? "前回より改善あり。継続を勧めた。"
                                : null,
                },
            });
        }

        console.log(`  ✅ ${i + 1}/20 ${c.name} (来店${visitCount}回)`);
    }

    console.log("\n🎉 シードデータの投入が完了しました！（20名分）");
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error("❌ エラー:", e);
    prisma.$disconnect();
    process.exit(1);
});
