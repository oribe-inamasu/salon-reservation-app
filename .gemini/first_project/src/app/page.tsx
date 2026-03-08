import Link from "next/link";
import { Search, Plus, User, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const customers = await prisma.customer.findMany({
    include: {
      visitHistories: {
        orderBy: { visit_date: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass bg-primary text-primary-foreground border-b border-primary-foreground/20">
        <div className="flex h-14 items-center px-4 justify-between shadow-sm">
          <h1 className="text-lg font-bold">顧客一覧</h1>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="名前やフリガナ、電話番号で検索"
              className="w-full pl-10 pr-4 py-2.5 bg-muted border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
        </div>
      </header>

      {/* Main Content (Customer List) */}
      <main className="flex-1 p-3">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">全 {customers.length} 件</span>
          <select className="text-xs bg-transparent text-primary font-medium focus:outline-none">
            <option>五十音順</option>
            <option>来店日順</option>
            <option>来店回数順</option>
          </select>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">まだ顧客データがありません</p>
            <p className="text-xs mt-1">Googleフォームから予診票が送信されると、ここに表示されます</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => {
              const lastVisit = customer.visitHistories[0];
              const visitCount = customer.visitHistories.length;

              return (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center p-3 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>

                  {/* Info */}
                  <div className="ml-4 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5 text-[10px]">
                      <div className="text-muted-foreground truncate">{customer.furigana}</div>
                    </div>
                    <div className="text-base font-bold text-foreground truncate">{customer.name} 様</div>
                    <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>登録: {customer.createdAt.toLocaleDateString("ja-JP")}</span>
                      {lastVisit && <span>最終来店: {lastVisit.visit_date.toLocaleDateString("ja-JP")}</span>}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 ml-2" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
