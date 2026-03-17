'use client';

import { useMemo, useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
];

export function CategoryDistributionChart() {
  const { transactions } = useFinance();
  const [view, setView] = useState<'expense' | 'income'>('expense');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'salary': 'Salário',
      'freelance': 'Freelance',
      'investment': 'Investimento',
      'other-income': 'Outros',
      'food': 'Alimentação',
      'transport': 'Transporte',
      'housing': 'Moradia',
      'utilities': 'Contas',
      'entertainment': 'Entretenimento',
      'health': 'Saúde',
      'education': 'Educação',
      'shopping': 'Compras',
      'other-expense': 'Outros',
    };
    return labels[category] || category;
  };

  const categoryData = useMemo(() => {
    const dataMap = new Map<string, number>();

    transactions
      .filter((t) => t.type === view)
      .forEach((t) => {
        const current = dataMap.get(t.category) || 0;
        dataMap.set(t.category, current + t.amount);
      });

    const total = Array.from(dataMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(dataMap.entries())
      .map(([category, value]) => ({
        name: getCategoryLabel(category),
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, view]);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>
            Visualize como suas {view === 'expense' ? 'despesas' : 'receitas'} estão distribuídas
          </CardDescription>
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
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Visualize como suas {view === 'expense' ? 'despesas' : 'receitas'} estão distribuídas
            </CardDescription>
          </div>
          <PieChartIcon className="w-8 h-8 text-primary" />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setView('expense')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'expense'
                ? 'bg-danger text-white'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setView('income')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'income'
                ? 'bg-primary text-white'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Receitas
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }: any) => `${name}: ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Category List */}
        <div className="mt-6 space-y-2">
          {categoryData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(item.value)}</p>
                <p className="text-xs text-muted-foreground">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
