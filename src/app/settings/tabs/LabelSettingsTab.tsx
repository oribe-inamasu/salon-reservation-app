"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, Check } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export type CustomerLabel = {
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

export default function LabelSettingsTab({
    initialData,
    onSave,
}: {
    initialData?: CustomerLabel[];
    onSave: (data: CustomerLabel[]) => Promise<boolean>;
}) {
    const [labelList, setLabelList] = useState<CustomerLabel[]>(
        initialData?.length ? initialData : [
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
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAddLabel = () => {
        const newLabel: CustomerLabel = {
            id: crypto.randomUUID(),
            name: "新しい属性ラベル",
            color: DEFAULT_COLORS[labelList.length % DEFAULT_COLORS.length],
        };
        setLabelList([...labelList, newLabel]);
    };

    const handleRemoveLabel = (id: string) => {
        setLabelList(labelList.filter((l) => l.id !== id));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(labelList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLabelList(items);
    };

    const handleChange = (id: string, field: keyof CustomerLabel, value: string) => {
        setLabelList(labelList.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const success = await onSave(labelList);
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
                    <h2 className="text-lg font-bold text-foreground">顧客属性ラベル管理</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        顧客に設定できる属性ラベル（年代・性別・VIPなど）を追加・変更できます。ドラッグして順番を入れ替えられます。
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden text-sm">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="label-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="p-4 space-y-3"
                            >
                                {labelList.map((label, index) => (
                                    <Draggable key={label.id} draggableId={label.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 group transition-shadow shadow-sm",
                                                    snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 z-50 relative"
                                                )}
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="p-1 text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing transition-colors"
                                                    title="ドラッグして移動"
                                                >
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={label.name}
                                                            onChange={(e) => handleChange(label.id, "name", e.target.value)}
                                                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow font-sans"
                                                            placeholder="ラベル名"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={label.color}
                                                            onChange={(e) => handleChange(label.id, "color", e.target.value)}
                                                            className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                                                            title="テーマカラーを選択"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveLabel(label.id)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                    title="削除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="p-4 border-t border-stone-100 bg-stone-50">
                    <button
                        onClick={handleAddLabel}
                        className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        ラベルを追加
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

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
