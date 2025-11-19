"use client";

import { useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";
import { Transaction } from "@/types";
import { Calendar } from "lucide-react";

export default function DFCPage() {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const data = await StorageService.getData();
            const totalIncome = data.transactions
                .filter((t) => t.type === "income")
                .reduce((acc, t) => acc + t.amount, 0);

            const totalDebit = data.transactions
                .filter((t) => t.type === "expense" && t.paymentMethod === "debit")
                .reduce((acc, t) => acc + t.amount, 0);

            setBalance(totalIncome - totalDebit);
        };
        loadData();
    }, []);

    // Mock projection for now since we don't have recurring transactions engine yet
    const projectionDays = [1, 2, 3, 4, 5];

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">DFC</h1>
                <p className="text-muted-foreground">Fluxo de Caixa Diário</p>
            </header>

            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Saldo Disponível Hoje</h3>
                <div className="mt-2 text-3xl font-bold text-primary">R$ {balance.toFixed(2)}</div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Projeção (Próximos 5 dias)
                </h2>
                <div className="space-y-2">
                    {projectionDays.map((day) => (
                        <div key={day} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                    +{day}d
                                </div>
                                <span className="text-sm text-muted-foreground">Saldo projetado</span>
                            </div>
                            <span className="font-medium">R$ {balance.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center pt-4">
                    * Adicione transações recorrentes para ver a projeção futura (Em breve).
                </p>
            </div>
        </div>
    );
}
