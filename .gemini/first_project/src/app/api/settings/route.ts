import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await prisma.appSetting.findMany();
        // Return a key-value map for easy access on the client
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, unknown>);

        return NextResponse.json({ success: true, settings: settingsMap });
    } catch (error) {
        console.error("Settings fetch error:", error);
        return NextResponse.json({ success: false, error: "取得に失敗しました" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json() as Record<string, unknown>;

        for (const [key, value] of Object.entries(data)) {
            // Prisma JsonValue requires specific typing, eslint-disable is used to handle generic JSON data safely
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
