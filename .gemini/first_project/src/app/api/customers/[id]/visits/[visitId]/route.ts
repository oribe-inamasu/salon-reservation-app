import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string, visitId: string }> }
) {
    const { id: customerId, visitId } = await params;

    try {
        const visit = await prisma.visitHistory.findUnique({ where: { id: visitId } });
        if (!visit || visit.customerId !== customerId) {
            return NextResponse.json({ success: false, error: "カルテが見つかりません" }, { status: 404 });
        }

        const data = await req.json();
        console.log(`[API: PUT visit] Updating visit ${visitId} with data:`, data);

        if (!data.visit_date) {
            return NextResponse.json({ success: false, error: "来店日時は必須です" }, { status: 400 });
        }

        const price = data.price !== undefined && data.price !== "" ? parseInt(String(data.price), 10) : undefined;
        const adjustment_price = data.adjustment_price !== undefined && data.adjustment_price !== "" ? parseInt(String(data.adjustment_price), 10) : undefined;

        const visitData: any = {
            visit_date: data.visit_date ? new Date(data.visit_date) : undefined,
            treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
            treatment_content: data.treatment_content !== undefined ? data.treatment_content : undefined,
            price: price !== undefined ? price : undefined,
            staff_memo: data.staff_memo !== undefined ? data.staff_memo : undefined,
            staff: data.staff !== undefined ? data.staff : undefined,
            adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
        };

        const updatedVisit = await prisma.visitHistory.update({
            where: { id: visitId },
            data: visitData,
        });

        console.log(`[API: PUT visit] Visit updated successfully:`, updatedVisit.id);

        // If there is an associated booking, update it too
        if (visit.bookingId) {
            console.log(`[API: PUT visit] Syncing to Booking ${visit.bookingId}`);
            await prisma.booking.update({
                where: { id: visit.bookingId },
                data: {
                    start_time: data.visit_date ? new Date(data.visit_date) : undefined,
                    treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
                    price: price !== undefined ? price : null,
                    memo: data.staff_memo !== undefined ? data.staff_memo : undefined,
                    staff: data.staff !== undefined ? data.staff : undefined,
                    adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
                }
            });
        }

        return NextResponse.json({ success: true, visitId: updatedVisit.id }, { status: 200 });
    } catch (error: any) {
        console.error("[API: PUT visit] Error:", error);
        return NextResponse.json({ success: false, error: "カルテの更新に失敗しました", details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, visitId: string }> }
) {
    const { id: customerId, visitId } = await params;

    try {
        const visit = await prisma.visitHistory.findUnique({ where: { id: visitId } });
        if (!visit || visit.customerId !== customerId) {
            return NextResponse.json({ success: false, error: "カルテが見つかりません" }, { status: 404 });
        }

        // If a linked booking exists, delete the booking (which cascades to delete the visit history)
        if (visit.bookingId) {
            const bookingExists = await prisma.booking.findUnique({ where: { id: visit.bookingId } });
            if (bookingExists) {
                await prisma.booking.delete({ where: { id: visit.bookingId } });
            } else {
                await prisma.visitHistory.delete({ where: { id: visitId } });
            }
        } else {
            // Otherwise just delete the visit history
            await prisma.visitHistory.delete({ where: { id: visitId } });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Visit delete error:", error);
        return NextResponse.json({ success: false, error: "カルテの削除に失敗しました" }, { status: 500 });
    }
}
