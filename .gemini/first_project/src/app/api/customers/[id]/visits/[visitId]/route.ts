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

        if (!data.visit_date) {
            return NextResponse.json({ success: false, error: "来店日時は必須です" }, { status: 400 });
        }

        const updatedVisit = await prisma.visitHistory.update({
            where: { id: visitId },
            data: {
                visit_date: new Date(data.visit_date),
                treatment_category: data.treatment_category || null,
                treatment_content: data.treatment_content || null,
                price: data.price ? parseInt(data.price, 10) : null,
                staff_memo: data.staff_memo || null,
                staff: data.staff !== undefined ? data.staff : undefined,
            },
        });

        // If there is an associated booking, update it too
        if (visit.bookingId) {
            await prisma.booking.update({
                where: { id: visit.bookingId },
                data: {
                    start_time: new Date(data.visit_date),
                    end_time: new Date(new Date(data.visit_date).getTime() + 60 * 60 * 1000), // Default 1 hour duration
                    treatment_category: data.treatment_category || null,
                    price: data.price ? parseInt(data.price, 10) : null,
                    memo: data.staff_memo || null,
                    staff: data.staff !== undefined ? data.staff : undefined,
                }
            });
        }

        return NextResponse.json({ success: true, visitId: updatedVisit.id }, { status: 200 });
    } catch (error) {
        console.error("Visit update error:", error);
        return NextResponse.json({ success: false, error: "カルテの更新に失敗しました" }, { status: 500 });
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
