import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsContribution,
  RecurringTransaction,
  RecurringExecutionLog,
  AppNotification,
} from '../types';
import { SpendWiseStorageService, UserFinancialData } from '../services/storage';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';
import {
  formatCurrency,
  getCurrencySymbol,
  getCurrencyConfig,
  CurrencyDisplayFormat,
  CurrencyConfig,
} from '../constants/currencies';
import {
  calculateSummary,
  computeBudgetStatuses,
  generateSpendingInsights,
  FinancialSummary,
  BudgetStatusResult,
  SpendingInsight,
} from '../utils/calculations';
import { useAuth } from './AuthContext';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FinanceContextType {
  data: UserFinancialData;
  currency: string;
  currencyConfig: CurrencyConfig;
  currencySymbol: string;
  currencyFormat: CurrencyDisplayFormat;
  setCurrency: (code: string) => void;
  setCurrencyFormat: (format: CurrencyDisplayFormat) => void;
  formatAmount: (amount: number, customFormat?: CurrencyDisplayFormat) => string;
  summary: FinancialSummary;
  budgetStatuses: BudgetStatusResult[];
  insights: SpendingInsight[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id' | 'userId' | 'isDefault'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };

  // Budgets
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>) => { success: boolean; error?: string };
  updateBudget: (id: string, budget: Partial<Budget>) => { success: boolean; error?: string };
  deleteBudget: (id: string) => void;

  // Savings Goals
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addGoalContribution: (goalId: string, amount: number, notes?: string) => { success: boolean; error?: string };
  recordGoalWithdrawal: (goalId: string, amount: number, notes?: string) => { success: boolean; error?: string };

  // Recurring
  addRecurring: (rule: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateRecurring: (id: string, rule: Partial<RecurringTransaction>) => void;
  toggleRecurringStatus: (id: string) => void;
  deleteRecurring: (id: string) => void;
  processDueRecurring: () => { processedCount: number; message: string };

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadNotificationsCount: number;

  // Utilities
  loadSampleData: () => void;
  resetToDemo: () => void;
  clearUserData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonStr: string) => { success: boolean; message: string };
  refreshData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const EMPTY_DATA: UserFinancialData = {
  profile: {
    id: '',
    email: '',
    name: 'Guest',
    currency: 'USD',
    monthlyIncomeTarget: 0,
    isDemoUser: false,
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
  categories: [...DEFAULT_CATEGORIES],
  transactions: [],
  budgets: [],
  savingsGoals: [],
  savingsContributions: [],
  recurringTransactions: [],
  recurringExecutionLogs: [],
  notifications: [],
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [data, setData] = useState<UserFinancialData>(() => {
    if (user?.id) {
      return SpendWiseStorageService.loadUserData(user.id);
    }
    return EMPTY_DATA;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync data whenever user switches
  useEffect(() => {
    if (user?.id) {
      const loaded = SpendWiseStorageService.loadUserData(user.id);
      setData(loaded);
    } else {
      setData(EMPTY_DATA);
    }
  }, [user?.id]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = String(Date.now());
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4000);
  }, []);

  const persistData = (updated: UserFinancialData) => {
    setData(updated);
    if (user) {
      SpendWiseStorageService.saveUserData(user.id, updated);
    }
  };

  const refreshData = () => {
    if (user) {
      setData(SpendWiseStorageService.loadUserData(user.id));
    }
  };

  const [currencyFormat, setCurrencyFormatState] = useState<CurrencyDisplayFormat>(() => {
    return (localStorage.getItem('spendwise_currency_format') as CurrencyDisplayFormat) || 'symbol';
  });

  const setCurrencyFormat = (fmt: CurrencyDisplayFormat) => {
    setCurrencyFormatState(fmt);
    localStorage.setItem('spendwise_currency_format', fmt);
    showToast(`Currency format updated: ${fmt.replace('_', ' ')}`, 'info');
  };

  const currency = user?.currency || data.profile?.currency || 'USD';
  const currencyConfig = useMemo(() => getCurrencyConfig(currency), [currency]);
  const currencySymbol = useMemo(() => currencyConfig.symbol, [currencyConfig]);

  const setCurrency = useCallback(
    (newCurrencyCode: string) => {
      const cleanCode = (newCurrencyCode || 'USD').toUpperCase();
      const cfg = getCurrencyConfig(cleanCode);
      if (user) {
        updateProfile({ currency: cleanCode });
      }
      setData((prev) => ({
        ...prev,
        profile: { ...prev.profile, currency: cleanCode },
      }));
      showToast(`Switched active currency to ${cfg.name} (${cfg.code} ${cfg.symbol})`, 'success');
    },
    [user, updateProfile, showToast]
  );

  const formatAmount = useCallback(
    (amount: number, customFormat?: CurrencyDisplayFormat) => {
      return formatCurrency(amount, currency, customFormat || currencyFormat);
    },
    [currency, currencyFormat]
  );

  // Current month & year for active budgets
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Financial summary of all transactions for current view
  const summary = useMemo(() => {
    return calculateSummary(data.transactions);
  }, [data.transactions]);

  // Active budget statuses
  const budgetStatuses = useMemo(() => {
    return computeBudgetStatuses(data.budgets, data.transactions, data.categories, currentMonth, currentYear);
  }, [data.budgets, data.transactions, data.categories, currentMonth, currentYear]);

  // Dynamic Rule-based Insights with reactive currency formatting
  const insights = useMemo(() => {
    return generateSpendingInsights(
      data.transactions,
      data.budgets,
      data.categories,
      currency,
      (val: number, cur: string) => formatCurrency(val, cur, currencyFormat)
    );
  }, [data.transactions, data.budgets, data.categories, currency, currencyFormat]);

  // Unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return data.notifications.filter((n) => !n.read).length;
  }, [data.notifications]);

  // ---------------- Transactions CRUD ----------------
  const addTransaction = (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user.id,
      amount: Math.round(Number(tx.amount) * 100) / 100,
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [newTx, ...data.transactions];

    // Check if adding this transaction breaches any budget limit
    const updatedBudgets = computeBudgetStatuses(
      data.budgets,
      updatedTransactions,
      data.categories,
      currentMonth,
      currentYear
    );
    const newNotifications = [...data.notifications];

    if (tx.type === 'expense') {
      const affectedBudget = updatedBudgets.find(
        (b) => b.budget.categoryId === tx.categoryId || b.budget.categoryId === null
      );
      if (affectedBudget) {
        if (affectedBudget.status === 'exceeded') {
          newNotifications.unshift({
            id: `notif-breach-${Date.now()}`,
            userId: user.id,
            title: 'Budget Exceeded Warning',
            message: `Your ${affectedBudget.categoryName} spending reached ${formatAmount(affectedBudget.spentAmount)} (limit: ${formatAmount(affectedBudget.limitAmount)}).`,
            type: 'budget_exceeded',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'budgets',
            linkId: affectedBudget.budget.id,
          });
        } else if (affectedBudget.status === 'warning') {
          newNotifications.unshift({
            id: `notif-warn-${Date.now()}`,
            userId: user.id,
            title: 'Approaching Budget Limit',
            message: `Your ${affectedBudget.categoryName} budget is at ${affectedBudget.utilizationPercentage}% (${formatAmount(affectedBudget.remainingAmount)} remaining).`,
            type: 'budget_warning',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'budgets',
            linkId: affectedBudget.budget.id,
          });
        }
      }
    }

    persistData({
      ...data,
      transactions: updatedTransactions,
      notifications: newNotifications,
    });
    showToast(`Transaction "${tx.description}" recorded successfully!`, 'success');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = data.transactions.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          amount: updates.amount !== undefined ? Math.round(Number(updates.amount) * 100) / 100 : t.amount,
        };
      }
      return t;
    });

    persistData({ ...data, transactions: updatedTransactions });
    showToast('Transaction updated successfully', 'success');
  };

  const deleteTransaction = (id: string) => {
    const target = data.transactions.find((t) => t.id === id);
    const updatedTransactions = data.transactions.filter((t) => t.id !== id);
    persistData({ ...data, transactions: updatedTransactions });
    showToast(`Deleted transaction "${target?.description || ''}"`, 'info');
  };

  // ---------------- Categories CRUD ----------------
  const addCategory = (cat: Omit<Category, 'id' | 'userId' | 'isDefault'>) => {
    if (!user) return;
    const newCategory: Category = {
      ...cat,
      id: `cat-cust-${Date.now()}`,
      userId: user.id,
      isDefault: false,
    };
    persistData({
      ...data,
      categories: [...data.categories, newCategory],
    });
    showToast(`Category "${cat.name}" added`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = data.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    persistData({ ...data, categories: updatedCategories });
    showToast('Category updated successfully', 'success');
  };

  const deleteCategory = (id: string): { success: boolean; message?: string } => {
    // Check if any transaction relies on this category
    const count = data.transactions.filter((t) => t.categoryId === id).length;
    if (count > 0) {
      const msg = `Cannot delete category: ${count} transaction(s) are currently categorized under it. Please reassign or delete those transactions first.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    // Check if any budget relies on this category
    const budgetCount = data.budgets.filter((b) => b.categoryId === id).length;
    if (budgetCount > 0) {
      const msg = `Cannot delete category: an active budget is configured for this category. Please delete the budget first.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }

    const updatedCategories = data.categories.filter((c) => c.id !== id);
    persistData({ ...data, categories: updatedCategories });
    showToast('Category deleted successfully', 'info');
    return { success: true };
  };

  // ---------------- Budgets CRUD ----------------
  const addBudget = (budget: Omit<Budget, 'id' | 'userId' | 'createdAt'>): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Unauthorized' };

    // Prevent duplicate budgets for the same user, category and month/year
    const exists = data.budgets.some(
      (b) => b.month === budget.month && b.year === budget.year && b.categoryId === budget.categoryId
    );
    if (exists) {
      const msg = 'A budget already exists for this category and month. Please edit the existing budget instead.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
      userId: user.id,
      limitAmount: Math.round(Number(budget.limitAmount) * 100) / 100,
      createdAt: new Date().toISOString(),
    };

    persistData({
      ...data,
      budgets: [...data.budgets, newBudget],
    });
    showToast('Budget created successfully', 'success');
    return { success: true };
  };

  const updateBudget = (id: string, updates: Partial<Budget>): { success: boolean; error?: string } => {
    // If categoryId, month or year changed, check duplicates
    const current = data.budgets.find((b) => b.id === id);
    if (current && (updates.categoryId !== undefined || updates.month !== undefined || updates.year !== undefined)) {
      const targetMonth = updates.month ?? current.month;
      const targetYear = updates.year ?? current.year;
      const targetCat = updates.categoryId !== undefined ? updates.categoryId : current.categoryId;

      const duplicate = data.budgets.some(
        (b) => b.id !== id && b.month === targetMonth && b.year === targetYear && b.categoryId === targetCat
      );
      if (duplicate) {
        const msg = 'Another budget already exists for this month and category.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    }

    const updatedBudgets = data.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
    persistData({ ...data, budgets: updatedBudgets });
    showToast('Budget updated successfully', 'success');
    return { success: true };
  };

  const deleteBudget = (id: string) => {
    const updatedBudgets = data.budgets.filter((b) => b.id !== id);
    persistData({ ...data, budgets: updatedBudgets });
    showToast('Budget deleted', 'info');
  };

  // ---------------- Savings Goals CRUD ----------------
  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => {
    if (!user) return;
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      userId: user.id,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    persistData({
      ...data,
      savingsGoals: [...data.savingsGoals, newGoal],
    });
    showToast(`Goal "${goal.name}" created`, 'success');
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const updatedGoals = data.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    persistData({ ...data, savingsGoals: updatedGoals });
    showToast('Savings goal updated', 'success');
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = data.savingsGoals.filter((g) => g.id !== id);
    const updatedContributions = data.savingsContributions.filter((c) => c.goalId !== id);
    persistData({
      ...data,
      savingsGoals: updatedGoals,
      savingsContributions: updatedContributions,
    });
    showToast('Savings goal deleted', 'info');
  };

  const addGoalContribution = (
    goalId: string,
    amount: number,
    notes?: string
  ): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Unauthorized' };
    if (amount <= 0) {
      showToast('Contribution amount must be greater than zero.', 'error');
      return { success: false, error: 'Amount must be greater than zero.' };
    }

    const goal = data.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found' };

    const newAmount = Math.round((goal.currentAmount + amount) * 100) / 100;
    const isCompleted = newAmount >= goal.targetAmount;

    // Create contribution audit record
    const contribution: SavingsContribution = {
      id: `sc-${Date.now()}`,
      goalId,
      userId: user.id,
      amount,
      type: 'deposit',
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Goal deposit',
      createdAt: new Date().toISOString(),
    };

    const newNotifications = [...data.notifications];

    if (isCompleted && goal.status !== 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      newNotifications.unshift({
        id: `notif-goal-achieved-${Date.now()}`,
        userId: user.id,
        title: 'Goal Achieved! 🎉',
        message: `Congratulations! You reached your full target for "${goal.name}" (${formatAmount(newAmount)}).`,
        type: 'savings_milestone',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'savings',
        linkId: goal.id,
      });
    }

    const updatedGoals = data.savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: newAmount,
          status: isCompleted ? ('completed' as const) : g.status,
        };
      }
      return g;
    });

    persistData({
      ...data,
      savingsGoals: updatedGoals,
      savingsContributions: [contribution, ...data.savingsContributions],
      notifications: newNotifications,
    });

    showToast(`Added ${formatAmount(amount)} to "${goal.name}"`, 'success');
    return { success: true };
  };

  const recordGoalWithdrawal = (
    goalId: string,
    amount: number,
    notes?: string
  ): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'Unauthorized' };
    if (amount <= 0) {
      showToast('Withdrawal amount must be greater than zero.', 'error');
      return { success: false, error: 'Amount must be greater than zero.' };
    }

    const goal = data.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found' };

    if (amount > goal.currentAmount) {
      const msg = `Cannot withdraw ${formatAmount(amount)}: current goal balance is only ${formatAmount(goal.currentAmount)}.`;
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    const newAmount = Math.round((goal.currentAmount - amount) * 100) / 100;
    const contribution: SavingsContribution = {
      id: `sc-w-${Date.now()}`,
      goalId,
      userId: user.id,
      amount,
      type: 'withdrawal',
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Goal withdrawal',
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = data.savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: newAmount,
          status: g.status === 'completed' && newAmount < g.targetAmount ? ('in_progress' as const) : g.status,
        };
      }
      return g;
    });

    persistData({
      ...data,
      savingsGoals: updatedGoals,
      savingsContributions: [contribution, ...data.savingsContributions],
    });

    showToast(`Recorded withdrawal of ${formatAmount(amount)} from "${goal.name}"`, 'info');
    return { success: true };
  };

  // ---------------- Recurring Transactions CRUD ----------------
  const addRecurring = (rule: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newRule: RecurringTransaction = {
      ...rule,
      id: `rec-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    persistData({
      ...data,
      recurringTransactions: [...data.recurringTransactions, newRule],
    });
    showToast(`Recurring rule "${rule.description}" scheduled`, 'success');
  };

  const updateRecurring = (id: string, updates: Partial<RecurringTransaction>) => {
    const updated = data.recurringTransactions.map((r) => (r.id === id ? { ...r, ...updates } : r));
    persistData({ ...data, recurringTransactions: updated });
    showToast('Recurring rule updated', 'success');
  };

  const toggleRecurringStatus = (id: string) => {
    const updated = data.recurringTransactions.map((r) => {
      if (r.id === id) {
        const nextStatus = r.status === 'active' ? 'paused' : 'active';
        showToast(`Rule "${r.description}" ${nextStatus}`, 'info');
        return { ...r, status: nextStatus as 'active' | 'paused' };
      }
      return r;
    });
    persistData({ ...data, recurringTransactions: updated });
  };

  const deleteRecurring = (id: string) => {
    const updated = data.recurringTransactions.filter((r) => r.id !== id);
    persistData({ ...data, recurringTransactions: updated });
    showToast('Recurring rule deleted', 'info');
  };

  // Process due recurring transactions with idempotency protection
  const processDueRecurring = (): { processedCount: number; message: string } => {
    if (!user) return { processedCount: 0, message: 'Unauthorized' };
    const today = new Date().toISOString().split('T')[0];

    const activeRules = data.recurringTransactions.filter((r) => r.status === 'active' && r.nextDueDate <= today);

    if (activeRules.length === 0) {
      showToast('No overdue or pending recurring transactions at this time.', 'info');
      return { processedCount: 0, message: 'All recurring transactions are up to date.' };
    }

    const newTransactions: Transaction[] = [];
    const newLogs: RecurringExecutionLog[] = [];
    const updatedRules = [...data.recurringTransactions];

    for (const rule of activeRules) {
      // Check execution log for idempotency (same rule and occurrence date)
      const alreadyExecuted = data.recurringExecutionLogs.some(
        (log) => log.recurringId === rule.id && log.scheduledDate === rule.nextDueDate
      );

      if (alreadyExecuted) {
        // Skip duplicate generation; advance date if needed
        const ruleIndex = updatedRules.findIndex((r) => r.id === rule.id);
        if (ruleIndex !== -1) {
          updatedRules[ruleIndex] = {
            ...updatedRules[ruleIndex],
            nextDueDate: SpendWiseStorageService.calculateNextOccurrence(rule.nextDueDate, rule.frequency),
          };
        }
        continue;
      }

      const txId = `tx-rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const tx: Transaction = {
        id: txId,
        userId: user.id,
        type: rule.type,
        amount: rule.amount,
        categoryId: rule.categoryId,
        description: `${rule.description} (Recurring)`,
        date: rule.nextDueDate,
        paymentMethod: rule.paymentMethod,
        notes: `Processed from recurring rule: ${rule.frequency}`,
        createdAt: new Date().toISOString(),
        recurringId: rule.id,
      };
      newTransactions.push(tx);

      const log: RecurringExecutionLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        recurringId: rule.id,
        userId: user.id,
        scheduledDate: rule.nextDueDate,
        executedAt: new Date().toISOString(),
        transactionId: txId,
        amount: rule.amount,
        description: rule.description,
      };
      newLogs.push(log);

      // Advance next due date safely
      const nextDue = SpendWiseStorageService.calculateNextOccurrence(rule.nextDueDate, rule.frequency);
      const ruleIndex = updatedRules.findIndex((r) => r.id === rule.id);
      if (ruleIndex !== -1) {
        updatedRules[ruleIndex] = {
          ...updatedRules[ruleIndex],
          nextDueDate: nextDue,
        };
      }
    }

    if (newTransactions.length > 0) {
      persistData({
        ...data,
        transactions: [...newTransactions, ...data.transactions],
        recurringTransactions: updatedRules,
        recurringExecutionLogs: [...newLogs, ...data.recurringExecutionLogs],
      });
      const msg = `Successfully processed ${newTransactions.length} recurring transaction(s).`;
      showToast(msg, 'success');
      return { processedCount: newTransactions.length, message: msg };
    }

    return { processedCount: 0, message: 'All scheduled occurrences are already up to date.' };
  };

  // ---------------- Notifications ----------------
  const markNotificationRead = (id: string) => {
    const updated = data.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persistData({ ...data, notifications: updated });
  };

  const markAllNotificationsRead = () => {
    const updated = data.notifications.map((n) => ({ ...n, read: true }));
    persistData({ ...data, notifications: updated });
    showToast('All notifications marked as read', 'info');
  };

  const deleteNotification = (id: string) => {
    const updated = data.notifications.filter((n) => n.id !== id);
    persistData({ ...data, notifications: updated });
  };

  // ---------------- Utilities ----------------
  const loadSampleData = () => {
    if (!user) return;
    const sampleBundle = SpendWiseStorageService.loadSampleDataForUser(user.id);
    setData(sampleBundle);
    showToast('Loaded sample transactions, budgets, and savings goals.', 'success');
  };

  const resetToDemo = () => {
    if (!user) return;
    const sampleBundle = SpendWiseStorageService.loadSampleDataForUser(user.id);
    setData(sampleBundle);
    showToast('Loaded sample financial dataset.', 'success');
  };

  const clearUserData = () => {
    if (!user) return;
    const cleared: UserFinancialData = {
      profile: user,
      categories: [...DEFAULT_CATEGORIES],
      transactions: [],
      budgets: [],
      savingsGoals: [],
      savingsContributions: [],
      recurringTransactions: [],
      recurringExecutionLogs: [],
      notifications: [],
    };
    persistData(cleared);
    showToast('Cleared all custom transactions, budgets and goals', 'info');
  };

  const exportDataJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `SpendWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    showToast('Full account backup JSON downloaded', 'success');
  };

  const importDataJson = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.transactions || !parsed.categories) {
        throw new Error('Invalid SpendWise backup file schema.');
      }
      persistData(parsed);
      showToast('SpendWise backup data restored successfully!', 'success');
      return { success: true, message: 'Import successful' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid JSON file';
      showToast(`Import error: ${errMsg}`, 'error');
      return { success: false, message: errMsg };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        data,
        currency,
        currencyConfig,
        currencySymbol,
        currencyFormat,
        setCurrency,
        setCurrencyFormat,
        formatAmount,
        summary,
        budgetStatuses,
        insights,
        activeTab,
        setActiveTab,
        quickAddOpen,
        setQuickAddOpen,
        toast,
        showToast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalContribution,
        recordGoalWithdrawal,
        addRecurring,
        updateRecurring,
        toggleRecurringStatus,
        deleteRecurring,
        processDueRecurring,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        unreadNotificationsCount,
        loadSampleData,
        resetToDemo,
        clearUserData,
        exportDataJson,
        importDataJson,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
