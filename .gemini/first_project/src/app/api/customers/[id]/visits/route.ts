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

        const bookingData = {
            customerId,
            start_time: new Date(data.visit_date),
            end_time: new Date(new Date(data.visit_date).getTime() + 60 * 60 * 1000), // Default 1 hour
            treatment_category: data.treatment_category || null,
            price: data.price ? parseInt(String(data.price), 10) : null,
            memo: data.staff_memo || null,
            status: "completed",
            staff: data.staff || null,
            adjustment_price: data.adjustment_price ? parseInt(String(data.adjustment_price), 10) : 0,
        };
        console.log("Creating booking with data:", bookingData);
        // 1. Create a placeholder booking
        const booking = await prisma.booking.create({
            data: bookingData,
        });

        const visitData = {
            customerId,
            visit_date: new Date(data.visit_date),
            treatment_category: data.treatment_category || null,
            treatment_content: data.treatment_content || null,
            price: data.price ? parseInt(String(data.price), 10) : null,
            staff_memo: data.staff_memo || null,
            staff: data.staff || null,
            adjustment_price: data.adjustment_price ? parseInt(String(data.adjustment_price), 10) : 0,
            bookingId: booking.id, // Link them
        };
        console.log("Creating visit with data:", visitData);
        // 2. Create the visit history linked to the booking
        const visit = await prisma.visitHistory.create({
            data: visitData,
        });

        return NextResponse.json({ success: true, visitId: visit.id }, { status: 201 });
    } catch (error: any) {
        console.error("Visit creation error:", error);
        return NextResponse.json({ success: false, error: "カルテの保存に失敗しました", details: error.message }, { status: 500 });
    }
}
