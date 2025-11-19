"use client";

import { useEffect, useState } from "react";
import { StorageService } from "@/lib/storage";
import { Transaction } from "@/types";
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, Plus } from "lucide-react";
import { TransactionList } from "@/components/transactions/transaction-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInvoiceDate } from "@/lib/finance-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calculateFinancials = (data: Transaction[]) => {
    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const debitExpenses = data
      .filter((t) => t.type === "expense" && t.paymentMethod === "debit")
      .reduce((acc, t) => acc + t.amount, 0);

    const creditExpenses = data
      .filter((t) => t.type === "expense" && t.paymentMethod === "credit")
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate current open invoice (approximate for now, showing total credit debt)
    // In a real app we would filter by invoice date. 
    // For now let's show "Total Credit Card Bill" as the sum of all unpaid credit transactions.
    // Assuming they are unpaid if they exist in the list (we'd need a "paid" status later).
    setInvoiceAmount(creditExpenses);

    setIncome(totalIncome);
    setExpense(debitExpenses + creditExpenses); // Total expenses tracked
    setBalance(totalIncome - debitExpenses); // Balance only affected by debit
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await StorageService.getData();
      setTransactions(data.transactions);
      calculateFinancials(data.transactions);
    };
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    await StorageService.deleteTransaction(id);
    // Reload data to ensure sync
    const data = await StorageService.getData();
    setTransactions(data.transactions);
    calculateFinancials(data.transactions);
  };

  const handleSave = async () => {
    const data = await StorageService.getData();
    setTransactions(data.transactions);
    calculateFinancials(data.transactions);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <header className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Olá, Andrey 👋</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </header>

      <div className="grid gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/50 to-slate-900/50 border border-blue-800/30 shadow-lg">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <Wallet className="w-5 h-5" />
            <h3 className="text-sm font-medium">Saldo Atual</h3>
          </div>
          <div className="text-4xl font-bold text-white">
            R$ {balance.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <ArrowUpCircle className="w-5 h-5" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Entradas</h3>
            </div>
            <div className="text-xl font-bold text-foreground">
              R$ {income.toFixed(2)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <ArrowDownCircle className="w-5 h-5" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Saídas (Déb)</h3>
            </div>
            <div className="text-xl font-bold text-foreground">
              R$ {(expense - invoiceAmount).toFixed(2)}
            </div>
          </div>

          <div className="col-span-2 p-4 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Fatura Cartão (Aberto)</h3>
            </div>
            <div className="text-xl font-bold text-foreground">
              R$ {invoiceAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
          <Link href="/transactions">
            <Button variant="link" className="text-xs">Ver tudo</Button>
          </Link>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 5)}
          onDelete={handleDelete}
        />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-8 h-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
