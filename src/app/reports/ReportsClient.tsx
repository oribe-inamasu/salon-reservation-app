"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";



import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type SalesDataPoint = {
    name: string;
    value: number;
    categories?: { name: string; value: number }[];
    visits?: Array<{
        id: string;
        visit_date: Date;
        treatment_category: string | null;
        price: number | null;
        customer: {
            name: string;
        };
        payment_method?: string | null;
    }>;
};

export default function ReportsClient({
    salesData,
    salesByStaff,
    totalSales,
    currentMonthLabel,
    currentMonthValue,
    serviceColorMap,
    salesByPaymentMethod,
}: {
    salesData: SalesDataPoint[];
    salesByStaff: SalesDataPoint[];
    totalSales: number;
    currentMonthLabel: string;
    currentMonthValue: string;
    serviceColorMap: Record<string, string>;
    salesByPaymentMethod: SalesDataPoint[];
}) {
    const router = useRouter();
    const [expandedStaffName, setExpandedStaffName] = useState<string | null>(null);
    const [reportType, setReportType] = useState<"category" | "payment">("category");

    const paymentColorMap: Record<string, string> = {
        "現金": "#10b981", // emerald-500
        "カード": "#3b82f6", // blue-500
        "電子マネー": "#f59e0b", // amber-500
        "その他": "#8b5cf6", // violet-500
    };

    const handleMonthChange = (offset: number) => {
        const [yearStr, monthStr] = currentMonthValue.split('-');
        let year = Number(yearStr);
        let month = Number(monthStr);

        month += offset;
        if (month > 12) {
            month = 1;
            year++;
        } else if (month < 1) {
            month = 12;
            year--;
        }

        const newMonth = `${year}-${String(month).padStart(2, '0')}`;
        router.push(`/reports?month=${newMonth}`);
    };

    const getCategoryColor = (categoryName: string) => {
        if (reportType === "payment") {
            return paymentColorMap[categoryName] || "#cbd5e1";
        }
        return serviceColorMap[categoryName] || "#cbd5e1"; // Fallback color
    };

    const currentChartData = reportType === "category" ? salesData : salesByPaymentMethod;
    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex items-center h-14 px-4 justify-center">
                    <h1 className="text-lg font-bold">売上レポート</h1>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between bg-card border rounded-2xl p-4 shadow-sm">
                    <button
                        onClick={() => handleMonthChange(-1)}
                        className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {currentMonthLabel}
                    </div>
                    <button
                        onClick={() => handleMonthChange(1)}
                        className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Total Sales Summary */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm text-center">
                    <h2 className="text-sm font-medium text-muted-foreground mb-1">総売上</h2>
                    <div className="text-3xl flex justify-center items-center font-bold text-foreground">
                        ¥{totalSales.toLocaleString()}
                    </div>
                </div>

                {/* Report Type Toggle */}
                <div className="flex p-1 bg-stone-200/50 rounded-2xl">
                    <button
                        onClick={() => setReportType("category")}
                        className={cn(
                            "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                            reportType === "category" 
                                ? "bg-white text-primary shadow-sm" 
                                : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        カテゴリ別
                    </button>
                    <button
                        onClick={() => setReportType("payment")}
                        className={cn(
                            "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                            reportType === "payment" 
                                ? "bg-white text-primary shadow-sm" 
                                : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        支払い方法別
                    </button>
                </div>

                {/* Chart Section */}
                <div className="bg-card border rounded-2xl p-4 shadow-sm text-stone-900 dark:text-stone-100">
                    <h3 className="font-bold border-b pb-2 mb-4 text-foreground">
                        {reportType === "category" ? "カテゴリ別" : "支払い方法別"} 売上内訳
                    </h3>
                    <div className="h-64 w-full">
                        {salesData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                データがありません
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={currentChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {currentChartData.map((entry: SalesDataPoint, index: number) => (
                                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={(value: any) => `¥${Number(value).toLocaleString()}`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
 
                    {/* Legend List */}
                    <div className="space-y-3 mt-4">
                        {currentChartData.map((item: SalesDataPoint) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: getCategoryColor(item.name) }}
                                    />
                                    <span className="text-muted-foreground truncate">{item.name}</span>
                                </div>
                                <div className="font-bold flex-shrink-0">
                                    ¥{item.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Sales Section */}
                <div className="bg-card border rounded-2xl p-4 shadow-sm">
                    <h3 className="font-bold border-b pb-2 mb-4 text-foreground flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        担当スタッフ別 売上
                    </h3>

                    {salesByStaff.length === 0 ? (
                        <div className="py-8 flex text-center items-center justify-center text-muted-foreground text-sm">
                            <p>データがありません</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {salesByStaff.map((staff) => {
                                const isExpanded = expandedStaffName === staff.name;

                                return (
                                    <div key={staff.name} className="bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200">
                                        <div
                                            className="space-y-1 cursor-pointer hover:bg-stone-50 p-3 transition-colors"
                                            onClick={() => setExpandedStaffName(isExpanded ? null : staff.name)}
                                        >
                                            <div className="flex justify-between items-end text-sm">
                                                <span className="font-medium text-stone-700 flex items-center gap-1">
                                                    {staff.name}
                                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                                                </span>
                                                <span className="font-bold text-primary">¥{staff.value.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full flex overflow-hidden"
                                                    style={{ width: `${Math.max(2, (staff.value / totalSales) * 100)}%` }}
                                                >
                                                    {(() => {
                                                        if (reportType === "payment" && staff.visits) {
                                                            const paymentBreakdown = Object.entries(
                                                                staff.visits.reduce((acc, visit) => {
                                                                    const method = visit.payment_method || "現金";
                                                                    acc[method] = (acc[method] || 0) + (visit.price || 0);
                                                                    return acc;
                                                                }, {} as Record<string, number>)
                                                            ).map(([name, value]) => ({ name, value }));

                                                            return paymentBreakdown.map((pm) => (
                                                                <div
                                                                    key={pm.name}
                                                                    className="h-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${(pm.value / staff.value) * 100}%`,
                                                                        backgroundColor: getCategoryColor(pm.name)
                                                                    }}
                                                                    title={`${pm.name}: ¥${pm.value.toLocaleString()}`}
                                                                />
                                                            ));
                                                        }

                                                        return staff.categories?.map((cat: { name: string; value: number }) => (
                                                            <div
                                                                key={cat.name}
                                                                className="h-full transition-all duration-500"
                                                                style={{
                                                                    width: `${(cat.value / staff.value) * 100}%`,
                                                                    backgroundColor: getCategoryColor(cat.name)
                                                                }}
                                                                title={`${cat.name}: ¥${cat.value.toLocaleString()}`}
                                                            />
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground text-right">
                                                {((staff.value / totalSales) * 100).toFixed(1)}%
                                            </div>
                                        </div>

                                        {/* Accordion Content */}
                                        {isExpanded && (
                                            <div className="p-3 bg-stone-50 border-t animate-in slide-in-from-top-2 duration-200">
                                                {(!staff.visits || staff.visits.length === 0) ? (
                                                    <div className="py-6 text-center text-stone-400 text-sm">
                                                        施術履歴がありません
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {staff.visits.map((visit) => (
                                                            <div key={visit.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="font-bold text-stone-700 text-sm">
                                                                        {visit.customer.name}
                                                                    </div>
                                                                    <div className="text-sm font-bold text-primary">
                                                                        ¥{(visit.price || 0).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs text-stone-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <CalendarIcon className="w-3 h-3" />
                                                                        {format(new Date(visit.visit_date), "MM/dd HH:mm")}
                                                                    </span>
                                                                    <span
                                                                        className="px-2 py-0.5 rounded-full font-bold"
                                                                        style={{
                                                                            backgroundColor: `${getCategoryColor(visit.treatment_category || "")}1A`,
                                                                            color: getCategoryColor(visit.treatment_category || "")
                                                                        }}
                                                                    >
                                                                        {visit.treatment_category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
