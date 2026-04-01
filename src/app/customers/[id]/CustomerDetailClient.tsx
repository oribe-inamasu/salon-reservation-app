"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Calendar, Clock, FileText, Phone, MapPin, Plus, TrendingUp, Award, PlusCircle } from "lucide-react";
import { OptionService } from "@/lib/settings";
import { calculateAge } from "@/lib/date-utils";


type SerializedCustomer = {
    id: string;
    name: string;
    furigana: string;
    birth_date: string | null;
    phone_number: string | null;
    address: string | null;
    occupation: string | null;
    pain_area: string | null;
    symptoms: string | null;
    when_symptoms_felt: string | null;
    visited_hospital: string | null;
    hospital_diagnosis: string | null;
    possible_cause: string | null;
    desired_duration: string | null;
    desired_treatment: string | null;
    current_treatment: string | null;
    past_injury: string | null;
    massage_frequency: string | null;
    experienced_momikaeshi: string | null;
    possible_pregnancy: string | null;
    referral_source: string | null;
    additional_concerns: string | null;
    pregnancy_duration: string | null;
    attribute_label: string | null;
    createdAt: string;
    updatedAt: string;
    visitHistories: Array<{
        id: string;
        customerId: string;
        visit_date: string;
        treatment_category: string | null;
        treatment_content: string | null;
        price: number | null;
        staff: string | null;
        staff_memo: string | null;
        createdAt: string;
        updatedAt: string;
        options?: string | null;
    }>;
};

