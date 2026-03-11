import { getAppSettings } from "@/lib/settings";
import NewCustomerClient from "./NewCustomerClient";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
    const { serviceNames, customerLabels } = await getAppSettings();

    return <NewCustomerClient serviceNames={serviceNames} customerLabels={customerLabels} />;
}
