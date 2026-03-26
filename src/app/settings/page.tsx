import { getAppSettings } from "@/lib/settings";
import SettingsClient, { SettingsData } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const { 
        staffMembers, 
        serviceCategories, 
        serviceCourses, 
        optionServices, 
        customerLabels, 
        clinicInfo 
    } = await getAppSettings();

    const initialSettings: SettingsData = {
        staff_members: staffMembers,
        service_categories: serviceCategories,
        service_courses: serviceCourses,
        option_services: optionServices,
        customer_labels: customerLabels,
        clinic_info: clinicInfo
    };

    return <SettingsClient initialSettings={initialSettings} />;
}
