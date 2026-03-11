import { getAppSettings } from "@/lib/settings";
import EditCustomerClient from "./EditCustomerClient";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { serviceNames, customerLabels } = await getAppSettings();

    return <EditCustomerClient params={params} serviceNames={serviceNames} customerLabels={customerLabels} />;
}
