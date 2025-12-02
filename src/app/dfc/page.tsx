"use client";

import { useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";
import { Transaction } from "@/types";
import { useMonth } from "@/contexts/MonthContext";
import { MonthSelector } from "@/components/ui/month-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getDate, endOfMonth, eachDayOfInterval, startOfMonth, isSameDay } from "date-fns";

export default function DFCPage() {
    const { currentMonth } = useMonth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [realBalanceInput, setRealBalanceInput] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [currentMonth]);

    const loadData = async () => {
        const data = await StorageService.getData(currentMonth);
        setTransactions(data.transactions);

        // We show the TOTAL balance until today for adjustment purposes
        const currentBalance = await StorageService.getTotalBalanceUntil(new Date());
        setBalance(currentBalance);

        processChartData(data.transactions);
    };

    const processChartData = (txs: Transaction[]) => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const data = days.map(day => {
            const dayTxs = txs.filter(t => isSameDay(new Date(t.date), day));
            const income = dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            return {
                day: getDate(day),
                income,
                expense,
            };
        });

        setChartData(data);
    };

    const handleAdjustBalance = async () => {
        if (!realBalanceInput) return;
        const realBalance = parseFloat(realBalanceInput);
        const diff = realBalance - balance;

        if (diff === 0) return;

        const type = diff > 0 ? 'income' : 'expense';
        const amount = Math.abs(diff);

        await StorageService.addTransaction({
            id: Math.random().toString(36).substring(2),
            description: "Ajuste de Saldo (Manual)",
            amount,
            type,
            category: 'other',
            date: new Date().toISOString(),
            paymentMethod: 'debit',
            isRecurring: false
        });

        setIsDialogOpen(false);
        setRealBalanceInput("");
        loadData();
    };

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
                <p className="text-muted-foreground">Projeção diária</p>
            </header>

            <MonthSelector />

            <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Saldo Atual (Total)</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Ajustar Saldo</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800">
                            <DialogHeader>
                                <DialogTitle>Ajustar Saldo Real</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quanto você tem realmente?</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={realBalanceInput}
                                        onChange={e => setRealBalanceInput(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Isso criará uma transação de ajuste para igualar o saldo do sistema.
                                    </p>
                                </div>
                                <Button onClick={handleAdjustBalance} className="w-full">Confirmar Ajuste</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">R$ {balance.toFixed(2)}</div>
                </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle>Entradas vs Saídas (Diário)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                cursor={{ fill: '#27272a' }}
                            />
                            <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
