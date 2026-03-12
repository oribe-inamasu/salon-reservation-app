"use client";

import { useState } from "react";
import { Users, LayoutList, Tags, ChevronLeft, PlusCircle, ClipboardList } from "lucide-react";
import Link from "next/link";
import StaffSettingsTab, { StaffMember } from "./tabs/StaffSettingsTab";
import ServicesSettingsTab, { ServiceCategory } from "./tabs/ServicesSettingsTab";
import CourseSettingsTab from "./tabs/CourseSettingsTab";
import OptionsSettingsTab from "./tabs/OptionsSettingsTab";
import { ServiceCourse, OptionService } from "@/lib/settings";
import LabelSettingsTab, { CustomerLabel } from "./tabs/LabelSettingsTab";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsClient({ initialSettings }: { initialSettings: Record<string, any> }) {
    const [activeTab, setActiveTab] = useState("staff");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [settings, setSettings] = useState<Record<string, any>>(initialSettings);

    const tabs = [
        { id: "staff", label: "スタッフ", icon: Users },
        { id: "services", label: "メニュー", icon: ClipboardList },
        { id: "courses", label: "コース", icon: LayoutList },
        { id: "options", label: "オプション", icon: PlusCircle },
        { id: "labels", label: "顧客ラベル", icon: Tags },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveSettings = async (updates: Record<string, any>) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const result = await res.json();
            if (result.success) {
                setSettings(prev => ({ ...prev, ...updates }));
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
                <div className="flex items-center h-14 px-4 border-b border-primary-foreground/10">
                    <Link
                        href="/"
                        className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg">設定</div>
                    <div className="w-10" />
                </div>
                {/* Tabs */}
                <div className="flex overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 min-w-[80px] transition-colors relative ${isActive
                                    ? "text-white"
                                    : "hover:bg-primary-foreground/5 text-primary-foreground/70"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-bold">{tab.label}</span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
                {activeTab === "staff" && (
                    <StaffSettingsTab
                        initialData={settings.staff_members as StaffMember[]}
                        initialClosedDays={settings.clinic_info?.closedDays as number[]}
                        onSave={(data: StaffMember[]) => handleSaveSettings({ staff_members: data })}
                        onSaveClosedDays={(days: number[]) => handleSaveSettings({
                            clinic_info: {
                                ...settings.clinic_info,
                                closedDays: days
                            }
                        })}
                    />
                )}
                {activeTab === "services" && (
                    <ServicesSettingsTab
                        initialData={settings.service_categories as ServiceCategory[]}
                        onSave={(data: ServiceCategory[]) => handleSaveSettings({ service_categories: data })}
                    />
                )}
                {activeTab === "courses" && (
                    <CourseSettingsTab
                        initialData={settings.service_courses as ServiceCourse[]}
                        onSave={(data) => handleSaveSettings({ service_courses: data })}
                    />
                )}
                {activeTab === "options" && (
                    <OptionsSettingsTab
                        initialData={settings.option_services as OptionService[]}
                        onSave={(data) => handleSaveSettings({ option_services: data })}
                    />
                )}
                {activeTab === "labels" && (
                    <LabelSettingsTab
                        initialData={settings.customer_labels as CustomerLabel[]}
                        onSave={(data) => handleSaveSettings({ customer_labels: data })}
                    />
                )}
            </main>
        </div>
    );
}
