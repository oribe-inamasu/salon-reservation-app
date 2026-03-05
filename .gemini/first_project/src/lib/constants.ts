export type AttributeLabelCode =
    | "M_10_20" | "M_30_40" | "M_50_60" | "M_70_UP"
    | "F_10_20" | "F_30_40" | "F_50_60" | "F_70_UP"
    | "SPECIAL_1" | "SPECIAL_2";

export type AttributeLabelInfo = {
    label: string;
    colorClass: string;
};

export const ATTRIBUTE_LABELS: Record<AttributeLabelCode, AttributeLabelInfo> = {
    "M_10_20": { label: "10〜20代 男", colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
    "M_30_40": { label: "30〜40代 男", colorClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" },
    "M_50_60": { label: "50〜60代 男", colorClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800" },
    "M_70_UP": { label: "70代以上 男", colorClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800" },
    "F_10_20": { label: "10〜20代 女", colorClass: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800" },
    "F_30_40": { label: "30〜40代 女", colorClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800" },
    "F_50_60": { label: "50〜60代 女", colorClass: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800" },
    "F_70_UP": { label: "70代以上 女", colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800" },
    "SPECIAL_1": { label: "特別枠 1", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
    "SPECIAL_2": { label: "特別枠 2", colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" },
};

export const SERVICE_CATEGORIES = [
    "リラクゼーションマッサージ・指圧",
    "鍼治療",
    "美容鍼",
    "矯正・関節調整",
    "産後骨盤矯正",
    "ヘッドマッサージ",
    "お顔周りの調整",
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
