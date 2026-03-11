"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, Check } from "lucide-react";

export type ServiceCategory = {
    id: string;
    name: string;
    color: string;
};

const DEFAULT_COLORS = [
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#ef4444", // Red
    "#84cc16", // Lime
    "#f43f5e", // Rose
];

export default function ServicesSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: ServiceCategory[];
    onSave: (data: ServiceCategory[]) => Promise<boolean>;
}) {
    // Basic fallback to constant if no data exists in DB yet
    const [serviceList, setServiceList] = useState<ServiceCategory[]>(
        initialData?.length ? initialData : [
            { id: "1", name: "鍼治療", color: "#3b82f6" },
            { id: "2", name: "美容鍼", color: "#f59e0b" },
            { id: "3", name: "矯正・関節調整", color: "#10b981" },
            { id: "4", name: "マッサージ", color: "#ec4899" },
            { id: "5", name: "ストレッチ", color: "#8b5cf6" },
            { id: "6", name: "カッピング", color: "#06b6d4" },
            { id: "7", name: "物療（電気・超音波など）", color: "#ef4444" },
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAddService = () => {
        const newService: ServiceCategory = {
            id: crypto.randomUUID(),
            name: "新しいメニュー",
            color: DEFAULT_COLORS[serviceList.length % DEFAULT_COLORS.length],
        };
        setServiceList([...serviceList, newService]);
    };

    const handleRemoveService = (id: string) => {
        setServiceList(serviceList.filter((s) => s.id !== id));
    };

    const handleChange = (id: string, field: keyof ServiceCategory, value: string) => {
        setServiceList(serviceList.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await onSave(serviceList);
        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-foreground">施術メニュー管理</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        カルテで選択できる施術内容や、売上レポートで集計されるメニュー項目を設定します。
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden text-sm">
                <div className="p-4 space-y-3">
                    {serviceList.map((service, index) => (
                        <div key={service.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-stone-100 group">
                            <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors hidden sm:block">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={service.name}
                                        onChange={(e) => handleChange(service.id, "name", e.target.value)}
                                        className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                        placeholder="施術メニュー名"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={service.color}
                                        onChange={(e) => handleChange(service.id, "color", e.target.value)}
                                        className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                                        title="テーマカラーを選択"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemoveService(service.id)}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="削除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50">
                    <button
                        onClick={handleAddService}
                        className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        メニューを追加
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 py-3 px-8 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 min-w-[200px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            保存中...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <Check className="w-5 h-5" />
                            保存しました
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
