"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, Check } from "lucide-react";

export type StaffMember = {
    id: string;
    name: string;
    color: string;
};

const DEFAULT_COLORS = [
    "bg-emerald-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-stone-800",
];

export default function StaffSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: StaffMember[];
    onSave: (data: StaffMember[]) => Promise<boolean>;
}) {
    // Basic fallback to constant if no data exists in DB yet
    const [staffList, setStaffList] = useState<StaffMember[]>(
        initialData?.length ? initialData : [
            { id: "1", name: "院長（スタッフA）", color: "bg-emerald-500" },
            { id: "2", name: "スタッフB", color: "bg-pink-500" },
            { id: "3", name: "スタッフC", color: "bg-purple-500" },
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAddStaff = () => {
        const newStaff: StaffMember = {
            id: crypto.randomUUID(),
            name: "新しいスタッフ",
            color: DEFAULT_COLORS[staffList.length % DEFAULT_COLORS.length],
        };
        setStaffList([...staffList, newStaff]);
    };

    const handleRemoveStaff = (id: string) => {
        setStaffList(staffList.filter((s) => s.id !== id));
    };

    const handleChange = (id: string, field: keyof StaffMember, value: string) => {
        setStaffList(staffList.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await onSave(staffList);
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
                    <h2 className="text-lg font-bold text-foreground">スタッフ管理</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        予約やカルテの担当者として選択できるスタッフを設定します。
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden text-sm">
                <div className="p-4 space-y-3">
                    {staffList.map((staff, index) => (
                        <div key={staff.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-stone-100 group">
                            <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors hidden sm:block">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={staff.name}
                                        onChange={(e) => handleChange(staff.id, "name", e.target.value)}
                                        className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                        placeholder="スタッフ名"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={staff.color}
                                        onChange={(e) => handleChange(staff.id, "color", e.target.value)}
                                        className="bg-white text-stone-900 border border-stone-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none min-w-[120px]"
                                    >
                                        {DEFAULT_COLORS.map(color => (
                                            <option key={color} value={color}>{color.replace('bg-', '')}</option>
                                        ))}
                                    </select>
                                    <div className={`w-8 h-8 rounded-full ${staff.color} border-2 border-white shadow-sm flex-shrink-0`} />
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemoveStaff(staff.id)}
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
                        onClick={handleAddStaff}
                        className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        スタッフを追加
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
