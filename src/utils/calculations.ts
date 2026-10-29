import { Transaction, Budget, Category } from '../types';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number; // percentage
  transactionCount: number;
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpenses += t.amount;
    }
  }

  // Round to 2 decimal places to avoid floating point precision artifacts
  totalIncome = Math.round(totalIncome * 100) / 100;
  totalExpenses = Math.round(totalExpenses * 100) / 100;
  const netCashFlow = Math.round((totalIncome - totalExpenses) * 100) / 100;

  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 10000) / 100;
  }

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    transactionCount: transactions.length,
  };
}

export interface BudgetStatusResult {
  budget: Budget;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: 'on_track' | 'warning' | 'exceeded';
}

export function computeBudgetStatuses(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: number,
  selectedYear: number
): BudgetStatusResult[] {
  // Filter expense transactions for this month and year
  const monthlyExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === selectedYear && m === selectedMonth;
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return budgets
    .filter((b) => b.month === selectedMonth && b.year === selectedYear)
    .map((b) => {
      let spent = 0;
      let catName = 'Overall Monthly Limit';
      let catColor = '#635BFF';
      let catIcon = 'DollarSign';

      if (b.categoryId) {
        const cat = categoryMap.get(b.categoryId);
        if (cat) {
          catName = cat.name;
          catColor = cat.color;
          catIcon = cat.icon;
        }
        spent = monthlyExpenses
          .filter((t) => t.categoryId === b.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        // Overall budget = all expenses for this month
        spent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
      }

      spent = Math.round(spent * 100) / 100;
      const remaining = Math.round((b.limitAmount - spent) * 100) / 100;
      const utilization = b.limitAmount > 0 ? Math.round((spent / b.limitAmount) * 10000) / 100 : 0;

      let status: 'on_track' | 'warning' | 'exceeded' = 'on_track';
      if (utilization >= 100) {
        status = 'exceeded';
      } else if (utilization >= 80) {
        status = 'warning';
      }

      return {
        budget: b,
        categoryName: catName,
        categoryColor: catColor,
        categoryIcon: catIcon,
        limitAmount: b.limitAmount,
        spentAmount: spent,
        remainingAmount: remaining,
        utilizationPercentage: utilization,
        status,
      };
    });
}

export interface SpendingInsight {
  id: string;
  type: 'positive' | 'warning' | 'neutral' | 'achievement';
  title: string;
  message: string;
}

export function generateSpendingInsights(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  currencyCode: string,
  formatCurrencyFn: (val: number, cur: string) => string
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const thisMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalThisMonth > 0) {
    // 1. Highest category insight
    const catTotals: Record<string, number> = {};
    for (const t of thisMonthExpenses) {
      catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
    }

    let topCatId = '';
    let topCatAmount = 0;
    for (const [id, amt] of Object.entries(catTotals)) {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        topCatId = id;
      }
    }

    const topCat = categories.find((c) => c.id === topCatId);
    if (topCat && topCatAmount > 0) {
      const pct = Math.round((topCatAmount / totalThisMonth) * 100);
      insights.push({
        id: 'top-cat',
        type: pct > 40 ? 'warning' : 'neutral',
        title: `${topCat.name} is your top expense`,
        message: `${topCat.name} accounts for ${pct}% (${formatCurrencyFn(topCatAmount, currencyCode)}) of your spending this month.`,
      });
    }
  }

  // 2. Budget utilization insight
  const budgetStatuses = computeBudgetStatuses(budgets, transactions, categories, currentMonth, currentYear);
  const exceededBudgets = budgetStatuses.filter((b) => b.status === 'exceeded');
  const warningBudgets = budgetStatuses.filter((b) => b.status === 'warning');

  if (exceededBudgets.length > 0) {
    const b = exceededBudgets[0];
    insights.push({
      id: `budget-exceeded-${b.budget.id}`,
      type: 'warning',
      title: `${b.categoryName} budget exceeded`,
      message: `You have spent ${formatCurrencyFn(b.spentAmount, currencyCode)}, exceeding your limit of ${formatCurrencyFn(b.limitAmount, currencyCode)} by ${formatCurrencyFn(Math.abs(b.remainingAmount), currencyCode)}.`,
    });
  } else if (warningBudgets.length > 0) {
    const b = warningBudgets[0];
    insights.push({
      id: `budget-warning-${b.budget.id}`,
      type: 'warning',
      title: `${b.categoryName} approaching limit`,
      message: `Your ${b.categoryName} budget is at ${b.utilizationPercentage}% utilization with ${formatCurrencyFn(b.remainingAmount, currencyCode)} remaining.`,
    });
  }

  // 3. Month over Month comparison
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const prevMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === prevYear && m === prevMonth;
  });

  const totalPrevMonth = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalPrevMonth > 0 && totalThisMonth > 0) {
    const diff = totalThisMonth - totalPrevMonth;
    const diffPct = Math.round((Math.abs(diff) / totalPrevMonth) * 100);

    if (diff < 0) {
      insights.push({
        id: 'mom-saving',
        type: 'positive',
        title: 'Spending less than last month',
        message: `You have spent ${diffPct}% less (${formatCurrencyFn(Math.abs(diff), currencyCode)}) compared to the same time last month.`,
      });
    } else if (diff > 0 && diffPct > 15) {
      insights.push({
        id: 'mom-increase',
        type: 'neutral',
        title: 'Spending trend increased',
        message: `Your expenses are currently ${diffPct}% higher than last month's total at this stage.`,
      });
    }
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      id: 'default-welcome',
      type: 'positive',
      title: 'Healthy Financial Tracking',
      message: 'Keep logging your regular transactions to reveal rich cash flow insights, budget forecasts, and savings trends.',
    });
  }

  return insights;
}

/**
 * Sanitizes a cell for CSV export to prevent spreadsheet formula injection.
 * Escapes formulas starting with =, +, -, @, \t, \r
 */
export function sanitizeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  let str = String(cell);
  // Neutralize formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  currencyCode: string
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method', 'Notes'];

  const rows = transactions.map((t) => [
    sanitizeCsvCell(t.date),
    sanitizeCsvCell(t.type.toUpperCase()),
    sanitizeCsvCell(categoryMap.get(t.categoryId) || 'Uncategorized'),
    sanitizeCsvCell(t.description),
    sanitizeCsvCell(t.amount.toFixed(2)),
    sanitizeCsvCell(currencyCode),
    sanitizeCsvCell(t.paymentMethod),
    sanitizeCsvCell(t.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
