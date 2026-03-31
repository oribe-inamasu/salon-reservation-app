import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import CustomerDetailClient from "./CustomerDetailClient";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { serviceCourses, optionServices } = await getAppSettings();

    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            visitHistories: {
                orderBy: { visit_date: "desc" },
            },
        },
    });

    if (!customer) {
        notFound();
    }

    // Serialize dates for client component
    const serializedCustomer = {
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        visitHistories: customer.visitHistories.map((v) => ({
            ...v,
            visit_date: v.visit_date.toISOString(),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
        })),
    };

    return <CustomerDetailClient
        customer={serializedCustomer}
        optionServices={optionServices}
    />;
}
