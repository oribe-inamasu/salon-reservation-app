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

        const safeParseInt = (val: any, defaultVal: number | undefined) => {
            if (val === undefined || val === "" || val === null) return defaultVal;
            const parsed = parseInt(String(val), 10);
            return isNaN(parsed) ? defaultVal : parsed;
        };

        const price = safeParseInt(data.price, undefined);
        const adjustment_price = safeParseInt(data.adjustment_price, undefined);

        const visitData = {
            visit_date: data.visit_date ? new Date(data.visit_date as string) : undefined,
            treatment_category: data.treatment_category !== undefined ? data.treatment_category as string : undefined,
            treatment_content: data.treatment_content !== undefined ? data.treatment_content as string : undefined,
            price: price !== undefined ? price : undefined,
            staff_memo: data.staff_memo !== undefined ? data.staff_memo as string : undefined,
            staff: data.staff !== undefined ? data.staff as string : undefined,
            adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
            payment_method: data.payment_method !== undefined ? data.payment_method as string : undefined,
            options: data.options !== undefined ? (data.options as string | null) : undefined,
        };

        const updatedVisit = await prisma.visitHistory.update({
            where: { id: visitId },
            data: visitData,
        });

        console.log(`[API: PUT visit] Visit updated successfully:`, updatedVisit.id);

        // If there is an associated booking, update it too if it still exists
        if (visit.bookingId) {
            console.log(`[API: PUT visit] Syncing to Booking ${visit.bookingId}`);
            const bookingExists = await prisma.booking.findUnique({ where: { id: visit.bookingId } });
            if (bookingExists) {
                await prisma.booking.update({
                    where: { id: visit.bookingId },
                    data: {
                        start_time: data.visit_date ? new Date(data.visit_date) : undefined,
                        treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
                        treatment_content: data.treatment_content !== undefined ? data.treatment_content : undefined,
                        price: price !== undefined ? price : null,
                        memo: data.staff_memo !== undefined ? data.staff_memo : undefined,
                        staff: data.staff !== undefined ? data.staff : undefined,
                        adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
                        payment_method: data.payment_method !== undefined ? data.payment_method : undefined,
                        options: data.options !== undefined ? (data.options as string | null) : undefined,
                    }
                });
            } else {
                console.warn(`[API: PUT visit] Linked booking ${visit.bookingId} not found. Skipping sync.`);
            }
        }

        return NextResponse.json({ success: true, visitId: updatedVisit.id }, { status: 200 });
    } catch (error) {
        console.error("[API: PUT visit] Error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: "カルテの更新に失敗しました", details: message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, visitId: string }> }
) {
    const { id: customerId, visitId } = await params;

    try {
        console.log(`[API: DELETE visit] Deleting visit ${visitId} for customer ${customerId}`);
        
        // 1. Fetch visit and linked booking info
        const visit = await prisma.visitHistory.findUnique({ 
            where: { id: visitId },
            select: { id: true, customerId: true, bookingId: true }
        });
        
        if (!visit) {
            console.warn(`[API: DELETE visit] Visit ${visitId} not found. Already deleted.`);
            return NextResponse.json({ success: true, message: "カルテは既に削除されています" }, { status: 200 });
        }
        
        if (visit.customerId !== customerId) {
            console.error(`[API: DELETE visit] Customer mismatch: ${visit.customerId} !== ${customerId}`);
            return NextResponse.json({ success: false, error: "不適切なアクセスです" }, { status: 403 });
        }

        // 2. Handle deletion (Visit + optional Booking)
        if (visit.bookingId) {
            console.log(`[API: DELETE visit] Found linked booking ${visit.bookingId}. Attempting to delete...`);
            const bookingExists = await prisma.booking.findUnique({ where: { id: visit.bookingId } });
            
            if (bookingExists) {
                // Deleting the booking will cascade to the visit history via prisma schema
                await prisma.booking.delete({ where: { id: visit.bookingId } });
                console.log(`[API: DELETE visit] Booking ${visit.bookingId} and linked visit ${visitId} deleted via cascade.`);
            } else {
                console.log(`[API: DELETE visit] Linked booking ${visit.bookingId} not found. Deleting visit directly.`);
                await prisma.visitHistory.delete({ where: { id: visitId } });
            }
        } else {
            console.log(`[API: DELETE visit] No linked booking. Deleting visit history ${visitId} directly.`);
            await prisma.visitHistory.delete({ where: { id: visitId } });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[API: DELETE visit] Unexpected error during deletion:", error);
        return NextResponse.json({ 
            success: false, 
            error: "カルテの削除に失敗しました", 
            details: error instanceof Error ? error.message : "Internal Server Error" 
        }, { status: 500 });
    }
}
