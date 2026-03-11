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

    // Aggregate by category
    const salesByCategory = serviceNames.map(category => {
        const total = visits
            .filter(v => v.treatment_category === category)
            .reduce((sum, v) => sum + (v.price || 0), 0);

        return {
            name: category,
            value: total,
        };
    }).filter(item => item.value > 0);

    // Aggregate by staff
    const salesByStaff = staffNames.map(staff => {
        const staffVisits = visits.filter(v => v.staff === staff);
        const total = staffVisits.reduce((sum, v) => sum + (v.price || 0), 0);

        const categories = serviceNames.map(category => {
            return {
                name: category,
                value: staffVisits.filter(v => v.treatment_category === category).reduce((sum, v) => sum + (v.price || 0), 0)
            };
        }).filter(c => c.value > 0);

        return {
            name: staff,
            value: total,
            categories,
            visits: staffVisits,
        };
    });

    // Handle null staff as "指名なし"
    const noStaffVisits = visits.filter(v => !v.staff);
    const noStaffTotal = noStaffVisits.reduce((sum, v) => sum + (v.price || 0), 0);

    if (noStaffTotal > 0) {
        const categories = serviceNames.map(category => {
            return {
                name: category,
                value: noStaffVisits.filter(v => v.treatment_category === category).reduce((sum, v) => sum + (v.price || 0), 0)
            };
        }).filter(c => c.value > 0);

        const noStaffIndex = salesByStaff.findIndex(item => item.name === "指名なし");
        if (noStaffIndex !== -1) {
            salesByStaff[noStaffIndex].value += noStaffTotal;
            // For simplicity, we assume "指名なし" is not in STAFF_MEMBERS list.
            // If it is, merging arrays would be needed, but it's typically an edge case.
            salesByStaff[noStaffIndex].categories = categories;
            salesByStaff[noStaffIndex].visits = [...salesByStaff[noStaffIndex].visits, ...noStaffVisits];
        } else {
            salesByStaff.push({ name: "指名なし", value: noStaffTotal, categories, visits: noStaffVisits });
        }
    }

    const filteredSalesByStaff = salesByStaff.filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    // If no real data has price yet, we might want to handle it or show 0
    const totalSales = salesByCategory.reduce((sum, item) => sum + item.value, 0);

    return (
        <ReportsClient
            salesData={salesByCategory}
            salesByStaff={filteredSalesByStaff}
            totalSales={totalSales}
            currentMonthLabel={currentMonthLabel}
            currentMonthValue={currentMonthValue}
            serviceColorMap={serviceColorMap}
            staffColorMap={staffColorMap}
        />
    );
}
