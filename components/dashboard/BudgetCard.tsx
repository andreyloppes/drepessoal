'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PiggyBank, AlertTriangle, TrendingUp, Pencil } from 'lucide-react';

export function BudgetCard() {
  const { getCategorySpending, setBudget } = useFinance();
  const categorySpending = getCategorySpending();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
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

  const handleEdit = (category: string, currentBudget: number) => {
    setEditingCategory(category);
    setBudgetInput(currentBudget > 0 ? currentBudget.toString() : '');
  };

  const handleSave = (category: string) => {
    const value = parseFloat(budgetInput) || 0;
    setBudget(category, value);
    setEditingCategory(null);
    setBudgetInput('');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setBudgetInput('');
  };

  const getProgressColor = (spending: typeof categorySpending[0]) => {
    if (spending.budget === 0) return 'bg-muted-foreground';
    if (spending.isOverBudget) return 'bg-danger';
    if (spending.isNearLimit) return 'bg-warning';
    return 'bg-primary';
  };

  const getProgressTextColor = (spending: typeof categorySpending[0]) => {
    if (spending.budget === 0) return 'text-muted-foreground';
    if (spending.isOverBudget) return 'text-danger';
    if (spending.isNearLimit) return 'text-warning';
    return 'text-primary';
  };

  // Separate categories with and without budgets
  const categoriesWithBudget = categorySpending.filter(c => c.budget > 0);
  const categoriesWithoutBudget = categorySpending.filter(c => c.budget === 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orçamento por Categoria</CardTitle>
            <CardDescription>
              Defina limites mensais para cada categoria de despesa
            </CardDescription>
          </div>
          <PiggyBank className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Categories with budgets */}
          {categoriesWithBudget.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Orçamentos Configurados
              </h3>
              {categoriesWithBudget.map((spending) => (
                <div key={spending.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {getCategoryLabel(spending.category)}
                        </span>
                        {editingCategory === spending.category ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={budgetInput}
                              onChange={(e) => setBudgetInput(e.target.value)}
                              placeholder="0,00"
                              className="w-32 h-8 text-sm"
                            />
                            <Button onClick={() => handleSave(spending.category)} size="sm">
                              Salvar
                            </Button>
                            <Button onClick={handleCancel} variant="ghost" size="sm">
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${getProgressTextColor(spending)}`}>
                              {formatCurrency(spending.spent)} / {formatCurrency(spending.budget)}
                            </span>
                            <Button
                              onClick={() => handleEdit(spending.category, spending.budget)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingCategory !== spending.category && (
                        <>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(spending)}`}
                              style={{ width: `${Math.min(spending.percentage, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {spending.percentage.toFixed(1)}% usado
                            </span>

                            {spending.isOverBudget && (
                              <span className="text-xs text-danger font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {formatCurrency(spending.spent - spending.budget)} acima do limite
                              </span>
                            )}

                            {spending.isNearLimit && !spending.isOverBudget && (
                              <span className="text-xs text-warning font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Próximo do limite
                              </span>
                            )}

                            {!spending.isOverBudget && !spending.isNearLimit && spending.budget > 0 && (
                              <span className="text-xs text-primary font-medium">
                                {formatCurrency(spending.budget - spending.spent)} disponível
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categories without budgets */}
          {categoriesWithoutBudget.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Sem Orçamento Definido
              </h3>
              {categoriesWithoutBudget.map((spending) => (
                <div key={spending.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {getCategoryLabel(spending.category)}
                      </span>
                      {editingCategory === spending.category ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="0,00"
                            className="w-32 h-8 text-sm"
                          />
                          <Button onClick={() => handleSave(spending.category)} size="sm">
                            Salvar
                          </Button>
                          <Button onClick={handleCancel} variant="ghost" size="sm">
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {spending.spent > 0 && (
                            <span className="text-sm text-muted-foreground">
                              Gasto: {formatCurrency(spending.spent)}
                            </span>
                          )}
                          <Button
                            onClick={() => handleEdit(spending.category, 0)}
                            variant="secondary"
                            size="sm"
                          >
                            Definir Orçamento
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {categoriesWithBudget.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Orçado</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(categoriesWithBudget.reduce((sum, c) => sum + c.budget, 0))}
                  </p>
                </div>
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Gasto</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0))}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  categoriesWithBudget.some(c => c.isOverBudget)
                    ? 'bg-danger/10'
                    : categoriesWithBudget.some(c => c.isNearLimit)
                    ? 'bg-warning/10'
                    : 'bg-primary/10'
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">Disponível</p>
                  <p className={`text-lg font-bold ${
                    categoriesWithBudget.some(c => c.isOverBudget)
                      ? 'text-danger'
                      : categoriesWithBudget.some(c => c.isNearLimit)
                      ? 'text-warning'
                      : 'text-primary'
                  }`}>
                    {formatCurrency(
                      categoriesWithBudget.reduce((sum, c) => sum + c.budget, 0) -
                      categoriesWithBudget.reduce((sum, c) => sum + c.spent, 0)
                    )}
                  </p>
                </div>
              </div>

              {categoriesWithBudget.some(c => c.isOverBudget || c.isNearLimit) && (
                <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Atenção aos seus gastos!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoriesWithBudget.filter(c => c.isOverBudget).length > 0 && (
                          <span className="text-danger font-medium">
                            {categoriesWithBudget.filter(c => c.isOverBudget).length} categoria(s)
                            {categoriesWithBudget.filter(c => c.isOverBudget).length === 1 ? ' está' : ' estão'} acima do orçamento.
                          </span>
                        )}
                        {categoriesWithBudget.filter(c => c.isOverBudget).length > 0 &&
                         categoriesWithBudget.filter(c => c.isNearLimit).length > 0 && ' '}
                        {categoriesWithBudget.filter(c => c.isNearLimit).length > 0 && (
                          <span className="text-warning font-medium">
                            {categoriesWithBudget.filter(c => c.isNearLimit).length} categoria(s)
                            {categoriesWithBudget.filter(c => c.isNearLimit).length === 1 ? ' está' : ' estão'} próxima do limite (80-100%).
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
