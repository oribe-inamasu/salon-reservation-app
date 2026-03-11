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
        { href: "/appointments", label: "カレンダー", icon: Calendar },
        { href: "/reports", label: "売上", icon: FileText },
        { href: "/settings", label: "設定", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary-foreground/20 pb-safe bg-primary shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full relative text-xs transition-colors duration-200",
                                isActive
                                    ? "text-white font-bold bg-white/10"
                                    : "text-primary-foreground/60 hover:text-primary-foreground/80"
                            )}
                        >
                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-b-md" />
                            )}
                            <Icon className={cn("w-6 h-6 mb-1", isActive ? "text-white" : "")} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
