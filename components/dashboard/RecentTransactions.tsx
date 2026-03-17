'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight, ArrowDownRight, Trash2, Pencil, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, TransactionType, TransactionCategory } from '@/types';

export function RecentTransactions() {
  const { transactions, removeTransaction, updateTransaction } = useFinance();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: 'other-expense' as TransactionCategory,
    date: '',
    isCreditCard: false,
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      isCreditCard: transaction.isCreditCard || false,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTransaction || !formData.description || !formData.amount) {
      return;
    }

    updateTransaction(editingTransaction.id, {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date),
      isCreditCard: formData.type === 'expense' ? formData.isCreditCard : false,
    });

    setEditingTransaction(null);
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
      category: type === 'income' ? 'salary' : 'other-expense',
      isCreditCard: type === 'income' ? false : formData.isCreditCard,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterCategory !== 'all' || startDate || endDate;

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => new Date(t.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= end);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        compareValue = a.amount - b.amount;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, startDate, endDate, sortBy, sortOrder]);

  const recentTransactions = filteredAndSortedTransactions.slice(0, 20);

  const allCategories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'salary', label: 'Salário' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investimentos' },
    { value: 'other-income', label: 'Outros (Receita)' },
    { value: 'food', label: 'Alimentação' },
    { value: 'transport', label: 'Transporte' },
    { value: 'housing', label: 'Moradia' },
    { value: 'utilities', label: 'Contas' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'health', label: 'Saúde' },
    { value: 'education', label: 'Educação' },
    { value: 'shopping', label: 'Compras' },
    { value: 'other-expense', label: 'Outros (Despesa)' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Transações</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            )}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Tipo"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                options={[
                  { value: 'all', label: 'Todos os Tipos' },
                  { value: 'income', label: 'Receitas' },
                  { value: 'expense', label: 'Despesas' },
                ]}
              />

              <Select
                label="Categoria"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TransactionCategory | 'all')}
                options={allCategories}
              />

              <Input
                label="Data Inicial"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <Input
                label="Data Final"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Select
                label="Ordenar Por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                options={[
                  { value: 'date', label: 'Data' },
                  { value: 'amount', label: 'Valor' },
                ]}
              />

              <Select
                label="Ordem"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Decrescente' },
                  { value: 'asc', label: 'Crescente' },
                ]}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredAndSortedTransactions.length} de {transactions.length} transação(ões)
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação registrada ainda
          </p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-primary/10'
                        : 'bg-danger/10'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-danger" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(transaction.category)} •{' '}
                      {format(new Date(transaction.date), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-primary'
                        : 'text-danger'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
                  >
                    <Pencil className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => removeTransaction(transaction.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-danger/10 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Modal de Edição */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Editar Transação</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
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

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => setEditingTransaction(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" fullWidth>
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
