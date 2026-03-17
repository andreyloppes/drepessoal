import { Transaction, FinancialSummary, EmergencyFund, AIAnalysis, TransactionCategory } from '@/types';

export function generateAIAnalysis(
  transactions: Transaction[],
  summary: FinancialSummary,
  emergencyFund: EmergencyFund
): AIAnalysis {
  // Análise de saúde financeira
  const financialHealth = analyzeFinancialHealth(summary, emergencyFund);

  // Análise de padrões de gastos
  const spendingPatterns = analyzeSpendingPatterns(transactions);

  // Recomendações de economia
  const savingsRecommendations = generateSavingsRecommendations(
    summary,
    emergencyFund,
    spendingPatterns
  );

  // Sugestões de investimento
  const investmentSuggestions = generateInvestmentSuggestions(
    summary,
    emergencyFund
  );

  return {
    financialHealth,
    spendingPatterns,
    savingsRecommendations,
    investmentSuggestions,
  };
}

function analyzeFinancialHealth(
  summary: FinancialSummary,
  emergencyFund: EmergencyFund
): AIAnalysis['financialHealth'] {
  let score = 0;
  const insights: string[] = [];

  // Avalia taxa de poupança (0-30 pontos)
  if (summary.savingsRate >= 30) {
    score += 30;
    insights.push('Excelente taxa de poupança! Você está guardando mais de 30% da sua renda.');
  } else if (summary.savingsRate >= 20) {
    score += 25;
    insights.push('Boa taxa de poupança. Continue mantendo este hábito!');
  } else if (summary.savingsRate >= 10) {
    score += 15;
    insights.push('Taxa de poupança moderada. Tente aumentar gradualmente.');
  } else if (summary.savingsRate > 0) {
    score += 5;
    insights.push('Taxa de poupança baixa. Foque em reduzir despesas não essenciais.');
  } else {
    insights.push('Atenção: Suas despesas estão iguais ou maiores que sua renda!');
  }

  // Avalia reserva de emergência (0-40 pontos)
  if (emergencyFund.isComplete) {
    score += 40;
    insights.push('Parabéns! Sua reserva de emergência está completa.');
  } else if (emergencyFund.monthsOfCoverage >= 3) {
    score += 30;
    insights.push(`Você tem ${emergencyFund.monthsOfCoverage.toFixed(1)} meses de reserva. Continue construindo!`);
  } else if (emergencyFund.monthsOfCoverage >= 1) {
    score += 15;
    insights.push('Boa! Você já começou sua reserva de emergência.');
  } else {
    insights.push('Priorize construir uma reserva de emergência de pelo menos 6 meses.');
  }

  // Avalia saldo geral (0-30 pontos)
  if (summary.balance > summary.monthlyExpenses * 6) {
    score += 30;
    insights.push('Excelente controle financeiro com saldo positivo robusto!');
  } else if (summary.balance > summary.monthlyExpenses * 3) {
    score += 20;
    insights.push('Bom saldo acumulado. Continue assim!');
  } else if (summary.balance > 0) {
    score += 10;
    insights.push('Saldo positivo, mas ainda pode melhorar.');
  } else {
    insights.push('Saldo negativo. Revise seus gastos urgentemente!');
  }

  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';
  else status = 'poor';

  return { score, status, insights };
}

function analyzeSpendingPatterns(transactions: Transaction[]) {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<TransactionCategory, number>);

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const trends: string[] = [];
  const recommendations: string[] = [];

  // Análise de padrões
  if (topCategories.length > 0) {
    const topCategory = topCategories[0];
    if (topCategory.percentage > 40) {
      trends.push(`${getCategoryLabel(topCategory.category)} representa ${topCategory.percentage.toFixed(0)}% dos gastos.`);
      recommendations.push(`Considere reduzir gastos com ${getCategoryLabel(topCategory.category)}.`);
    }
  }

  // Recomendações específicas por categoria
  const foodCategory = topCategories.find((c) => c.category === 'food');
  if (foodCategory && foodCategory.percentage > 25) {
    recommendations.push('Gastos com alimentação estão elevados. Considere cozinhar mais em casa.');
  }

  const transportCategory = topCategories.find((c) => c.category === 'transport');
  if (transportCategory && transportCategory.percentage > 20) {
    recommendations.push('Avalie alternativas de transporte mais econômicas.');
  }

  const entertainmentCategory = topCategories.find((c) => c.category === 'entertainment');
  if (entertainmentCategory && entertainmentCategory.percentage > 15) {
    recommendations.push('Entretenimento está consumindo parte significativa do orçamento.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Seus gastos estão bem distribuídos entre as categorias!');
  }

  return { topCategories, trends, recommendations };
}

