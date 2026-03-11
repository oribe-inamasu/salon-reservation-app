"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, UserPlus, Loader2 } from "lucide-react";
import { AttributeLabelSelector } from "@/components/AttributeLabelSelector";
import type { CustomerLabel } from "@/lib/settings";

type FormSection = {
    title: string;
    fields: {
        key: string;
        label: string;
        type?: "text" | "tel" | "date" | "select" | "textarea";
        placeholder?: string;
        required?: boolean;
        options?: readonly string[];
    }[];
};

const getFormSections = (serviceNames: string[]): FormSection[] => [
    {
        title: "基本情報",
        fields: [
            { key: "name", label: "お名前", placeholder: "例: 山田 太郎", required: true },
            { key: "furigana", label: "フリガナ", placeholder: "例: ヤマダ タロウ", required: true },
            { key: "birth_date", label: "生年月日", type: "date" },
            { key: "phone_number", label: "電話番号", type: "tel", placeholder: "例: 090-1234-5678" },
            { key: "address", label: "住所", placeholder: "例: 東京都渋谷区..." },
            { key: "occupation", label: "ご職業", placeholder: "例: 会社員" },
        ],
    },
    {
        title: "お悩み・症状",
        fields: [
            { key: "pain_area", label: "痛みや違和感のある部分", placeholder: "例: 肩・首" },
            { key: "symptoms", label: "どんな症状か", type: "textarea", placeholder: "例: 慢性的な肩こり" },
            { key: "when_symptoms_felt", label: "どんなときに感じるか", placeholder: "例: デスクワーク中" },
            { key: "possible_cause", label: "考えられる原因", placeholder: "例: 長時間のPC作業" },
        ],
    },
    {
        title: "ご希望",
        fields: [
            { key: "desired_treatment", label: "ご希望の施術内容", type: "select", options: serviceNames },
            {
                key: "desired_duration",
                label: "ご希望の施術時間",
                type: "select",
                options: ["30分", "45分", "60分", "90分", "120分"] as const,
            },
        ],
    },
    {
        title: "その他",
        fields: [
            { key: "visited_hospital", label: "病院での受診", type: "select", options: ["はい", "いいえ"] as const },
            { key: "hospital_diagnosis", label: "診断名", placeholder: "受診した場合のみ" },
            { key: "current_treatment", label: "現在治療中の怪我や病気", type: "textarea", placeholder: "なければ空欄" },
            { key: "past_injury", label: "過去の大きなケガや病気", type: "textarea", placeholder: "なければ空欄" },
            { key: "massage_frequency", label: "マッサージの頻度", type: "select", options: ["初めて", "年に数回", "月に1回", "月に2〜3回", "週に1回以上"] as const },
            { key: "experienced_momikaeshi", label: "揉み返しの経験", type: "select", options: ["はい", "いいえ", "わからない"] as const },
            { key: "possible_pregnancy", label: "妊娠の可能性", type: "select", options: ["はい", "いいえ"] as const },
            { key: "referral_source", label: "当院を知ったきっかけ", placeholder: "例: Google検索、友人の紹介" },
            { key: "additional_concerns", label: "自由記述・お身体で不安なこと", type: "textarea", placeholder: "どんなことでもご記入ください" },
        ],
    },
];

export default function NewCustomerClient({
    serviceNames,
    customerLabels
}: {
    serviceNames: string[];
    customerLabels: CustomerLabel[];
}) {
    const formSections = getFormSections(serviceNames);
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name?.trim() || !formData.furigana?.trim()) {
            setError("お名前とフリガナは必須です");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (result.success) {
                router.push(`/customers/${result.customerId}`);
            } else {
                setError(result.error || "登録に失敗しました");
            }
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex items-center h-14 px-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg">新規顧客の登録</div>
                    <div className="w-10" />
                </div>
            </header>

            {/* Form */}
            <main className="flex-1 p-4">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {formSections.length > 0 && (
                        <AttributeLabelSelector
                            value={formData.attribute_label || ""}
                            onChange={(val) => handleChange("attribute_label", val)}
                            customerLabels={customerLabels}
                        />
                    )}

                    {formSections.map((section) => (
                        <div key={section.title} className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                            <h3 className="font-bold border-b pb-2 text-primary">{section.title}</h3>
                            {section.fields.map((field) => (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-xs text-red-500 font-bold">必須</span>
                                        )}
                                    </label>

                                    {field.type === "select" ? (
                                        <select
                                            value={formData[field.key] || ""}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                        >
                                            <option value="">選択してください</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === "textarea" ? (
                                        <textarea
                                            value={formData[field.key] || ""}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                                        />
                                    ) : (
                                        <input
                                            type={field.type || "text"}
                                            value={formData[field.key] || ""}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                登録中...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                この内容で登録する
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
