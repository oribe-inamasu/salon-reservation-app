import prisma from "./prisma";

export type StaffMember = {
    id: string;
    name: string;
    color: string;
};

export type ServiceCategory = {
    id: string;
    name: string;
    color: string;
};

const DEFAULT_STAFF: StaffMember[] = [
    { id: "1", name: "院長（スタッフA）", color: "bg-emerald-500" },
    { id: "2", name: "スタッフB", color: "bg-pink-500" },
    { id: "3", name: "スタッフC", color: "bg-purple-500" },
];

const DEFAULT_SERVICES: ServiceCategory[] = [
    { id: "1", name: "鍼治療", color: "#3b82f6" },
    { id: "2", name: "美容鍼", color: "#f59e0b" },
    { id: "3", name: "矯正・関節調整", color: "#10b981" },
    { id: "4", name: "マッサージ", color: "#ec4899" },
    { id: "5", name: "ストレッチ", color: "#8b5cf6" },
    { id: "6", name: "カッピング", color: "#06b6d4" },
    { id: "7", name: "物療（電気・超音波など）", color: "#ef4444" },
];

export type CustomerLabel = {
    id: string;
    name: string;
    color: string;
};

export type ClinicInfo = {
    name: string;
    phone: string;
    address: string;
    hours: string;
    closedDays: number[];
    website: string;
};

const DEFAULT_LABELS: CustomerLabel[] = [
    { id: "M_10_20", name: "10〜20代 男", color: "#3b82f6" },
    { id: "M_30_40", name: "30〜40代 男", color: "#3b82f6" },
    { id: "M_50_60", name: "50〜60代 男", color: "#3b82f6" },
    { id: "M_70_UP", name: "70代以上 男", color: "#3b82f6" },
    { id: "F_10_20", name: "10〜20代 女", color: "#ec4899" },
    { id: "F_30_40", name: "30〜40代 女", color: "#ec4899" },
    { id: "F_50_60", name: "50〜60代 女", color: "#ec4899" },
    { id: "F_70_UP", name: "70代以上 女", color: "#ec4899" },
    { id: "SPECIAL_1", name: "特別枠 1", color: "#f59e0b" },
    { id: "SPECIAL_2", name: "特別枠 2", color: "#10b981" },
];

const DEFAULT_CLINIC_INFO: ClinicInfo = {
    name: "Salon Karte",
    phone: "03-1234-5678",
    address: "東京都渋谷区...",
    hours: "10:00 - 20:00",
    closedDays: [3], // 3 = Wednesday
    website: "https://example.com",
};

export async function getAppSettings() {
    try {
        const settings = await prisma.appSetting.findMany();
        const settingsMap = settings.reduce((acc: Record<string, any>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return {
            staffMembers: (settingsMap.staff_members as StaffMember[]) || DEFAULT_STAFF,
            serviceCategories: (settingsMap.service_categories as ServiceCategory[]) || DEFAULT_SERVICES,
            // Maps for easy lookup
            staffColorMap: ((settingsMap.staff_members as StaffMember[]) || DEFAULT_STAFF).reduce((acc, s) => {
                acc[s.name] = s.color;
                return acc;
            }, {} as Record<string, string>),
            serviceColorMap: ((settingsMap.service_categories as ServiceCategory[]) || DEFAULT_SERVICES).reduce((acc, s) => {
                acc[s.name] = s.color;
                return acc;
            }, {} as Record<string, string>),
            staffNames: ((settingsMap.staff_members as StaffMember[]) || DEFAULT_STAFF).map(s => s.name),
            serviceNames: ((settingsMap.service_categories as ServiceCategory[]) || DEFAULT_SERVICES).map(s => s.name),
            customerLabels: (settingsMap.customer_labels as CustomerLabel[]) || DEFAULT_LABELS,
            clinicInfo: (() => {
                const info = settingsMap.clinic_info as any;
                if (!info) return DEFAULT_CLINIC_INFO;
                return {
                    ...info,
                    closedDays: Array.isArray(info.closedDays) ? info.closedDays : DEFAULT_CLINIC_INFO.closedDays
                } as ClinicInfo;
            })(),
        };
    } catch (error) {
        console.error("Failed to fetch settings, using defaults", error);
        return {
            staffMembers: DEFAULT_STAFF,
            serviceCategories: DEFAULT_SERVICES,
            staffColorMap: DEFAULT_STAFF.reduce((acc, s) => {
                acc[s.name] = s.color;
                return acc;
            }, {} as Record<string, string>),
            serviceColorMap: DEFAULT_SERVICES.reduce((acc, s) => {
                acc[s.name] = s.color;
                return acc;
            }, {} as Record<string, string>),
            staffNames: DEFAULT_STAFF.map(s => s.name),
            serviceNames: DEFAULT_SERVICES.map(s => s.name),
            customerLabels: DEFAULT_LABELS,
            clinicInfo: DEFAULT_CLINIC_INFO,
        };
    }
}
