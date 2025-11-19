"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, TrendingUp, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/transactions", label: "Transações", icon: CreditCard },
    { href: "/dfc", label: "DFC", icon: TrendingUp },
    { href: "/emergency", label: "Reserva", icon: Shield },
    { href: "/ai", label: "IA", icon: Sparkles },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