export default function CustomerDetailClient({
    customer,
    optionServices
}: {
    customer: SerializedCustomer,
    optionServices: OptionService[]
}) {
    const [activeTab, setActiveTab] = useState<"intake" | "history">("intake");

    const totalVisits = customer.visitHistories.length;
    const totalSales = customer.visitHistories.reduce((sum, visit) => sum + (visit.price || 0), 0);

    const mostFrequentTreatment = useMemo(() => {
        if (totalVisits === 0) return "データなし";
        const counts = customer.visitHistories.reduce((acc, visit) => {
            if (visit.treatment_category) {
                acc[visit.treatment_category] = (acc[visit.treatment_category] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        let maxCategory = "データなし";
        let maxCount = 0;
        for (const [category, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                maxCategory = category;
            }
        }
        return maxCategory;
    }, [customer.visitHistories, totalVisits]);

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex items-center h-14 px-4">
                    <Link href="/" className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg truncate">
                        {customer.name} 様
                    </div>
                    <Link href={`/customers/${customer.id}/edit`} className="p-2 -mr-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <Edit3 className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Customer Quick Info Card */}
            <div className="px-4 pt-4 pb-2">
                <div className="bg-card border rounded-2xl shadow-sm p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
                            {customer.name[0]}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1 text-xs">
                                <div className="text-muted-foreground truncate">{customer.furigana}</div>
                                {calculateAge(customer.birth_date) !== null && (
                                    <div className="text-muted-foreground font-medium">
                                        {calculateAge(customer.birth_date)}歳
                                    </div>
                                )}
                            </div>
                            <div className="text-xl font-bold dark:text-slate-100 truncate">{customer.name}</div>
                        </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y mt-3 mb-1">
                        <div className="flex flex-col items-center justify-center text-center p-2 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />来店数</div>
                            <div className="font-bold text-base">{totalVisits}<span className="text-xs font-normal ml-0.5">回</span></div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-2 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />総売上</div>
                            <div className="font-bold text-base text-primary">¥{totalSales.toLocaleString()}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-2 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Award className="w-3 h-3" />最多コース</div>
                            <div className="font-bold text-xs line-clamp-2 leading-tight">{mostFrequentTreatment}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                        {customer.createdAt && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Plus className="w-4 h-4" /> 登録: {new Date(customer.createdAt).toLocaleDateString("ja-JP")}
                            </div>
                        )}
                        {customer.phone_number && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" /> {customer.phone_number}
                            </div>
                        )}
                        {customer.birth_date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" /> {customer.birth_date}
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                <MapPin className="w-4 h-4" /> {customer.address}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-2 sticky top-14 z-30 bg-muted/30 backdrop-blur-md">
                <div className="flex p-1 bg-muted rounded-xl">
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'intake' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab("intake")}
                    >
                        <FileText className="w-4 h-4" /> 予診票
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground'}`}
                        onClick={() => setActiveTab("history")}
                    >
                        <Clock className="w-4 h-4" /> 来店履歴
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 px-4">
                {activeTab === "intake" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Subjective Info */}
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <h3 className="font-bold border-b pb-2 mb-3 text-primary">お悩み・症状</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">痛みや違和感のある部分</dt>
                                    <dd className="text-sm font-medium">{customer.pain_area || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">どんな症状か</dt>
                                    <dd className="text-sm font-medium">{customer.symptoms || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">どんなときに感じるか</dt>
                                    <dd className="text-sm font-medium">{customer.when_symptoms_felt || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">希望コース</dt>
                                    <dd className="text-sm font-medium">{customer.desired_treatment || "未入力"} / {customer.desired_duration || "未入力"}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Medical Info */}
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <h3 className="font-bold border-b pb-2 mb-3 text-primary">その他・特記事項</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">ご職業</dt>
                                    <dd className="text-sm font-medium">{customer.occupation || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">病院での受診</dt>
                                    <dd className="text-sm font-medium">{customer.visited_hospital || "未入力"}</dd>
                                </div>
                                {customer.hospital_diagnosis && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground mb-1">診断名</dt>
                                        <dd className="text-sm font-medium">{customer.hospital_diagnosis}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">マッサージ頻度</dt>
                                    <dd className="text-sm font-medium">{customer.massage_frequency || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">考えられる原因</dt>
                                    <dd className="text-sm font-medium">{customer.possible_cause || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">現在治療中の怪我や病気</dt>
                                    <dd className="text-sm font-medium">{customer.current_treatment || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">過去の大きなケガや病気</dt>
                                    <dd className="text-sm font-medium">{customer.past_injury || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">揉み返しの経験</dt>
                                    <dd className="text-sm font-medium">{customer.experienced_momikaeshi || "未入力"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">妊娠の可能性</dt>
                                    <dd className="text-sm font-medium">
                                        {customer.possible_pregnancy || "未入力"}
                                        {customer.pregnancy_duration && ` (${customer.pregnancy_duration})`}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">当院を知ったきっかけ</dt>
                                    <dd className="text-sm font-medium">{customer.referral_source || "未入力"}</dd>
                                </div>
                                {customer.additional_concerns && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground mb-1">自由記述 / お身体で不安なこと</dt>
                                        <dd className="text-sm font-medium bg-muted p-3 rounded-xl mt-1 leading-relaxed whitespace-pre-wrap">
                                            {customer.additional_concerns}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Link href={`/customers/${customer.id}/visits/new`} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-sm active:scale-[0.98] transition-all">
                            <Plus className="w-5 h-5" /> 新しいカルテを追加
                        </Link>

                        {customer.visitHistories.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">まだ来店履歴がありません</p>
                            </div>
                        ) : (
                            <div className="relative pl-6 border-l-2 border-muted mt-6 ml-2 space-y-8">
                                {customer.visitHistories.map((visit) => (
                                    <div key={visit.id} className="relative">
                                        <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-foreground">
                                                    {new Date(visit.visit_date).toLocaleDateString("ja-JP")}
                                                </div>
                                                {visit.price != null && (
                                                    <div className="text-sm font-bold text-primary mr-8">
                                                        {visit.price.toLocaleString()}円
                                                    </div>
                                                )}
                                                <Link
                                                    href={`/customers/${customer.id}/visits/${visit.id}/edit`}
                                                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors p-1"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                            {(visit.treatment_category || visit.treatment_content) && (
                                                <div className="text-sm font-medium mb-2 pb-2 border-b">
                                                    {visit.treatment_category}{visit.treatment_content ? ` - ${visit.treatment_content}` : ""}
                                                    {visit.staff && (
                                                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs rounded-md">
                                                            担当: {visit.staff}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {visit.options && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {(() => {
                                                        try {
                                                            const selectedOptionIds = JSON.parse(visit.options) as string[];
                                                            return selectedOptionIds.map((optId, idx) => {
                                                                const opt = optionServices.find(o => o.id === optId);
                                                                if (!opt) return null;
                                                                return (
                                                                    <span key={`${optId}-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800">
                                                                        <PlusCircle className="w-2.5 h-2.5" />
                                                                        {opt.name}
                                                                    </span>
                                                                );
                                                            });
                                                        } catch (e) {
                                                            return null;
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                            {visit.staff_memo && (
                                                <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                                    <p className="font-bold text-xs text-amber-600 dark:text-amber-500 mb-1">スタッフメモ (非公開)</p>
                                                    <div className="whitespace-pre-wrap">{visit.staff_memo}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
