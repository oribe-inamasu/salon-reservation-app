import prisma from "@/lib/prisma";
import ReportsClient from "./ReportsClient";
import { getAppSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
    searchParams
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const params = await searchParams;
    const appSettings = await getAppSettings();
    const { serviceNames, staffNames, serviceColorMap, staffColorMap } = appSettings;

    // Parse the requested month, or use current month
    let targetDate = new Date();
    // Use Japanese timezone (JST) as base for current month if strictly necessary, 
    // but the system default date with 1st day is usually enough for JST offset.
    if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
        const [year, month] = params.month.split('-');
        targetDate = new Date(Number(year), Number(month) - 1, 1);
    }

    // Calculate boundaries for the query
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

    // Formatted current month string for the UI
    const formatter = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" });
    const currentMonthLabel = formatter.format(startOfMonth); // e.g., "2026年3月"
    const currentMonthValue = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;

    const visits = await prisma.visitHistory.findMany({
        where: {
            visit_date: {
                gte: startOfMonth,
                lt: endOfMonth, // End of month boundary
            },
        },
        include: {
            customer: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            visit_date: "desc",
        }
    });

    const totalSales = visits.reduce((sum, v) => sum + (v.price || 0), 0);

    // Aggregate by category
    const categoryMap = new Map<string, number>();
    visits.forEach(v => {
        const category = (v.treatment_category && serviceNames.includes(v.treatment_category)) 
            ? v.treatment_category 
            : "その他";
        categoryMap.set(category, (categoryMap.get(category) || 0) + (v.price || 0));
    });

    const salesByCategory = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    // Aggregate by staff
    const staffMap = new Map<string, { 
        value: number; 
        categories: Map<string, number>; 
        visits: typeof visits 
    }>();

    visits.forEach(v => {
        const staff = (v.staff && staffNames.includes(v.staff)) ? v.staff : "指名なし";
        const category = (v.treatment_category && serviceNames.includes(v.treatment_category)) 
            ? v.treatment_category 
            : "その他";

        if (!staffMap.has(staff)) {
            staffMap.set(staff, { value: 0, categories: new Map(), visits: [] });
        }

        const staffData = staffMap.get(staff)!;
        staffData.value += (v.price || 0);
        staffData.visits.push(v);
        staffData.categories.set(category, (staffData.categories.get(category) || 0) + (v.price || 0));
    });

    const filteredSalesByStaff = Array.from(staffMap.entries())
        .map(([name, data]) => ({
            name,
            value: data.value,
            visits: data.visits,
            categories: Array.from(data.categories.entries()).map(([cName, cValue]) => ({
                name: cName,
                value: cValue
            }))
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const paymentMethods = ["現金", "カード", "電子マネー", "その他"];
    const salesByPaymentMethod = paymentMethods.map(method => {
        const total = visits
            .filter(v => {
                const vm = v.payment_method;
                if (method === "その他") {
                    return !vm || !paymentMethods.includes(vm) || vm === "その他";
                }
                return vm === method;
            })
            .reduce((sum, v) => sum + (v.price || 0), 0);
        return {
            name: method,
            value: total,
        };
    }).filter(item => item.value > 0);

    return (
        <ReportsClient
            salesData={salesByCategory}
            salesByPaymentMethod={salesByPaymentMethod}
            salesByStaff={filteredSalesByStaff}
            totalSales={totalSales}
            currentMonthLabel={currentMonthLabel}
            currentMonthValue={currentMonthValue}
            serviceColorMap={serviceColorMap}
        />
    );
}
