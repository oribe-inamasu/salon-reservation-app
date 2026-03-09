import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: customerId } = await params;

    try {
        // Verify customer exists
        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            return NextResponse.json({ success: false, error: "顧客が見つかりません" }, { status: 404 });
        }

        const data = await req.json();

        if (!data.visit_date) {
            return NextResponse.json({ success: false, error: "来店日時は必須です" }, { status: 400 });
        }

        const visit = await prisma.visitHistory.create({
            data: {
                customerId,
                visit_date: new Date(data.visit_date),
                treatment_category: data.treatment_category || null,
                treatment_content: data.treatment_content || null,
                price: data.price ? parseInt(data.price, 10) : null,
                staff_memo: data.staff_memo || null,
            },
        });

        return NextResponse.json({ success: true, visitId: visit.id }, { status: 201 });
    } catch (error) {
        console.error("Visit creation error:", error);
        return NextResponse.json({ success: false, error: "カルテの保存に失敗しました" }, { status: 500 });
    }
}
