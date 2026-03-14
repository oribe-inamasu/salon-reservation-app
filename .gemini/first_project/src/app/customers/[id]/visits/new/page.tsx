import { getAppSettings } from "@/lib/settings";
import NewVisitClient from "./NewVisitClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { serviceNames, staffNames, serviceCourses, optionServices } = await getAppSettings();
    const customer = await prisma.customer.findUnique({
        where: { id }
    });

    if (!customer) {
        return <div>顧客が見つかりません</div>;
    }

    return <NewVisitClient params={params} customer={customer} serviceNames={serviceNames} staffNames={staffNames} serviceCourses={serviceCourses} optionServices={optionServices} />;
}
