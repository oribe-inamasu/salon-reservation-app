"use client";

import type { CustomerLabel } from "@/lib/settings";

export function AttributeLabelSelector({
    value,
    onChange,
    customerLabels,
}: {
    value: string;
    onChange: (value: string) => void;
    customerLabels: CustomerLabel[];
}) {
    return (
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold border-b pb-2 text-primary">顧客カテゴリ（性別・年代）</h3>
            <div className="grid grid-cols-2 gap-2">
                {customerLabels.map((label) => {
                    const isSelected = value === label.id;
                    return (
                        <button
                            key={label.id}
                            type="button"
                            onClick={() => onChange(isSelected ? "" : label.id)}
                            style={{
                                backgroundColor: isSelected ? `${label.color}33` : `${label.color}1A`,
                                color: label.color,
                                borderColor: isSelected ? label.color : `${label.color}33`,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isSelected ? "ring-2 ring-offset-1 ring-current scale-[1.02]" : "opacity-70 hover:opacity-100"
                                }`}
                        >
                            {label.name}
                        </button>
                    );
                })}
            </div>
            {value && (
                <p className="text-xs text-muted-foreground text-center">
                    選択中: <span className="font-bold">{customerLabels.find(l => l.id === value)?.name || value}</span>
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
