import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await prisma.appSetting.findMany();
        // Return a key-value map for easy access on the client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ success: true, settings: settingsMap });
    } catch (error) {
        console.error("Settings fetch error:", error);
        return NextResponse.json({ success: false, error: "取得に失敗しました" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Expected format: Record<string, any> (e.g. { "staff_members": [...], "service_categories": [...] })
        const data = await req.json();

        // Update or create each setting
        for (const [key, value] of Object.entries(data)) {
            // Prisma Json typing requires specific structure, standard any works fine with V8 objects.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonValue = value as any;

            await prisma.appSetting.upsert({
                where: { key },
                update: { value: jsonValue },
                create: { key, value: jsonValue },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ success: false, error: "更新に失敗しました" }, { status: 500 });
    }
}
