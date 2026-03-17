'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TransactionType, TransactionCategory } from '@/types';
import { Plus } from 'lucide-react';

export function AddTransactionForm() {
  const { addTransaction } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: 'other-expense' as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
    isCreditCard: false,
    recurring: false,
    recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  });

  const incomeCategories = [
    { value: 'salary', label: 'Salário' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investimentos' },
    { value: 'other-income', label: 'Outros' },
  ];

  const expenseCategories = [
    { value: 'food', label: 'Alimentação' },
    { value: 'transport', label: 'Transporte' },
    { value: 'housing', label: 'Moradia' },
    { value: 'utilities', label: 'Contas' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'health', label: 'Saúde' },
    { value: 'education', label: 'Educação' },
    { value: 'shopping', label: 'Compras' },
    { value: 'other-expense', label: 'Outros' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      return;
    }

    addTransaction({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date),
      isCreditCard: formData.type === 'expense' ? formData.isCreditCard : false,
      recurring: formData.recurring,
      recurringFrequency: formData.recurring ? formData.recurringFrequency : undefined,
    });

    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: 'other-expense',
      date: new Date().toISOString().split('T')[0],
      isCreditCard: false,
      recurring: false,
      recurringFrequency: 'monthly',
    });

    setIsOpen(false);
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
      category: type === 'income' ? 'salary' : 'other-expense',
      isCreditCard: type === 'income' ? false : formData.isCreditCard,
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'primary' : 'secondary'}
                onClick={() => handleTypeChange('income')}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'danger' : 'secondary'}
                onClick={() => handleTypeChange('expense')}
              >
                Despesa
              </Button>
            </div>

            <Input
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Supermercado, Salário..."
              required
            />

            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0,00"
              required
            />

            <Select
              label="Categoria"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as TransactionCategory,
                })
              }
              options={
                formData.type === 'income'
                  ? incomeCategories
                  : expenseCategories
              }
            />

            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />

            {formData.type === 'expense' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCreditCard}
                  onChange={(e) =>
                    setFormData({ ...formData, isCreditCard: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Cartão de Crédito</span>
              </label>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) =>
                    setFormData({ ...formData, recurring: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Transação Recorrente</span>
              </label>

              {formData.recurring && (
                <Select
                  label="Frequência"
                  value={formData.recurringFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurringFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly',
                    })
                  }
                  options={[
                    { value: 'daily', label: 'Diária' },
                    { value: 'weekly', label: 'Semanal' },
                    { value: 'monthly', label: 'Mensal' },
                    { value: 'yearly', label: 'Anual' },
                  ]}
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" fullWidth>
                Adicionar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
