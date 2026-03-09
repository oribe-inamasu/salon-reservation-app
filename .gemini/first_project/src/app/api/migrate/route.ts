import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const labelAssignments: [string, string][] = [
    ["田中 太郎", "M_30_40"],
    ["鈴木 花子", "F_30_40"],
    ["佐藤 美咲", "F_10_20"],
    ["高橋 健一", "M_30_40"],
    ["伊藤 さくら", "F_30_40"],
    ["渡辺 大輔", "M_50_60"],
    ["山本 由美子", "F_50_60"],
    ["中村 翔太", "M_10_20"],
    ["小林 幸恵", "F_30_40"],
    ["加藤 真理", "F_30_40"],
    ["吉田 勇気", "M_10_20"],
    ["山田 裕子", "F_50_60"],
    ["松本 亮", "M_30_40"],
    ["井上 瞳", "F_30_40"],
    ["木村 早紀", "F_30_40"],
    ["林 哲也", "M_50_60"],
    ["清水 麻衣", "F_10_20"],
    ["森 俊介", "M_30_40"],
    ["池田 美穂", "F_30_40"],
    ["藤田 誠", "M_70_UP"],
];

export async function POST() {
    try {
        let updated = 0;
        for (const [name, label] of labelAssignments) {
            const result = await prisma.$executeRawUnsafe(
                `UPDATE "Customer" SET "attribute_label" = $1 WHERE "name" = $2 AND "attribute_label" IS NULL`,
                label,
                name
            );
            updated += result;
        }

        return NextResponse.json({ success: true, message: `${updated}名のラベルを更新しました` });
    } catch (error) {
        console.error("Label assignment error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
