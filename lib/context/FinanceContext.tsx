'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, Goal, FinancialSummary, EmergencyFund, DailyCashFlow, Budget, CategorySpending } from '@/types';
import { supabase } from '@/lib/supabase';

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  initialBalance: number;
  creditCardDueDay: number;
  monthlyCost: number;
  emergencyMonths: number;
  currentSavings: number;
  setInitialBalance: (balance: number) => void;
  setCreditCardDueDay: (day: number) => void;
  setMonthlyCost: (cost: number) => void;
  setEmergencyMonths: (months: number) => void;
  setCurrentSavings: (savings: number) => void;
  setBudget: (category: string, limit: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  getFinancialSummary: () => FinancialSummary;
  getEmergencyFund: () => EmergencyFund;
  getDailyCashFlow: (days: number) => DailyCashFlow[];
  getCategorySpending: () => CategorySpending[];
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'dre-finance-storage';

// --- Supabase helpers ---
async function loadTransactionsFromSupabase(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('dre_transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('Supabase load transactions:', error); return []; }
  return (data || []).map((t: any) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    type: t.type,
    category: t.category,
    date: new Date(t.date),
    recurring: t.recurring || false,
    recurringFrequency: t.recurring_frequency || undefined,
    isCreditCard: t.is_credit_card || false,
  }));
}

async function loadGoalsFromSupabase(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('dre_goals')
    .select('*')
    .order('deadline', { ascending: true });
  if (error) { console.error('Supabase load goals:', error); return []; }
  return (data || []).map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description || '',
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    deadline: new Date(g.deadline),
    priority: g.priority,
    category: g.category,
  }));
}

async function loadBudgetsFromSupabase(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('dre_budgets')
    .select('*');
  if (error) { console.error('Supabase load budgets:', error); return []; }
  return (data || []).map((b: any) => ({
    category: b.category,
    limit: Number(b.budget_limit),
  }));
}

async function loadSettingsFromSupabase(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('dre_settings')
    .select('*');
  if (error) { console.error('Supabase load settings:', error); return {}; }
  const settings: Record<string, string> = {};
  (data || []).forEach((s: any) => { settings[s.key] = s.value; });
  return settings;
}

