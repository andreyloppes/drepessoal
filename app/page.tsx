'use client';

import { useState } from 'react';
import { FinancialSummaryCards } from '@/components/dashboard/FinancialSummaryCards';
import { EmergencyFundCard } from '@/components/dashboard/EmergencyFundCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { GoalsCard } from '@/components/dashboard/GoalsCard';
import { CashFlowCard } from '@/components/dashboard/CashFlowCard';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ReportsCard } from '@/components/reports/ReportsCard';
import { MonthlyEvolutionChart } from '@/components/reports/MonthlyEvolutionChart';
import { CategoryDistributionChart } from '@/components/reports/CategoryDistributionChart';
import { MonthComparisonCard } from '@/components/reports/MonthComparisonCard';
import { AddTransactionForm } from '@/components/transactions/AddTransactionForm';
import { LayoutDashboard, TrendingUp, Brain, Target, Wallet, FileBarChart } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cashflow' | 'reports' | 'analytics' | 'goals'>('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-foreground">DRE Pessoal</h1>
            <p className="text-sm text-muted-foreground">Gestão Financeira Inteligente</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium">Visão Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'cashflow'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="font-medium">Fluxo de Caixa</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileBarChart className="w-4 h-4" />
              <span className="font-medium">Relatórios</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="font-medium">Análise IA</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'goals'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="font-medium">Metas</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <FinancialSummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmergencyFundCard />
              <FinancialChart />
            </div>

            <BudgetCard />

            <RecentTransactions />
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <CashFlowCard />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportsCard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyEvolutionChart />
              <CategoryDistributionChart />
            </div>

            <MonthComparisonCard />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AIInsights />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <GoalsCard />
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <AddTransactionForm />
    </div>
  );
}
