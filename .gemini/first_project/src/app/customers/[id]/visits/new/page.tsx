import { getAppSettings } from "@/lib/settings";
import NewVisitClient from "./NewVisitClient";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({ params }: { params: Promise<{ id: string }> }) {
    const { serviceNames, staffNames, serviceCourses, optionServices } = await getAppSettings();

    return <NewVisitClient params={params} serviceNames={serviceNames} staffNames={staffNames} serviceCourses={serviceCourses} optionServices={optionServices} />;
}
