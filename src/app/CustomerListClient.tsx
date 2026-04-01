"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, User, ChevronRight, ChevronDown, Check } from "lucide-react";
import type { CustomerLabel } from "@/lib/settings";
import { calculateAge } from "@/lib/date-utils";

type CustomerWithVisits = {
    id: string;
    name: string;
    furigana: string;
    phone_number: string | null;
    createdAt: string;
    lastVisitDate: string | null;
    visitCount: number;
    attributeLabel: string | null;
    birthDate: string | null;
};


type SortType = "newest" | "furigana" | "lastVisit" | "visitCount";

export default function CustomerListClient({
    customers,
    customerLabels,
}: {
    customers: CustomerWithVisits[];
    customerLabels: CustomerLabel[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortType, setSortType] = useState<SortType>("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort labels for display
    const sortLabels: Record<SortType, string> = {
        newest: "登録日順（新しい順）",
        furigana: "五十音順",
        lastVisit: "来店日順",
        visitCount: "来店回数順",
    };

    const filteredAndSorted = useMemo(() => {
        let result = customers;

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.furigana.toLowerCase().includes(q) ||
                    (c.phone_number && c.phone_number.includes(q))
            );
        }

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortType) {
                case "furigana":
                    return a.furigana.localeCompare(b.furigana, "ja");
                case "lastVisit": {
                    if (!a.lastVisitDate && !b.lastVisitDate) return 0;
                    if (!a.lastVisitDate) return 1;
                    if (!b.lastVisitDate) return -1;
                    return new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime();
                }
                case "visitCount":
                    return b.visitCount - a.visitCount;
                case "newest":
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return result;
    }, [customers, searchQuery, sortType]);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex h-14 items-center px-4 justify-between shadow-sm">
                    <h1 className="text-lg font-bold">顧客一覧</h1>
                    <Link href="/customers/new" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Plus className="w-6 h-6" />
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="p-3 bg-white dark:bg-slate-900 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="名前やフリガナ、電話番号で検索"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content (Customer List) */}
            <main className="flex-1 p-3">
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-medium text-muted-foreground">
                        {searchQuery ? `検索結果: ${filteredAndSorted.length} 件` : `全 ${customers.length} 件`}
                    </span>
                    {/* Custom Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-1 text-sm bg-primary/5 sm:bg-transparent px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-md sm:rounded-none text-primary font-medium focus:outline-none transition-colors hover:bg-primary/10 sm:hover:bg-transparent active:scale-95 sm:active:scale-100"
                        >
                            {sortLabels[sortType]}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isSortOpen && (
                            <>
                                {/* Overlay to close */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsSortOpen(false)}
                                />
                                {/* Menu */}
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {(Object.entries(sortLabels) as [SortType, string][]).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSortType(key);
                                                setIsSortOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-3.5 text-left text-[15px] sm:text-sm hover:bg-muted transition-colors active:bg-muted/80 border-b border-border/50 last:border-0"
                                        >
                                            <span className={sortType === key ? "font-bold text-primary" : "text-foreground"}>
                                                {label}
                                            </span>
                                            {sortType === key && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {filteredAndSorted.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        {searchQuery ? (
                            <>
                                <p className="text-sm">「{searchQuery}」に一致する顧客が見つかりません</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs mt-2 text-primary underline"
                                >
                                    検索をクリア
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm">まだ顧客データがありません</p>
                                <p className="text-xs mt-1">Googleフォームから予診票が送信されると、ここに表示されます</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAndSorted.map((customer) => (
                            <Link
                                key={customer.id}
                                href={`/customers/${customer.id}`}
                                className="flex items-center p-3 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <User className="w-6 h-6" />
                                </div>

                                {/* Info */}
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-0.5 text-[10px]">
                                        <div className="text-muted-foreground truncate">{customer.furigana}</div>
                                        {calculateAge(customer.birthDate) !== null && (
                                            <div className="text-muted-foreground font-medium">
                                                {calculateAge(customer.birthDate)}歳
                                            </div>
                                        )}
                                        {customer.attributeLabel && customerLabels.find(l => l.id === customer.attributeLabel) && (() => {
                                            const labelInfo = customerLabels.find(l => l.id === customer.attributeLabel);
                                            return (
                                                <span
                                                    className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border"
                                                    style={{
                                                        backgroundColor: `${labelInfo?.color}1A`,
                                                        color: labelInfo?.color,
                                                        borderColor: `${labelInfo?.color}33`
                                                    }}
                                                >
                                                    {labelInfo?.name}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="text-base font-bold text-foreground truncate">{customer.name} 様</div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-muted-foreground/50 ml-2" />
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
