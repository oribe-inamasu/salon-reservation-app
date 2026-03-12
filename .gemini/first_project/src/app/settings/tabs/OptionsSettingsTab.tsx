"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Check, Clock, JapaneseYen, PlusCircle, ChevronUp, ChevronDown } from "lucide-react";
import { OptionService } from "@/lib/settings";

export default function OptionsSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: OptionService[];
    onSave: (data: OptionService[]) => Promise<boolean>;
}) {
    const [optionList, setOptionList] = useState<OptionService[]>(
        initialData?.length ? initialData : [
            { id: "o1", name: "指名料", duration: 0, price: 500 },
            { id: "o2", name: "初回割引", duration: 0, price: -1000 },
            { id: "o3", name: "延長 10分", duration: 10, price: 1000 },
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAddOption = () => {
        const newOption: OptionService = {
            id: crypto.randomUUID(),
            name: "新しいオプション",
            duration: 0,
            price: 500,
        };
        setOptionList([...optionList, newOption]);
    };

    const handleRemoveOption = (id: string) => {
        setOptionList(optionList.filter((o) => o.id !== id));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newList = [...optionList];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setOptionList(newList);
    };

    const handleMoveDown = (index: number) => {
        if (index === optionList.length - 1) return;
        const newList = [...optionList];
        [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
        setOptionList(newList);
    };

    const handleChange = (id: string, field: keyof OptionService, value: string | number) => {
        setOptionList(optionList.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await onSave(optionList);
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
                    <h2 className="text-lg font-bold text-foreground">オプション・割引設定</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        指名料や延長料金、または割引項目を設定します。割引の場合は「金額」をマイナスで入力してください（例: -1000）。
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {optionList.map((option, index) => (
                    <div key={option.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-stone-300 hover:text-primary disabled:opacity-30 transition-colors"
                                        title="上に移動"
                                    >
                                        <ChevronUp className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === optionList.length - 1}
                                        className="p-1 text-stone-300 hover:text-primary disabled:opacity-30 transition-colors"
                                        title="下に移動"
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider">項目名</label>
                                    <input
                                        type="text"
                                        value={option.name}
                                        onChange={(e) => handleChange(option.id, "name", e.target.value)}
                                        className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="例: 指名料, 初回割引 など"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveOption(option.id)}
                                className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="削除"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 加算時間 (分)
                                </label>
                                <input
                                    type="number"
                                    value={option.duration}
                                    onChange={(e) => handleChange(option.id, "duration", parseInt(e.target.value) || 0)}
                                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                    <JapaneseYen className="w-3 h-3" /> 加算金額 (円)
                                </label>
                                <input
                                    type="number"
                                    value={option.price}
                                    onChange={(e) => handleChange(option.id, "price", parseInt(e.target.value) || 0)}
                                    className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${option.price < 0 ? 'text-red-600 font-bold' : 'text-stone-900'}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddOption}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-stone-200 text-stone-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-3xl transition-all font-bold text-sm"
                >
                    <PlusCircle className="w-5 h-5" />
                    新しい項目を追加
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
                            設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
