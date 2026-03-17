export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other-income'
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'shopping'
  | 'other-expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isCreditCard?: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}

export interface EmergencyFund {
  currentAmount: number;
  targetAmount: number;
  monthlyExpenses: number;
  monthsOfCoverage: number;
  targetMonths: number;
  isComplete: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'emergency' | 'investment' | 'purchase' | 'debt' | 'other';
}

export interface AIAnalysis {
  financialHealth: {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    insights: string[];
  };
  spendingPatterns: {
    topCategories: { category: TransactionCategory; amount: number; percentage: number }[];
    trends: string[];
    recommendations: string[];
  };
  savingsRecommendations: {
    emergencyFund: string[];
    investments: string[];
    budgetAdjustments: string[];
  };
  investmentSuggestions: {
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    suggestions: {
      type: string;
      description: string;
      expectedReturn: string;
      risk: string;
    }[];
  };
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashFlow {
  initialBalance: number;
}

export interface DailyCashFlow {
  date: Date;
  income: number;
  expenses: number;
  balance: number;
  transactions: Transaction[];
  isNegative: boolean;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
}

export interface CategorySpending {
  category: TransactionCategory;
  spent: number;
  budget: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}
