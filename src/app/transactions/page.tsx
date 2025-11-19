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
    };

    const handleDelete = async (id: string) => {
        await StorageService.deleteTransaction(id);
        const data = await StorageService.getData();
        setTransactions(data.transactions);
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
                    <p className="text-muted-foreground">Gerencie suas entradas e saídas</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="rounded-full h-10 w-10 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="w-6 h-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] w-[95%] rounded-xl">
                        <DialogHeader>
                            <DialogTitle>Nova Transação</DialogTitle>
                        </DialogHeader>
                        <TransactionForm onSave={handleSave} />
                    </DialogContent>
                </Dialog>
            </header>

            <TransactionList transactions={transactions} onDelete={handleDelete} />
        </div>
    );
}
