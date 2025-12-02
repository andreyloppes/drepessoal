"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { useMonth } from "@/contexts/MonthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MonthSelector() {
    const { currentMonth, nextMonth, prevMonth } = useMonth();

    return (
        <div className="flex items-center justify-between bg-card rounded-xl p-2 border border-border mb-4 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold capitalize text-lg">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
