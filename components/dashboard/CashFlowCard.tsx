'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Calendar, AlertTriangle, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CashFlowCard() {
  const { initialBalance, setInitialBalance, creditCardDueDay, setCreditCardDueDay, getDailyCashFlow } = useFinance();
  const [balanceInput, setBalanceInput] = useState(initialBalance.toString());
  const [dueDayInput, setDueDayInput] = useState(creditCardDueDay.toString());
  const [daysToShow, setDaysToShow] = useState(30);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [isEditingDueDay, setIsEditingDueDay] = useState(false);

  const dailyFlows = getDailyCashFlow(daysToShow);
  const negativeBalanceDays = dailyFlows.filter((day) => day.isNegative);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSaveBalance = () => {
    setInitialBalance(parseFloat(balanceInput) || 0);
    setIsEditingBalance(false);
  };

  const handleSaveDueDay = () => {
    const day = parseInt(dueDayInput) || 10;
    setCreditCardDueDay(Math.max(1, Math.min(31, day))); // Ensure it's between 1 and 31
    setIsEditingDueDay(false);
  };

  return (
    <div className="space-y-4">
      {/* Saldo Inicial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saldo Atual em Caixa</CardTitle>
              <CardDescription>
                Informe quanto você tem disponível hoje
              </CardDescription>
            </div>
            <Wallet className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isEditingBalance ? (
            <div className="space-y-3">
              <Input
                type="number"
                step="0.01"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="0,00"
                label="Saldo em Caixa"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveBalance} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingBalance(false);
                    setBalanceInput(initialBalance.toString());
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
                  {formatCurrency(initialBalance)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Saldo disponível hoje
                </p>
              </div>
              <Button onClick={() => setIsEditingBalance(true)} variant="secondary" size="sm">
                Editar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dia de Vencimento do Cartão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dia de Vencimento do Cartão</CardTitle>
              <CardDescription>
                Dia do mês em que a fatura do cartão é debitada
              </CardDescription>
            </div>
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {isEditingDueDay ? (
            <div className="space-y-3">
              <Input
                type="number"
                min="1"
                max="31"
                value={dueDayInput}
                onChange={(e) => setDueDayInput(e.target.value)}
                placeholder="10"
                label="Dia de Vencimento"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveDueDay} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingDueDay(false);
                    setDueDayInput(creditCardDueDay.toString());
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
                  Dia {creditCardDueDay}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vencimento da fatura do cartão
                </p>
              </div>
              <Button onClick={() => setIsEditingDueDay(true)} variant="secondary" size="sm">
                Editar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Saldo Negativo */}
      {negativeBalanceDays.length > 0 && (
        <Card className="border-danger">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <CardTitle className="text-danger">Atenção: Dias com Saldo Negativo!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Você terá saldo insuficiente nos seguintes dias:
            </p>
            <div className="space-y-2">
              {negativeBalanceDays.slice(0, 5).map((day) => (
                <div
                  key={day.date.toISOString()}
                  className="flex items-center justify-between p-3 bg-danger/10 rounded-lg border border-danger/30"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-danger" />
                    <span className="text-sm font-medium text-foreground">
                      {format(day.date, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-danger">
                    {formatCurrency(day.balance)}
                  </span>
                </div>
              ))}
              {negativeBalanceDays.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {negativeBalanceDays.length - 5} dia(s) com saldo negativo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fluxo de Caixa Diário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
              <CardDescription>
                Previsão de entrada e saída para os próximos dias
              </CardDescription>
            </div>
            <select
              value={daysToShow}
              onChange={(e) => setDaysToShow(Number(e.target.value))}
              className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm text-foreground"
            >
              <option value={7}>7 dias</option>
              <option value={15}>15 dias</option>
              <option value={30}>30 dias</option>
              <option value={60}>60 dias</option>
              <option value={90}>90 dias</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Data
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Entradas
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Saídas
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyFlows.map((day, index) => (
                  <tr
                    key={day.date.toISOString()}
                    className={`border-b border-border/50 ${
                      day.isNegative ? 'bg-danger/5' : index % 2 === 0 ? 'bg-secondary/20' : ''
                    } ${day.transactions.length > 0 ? 'font-medium' : ''}`}
                  >
                    <td className="py-3 px-2 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        {day.isNegative && (
                          <AlertTriangle className="w-4 h-4 text-danger" />
                        )}
                        <span>
                          {format(day.date, "dd/MM (EEE)", { locale: ptBR })}
                        </span>
                        {day.transactions.length > 0 && (
                          <span className="text-xs text-primary">
                            ({day.transactions.length})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {day.income > 0 ? (
                        <span className="text-primary font-medium flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {formatCurrency(day.income)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {day.expenses > 0 ? (
                        <span className="text-danger font-medium flex items-center justify-end gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {formatCurrency(day.expenses)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className={`py-3 px-2 text-sm text-right font-semibold ${
                      day.isNegative ? 'text-danger' : 'text-foreground'
                    }`}>
                      {formatCurrency(day.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
