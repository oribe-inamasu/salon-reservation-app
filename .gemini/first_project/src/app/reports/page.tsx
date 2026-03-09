"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SERVICE_CATEGORIES } from "@/lib/constants";

// Mock data for sales report
const mockSalesData = [
    { name: "リラクゼーションマッサージ・指圧", value: 45000 },
    { name: "鍼治療", value: 32000 },
    { name: "美容鍼", value: 28000 },
    { name: "矯正・関節調整", value: 15000 },
    { name: "産後骨盤矯正", value: 12000 },
    { name: "ヘッドマッサージ", value: 8000 },
    { name: "お顔周りの調整", value: 5000 },
];

const COLORS = [
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#ef4444", // Red
];

export default function Reports() {
    const totalSales = mockSalesData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground border-b border-primary-foreground/20 shadow-md">
                <div className="flex items-center h-14 px-4 justify-center">
                    <h1 className="text-lg font-bold">売上レポート (カテゴリ別)</h1>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4">
                {/* Total Sales Summary */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm text-center">
                    <h2 className="text-sm font-medium text-muted-foreground mb-1">今月の総売上</h2>
                    <div className="text-3xl font-bold text-foreground">
                        ¥{totalSales.toLocaleString()}
                    </div>
                    <div className="text-xs text-primary font-medium mt-2 bg-primary/10 inline-block px-2 py-1 rounded-full">
                        前月比 +15%
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-card border rounded-2xl p-4 shadow-sm">
                    <h3 className="font-bold border-b pb-2 mb-4 text-foreground">カテゴリ別 売上内訳</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockSalesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {mockSalesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => `¥${(value || 0).toLocaleString()}`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend List */}
                    <div className="space-y-3 mt-4">
                        {mockSalesData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
            </main>
        </div>
    );
}