async function saveSetting(key: string, value: string) {
  const { error } = await supabase
    .from('dre_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) console.error('Supabase save setting:', error);
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [initialBalance, setInitialBalanceState] = useState<number>(0);
  const [creditCardDueDay, setCreditCardDueDayState] = useState<number>(10);
  const [monthlyCost, setMonthlyCostState] = useState<number>(4500);
  const [emergencyMonths, setEmergencyMonthsState] = useState<number>(6);
  const [currentSavings, setCurrentSavingsState] = useState<number>(4500);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastRecurringCheck, setLastRecurringCheck] = useState<string | null>(null);

  // Helper function to generate next date for recurring transaction
  const getNextDate = (currentDate: Date, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date => {
    const nextDate = new Date(currentDate);
    switch (frequency) {
      case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
      case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
      case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
      case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }
    return nextDate;
  };

  // Function to generate recurring transactions
  const generateRecurringTransactions = (existingTransactions: Transaction[]): Transaction[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recurringTemplates = existingTransactions.filter((t) => t.recurring);
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const newTransactions: Transaction[] = [];

    recurringTemplates.forEach((template) => {
      if (!template.recurringFrequency) return;
      const instances = existingTransactions.filter(
        (t) => t.description === template.description && t.amount === template.amount && t.type === template.type && t.category === template.category
      );
      const latestDate = instances.reduce((latest, t) => {
        const tDate = new Date(t.date);
        return tDate > latest ? tDate : latest;
      }, new Date(template.date));

      let currentDate = getNextDate(latestDate, template.recurringFrequency);
      while (currentDate <= threeMonthsFromNow) {
        const alreadyExists = existingTransactions.some((t) => {
          const tDate = new Date(t.date);
          tDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          return tDate.getTime() === currentDate.getTime() && t.description === template.description && t.amount === template.amount && t.type === template.type && t.category === template.category;
        });
        if (!alreadyExists) {
          newTransactions.push({ ...template, id: crypto.randomUUID(), date: new Date(currentDate) });
        }
        currentDate = getNextDate(currentDate, template.recurringFrequency);
      }
    });
    return newTransactions;
  };

  // Save to localStorage as cache
  const saveToLocalStorage = useCallback((data: {
    transactions: Transaction[]; goals: Goal[]; budgets: Budget[];
    initialBalance: number; creditCardDueDay: number; monthlyCost: number;
    emergencyMonths: number; currentSavings: number; lastRecurringCheck: string | null;
  }) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }, []);

  // Load from Supabase on mount (with localStorage as fast fallback)
  useEffect(() => {
    async function loadData() {
      // 1. Fast: load from localStorage cache first for instant UI
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setTransactions((data.transactions || []).map((t: any) => ({ ...t, date: new Date(t.date) })));
          setGoals((data.goals || []).map((g: any) => ({ ...g, deadline: new Date(g.deadline) })));
          setBudgets(data.budgets || []);
          setInitialBalanceState(data.initialBalance || 0);
          setCreditCardDueDayState(data.creditCardDueDay || 10);
          setMonthlyCostState(data.monthlyCost || 4500);
          setEmergencyMonthsState(data.emergencyMonths || 6);
          setCurrentSavingsState(data.currentSavings || 4500);
          setLastRecurringCheck(data.lastRecurringCheck || null);
        } catch (e) { /* ignore parse error */ }
      }
      setIsLoaded(true);

      // 2. Then: load fresh from Supabase (source of truth)
      try {
        const [sbTransactions, sbGoals, sbBudgets, sbSettings] = await Promise.all([
          loadTransactionsFromSupabase(),
          loadGoalsFromSupabase(),
          loadBudgetsFromSupabase(),
          loadSettingsFromSupabase(),
        ]);

        const ib = Number(sbSettings.initial_balance) || 0;
        const cdd = Number(sbSettings.credit_card_due_day) || 10;
        const mc = Number(sbSettings.monthly_cost) || 4500;
        const em = Number(sbSettings.emergency_months) || 6;
        const cs = Number(sbSettings.current_savings) || 4500;

        setTransactions(sbTransactions);
        setGoals(sbGoals);
        setBudgets(sbBudgets);
        setInitialBalanceState(ib);
        setCreditCardDueDayState(cdd);
        setMonthlyCostState(mc);
        setEmergencyMonthsState(em);
        setCurrentSavingsState(cs);

        // Update localStorage cache
        saveToLocalStorage({
          transactions: sbTransactions, goals: sbGoals, budgets: sbBudgets,
          initialBalance: ib, creditCardDueDay: cdd, monthlyCost: mc,
          emergencyMonths: em, currentSavings: cs, lastRecurringCheck: null,
        });
      } catch (e) {
        console.error('Failed to load from Supabase, using localStorage cache:', e);
      }
    }
    loadData();
  }, [saveToLocalStorage]);

  // Generate recurring transactions after loading
  useEffect(() => {
    if (isLoaded && transactions.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      if (lastRecurringCheck !== today) {
        const newRecurringTransactions = generateRecurringTransactions(transactions);
        if (newRecurringTransactions.length > 0) {
          // Save recurring to Supabase too
          newRecurringTransactions.forEach(async (t) => {
            await supabase.from('dre_transactions').insert({
              id: t.id,
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.category,
              date: t.date.toISOString(),
              recurring: t.recurring,
              recurring_frequency: t.recurringFrequency,
              is_credit_card: t.isCreditCard,
            });
          });
          setTransactions((prev) => [...prev, ...newRecurringTransactions]);
        }
        setLastRecurringCheck(today);
      }
    }
  }, [isLoaded, transactions.length]);

  // Save to localStorage whenever data changes (as cache)
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage({
        transactions, goals, budgets, initialBalance, creditCardDueDay,
        monthlyCost, emergencyMonths, currentSavings, lastRecurringCheck,
      });
    }
  }, [transactions, goals, budgets, initialBalance, creditCardDueDay, monthlyCost, emergencyMonths, currentSavings, lastRecurringCheck, isLoaded, saveToLocalStorage]);

  // --- Settings ---
  const setInitialBalance = (balance: number) => {
    setInitialBalanceState(balance);
    saveSetting('initial_balance', String(balance));
  };
  const setCreditCardDueDay = (day: number) => {
    setCreditCardDueDayState(day);
    saveSetting('credit_card_due_day', String(day));
  };
  const setMonthlyCost = (cost: number) => {
    setMonthlyCostState(cost);
    saveSetting('monthly_cost', String(cost));
  };
  const setEmergencyMonths = (months: number) => {
    setEmergencyMonthsState(months);
    saveSetting('emergency_months', String(months));
  };
  const setCurrentSavings = (savings: number) => {
    setCurrentSavingsState(savings);
    saveSetting('current_savings', String(savings));
  };

  const setBudget = (category: string, limit: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) {
        return prev.map((b) => b.category === category ? { ...b, limit } : b);
      } else {
        return [...prev, { category: category as any, limit }];
      }
    });
    // Persist to Supabase
    supabase.from('dre_budgets').upsert(
      { category, budget_limit: limit },
      { onConflict: 'category' }
    ).then(({ error }) => { if (error) console.error('Save budget:', error); });
  };

  // --- Transactions ---
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const id = crypto.randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      date: new Date(transaction.date),
    };
    setTransactions((prev) => [...prev, newTransaction]);

    // Persist to Supabase
    supabase.from('dre_transactions').insert({
      id,
      description: newTransaction.description,
      amount: newTransaction.amount,
      type: newTransaction.type,
      category: newTransaction.category,
      date: newTransaction.date.toISOString(),
      recurring: newTransaction.recurring || false,
      recurring_frequency: newTransaction.recurringFrequency || null,
      is_credit_card: newTransaction.isCreditCard || false,
    }).then(({ error }) => { if (error) console.error('Save transaction:', error); });
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    supabase.from('dre_transactions').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Delete transaction:', error); });
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...transaction };
          if (updated.date && !(updated.date instanceof Date)) {
            updated.date = new Date(updated.date);
          }
          return updated;
        }
        return t;
      })
    );
    // Persist to Supabase
    const updates: any = {};
    if (transaction.description !== undefined) updates.description = transaction.description;
    if (transaction.amount !== undefined) updates.amount = transaction.amount;
    if (transaction.type !== undefined) updates.type = transaction.type;
    if (transaction.category !== undefined) updates.category = transaction.category;
    if (transaction.date !== undefined) updates.date = new Date(transaction.date).toISOString();
    if (transaction.recurring !== undefined) updates.recurring = transaction.recurring;
    if (transaction.recurringFrequency !== undefined) updates.recurring_frequency = transaction.recurringFrequency;
    if (transaction.isCreditCard !== undefined) updates.is_credit_card = transaction.isCreditCard;

    supabase.from('dre_transactions').update(updates).eq('id', id)
      .then(({ error }) => { if (error) console.error('Update transaction:', error); });
  };

  // --- Goals ---
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const id = crypto.randomUUID();
    const newGoal: Goal = {
      ...goal,
      id,
      deadline: new Date(goal.deadline),
    };
    setGoals((prev) => [...prev, newGoal]);

    supabase.from('dre_goals').insert({
      id,
      title: newGoal.title,
      description: newGoal.description,
      target_amount: newGoal.targetAmount,
      current_amount: newGoal.currentAmount,
      deadline: newGoal.deadline.toISOString(),
      priority: newGoal.priority,
      category: newGoal.category,
    }).then(({ error }) => { if (error) console.error('Save goal:', error); });
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    supabase.from('dre_goals').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Delete goal:', error); });
  };

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...goal };
          if (updated.deadline && !(updated.deadline instanceof Date)) {
            updated.deadline = new Date(updated.deadline);
          }
          return updated;
        }
        return g;
      })
    );
    const updates: any = {};
    if (goal.title !== undefined) updates.title = goal.title;
    if (goal.description !== undefined) updates.description = goal.description;
    if (goal.targetAmount !== undefined) updates.target_amount = goal.targetAmount;
    if (goal.currentAmount !== undefined) updates.current_amount = goal.currentAmount;
    if (goal.deadline !== undefined) updates.deadline = new Date(goal.deadline).toISOString();
    if (goal.priority !== undefined) updates.priority = goal.priority;
    if (goal.category !== undefined) updates.category = goal.category;

    supabase.from('dre_goals').update(updates).eq('id', id)
      .then(({ error }) => { if (error) console.error('Update goal:', error); });
  };

  // --- Computed values (unchanged) ---
  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return { totalIncome, totalExpenses, balance, monthlyIncome, monthlyExpenses, savingsRate };
  };

  const getEmergencyFund = (): EmergencyFund => {
    const targetAmount = monthlyCost * emergencyMonths;
    const monthsOfCoverage = monthlyCost > 0 ? currentSavings / monthlyCost : 0;
    return {
      currentAmount: currentSavings,
      targetAmount,
      monthlyExpenses: monthlyCost,
      monthsOfCoverage,
      targetMonths: emergencyMonths,
      isComplete: currentSavings >= targetAmount,
    };
  };

  const getDailyCashFlow = (days: number): DailyCashFlow[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getCreditCardDueDate = (transactionDate: Date): Date => {
      const dueDate = new Date(transactionDate);
      dueDate.setDate(creditCardDueDay);
      dueDate.setHours(0, 0, 0, 0);
      if (transactionDate.getDate() >= creditCardDueDay) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      return dueDate;
    };

    const creditCardExpensesByDueDate = new Map<string, { amount: number; transactions: Transaction[] }>();
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.isCreditCard) {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        const dueDate = getCreditCardDueDate(tDate);
        const dueDateKey = dueDate.toISOString();
        if (!creditCardExpensesByDueDate.has(dueDateKey)) {
          creditCardExpensesByDueDate.set(dueDateKey, { amount: 0, transactions: [] });
        }
        const entry = creditCardExpensesByDueDate.get(dueDateKey)!;
        entry.amount += t.amount;
        entry.transactions.push(t);
      }
    });

    const dailyFlows: DailyCashFlow[] = [];
    let runningBalance = initialBalance;

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);

      const dayTransactions = transactions.filter((t) => {
        if (t.isCreditCard) return false;
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate >= currentDate && tDate < nextDate;
      });

      let dayIncome = dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      let dayExpenses = dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      const currentDateKey = currentDate.toISOString();
      if (creditCardExpensesByDueDate.has(currentDateKey)) {
        const creditCardEntry = creditCardExpensesByDueDate.get(currentDateKey)!;
        dayExpenses += creditCardEntry.amount;
        dayTransactions.push(...creditCardEntry.transactions);
      }

      runningBalance = runningBalance + dayIncome - dayExpenses;
      dailyFlows.push({
        date: currentDate,
        income: dayIncome,
        expenses: dayExpenses,
        balance: runningBalance,
        transactions: dayTransactions,
        isNegative: runningBalance < 0,
      });
    }
    return dailyFlows;
  };

  const getCategorySpending = (): CategorySpending[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const expenseCategories = ['food', 'transport', 'housing', 'utilities', 'entertainment', 'health', 'education', 'shopping', 'other-expense'];
    const categorySpending: CategorySpending[] = [];

    expenseCategories.forEach((category) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === category && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      const budgetItem = budgets.find((b) => b.category === category);
      const budget = budgetItem ? budgetItem.limit : 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      categorySpending.push({
        category: category as any, spent, budget, percentage,
        isOverBudget: spent > budget && budget > 0,
        isNearLimit: percentage >= 80 && percentage < 100,
      });
    });

    return categorySpending.sort((a, b) => b.percentage - a.percentage);
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setBudgets([]);
    setInitialBalanceState(0);
    setCreditCardDueDayState(10);
    setMonthlyCostState(4500);
    setEmergencyMonthsState(6);
    setCurrentSavingsState(4500);

    // Clear Supabase tables
    supabase.from('dre_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    supabase.from('dre_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    supabase.from('dre_budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    saveSetting('initial_balance', '0');
    saveSetting('credit_card_due_day', '10');
    saveSetting('monthly_cost', '4500');
    saveSetting('emergency_months', '6');
    saveSetting('current_savings', '4500');
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions, goals, budgets, initialBalance, creditCardDueDay, monthlyCost,
        emergencyMonths, currentSavings, setInitialBalance, setCreditCardDueDay, setMonthlyCost,
        setEmergencyMonths, setCurrentSavings, setBudget, addTransaction, removeTransaction,
        updateTransaction, addGoal, removeGoal, updateGoal, getFinancialSummary, getEmergencyFund,
        getDailyCashFlow, getCategorySpending, clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
