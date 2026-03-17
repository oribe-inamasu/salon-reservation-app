import prisma from "@/lib/prisma";
import SettingsClient, { SettingsData } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await prisma.appSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, unknown>);

    return <SettingsClient initialSettings={settingsMap as unknown as SettingsData} />;
}
