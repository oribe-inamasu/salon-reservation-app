"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Check, Clock, JapaneseYen, PlusCircle, GripVertical } from "lucide-react";
import { OptionService, ServiceCategory } from "@/lib/settings";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function OptionsSettingsTab({
    initialData,
    serviceCategories = [],
    onSave,
}: {
    initialData?: OptionService[];
    serviceCategories?: ServiceCategory[];
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

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(optionList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setOptionList(items);
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
                        指名料や延長料金、または割引項目を設定します。ドラッグして順番を入れ替えられます。
                    </p>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="option-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {optionList.map((option, index) => (
                                <Draggable key={option.id} draggableId={option.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={cn(
                                                "bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-4 transition-shadow",
                                                snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 z-50 relative bg-white"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="p-1 text-stone-400 hover:text-stone-500 cursor-grab active:cursor-grabbing transition-colors"
                                                        title="ドラッグして移動"
                                                    >
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider">項目名</label>
                                                        <input
                                                            type="text"
                                                            value={option.name}
                                                            onChange={(e) => handleChange(option.id, "name", e.target.value)}
                                                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
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

                                                <div className="space-y-1 col-span-2">
                                                    <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                                        メニュー属性（売上分類）
                                                    </label>
                                                    <select
                                                        value={option.category || ""}
                                                        onChange={(e) => handleChange(option.id, "category", e.target.value)}
                                                        className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                                                    >
                                                        <option value="">メニュー項目を選択（任意）</option>
                                                        {serviceCategories.map(cat => (
                                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-stone-400 mb-1 block uppercase tracking-wider flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> 加算時間 (分)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={option.duration}
                                                        onChange={(e) => handleChange(option.id, "duration", parseInt(e.target.value) || 0)}
                                                        className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
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
                                                        className={cn(
                                                            "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans",
                                                            option.price < 0 ? 'text-red-600 font-bold' : 'text-stone-900'
                                                        )}
                                                    />
                                                </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                onClick={handleAddOption}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-stone-200 text-stone-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-3xl transition-all font-bold text-sm"
            >
                <PlusCircle className="w-5 h-5" />
                新しい項目を追加
            </button>

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
                            項目設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
