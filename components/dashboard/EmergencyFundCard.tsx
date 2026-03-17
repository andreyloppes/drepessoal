'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, Pencil, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function EmergencyFundCard() {
  const {
    getEmergencyFund,
    monthlyCost,
    emergencyMonths,
    currentSavings,
    setMonthlyCost,
    setEmergencyMonths,
    setCurrentSavings,
    getFinancialSummary
  } = useFinance();

  const emergencyFund = getEmergencyFund();
  const summary = getFinancialSummary();

  const [isEditingCost, setIsEditingCost] = useState(false);
  const [isEditingMonths, setIsEditingMonths] = useState(false);
  const [isEditingSavings, setIsEditingSavings] = useState(false);

  const [costInput, setCostInput] = useState(monthlyCost.toString());
  const [monthsInput, setMonthsInput] = useState(emergencyMonths.toString());
  const [savingsInput, setSavingsInput] = useState(currentSavings.toString());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const progress = emergencyFund.targetAmount > 0
    ? (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100
    : 0;

  const remaining = emergencyFund.targetAmount - emergencyFund.currentAmount;
  const monthlySurplus = summary.monthlyIncome - summary.monthlyExpenses;

  // Cálculo de quanto guardar por mês
  const monthsToReach = remaining > 0 && monthlySurplus > 0
    ? Math.ceil(remaining / monthlySurplus)
    : 0;

  // Recomendação: guardar 10-20% da renda
  const recommendedMonthlySaving = summary.monthlyIncome > 0
    ? summary.monthlyIncome * 0.15 // 15% da renda
    : 0;

  const monthsWithRecommendation = remaining > 0 && recommendedMonthlySaving > 0
    ? Math.ceil(remaining / recommendedMonthlySaving)
    : 0;

  const handleSaveCost = () => {
    setMonthlyCost(parseFloat(costInput) || 4500);
    setIsEditingCost(false);
  };

  const handleSaveMonths = () => {
    setEmergencyMonths(parseInt(monthsInput) || 6);
    setIsEditingMonths(false);
  };

  const handleSaveSavings = () => {
    setCurrentSavings(parseFloat(savingsInput) || 0);
    setIsEditingSavings(false);
  };

  return (
    <div className="space-y-4">
      {/* Card de Custo Mensal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custo de Vida Mensal</CardTitle>
              <CardDescription>
                Quanto você gasta por mês
              </CardDescription>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isEditingCost ? (
            <div className="space-y-3">
              <Input
                type="number"
                step="0.01"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="4500,00"
                label="Custo Mensal"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveCost} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingCost(false);
                    setCostInput(monthlyCost.toString());
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(monthlyCost)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Custo mensal de vida
                </p>
              </div>
              <Button onClick={() => setIsEditingCost(true)} variant="ghost" size="sm">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Meta de Meses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meta de Reserva</CardTitle>
              <CardDescription>
                Quantos meses de cobertura
              </CardDescription>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isEditingMonths ? (
            <div className="space-y-3">
              <Input
                type="number"
                min="1"
                max="24"
                value={monthsInput}
                onChange={(e) => setMonthsInput(e.target.value)}
                placeholder="6"
                label="Meses de Cobertura"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveMonths} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingMonths(false);
                    setMonthsInput(emergencyMonths.toString());
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {emergencyMonths} meses
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Meta: {formatCurrency(emergencyFund.targetAmount)}
                </p>
              </div>
              <Button onClick={() => setIsEditingMonths(true)} variant="ghost" size="sm">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Poupança Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Poupança Atual</CardTitle>
              <CardDescription>
                Quanto você já tem guardado
              </CardDescription>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isEditingSavings ? (
            <div className="space-y-3">
              <Input
                type="number"
                step="0.01"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                placeholder="0,00"
                label="Poupança Atual"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveSavings} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingSavings(false);
                    setSavingsInput(currentSavings.toString());
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(currentSavings)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {emergencyFund.monthsOfCoverage.toFixed(1)} meses de cobertura
                </p>
              </div>
              <Button onClick={() => setIsEditingSavings(true)} variant="ghost" size="sm">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reserva de Emergência</CardTitle>
              <CardDescription>
                Progresso da sua meta
              </CardDescription>
            </div>
            <Shield className={`w-8 h-8 ${emergencyFund.isComplete ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-foreground">
                  {Math.min(progress, 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    emergencyFund.isComplete ? 'bg-primary' : 'bg-primary/70'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Atual</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(emergencyFund.currentAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falta</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(remaining > 0 ? remaining : 0)}
                </p>
              </div>
            </div>

            {!emergencyFund.isComplete && (
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-semibold text-foreground">Recomendação de Poupança</h4>

                <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Guarde {formatCurrency(recommendedMonthlySaving)}/mês
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        15% da sua renda mensal • Atingirá a meta em ~{monthsWithRecommendation} meses
                      </p>
                    </div>
                  </div>
                </div>

                {monthlySurplus > 0 && (
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Seu superávit mensal atual: <span className="font-semibold text-primary">{formatCurrency(monthlySurplus)}</span>
                    </p>
                    {monthlySurplus > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Guardando todo o superávit, você atinge a meta em ~{monthsToReach} meses
                      </p>
                    )}
                  </div>
                )}

                {monthlySurplus <= 0 && (
                  <div className="bg-danger/10 p-4 rounded-lg">
                    <p className="text-sm text-danger font-medium">
                      Atenção: Suas despesas estão maiores ou iguais à sua renda
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revise seus gastos para começar a poupar para emergências
                    </p>
                  </div>
                )}
              </div>
            )}

            {emergencyFund.isComplete && (
              <div className="pt-4 border-t border-border">
                <div className="bg-primary/10 p-4 rounded-lg flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Parabéns! Meta atingida!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Você está protegido por {emergencyFund.monthsOfCoverage.toFixed(1)} meses
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
