'use client';

import { useFinance } from '@/lib/context/FinanceContext';
import { generateAIAnalysis } from '@/lib/ai-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Brain, TrendingUp, PiggyBank, Lightbulb, Target } from 'lucide-react';

export function AIInsights() {
  const { transactions, getFinancialSummary, getEmergencyFund } = useFinance();
  const summary = getFinancialSummary();
  const emergencyFund = getEmergencyFund();

  const analysis = generateAIAnalysis(transactions, summary, emergencyFund);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-primary';
      case 'good':
        return 'text-primary/80';
      case 'fair':
        return 'text-warning';
      case 'poor':
        return 'text-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'fair':
        return 'Regular';
      case 'poor':
        return 'Precisa Atenção';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saúde Financeira</CardTitle>
              <CardDescription>Análise inteligente da sua situação</CardDescription>
            </div>
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className={`text-3xl font-bold ${getHealthColor(analysis.financialHealth.status)}`}>
                  {analysis.financialHealth.score}/100
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-xl font-semibold ${getHealthColor(analysis.financialHealth.status)}`}>
                  {getHealthLabel(analysis.financialHealth.status)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              {analysis.financialHealth.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Patterns */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Padrões de Gastos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.spendingPatterns.topCategories.length > 0 ? (
              <>
                <div className="space-y-2">
                  {analysis.spendingPatterns.topCategories.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground capitalize">
                          {cat.category.replace('-', ' ')}
                        </span>
                        <span className="text-muted-foreground">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {analysis.spendingPatterns.recommendations.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-sm font-semibold text-foreground">Recomendações:</p>
                    {analysis.spendingPatterns.recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {rec}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Adicione transações para ver análises
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savings Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            <CardTitle>Recomendações de Economia</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.savingsRecommendations.emergencyFund.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Reserva de Emergência:</p>
                <div className="space-y-1">
                  {analysis.savingsRecommendations.emergencyFund.map((rec, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {analysis.savingsRecommendations.budgetAdjustments.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-2">Ajustes de Orçamento:</p>
                <div className="space-y-1">
                  {analysis.savingsRecommendations.budgetAdjustments.map((rec, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Sugestões de Investimento</CardTitle>
          </div>
          <CardDescription>
            Perfil: <span className="capitalize font-semibold text-foreground">
              {analysis.investmentSuggestions.riskProfile === 'conservative' && 'Conservador'}
              {analysis.investmentSuggestions.riskProfile === 'moderate' && 'Moderado'}
              {analysis.investmentSuggestions.riskProfile === 'aggressive' && 'Agressivo'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.investmentSuggestions.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-secondary/50 border border-border"
              >
                <h4 className="font-semibold text-foreground mb-1">{suggestion.type}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {suggestion.description}
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="text-primary">
                    Retorno: {suggestion.expectedReturn}
                  </span>
                  <span className="text-muted-foreground">
                    Risco: {suggestion.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            {analysis.savingsRecommendations.investments.map((rec, index) => (
              <p key={index} className="text-sm text-muted-foreground mb-1">
                • {rec}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
