"use client";

import { ATTRIBUTE_LABELS, type AttributeLabelCode } from "@/lib/constants";

const labelEntries = Object.entries(ATTRIBUTE_LABELS) as [AttributeLabelCode, { label: string; colorClass: string }][];

export function AttributeLabelSelector({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold border-b pb-2 text-primary">顧客カテゴリ（性別・年代）</h3>
            <div className="grid grid-cols-2 gap-2">
                {labelEntries.map(([code, info]) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => onChange(value === code ? "" : code)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${value === code
                                ? `${info.colorClass} ring-2 ring-offset-1 ring-current scale-[1.02]`
                                : `${info.colorClass} opacity-50 hover:opacity-80`
                            }`}
                    >
                        {info.label}
                    </button>
                ))}
            </div>
            {value && (
                <p className="text-xs text-muted-foreground text-center">
                    選択中: <span className="font-bold">{ATTRIBUTE_LABELS[value as AttributeLabelCode]?.label}</span>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="ml-2 text-red-500 underline"
                    >
                        解除
                    </button>
                </p>
            )}
        </div>
    );
}
