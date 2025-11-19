"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StorageService } from "@/lib/storage";
import { Category, TransactionType } from "@/types";
import { cn } from "@/lib/utils";

export function TransactionForm({ onSave }: { onSave: () => void }) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<TransactionType>("expense");
    const [category, setCategory] = useState<Category>("food");
    const [paymentMethod, setPaymentMethod] = useState<'debit' | 'credit'>('debit');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        await StorageService.addTransaction({
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
            amount: parseFloat(amount),
            description,
            date: new Date(date).toISOString(),
            type,
            category,
            paymentMethod: type === 'income' ? 'debit' : paymentMethod,
            isRecurring,
            recurrenceDay: isRecurring ? new Date(date).getDate() : undefined
        });

        setAmount("");
        setDescription("");
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-xl border border-border">
            <div className="flex gap-2 mb-4">
                <Button
                    type="button"
                    variant={type === "expense" ? "destructive" : "outline"}
                    className="flex-1"
                    onClick={() => setType("expense")}
                >
                    <Minus className="w-4 h-4 mr-2" />
                    Despesa
                </Button>
                <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className={cn("flex-1", type === "income" && "bg-emerald-600 hover:bg-emerald-700")}
                    onClick={() => setType("income")}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Receita
                </Button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-9 text-lg"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                    id="description"
                    placeholder="Ex: Mercado, Salário..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="food">Alimentação</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                        <SelectItem value="housing">Moradia</SelectItem>
                        <SelectItem value="utilities">Contas</SelectItem>
                        <SelectItem value="health">Saúde</SelectItem>
                        <SelectItem value="entertainment">Lazer</SelectItem>
                        <SelectItem value="salary">Salário</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="investment">Investimento</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {type === "expense" && (
                <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={paymentMethod === "debit" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setPaymentMethod("debit")}
                        >
                            Débito/Pix
                        </Button>
                        <Button
                            type="button"
                            variant={paymentMethod === "credit" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setPaymentMethod("credit")}
                        >
                            Crédito
                        </Button>
                    </div>
                    {paymentMethod === "credit" && (
                        <p className="text-xs text-muted-foreground">
                            Fechamento: dia 04. Fatura vence dia 10 (estimado).
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                    {type === 'income' ? 'Receita Recorrente (Mensal)' : 'Despesa Fixa (Mensal)'}
                </Label>
            </div>

            <Button type="submit" className="w-full mt-4">
                Adicionar
            </Button>
        </form>
    );
}
