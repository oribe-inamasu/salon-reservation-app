import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await prisma.appSetting.findMany();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, any>);

    return <SettingsClient initialSettings={settingsMap} />;
}
