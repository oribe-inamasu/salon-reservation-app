"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Check, ClipboardList, Clock, JapaneseYen } from "lucide-react";
import { ServiceCourse } from "@/lib/settings";

export default function CourseSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: ServiceCourse[];
    onSave: (data: ServiceCourse[]) => Promise<boolean>;
}) {
    const [courseList, setCourseList] = useState<ServiceCourse[]>(
        initialData?.length ? initialData : [
            { id: "c1", name: "総合鍼灸コース 60分", duration: 60, price: 6500 },
            { id: "c2", name: "美容鍼スタンダード 45分", duration: 45, price: 5500 },
            { id: "c3", name: "クイックマッサージ 30分", duration: 30, price: 3500 },
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAddCourse = () => {
        const newCourse: ServiceCourse = {
            id: crypto.randomUUID(),
            name: "新しいコース",
            duration: 60,
            price: 5000,
        };
        setCourseList([...courseList, newCourse]);
    };

    const handleRemoveCourse = (id: string) => {
        if (courseList.length <= 1) {
            alert("少なくとも1つのコースが必要です。");
            return;
        }
        setCourseList(courseList.filter((c) => c.id !== id));
    };

    const handleChange = (id: string, field: keyof ServiceCourse, value: string | number) => {
        setCourseList(courseList.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await onSave(courseList);
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
                    <h2 className="text-lg font-bold text-foreground">コース管理</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        予約や会計時に選択できる施術コースを設定します。
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {courseList.map((course) => (
                    <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider">コース名</label>
                                <input
                                    type="text"
                                    value={course.name}
                                    onChange={(e) => handleChange(course.id, "name", e.target.value)}
                                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="例: 全身調整 60分"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveCourse(course.id)}
                                className="mt-5 p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="削除"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 所要時間 (分)
                                </label>
                                <input
                                    type="number"
                                    value={course.duration}
                                    onChange={(e) => handleChange(course.id, "duration", parseInt(e.target.value) || 0)}
                                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                    <JapaneseYen className="w-3 h-3" /> 金額 (円)
                                </label>
                                <input
                                    type="number"
                                    value={course.price}
                                    onChange={(e) => handleChange(course.id, "price", parseInt(e.target.value) || 0)}
                                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddCourse}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-stone-200 text-stone-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-3xl transition-all font-bold text-sm"
                >
                    <Plus className="w-5 h-5" />
                    新しいコースを追加
                </button>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 py-4 px-10 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 min-w-[220px]"
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
                            コース設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
