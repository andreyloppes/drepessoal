"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { StorageService } from "@/lib/storage";
import { Transaction } from "@/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

    useEffect(() => {
        const loadData = async () => {
            const data = await StorageService.getData();
            setTransactions(data.transactions);
        };
        loadData();
    }, []);

    const handleSave = async () => {
        const data = await StorageService.getData();
        setTransactions(data.transactions);
        setIsOpen(false);
        setEditingTransaction(undefined);
    };

    const handleDelete = async (id: string) => {
        await StorageService.deleteTransaction(id);
        const data = await StorageService.getData();
        setTransactions(data.transactions);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsOpen(true);
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
                    <p className="text-muted-foreground">Histórico completo</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingTransaction(undefined);
                }}>
                    <DialogTrigger asChild>
                        <Button>Nova Transação</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] w-[95%] rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
                        <DialogHeader>
                            <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                        </DialogHeader>
                        <TransactionForm onSave={handleSave} initialData={editingTransaction} />
                    </DialogContent>
                </Dialog>
            </header>

            <TransactionList transactions={transactions} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
    );
}
