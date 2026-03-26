"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBookings(start: Date, end: Date) {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                start_time: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                customer: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
            orderBy: {
                start_time: "asc",
            },
        });
        return bookings;
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        throw new Error("予約データの取得に失敗しました");
    }
}

export async function createBooking(data: {
    customerId: string;
    start_time: Date;
    end_time: Date;
    treatment_category?: string;
    treatment_content?: string;
    price?: number;
    memo?: string;
    status?: string;
    staff?: string;
    adjustment_price?: number;
    payment_method?: string;
}) {
    try {
        console.log("Creating booking with data in action:", data);
        const booking = await prisma.booking.create({
            data: {
                customerId: data.customerId,
                start_time: data.start_time,
                end_time: data.end_time,
                treatment_category: data.treatment_category || null,
                treatment_content: data.treatment_content || null,
                price: data.price !== undefined ? parseInt(String(data.price), 10) : null,
                memo: data.memo || null,
                status: data.status || "pending",
                staff: data.staff || null,
                adjustment_price: data.adjustment_price !== undefined ? parseInt(String(data.adjustment_price), 10) : 0,
                payment_method: data.payment_method || null,
            },
        });
        console.log("Booking created successfully:", booking.id);
        revalidatePath("/appointments");
        return { success: true, booking };
    } catch (error) {
        console.error("Failed to create booking in action:", error);
        const message = error instanceof Error ? error.message : "予約の作成に失敗しました";
        return { success: false, error: message };
    }
}

export async function updateBooking(id: string, data: {
    customerId?: string;
    start_time?: Date;
    end_time?: Date;
    treatment_category?: string;
    treatment_content?: string;
    price?: number;
    memo?: string;
    status?: string;
    staff?: string;
    adjustment_price?: number;
    payment_method?: string;
}) {
    try {
        console.log(`[Action: updateBooking] Updating booking ${id} with data:`, data);
        
        // Ensure numbers are properly parsed
        const price = data.price !== undefined ? parseInt(String(data.price), 10) : undefined;
        const adjustment_price = data.adjustment_price !== undefined ? parseInt(String(data.adjustment_price), 10) : undefined;

        // Update the booking
        const booking = await prisma.booking.update({
            where: { id },
            data: {
                start_time: data.start_time !== undefined ? data.start_time : undefined,
                end_time: data.end_time !== undefined ? data.end_time : undefined,
                treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
                treatment_content: data.treatment_content !== undefined ? data.treatment_content : undefined,
                price: price !== undefined ? price : undefined,
                memo: data.memo !== undefined ? data.memo : undefined,
                status: data.status !== undefined ? data.status : undefined,
                staff: data.staff !== undefined ? data.staff : undefined,
                adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
                payment_method: data.payment_method !== undefined ? data.payment_method : undefined,
            },
            include: { customer: true },
        });

        console.log(`[Action: updateBooking] Booking updated successfully:`, booking.id);

        // Sync to VisitHistory if it exists
        const visit = await prisma.visitHistory.findUnique({ where: { bookingId: id } });
        if (visit) {
            console.log(`[Action: updateBooking] Syncing to VisitHistory ${visit.id}`);
            await prisma.visitHistory.update({
                where: { id: visit.id },
                data: {
                    visit_date: data.start_time,
                    treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
                    price: price !== undefined ? price : null,
                    adjustment_price: adjustment_price !== undefined ? adjustment_price : undefined,
                    staff: data.staff !== undefined ? data.staff : undefined,
                    payment_method: data.payment_method !== undefined ? data.payment_method : undefined,
                    // If the memo changed, it might affect treatment_content or staff_memo
                    staff_memo: data.memo !== undefined ? data.memo : undefined,
                },
            });
        }

        revalidatePath("/appointments");
        return { success: true, booking };
    } catch (error) {
        console.error("[Action: updateBooking] Error:", error);
        return { success: false, error: "予約の更新に失敗しました" };
    }
}

export async function deleteBooking(id: string) {
    try {
        await prisma.booking.delete({
            where: { id },
        });
        revalidatePath("/appointments");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete booking:", error);
        return { success: false, error: "予約の削除に失敗しました" };
    }
}

export async function convertToVisit(bookingId: string, price?: number, payment_method?: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true },
        });

        if (!booking) {
            return { success: false, error: "予約が見つかりません" };
        }

        // Create or update the visit history record
        await prisma.visitHistory.upsert({
            where: { bookingId: booking.id },
            update: {
                visit_date: booking.start_time,
                treatment_category: booking.treatment_category || null,
                treatment_content: booking.treatment_content || null,
                price: booking.price || null,
                staff: booking.staff || null,
                adjustment_price: booking.adjustment_price || 0,
                payment_method: payment_method || booking.payment_method || null,
            },
            create: {
                customerId: booking.customerId,
                bookingId: booking.id,
                visit_date: booking.start_time,
                treatment_category: booking.treatment_category || null,
                treatment_content: booking.treatment_content || null,
                price: booking.price || null,
                staff: booking.staff || null,
                adjustment_price: booking.adjustment_price || 0,
                payment_method: payment_method || booking.payment_method || null,
            },
        });

        // 2. Update Booking status to "completed"
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "completed" },
        });

        revalidatePath("/appointments");
        revalidatePath("/reports");
        revalidatePath(`/customers/${booking.customerId}`);

        return { success: true };
    } catch (error) {
        console.error("Failed to convert booking to visit:", error);
        return { success: false, error: "来店処理に失敗しました" };
    }
}

export async function revertVisit(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return { success: false, error: "予約が見つかりません" };
        }

        // 1. Delete the corresponding VisitHistory record
        await prisma.visitHistory.deleteMany({
            where: { bookingId: bookingId },
        });

        // 2. Revert Booking status to "pending" or "confirmed"? 
        // In this app, "pending" seems to be the default for active appointments.
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "pending" },
        });

        revalidatePath("/appointments");
        revalidatePath("/reports");
        revalidatePath(`/customers/${booking.customerId}`);

        return { success: true };
    } catch (error) {
        console.error("Failed to revert visit:", error);
        return { success: false, error: "来店取消処理に失敗しました" };
    }
}
