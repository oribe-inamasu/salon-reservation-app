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
    price?: number;
    memo?: string;
    status?: string;
    staff?: string;
}) {
    try {
        const booking = await prisma.booking.create({
            data: {
                ...data,
                price: data.price !== undefined && data.price !== null ? Number(data.price) : null,
                staff: data.staff || null,
                status: data.status || "scheduled", // Ensure status is handled, default to "scheduled"
            },
            include: { customer: true },
        });
        revalidatePath("/appointments");
        return { success: true, booking };
    } catch (error) {
        console.error("Failed to create booking:", error);
        return { success: false, error: "予約の作成に失敗しました" };
    }
}

export async function updateBooking(id: string, data: {
    customerId?: string;
    start_time?: Date;
    end_time?: Date;
    treatment_category?: string;
    price?: number;
    memo?: string;
    status?: string;
    staff?: string;
}) {
    try {
        // Update the booking
        const booking = await prisma.booking.update({
            where: { id },
            data: {
                ...data,
                price: data.price !== undefined && data.price !== null ? Number(data.price) : null,
                staff: data.staff !== undefined ? data.staff : undefined,
            },
            include: { customer: true },
        });

        // Sync to VisitHistory if it exists
        const visit = await prisma.visitHistory.findUnique({ where: { bookingId: id } });
        if (visit) {
            await prisma.visitHistory.update({
                where: { id: visit.id },
                data: {
                    visit_date: data.start_time,
                    treatment_category: data.treatment_category !== undefined ? data.treatment_category : undefined,
                    price: data.price !== undefined && data.price !== null ? Number(data.price) : null,
                    staff: data.staff !== undefined ? data.staff : undefined,
                },
            });
        }

        revalidatePath("/appointments");
        return { success: true, booking };
    } catch (error) {
        console.error("Failed to update booking:", error);
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

export async function convertToVisit(bookingId: string, price?: number) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true },
        });

        if (!booking) {
            return { success: false, error: "予約が見つかりません" };
        }

        // Create the visit history record
        await prisma.visitHistory.create({
            data: {
                customerId: booking.customerId,
                visit_date: booking.start_time,
                treatment_category: booking.treatment_category !== undefined ? booking.treatment_category : null,
                price: booking.price !== undefined && booking.price !== null ? booking.price : null,
                staff: booking.staff !== undefined ? booking.staff : null,
                bookingId: booking.id, // Keep the connection
            },
        });

        // 2. Update Booking status
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

