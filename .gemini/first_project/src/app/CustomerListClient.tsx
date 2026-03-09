"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, User, ChevronRight } from "lucide-react";
import { ATTRIBUTE_LABELS, type AttributeLabelCode } from "@/lib/constants";

type CustomerWithVisits = {
    id: string;
    name: string;
    furigana: string;
    phone_number: string | null;
    createdAt: string;
    lastVisitDate: string | null;
    visitCount: number;
    attributeLabel: string | null;
};

type SortType = "newest" | "furigana" | "lastVisit" | "visitCount";

export default function CustomerListClient({
    customers,
}: {
    customers: CustomerWithVisits[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortType, setSortType] = useState<SortType>("newest");

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
                            className="w-full pl-10 pr-4 py-2.5 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
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
                    <select
                        className="text-xs bg-transparent text-primary font-medium focus:outline-none cursor-pointer"
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value as SortType)}
                    >
                        <option value="newest">登録日順（新しい順）</option>
                        <option value="furigana">五十音順</option>
                        <option value="lastVisit">来店日順</option>
                        <option value="visitCount">来店回数順</option>
                    </select>
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
                                        {customer.attributeLabel && ATTRIBUTE_LABELS[customer.attributeLabel as AttributeLabelCode] && (
                                            <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${ATTRIBUTE_LABELS[customer.attributeLabel as AttributeLabelCode].colorClass}`}>
                                                {ATTRIBUTE_LABELS[customer.attributeLabel as AttributeLabelCode].label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-base font-bold text-foreground truncate">{customer.name} 様</div>
                                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                                        <span>登録: {new Date(customer.createdAt).toLocaleDateString("ja-JP")}</span>
                                        {customer.lastVisitDate && (
                                            <span>最終来店: {new Date(customer.lastVisitDate).toLocaleDateString("ja-JP")}</span>
                                        )}
                                        {customer.visitCount > 0 && (
                                            <span className="text-primary font-medium">{customer.visitCount}回来店</span>
                                        )}
                                    </div>
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
