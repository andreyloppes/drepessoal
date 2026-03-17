'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Target, Plus, X } from 'lucide-react';
import { Goal } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GoalsCard() {
  const { goals, addGoal, removeGoal } = useFinance();
  
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    priority: 'medium' as Goal['priority'],
    category: 'other' as Goal['category'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      return;
    }

    addGoal({
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: new Date(formData.deadline),
      priority: formData.priority,
      category: formData.category,
    });

    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      priority: 'medium',
      category: 'other',
    });

    setShowForm(false);
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-danger';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Metas Financeiras</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-secondary/30 rounded-lg space-y-3">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Viagem, Carro novo..."
              required
            />

            <Input
              label="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da meta"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor Meta"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="0,00"
                required
              />

              <Input
                label="Valor Atual"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <Input
              label="Data Limite"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Prioridade"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Goal['priority'] })}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                ]}
              />

              <Select
                label="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                options={[
                  { value: 'emergency', label: 'Emergência' },
                  { value: 'investment', label: 'Investimento' },
                  { value: 'purchase', label: 'Compra' },
                  { value: 'debt', label: 'Dívida' },
                  { value: 'other', label: 'Outro' },
                ]}
              />
            </div>

            <Button type="submit" fullWidth size="sm">
              Adicionar Meta
            </Button>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma meta definida ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = goal.targetAmount > 0
                ? (goal.currentAmount / goal.targetAmount) * 100
                : 0;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="p-1 hover:bg-danger/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-danger" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-foreground">
                        {Math.min(progress, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className={`font-medium ${getPriorityColor(goal.priority)}`}>
                        {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
