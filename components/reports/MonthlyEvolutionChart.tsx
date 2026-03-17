'use client';

import { useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

export function MonthlyEvolutionChart() {
  const { transactions } = useFinance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach((t) => {
      const monthKey = format(new Date(t.date), 'MMM/yy', { locale: ptBR });

      if (!dataMap.has(monthKey)) {
        dataMap.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = dataMap.get(monthKey)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expenses += t.amount;
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(dataMap.entries())
      .map(([month, data]) => ({
        month,
        receitas: data.income,
        despesas: data.expenses,
        saldo: data.income - data.expenses,
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split('/');
        const [monthB, yearB] = b.month.split('/');
        const dateA = new Date(`20${yearA}-${monthA}-01`);
        const dateB = new Date(`20${yearB}-${monthB}-01`);
        return dateA.getTime() - dateB.getTime();
      });

    // Get last 12 months
    return sortedData.slice(-12);
  }, [transactions]);

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>Acompanhe a evolução das suas receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum dado disponível ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Receitas vs Despesas (últimos 12 meses)</CardDescription>
          </div>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              style={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              style={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="Receitas"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              name="Despesas"
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Saldo"
              dot={{ fill: 'hsl(var(--chart-3))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
