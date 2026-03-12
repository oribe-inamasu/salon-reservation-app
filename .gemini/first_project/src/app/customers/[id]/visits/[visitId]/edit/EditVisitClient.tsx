"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, CheckCircle, Trash2, Clock, JapaneseYen, PlusCircle } from "lucide-react";
import { ServiceCourse, OptionService } from "@/lib/settings";

type SerializedVisit = {
    id: string;
    customerId: string;
    visit_date: string;
    treatment_category: string | null;
    treatment_content: string | null;
    price: number | null;
    staff: string | null;
    staff_memo: string | null;
};

export default function EditVisitClient({
    visit,
    serviceNames,
    staffNames,
    serviceCourses,
    optionServices,
}: {
    visit: SerializedVisit;
    serviceNames: string[];
    staffNames: string[];
    serviceCourses: ServiceCourse[];
    optionServices: OptionService[];
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Format ISO string to 'YYYY-MM-DDThh:mm' for datetime-local input
    const formatDateTimeLocal = (isoString: string) => {
        const d = new Date(isoString);
        // adjust to local timezone for the input
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const [visitDate, setVisitDate] = useState(formatDateTimeLocal(visit.visit_date));
    const [treatmentCategory, setTreatmentCategory] = useState(visit.treatment_category || "");
    const [treatmentContent, setTreatmentContent] = useState(visit.treatment_content || "");
    const [price, setPrice] = useState(visit.price !== null ? String(visit.price) : "");
    const [staff, setStaff] = useState(visit.staff || "");
    const [staffMemo, setStaffMemo] = useState(visit.staff_memo || "");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!visitDate) {
            setError("来店日時は必須です");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/customers/${visit.customerId}/visits/${visit.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visit_date: visitDate,
                    treatment_category: treatmentCategory,
                    treatment_content: treatmentContent,
                    price: price,
                    staff: staff,
                    staff_memo: staffMemo,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/customers/${visit.customerId}`);
                    router.refresh();
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

    const handleDelete = async () => {
        if (!confirm("このカルテを削除してもよろしいですか？\n※関連する予約カレンダーのデータも削除されます")) return;

        setIsDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/customers/${visit.customerId}/visits/${visit.id}`, {
                method: "DELETE",
            });

            const result = await res.json();
            if (result.success) {
                router.push(`/customers/${visit.customerId}`);
                router.refresh();
            } else {
                setError(result.error || "削除に失敗しました");
                setIsDeleting(false);
            }
        } catch {
            setError("通信エラーが発生しました");
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex items-center h-14 px-4">
                    <Link href={`/customers/${visit.customerId}`} className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg">
                        カルテの編集
                    </div>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting || success || isDeleting}
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
                            <p className="font-bold">カルテを更新しました</p>
                            <p className="text-xs mt-1">顧客詳細ページに戻ります...</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Visit Date */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">来店情報</h3>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1">
                                来店日時
                                <span className="text-xs text-red-500 font-bold">必須</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Treatment Content */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">施術内容</h3>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">施術カテゴリ</label>
                            <select
                                value={treatmentCategory}
                                onChange={(e) => setTreatmentCategory(e.target.value)}
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            >
                                <option value="">選択してください</option>
                                {serviceNames.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <label className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                                <Clock className="w-3 h-3" /> クイック選択：施術コース
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => {
                                    const courseId = e.target.value;
                                    setSelectedCourseId(courseId);
                                    const course = serviceCourses.find(c => c.id === courseId);
                                    if (course) {
                                        setTreatmentCategory(course.name);
                                        setPrice(String(course.price));
                                    }
                                }}
                                className="w-full bg-transparent border-none rounded-lg text-sm font-bold focus:ring-0"
                            >
                                <option value="">コースを選択して自動入力</option>
                                {serviceCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.duration}分 / ¥{course.price.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <label className="text-xs font-bold text-amber-700 flex items-center gap-1 uppercase tracking-wider">
                                <PlusCircle className="w-3 h-3" /> クイック追加：オプション・割引
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {optionServices.map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            setPrice(prev => String(parseInt(prev || "0") + option.price));
                                        }}
                                        className="px-2 py-1.5 bg-white text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-all"
                                    >
                                        {option.name} ({option.price > 0 ? "+" : ""}{option.price.toLocaleString()}円)
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">施術内容の詳細（任意）</label>
                            <input
                                type="text"
                                value={treatmentContent}
                                onChange={(e) => setTreatmentContent(e.target.value)}
                                placeholder="例: 全身調整＋ヘッド 60分など"
                                className="w-full p-3 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>
                        <div className="space-y-1.5 pt-2 border-t">
                            <label className="text-sm font-medium text-foreground">担当スタッフ（任意）</label>
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

                    {/* Price */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-primary">料金</h3>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">料金（円）</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">¥</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="例: 6500"
                                    className="w-full p-3 pl-8 bg-muted border-none rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Staff Memo */}
                    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
                        <h3 className="font-bold border-b pb-2 text-amber-600 dark:text-amber-500">🔒 スタッフ用メモ（非公開）</h3>
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-1 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                            <textarea
                                value={staffMemo}
                                onChange={(e) => setStaffMemo(e.target.value)}
                                rows={5}
                                placeholder="痛みの変化や次回への引き継ぎ事項などを記録"
                                className="w-full p-3 bg-transparent border-none focus:outline-none text-sm leading-relaxed resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting || success || isDeleting}
                            className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || success || isDeleting}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    変更を保存する
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
