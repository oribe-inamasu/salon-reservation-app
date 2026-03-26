import { getAppSettings } from "@/lib/settings";
import SettingsClient, { SettingsData } from "./SettingsClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const [settingsData, users] = await Promise.all([
        getAppSettings(),
        prisma.user.findMany({
            select: { id: true, name: true, email: true },
            orderBy: { createdAt: "asc" }
        })
    ]);

    const { 
        staffMembers, 
        serviceCategories, 
        serviceCourses, 
        optionServices, 
        customerLabels, 
        clinicInfo 
    } = settingsData;

    const initialSettings: SettingsData = {
        staff_members: staffMembers,
        service_categories: serviceCategories,
        service_courses: serviceCourses,
        option_services: optionServices,
        customer_labels: customerLabels,
        clinic_info: clinicInfo
    };

    return <SettingsClient initialSettings={initialSettings} initialUsers={users} />;
}
