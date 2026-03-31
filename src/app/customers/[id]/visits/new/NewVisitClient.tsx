"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, CheckCircle, Clock, PlusCircle, Check } from "lucide-react";
import { ServiceCourse, OptionService } from "@/lib/settings";
import { calculateTotalPrice } from "@/lib/utils";

type CustomerSummary = {
    id: string;
    name: string;
};

export default function NewVisitClient({
    params,
    customer,
    staffNames,
    serviceCourses,
    optionServices,
}: {
    params: Promise<{ id: string }>;
    customer: CustomerSummary;
    staffNames: string[];
    serviceCourses: ServiceCourse[];
    optionServices: OptionService[];
}) {
    const router = useRouter();
    const [customerId, setCustomerId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<{ id: string, optionId: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [visitDate, setVisitDate] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [treatmentCategory, setTreatmentCategory] = useState("");
    const [treatmentContent, setTreatmentContent] = useState("");
    const [price, setPrice] = useState("");
    const [staff, setStaff] = useState("");
    const [staffMemo, setStaffMemo] = useState("");
    const [adjustmentPrice, setAdjustmentPrice] = useState("0");
    const [paymentMethod, setPaymentMethod] = useState("現金");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    useEffect(() => {
        params.then(({ id }) => setCustomerId(id));
    }, [params]);

// ... (inside the component)

    const updatePrice = (courseId: string, options: { optionId: string }[], adj: string) => {
        const total = calculateTotalPrice(courseId, options, adj, serviceCourses, optionServices);
        setPrice(String(total));
    };

    const addOption = () => {
        setSelectedOptions(prev => [...prev, { id: crypto.randomUUID(), optionId: "" }]);
    };

    const removeOption = (id: string) => {
        const newOptions = selectedOptions.filter(o => o.id !== id);
        setSelectedOptions(newOptions);
        updatePrice(selectedCourseId, newOptions, adjustmentPrice);
    };

    const updateOption = (id: string, newOptionId: string) => {
        const newOptions = selectedOptions.map(o => o.id === id ? { ...o, optionId: newOptionId } : o);
        setSelectedOptions(newOptions);
        updatePrice(selectedCourseId, newOptions, adjustmentPrice);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!visitDate) {
            setError("来店日時は必須です");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/customers/${customerId}/visits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visit_date: visitDate,
                    treatment_category: treatmentCategory,
                    treatment_content: treatmentContent,
                    price: price,
                    staff: staff,
                    staff_memo: staffMemo,
                    adjustment_price: adjustmentPrice,
                    payment_method: paymentMethod,
                    options: selectedOptions.length > 0 ? JSON.stringify(selectedOptions.map(o => o.optionId).filter(id => id !== "")) : null,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/customers/${customerId}`);
                }, 1000);
            } else {
                setError(result.error || "保存に失敗しました");
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
                    <Link href={`/customers/${customerId}`} className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg">
                        カルテ記録の追加
                    </div>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting || success}
                        className="p-2 -mr-2 text-primary-foreground font-bold hover:bg-white/10 rounded-full active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : success ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> 保存
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Form */}
            <main className="flex-1 p-4">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-sm text-green-700 dark:text-green-400 text-center animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                            <p className="font-bold">カルテを保存しました</p>
                            <p className="text-xs mt-1">顧客詳細ページに戻ります...</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                     {/* Visit Info */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">来店情報</h3>
                        
                        {/* 1. Customer (Read-only for New Visit as it's from the page context usually, but good to show) */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">顧客</label>
                            <div className="w-full p-3 bg-muted/50 border border-muted rounded-xl text-sm font-bold text-stone-600">
                                {customer.name} 様
                            </div>
                        </div>

                        {/* 2. Time */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1">
                                時間（来店日時）
                                <span className="text-xs text-red-500 font-bold">必須</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>

                        {/* 3. Staff */}
                        <div className="space-y-1.5 pt-2 border-t">
                            <label className="text-sm font-medium text-foreground">担当スタッフ</label>
                            <select
                                value={staff}
                                onChange={(e) => setStaff(e.target.value)}
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            >
                                <option value="">指名なし・選択しない</option>
                                {staffNames.map((member) => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Treatment Content */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">施術内容</h3>
                        {/* 4. Course */}
                        <div className="space-y-1.5 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <label className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                                <Clock className="w-3 h-3" /> コース
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => {
                                    const courseId = e.target.value;
                                    setSelectedCourseId(courseId);
                                    const course = serviceCourses.find(c => c.id === courseId);
                                    if (course) {
                                        setTreatmentCategory(course.category || course.name);
                                        setTreatmentContent(course.name);
                                        updatePrice(courseId, selectedOptions, adjustmentPrice);
                                    }
                                }}
                                className="w-full bg-transparent border-none rounded-lg text-sm font-bold focus:ring-0 outline-none"
                            >
                                <option value="">コースを選択して自動入力</option>
                                {serviceCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.duration}分 / ¥{course.price.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Option */}
                        <div className="space-y-1.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <label className="text-xs font-bold text-amber-700 flex items-center gap-1 uppercase tracking-wider">
                                <PlusCircle className="w-3 h-3" /> オプション・割引
                            </label>
                            <div className="space-y-3 mt-1">
                                {selectedOptions.map((opt, index) => (
                                    <div key={opt.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                                        <select
                                            value={opt.optionId}
                                            onChange={(e) => updateOption(opt.id, e.target.value)}
                                            className="flex-1 w-full bg-white border border-amber-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none p-2"
                                        >
                                            <option value="">オプション・割引を選択</option>
                                            {optionServices.map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.name} ({option.price > 0 ? "+" : ""}{option.price.toLocaleString()}円)
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(opt.id)}
                                            className="p-2 self-end sm:self-auto bg-stone-100/50 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        >
                                            <span className="sm:hidden text-xs font-bold mr-1">削除</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="w-full py-2.5 mt-2 border-2 border-dashed border-amber-200 text-amber-700/70 font-bold rounded-lg hover:border-amber-400 hover:text-amber-700 hover:bg-amber-100/50 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                    オプションを追加
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Price & Memo */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">会計・記録</h3>
                        
                        {/* 6. Adjustment */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">登録外の調整額（例：-500, +1000）</label>
                            <input
                                type="number"
                                value={adjustmentPrice}
                                onChange={(e) => {
                                    const newVal = e.target.value;
                                    setAdjustmentPrice(newVal);
                                    updatePrice(selectedCourseId, selectedOptions, newVal);
                                }}
                                className="w-full p-3 bg-amber-50 border-amber-200 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
                                placeholder="0"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1.5 pt-2 border-t">
                            <label className="text-sm font-medium text-foreground">支払い方法</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            >
                                <option value="現金">現金</option>
                                <option value="カード">カード</option>
                                <option value="電子マネー">電子マネー</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>

                        {/* 7. Memo */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center justify-between">
                                <span>🔒 メモ（スタッフ用メモ）</span>
                                <span className="text-[10px] text-muted-foreground font-normal">※次回への引き継ぎなど</span>
                            </label>
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-1 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                <textarea
                                    value={staffMemo}
                                    onChange={(e) => setStaffMemo(e.target.value)}
                                    rows={4}
                                    placeholder="痛みの変化や次回への引き継ぎ事項などを記録"
                                    className="w-full p-3 bg-transparent border-none focus:outline-none text-sm leading-relaxed resize-none"
                                />
                            </div>
                        </div>

                        {/* 8. Final Price */}
                        <div className="space-y-1.5 pt-4 border-t">
                            <label className="text-sm font-bold text-foreground">施術料金（最終料金）</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">¥</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="例: 6500"
                                    className="w-full p-3 pl-8 bg-muted border-none rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow font-bold text-lg"
                                />
                            </div>
                        </div>

                        {/* Extra: Content (placed at bottom to not interfere with requested 1-8) */}
                        <div className="space-y-1.5 pt-2 border-t opacity-70">
                            <label className="text-xs font-medium text-muted-foreground">施術内容の詳細（任意）</label>
                            <input
                                type="text"
                                value={treatmentContent}
                                onChange={(e) => setTreatmentContent(e.target.value)}
                                placeholder="例: 全身調整＋ヘッド 60分など"
                                className="w-full p-2 bg-muted/50 border-none rounded-lg text-xs focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || success}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                保存中...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                保存完了
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                このカルテを保存する
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div >
    );
}
