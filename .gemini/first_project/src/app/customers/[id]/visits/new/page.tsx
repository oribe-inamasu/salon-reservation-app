"use client";

import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";

export default function NewVisit({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col min-h-screen pb-safe bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full glass bg-primary text-primary-foreground border-b border-primary-foreground/20">
                <div className="flex items-center h-14 px-4">
                    <Link href={`/customers/${params.id}`} className="p-2 -ml-2 text-primary-foreground hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1 text-center font-bold text-lg">
                        カルテ記録の追加
                    </div>
                    <button className="p-2 -mr-2 text-primary-foreground font-bold shadow-sm hover:bg-white/10 rounded-full active:scale-95 transition-all flex items-center gap-1">
                        <Save className="w-5 h-5" /> 保存
                    </button>
                </div>
            </header>

            {/* Main Form */}
            <main className="flex-1 p-4 space-y-6">
                <form className="space-y-6 max-w-lg mx-auto">
                    {/* Visit Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">来店日時 (必須)</label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 bg-card border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            defaultValue={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    {/* Treatment Content */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">施術カテゴリ</label>
                            <select className="w-full p-3 bg-card border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow">
                                <option value="">選択してください</option>
                                <option value="リラクゼーションマッサージ・指圧">リラクゼーションマッサージ・指圧</option>
                                <option value="鍼治療">鍼治療</option>
                                <option value="美容鍼">美容鍼</option>
                                <option value="矯正・関節調整">矯正・関節調整</option>
                                <option value="産後骨盤矯正">産後骨盤矯正</option>
                                <option value="ヘッドマッサージ">ヘッドマッサージ</option>
                                <option value="お顔周りの調整">お顔周りの調整</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">施術内容の詳細 (任意)</label>
                            <input
                                type="text"
                                placeholder="例: 全身調整＋ヘッド 60分など"
                                className="w-full p-3 bg-card border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">料金 (円)</label>
                        <input
                            type="number"
                            placeholder="例: 6500"
                            className="w-full p-3 bg-card border rounded-xl shadow-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>

                    {/* Staff Memo */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-amber-600 dark:text-amber-500">スタッフ用メモ (お客様には非公開)</label>
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-1 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                            <textarea
                                rows={5}
                                placeholder="痛みの変化や次回への引き継ぎ事項などを記録"
                                className="w-full p-3 bg-transparent border-none focus:outline-none text-sm leading-relaxed resize-none"
                            />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
