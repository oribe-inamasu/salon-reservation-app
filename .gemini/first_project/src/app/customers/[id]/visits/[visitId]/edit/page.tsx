import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAppSettings } from "@/lib/settings";
import EditVisitClient from "./EditVisitClient";

export const dynamic = "force-dynamic";

export default async function EditVisitPage({
    params,
}: {
    params: Promise<{ id: string; visitId: string }>;
}) {
    const { id, visitId } = await params;

     const visit = await prisma.visitHistory.findUnique({
        where: { id: visitId, customerId: id },
        include: { customer: true },
    });

    if (!visit) {
        notFound();
    }

    const serializedVisit = {
        id: visit.id,
        customerId: visit.customerId,
        visit_date: visit.visit_date.toISOString(),
        treatment_category: visit.treatment_category,
        treatment_content: visit.treatment_content,
        price: visit.price,
        staff: visit.staff,
        staff_memo: visit.staff_memo,
        adjustment_price: visit.adjustment_price,
        payment_method: visit.payment_method,
        customer: {
            name: visit.customer.name,
        }
    };
    const { serviceNames, staffNames, serviceCourses, optionServices } = await getAppSettings();

    return <EditVisitClient visit={serializedVisit} staffNames={staffNames} serviceCourses={serviceCourses} optionServices={optionServices} />;
}