function generateSavingsRecommendations(
  summary: FinancialSummary,
  emergencyFund: EmergencyFund,
  spendingPatterns: ReturnType<typeof analyzeSpendingPatterns>
): AIAnalysis['savingsRecommendations'] {
  const emergencyFundRecs: string[] = [];
  const investmentRecs: string[] = [];
  const budgetAdjustments: string[] = [];

  // Recomendações de reserva de emergência
  if (!emergencyFund.isComplete) {
    const monthlyNeeded = (emergencyFund.targetAmount - emergencyFund.currentAmount) / 12;
    emergencyFundRecs.push(
      `Para completar sua reserva em 1 ano, guarde R$ ${monthlyNeeded.toFixed(2)} por mês.`
    );
    emergencyFundRecs.push('Mantenha a reserva em investimentos de alta liquidez (poupança, CDB liquidez diária).');
  } else {
    emergencyFundRecs.push('Sua reserva está completa! Mantenha-a atualizada com a inflação.');
  }

  // Recomendações de investimento
  if (emergencyFund.isComplete && summary.savingsRate > 15) {
    investmentRecs.push('Com reserva completa, considere investimentos de médio/longo prazo.');
    investmentRecs.push('Diversifique entre renda fixa e variável conforme seu perfil.');
  } else if (summary.savingsRate > 0) {
    investmentRecs.push('Primeiro complete sua reserva de emergência antes de investimentos agressivos.');
  } else {
    investmentRecs.push('Foque em equilibrar suas finanças antes de pensar em investimentos.');
  }

  // Ajustes de orçamento
  if (summary.savingsRate < 20) {
    budgetAdjustments.push('Meta: Alcançar pelo menos 20% de taxa de poupança.');

    const topExpense = spendingPatterns.topCategories[0];
    if (topExpense) {
      const reduction = topExpense.amount * 0.1; // 10% de redução
      budgetAdjustments.push(
        `Reduza 10% em ${getCategoryLabel(topExpense.category)} (economize R$ ${reduction.toFixed(2)}/mês).`
      );
    }
  }

  if (summary.monthlyExpenses > summary.monthlyIncome) {
    budgetAdjustments.push('URGENTE: Suas despesas excedem sua renda. Revise gastos imediatamente!');
  }

  return {
    emergencyFund: emergencyFundRecs,
    investments: investmentRecs,
    budgetAdjustments,
  };
}

function generateInvestmentSuggestions(
  summary: FinancialSummary,
  emergencyFund: EmergencyFund
): AIAnalysis['investmentSuggestions'] {
  let riskProfile: 'conservative' | 'moderate' | 'aggressive';

  // Determina perfil de risco baseado na situação financeira
  if (!emergencyFund.isComplete || summary.savingsRate < 10) {
    riskProfile = 'conservative';
  } else if (summary.savingsRate >= 20 && emergencyFund.monthsOfCoverage >= 6) {
    riskProfile = 'aggressive';
  } else {
    riskProfile = 'moderate';
  }

  const suggestions = [];

  if (riskProfile === 'conservative') {
    suggestions.push(
      {
        type: 'Tesouro Selic',
        description: 'Título público de baixo risco com liquidez diária',
        expectedReturn: '100% do CDI (~13% a.a.)',
        risk: 'Muito Baixo',
      },
      {
        type: 'CDB Liquidez Diária',
        description: 'Investimento bancário com boa liquidez',
        expectedReturn: '90-100% do CDI',
        risk: 'Baixo',
      },
      {
        type: 'Poupança',
        description: 'Para guardar a reserva de emergência',
        expectedReturn: '~70% do CDI',
        risk: 'Muito Baixo',
      }
    );
  } else if (riskProfile === 'moderate') {
    suggestions.push(
      {
        type: 'Tesouro IPCA+',
        description: 'Proteção contra inflação com retorno real',
        expectedReturn: 'IPCA + 6% a.a.',
        risk: 'Baixo',
      },
      {
        type: 'Fundos Multimercado',
        description: 'Diversificação em várias classes de ativos',
        expectedReturn: '12-18% a.a.',
        risk: 'Médio',
      },
      {
        type: 'Ações (Blue Chips)',
        description: 'Ações de empresas consolidadas',
        expectedReturn: '15-25% a.a. (variável)',
        risk: 'Médio-Alto',
      }
    );
  } else {
    suggestions.push(
      {
        type: 'Ações Growth',
        description: 'Empresas com alto potencial de crescimento',
        expectedReturn: '20-40% a.a. (variável)',
        risk: 'Alto',
      },
      {
        type: 'Fundos Imobiliários',
        description: 'Investimento em imóveis com renda passiva',
        expectedReturn: '10-15% a.a. + dividendos',
        risk: 'Médio-Alto',
      },
      {
        type: 'ETFs Internacionais',
        description: 'Diversificação internacional',
        expectedReturn: '15-30% a.a. (variável)',
        risk: 'Alto',
      }
    );
  }

  return { riskProfile, suggestions };
}

function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
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
}
