'use client';

import { useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MonthComparisonCard() {
  const { transactions } = useFinance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const comparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = subMonths(now, 1);
    const lastMonthNumber = lastMonth.getMonth();
    const lastMonthYear = lastMonth.getFullYear();

    // Current month
    const currentIncome = transactions
      .filter(
        (t) =>
          t.type === 'income' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month
    const lastIncome = transactions
      .filter(
        (t) =>
          t.type === 'income' &&
          new Date(t.date).getMonth() === lastMonthNumber &&
          new Date(t.date).getFullYear() === lastMonthYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const lastExpenses = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date).getMonth() === lastMonthNumber &&
          new Date(t.date).getFullYear() === lastMonthYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = currentIncome - currentExpenses;
    const lastBalance = lastIncome - lastExpenses;

    const calculateChange = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    return {
      currentMonth: {
        name: format(now, 'MMMM yyyy', { locale: ptBR }),
        income: currentIncome,
        expenses: currentExpenses,
        balance: currentBalance,
      },
      lastMonth: {
        name: format(lastMonth, 'MMMM yyyy', { locale: ptBR }),
        income: lastIncome,
        expenses: lastExpenses,
        balance: lastBalance,
      },
      changes: {
        income: {
          value: currentIncome - lastIncome,
          percentage: calculateChange(currentIncome, lastIncome),
        },
        expenses: {
          value: currentExpenses - lastExpenses,
          percentage: calculateChange(currentExpenses, lastExpenses),
        },
        balance: {
          value: currentBalance - lastBalance,
          percentage: calculateChange(currentBalance, lastBalance),
        },
      },
    };
  }, [transactions]);

  const ChangeIndicator = ({ value, percentage, type }: { value: number; percentage: number; type: 'income' | 'expense' | 'balance' }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    // For expenses, increase is bad (red), decrease is good (green)
    // For income and balance, increase is good (green), decrease is bad (red)
    const isGood = type === 'expense' ? !isPositive : isPositive;

    if (isNeutral) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">Sem alteração</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${isGood ? 'text-primary' : 'text-danger'}`}>
        {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span className="text-sm font-semibold">
          {Math.abs(percentage).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">
          ({isPositive ? '+' : ''}{formatCurrency(value)})
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Comparação Mensal</CardTitle>
            <CardDescription>
              Compare {comparison.currentMonth.name} com {comparison.lastMonth.name}
            </CardDescription>
          </div>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Receitas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Receitas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{comparison.currentMonth.name}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(comparison.currentMonth.income)}</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{comparison.lastMonth.name}</p>
              <p className="text-xl font-bold text-muted-foreground">{formatCurrency(comparison.lastMonth.income)}</p>
            </div>
          </div>
          <ChangeIndicator
            value={comparison.changes.income.value}
            percentage={comparison.changes.income.percentage}
            type="income"
          />
        </div>

        {/* Despesas */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Despesas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{comparison.currentMonth.name}</p>
              <p className="text-xl font-bold text-danger">{formatCurrency(comparison.currentMonth.expenses)}</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{comparison.lastMonth.name}</p>
              <p className="text-xl font-bold text-muted-foreground">{formatCurrency(comparison.lastMonth.expenses)}</p>
            </div>
          </div>
          <ChangeIndicator
            value={comparison.changes.expenses.value}
            percentage={comparison.changes.expenses.percentage}
            type="expense"
          />
        </div>

        {/* Saldo */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">Saldo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${comparison.currentMonth.balance >= 0 ? 'bg-primary/10' : 'bg-danger/10'}`}>
              <p className="text-xs text-muted-foreground mb-1">{comparison.currentMonth.name}</p>
              <p className={`text-xl font-bold ${comparison.currentMonth.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatCurrency(comparison.currentMonth.balance)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${comparison.lastMonth.balance >= 0 ? 'bg-secondary/30' : 'bg-danger/10'}`}>
              <p className="text-xs text-muted-foreground mb-1">{comparison.lastMonth.name}</p>
              <p className={`text-xl font-bold ${comparison.lastMonth.balance >= 0 ? 'text-muted-foreground' : 'text-danger'}`}>
                {formatCurrency(comparison.lastMonth.balance)}
              </p>
            </div>
          </div>
          <ChangeIndicator
            value={comparison.changes.balance.value}
            percentage={comparison.changes.balance.percentage}
            type="balance"
          />
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Análise</h3>
          <div className="space-y-2">
            {comparison.changes.income.percentage > 10 && (
              <div className="p-3 bg-primary/10 rounded-lg text-sm text-foreground">
                ✨ Ótimo! Suas receitas aumentaram {comparison.changes.income.percentage.toFixed(1)}% este mês.
              </div>
            )}
            {comparison.changes.expenses.percentage < -10 && (
              <div className="p-3 bg-primary/10 rounded-lg text-sm text-foreground">
                💰 Excelente! Você reduziu suas despesas em {Math.abs(comparison.changes.expenses.percentage).toFixed(1)}%.
              </div>
            )}
            {comparison.changes.expenses.percentage > 20 && (
              <div className="p-3 bg-warning/10 rounded-lg text-sm text-foreground">
                ⚠️ Atenção: Suas despesas aumentaram {comparison.changes.expenses.percentage.toFixed(1)}% este mês.
              </div>
            )}
            {comparison.currentMonth.balance < 0 && comparison.lastMonth.balance >= 0 && (
              <div className="p-3 bg-danger/10 rounded-lg text-sm text-foreground">
                🚨 Alerta: Você entrou no negativo este mês. Revise seus gastos!
              </div>
            )}
            {comparison.currentMonth.balance > comparison.lastMonth.balance && comparison.currentMonth.balance > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg text-sm text-foreground">
                🎯 Parabéns! Seu saldo melhorou {formatCurrency(comparison.changes.balance.value)} este mês.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
