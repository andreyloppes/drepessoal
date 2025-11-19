
"use client";

import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Nenhuma transação encontrada.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                                transaction.type === "income"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-destructive/10 text-destructive"
                            )}
                        >
                            {transaction.category === "food" && "🍔"}
                            {transaction.category === "transport" && "🚗"}
                            {transaction.category === "housing" && "🏠"}
                            {transaction.category === "utilities" && "💡"}
                            {transaction.category === "health" && "💊"}
                            {transaction.category === "entertainment" && "🎬"}
                            {transaction.category === "salary" && "💰"}
                            {transaction.category === "freelance" && "💻"}
                            {transaction.category === "investment" && "📈"}
                            {transaction.category === "other" && "📦"}
                        </div>
                        <div>
                            <div>
                                <p className="font-medium">{transaction.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                                    <span>•</span>
                                    <span className="capitalize">{transaction.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                "font-bold",
                                transaction.type === "income" ? "text-emerald-500" : "text-destructive"
                            )}
                        >
                            {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => onEdit(transaction)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(transaction.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
