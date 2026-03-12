import prisma from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
    // Fetch all customers for the booking form
    const customers = await prisma.customer.findMany({
        select: {
            id: true,
            name: true,
            attribute_label: true,
        },
        orderBy: {
            furigana: "asc",
        },
    });

    // Fetch all bookings (you might want to limit this to a range in the future)
    const bookings = await prisma.booking.findMany({
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    attribute_label: true,
                },
            },
        },
        orderBy: {
            start_time: "asc",
        },
    });

    const { serviceNames, staffNames, staffColorMap, customerLabels, clinicInfo, serviceCourses, optionServices } = await getAppSettings();

    return (
        <CalendarClient
            initialBookings={bookings}
            customers={customers}
            serviceNames={serviceNames}
            staffNames={staffNames}
            staffColorMap={staffColorMap}
            customerLabels={customerLabels}
            clinicInfo={clinicInfo}
            serviceCourses={serviceCourses}
            optionServices={optionServices}
        />
    );
}
