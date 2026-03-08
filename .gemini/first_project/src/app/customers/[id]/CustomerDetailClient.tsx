"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Calendar, Clock, FileText, Phone, MapPin, Plus } from "lucide-react";

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
    createdAt: string;
    updatedAt: string;
    visitHistories: Array<{
        id: string;
        customerId: string;
        visit_date: string;
        treatment_category: string | null;
        treatment_content: string | null;
        price: number | null;
        staff_memo: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
};

export default function CustomerDetailClient({ customer }: { customer: SerializedCustomer }) {
    const [activeTab, setActiveTab] = useState<"intake" | "history">("intake");

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full glass bg-primary text-primary-foreground border-b border-primary-foreground/20">
                <div className="flex items-center h-14 px-4">
                    <Link href="/" className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg truncate">
                        {customer.name} 様
                    </div>
                    <button className="p-2 -mr-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <Edit3 className="w-5 h-5" />
                    </button>
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
                            </div>
                            <div className="text-xl font-bold dark:text-slate-100 truncate">{customer.name}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t mt-2">
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
                                    <dt className="text-xs text-muted-foreground mb-1">当院を知ったきっかけ</dt>
                                    <dd className="text-sm font-medium">{customer.referral_source || "未入力"}</dd>
                                </div>
                                {customer.additional_concerns && (
                                    <div>
                                        <dt className="text-xs text-muted-foreground mb-1">自由記述 / お身体で不安なこと</dt>
                                        <dd className="text-sm font-medium bg-muted p-3 rounded-xl mt-1 leading-relaxed">
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
                                                    <div className="text-sm font-bold text-primary">
                                                        {visit.price.toLocaleString()}円
                                                    </div>
                                                )}
                                            </div>
                                            {(visit.treatment_category || visit.treatment_content) && (
                                                <div className="text-sm font-medium mb-2 pb-2 border-b">
                                                    {visit.treatment_category}{visit.treatment_content ? ` - ${visit.treatment_content}` : ""}
                                                </div>
                                            )}
                                            {visit.staff_memo && (
                                                <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                                    <p className="font-bold text-xs text-amber-600 dark:text-amber-500 mb-1">スタッフメモ (非公開)</p>
                                                    {visit.staff_memo}
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
