"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, Settings, FileText } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "顧客", icon: Users },
        { href: "/appointments", label: "予約・カレンダー", icon: Calendar },
        { href: "/reports", label: "売上", icon: FileText },
        { href: "/settings", label: "設定", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t pb-safe dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors duration-200",
                                isActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn("flex flex-col items-center justify-center relative w-full h-full", isActive ? "before:absolute before:top-[-10px] before:w-12 before:h-1 before:bg-primary before:rounded-b-md bg-primary/5" : "")}>
                                <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "")} />
                                <span className={cn("mt-1", isActive ? "text-primary font-bold" : "")}>{link.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
