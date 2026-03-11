"use client";

import { useState } from "react";
import { Save, Loader2, Store, Phone, MapPin, Clock, CalendarDays, Globe } from "lucide-react";

export type ClinicInfo = {
    name: string;
    phone: string;
    address: string;
    hours: string;
    closedDays: number[];
    website: string;
};

const defaultClinicInfo: ClinicInfo = {
    name: "Salon Karte",
    phone: "03-1234-5678",
    address: "東京都...",
    hours: "10:00 - 20:00",
    closedDays: [3],
    website: "https://example.com",
};

const DAYS_OF_WEEK = [
    { id: 1, label: "月" },
    { id: 2, label: "火" },
    { id: 3, label: "水" },
    { id: 4, label: "木" },
    { id: 5, label: "金" },
    { id: 6, label: "土" },
    { id: 0, label: "日" },
];

export default function ClinicSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: ClinicInfo;
    onSave: (data: ClinicInfo) => Promise<boolean>;
}) {
    const [info, setInfo] = useState<ClinicInfo>(initialData || defaultClinicInfo);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (key: keyof ClinicInfo, value: any) => {
        setInfo(prev => ({ ...prev, [key]: value }));
        setSuccessMessage(null);
    };

    const handleToggleDay = (dayId: number) => {
        setInfo(prev => {
            const newDays = prev.closedDays.includes(dayId)
                ? prev.closedDays.filter(d => d !== dayId)
                : [...prev.closedDays, dayId];
            return { ...prev, closedDays: newDays.sort() };
        });
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage(null);

        const success = await onSave(info);
        if (success) {
            setSuccessMessage("サロン情報を保存しました。この情報は予約サイトやレシートに表示されます。");
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                    <Store className="w-6 h-6 text-primary" />
                    サロン基本情報
                </h2>

                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm flex items-center justify-center font-bold">
                        {successMessage}
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                            <Store className="w-4 h-4 text-stone-400" />
                            サロン名 / 屋号
                        </label>
                        <input
                            type="text"
                            value={info.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                            placeholder="例: Salon Karte"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-stone-400" />
                            電話番号
                        </label>
                        <input
                            type="tel"
                            value={info.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                            placeholder="例: 03-1234-5678"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            住所
                        </label>
                        <textarea
                            value={info.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            rows={2}
                            className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow resize-none"
                            placeholder="例: 東京都渋谷区神宮前X-X-X"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-stone-400" />
                                営業時間
                            </label>
                            <input
                                type="text"
                                value={info.hours}
                                onChange={(e) => handleChange("hours", e.target.value)}
                                className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                placeholder="例: 10:00 - 20:00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-stone-400" />
                                定休日（曜日）
                            </label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = info.closedDays.includes(day.id);
                                    return (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => handleToggleDay(day.id)}
                                            className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${isSelected
                                                ? "bg-red-500 text-white shadow-sm"
                                                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-stone-400" />
                            Webサイト / SNS
                        </label>
                        <input
                            type="url"
                            value={info.website}
                            onChange={(e) => handleChange("website", e.target.value)}
                            className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                            placeholder="例: https://example.com"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            保存中...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            変更を保存する
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
