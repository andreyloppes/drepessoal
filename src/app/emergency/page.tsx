"use client";

import { useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";
import { EmergencyFund } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Target, TrendingUp } from "lucide-react";

export default function EmergencyPage() {
    const [fund, setFund] = useState<EmergencyFund>({
        currentAmount: 0,
        goalAmount: 10000,
        monthlyContribution: 0,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [addAmount, setAddAmount] = useState("");

    useEffect(() => {
        const loadData = async () => {
            const data = await StorageService.getData();
            setFund(data.emergencyFund);
        };
        loadData();
    }, []);

    const handleUpdateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        await StorageService.updateEmergencyFund(fund);
        setIsEditing(false);
    };

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount) return;
        const val = parseFloat(addAmount);
        const newAmount = fund.currentAmount + val;
        await StorageService.updateEmergencyFund({ currentAmount: newAmount });
        setFund({ ...fund, currentAmount: newAmount });
        setAddAmount("");

        // Optionally add a transaction record for this? 
        // For now, keeping it simple as a separate bucket.
    };

    const progress = Math.min((fund.currentAmount / fund.goalAmount) * 100, 100);

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Reserva de Emergência</h1>
                <p className="text-muted-foreground">Prepare-se para o inesperado</p>
            </header>

            <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-6 h-6" />
                        <h2 className="font-semibold">Progresso Atual</h2>
                    </div>
                    <span className="text-2xl font-bold">
                        {progress.toFixed(1)}%
                    </span>
                </div>

                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Atual</p>
                        <p className="text-xl font-bold text-emerald-500">R$ {fund.currentAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Meta</p>
                        <p className="text-xl font-bold">R$ {fund.goalAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Adicionar Valor
                </h3>
                <form onSubmit={handleAddMoney} className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Valor (R$)"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">Adicionar</Button>
                </form>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Configurar Meta
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Cancelar" : "Editar"}
                    </Button>
                </div>

                {isEditing && (
                    <form onSubmit={handleUpdateGoal} className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                            <Label>Valor da Meta</Label>
                            <Input
                                type="number"
                                value={fund.goalAmount}
                                onChange={(e) => setFund({ ...fund, goalAmount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">Salvar Meta</Button>
                    </form>
                )}
            </div>
        </div>
    );
}
