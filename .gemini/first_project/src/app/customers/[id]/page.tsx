"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Calendar, Clock, FileText, Phone, MapPin, Plus } from "lucide-react";
import { ATTRIBUTE_LABELS, type AttributeLabelCode } from "@/lib/constants";

// TODO: Replace with Prisma fetch
const mockCustomer = {
    id: "1",
    name: "山田 花子",
    furigana: "ヤマダ ハナコ",
    birth_date: "1988年1月23日 (36歳)",
    phone_number: "090-1234-5678",
    address: "東京都渋谷区...",
    occupation: "会社員 (デスクワーク)",
    pain_area: "首筋から左肩にかけて、右腰",
    symptoms: "こる, 重苦しい",
    when_symptoms_felt: "デスクワーク中、夕方になるとつらい",
    visited_hospital: "いいえ",
    desired_duration: "60分",
    desired_treatment: "施術師と相談して決めたい",
    massage_frequency: "たまに",
    referral_source: "Googleマップ",
    additional_concerns: "強めのマッサージが好みです。揉み返しはあまり出ません。",
    attribute: "F_30_40" as AttributeLabelCode,
};

const mockVisits = [
    { id: "v1", date: "2023-10-25", treatment: "全身調整＋ヘッド 60分", price: "6,500円", memo: "左肩甲骨周りがかなり硬い。次回も同様のアプローチ。" },
    { id: "v2", date: "2023-10-10", treatment: "背面もみほぐし 45分", price: "4,800円", memo: "初回。首からの痛みが主訴。" },
];

export default function CustomerDetail({ params }: { params: { id: string } }) {
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
                        {mockCustomer.name} 様
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
                            {mockCustomer.name[0]}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1 text-xs">
                                <div className="text-muted-foreground truncate">{mockCustomer.furigana}</div>
                                {mockCustomer.attribute && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${ATTRIBUTE_LABELS[mockCustomer.attribute].colorClass}`}>
                                        {ATTRIBUTE_LABELS[mockCustomer.attribute].label}
                                    </span>
                                )}
                            </div>
                            <div className="text-xl font-bold dark:text-slate-100 truncate">{mockCustomer.name}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" /> {mockCustomer.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" /> {mockCustomer.birth_date}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <MapPin className="w-4 h-4" /> {mockCustomer.address}
                        </div>
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
                                    <dd className="text-sm font-medium">{mockCustomer.pain_area}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">どんな症状か</dt>
                                    <dd className="text-sm font-medium">{mockCustomer.symptoms}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">どんなときに感じるか</dt>
                                    <dd className="text-sm font-medium">{mockCustomer.when_symptoms_felt}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">希望コース</dt>
                                    <dd className="text-sm font-medium">{mockCustomer.desired_treatment} / {mockCustomer.desired_duration}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Medical Info */}
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <h3 className="font-bold border-b pb-2 mb-3 text-primary">その他・特記事項</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">マッサージ頻度</dt>
                                    <dd className="text-sm font-medium">{mockCustomer.massage_frequency}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground mb-1">自由記述 / お身体で不安なこと</dt>
                                    <dd className="text-sm font-medium bg-muted p-3 rounded-xl mt-1 leading-relaxed">
                                        {mockCustomer.additional_concerns}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Link href={`/customers/${mockCustomer.id}/visits/new`} className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-sm active:scale-[0.98] transition-all">
                            <Plus className="w-5 h-5" /> 新しいカルテを追加
                        </Link>

                        <div className="relative pl-6 border-l-2 border-muted mt-6 ml-2 space-y-8">
                            {mockVisits.map((visit) => (
                                <div key={visit.id} className="relative">
                                    <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                    <div className="bg-card border rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-foreground">{visit.date}</div>
                                            <div className="text-sm font-bold text-primary">{visit.price}</div>
                                        </div>
                                        <div className="text-sm font-medium mb-2 pb-2 border-b">{visit.treatment}</div>
                                        <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                            <p className="font-bold text-xs text-amber-600 dark:text-amber-500 mb-1">スタッフメモ (非公開)</p>
                                            {visit.memo}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
