import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Plus,
  AlertTriangle,
  Target,
  Repeat,
  Info,
  ChevronRight,
  Clock,
  PieChart as PieIcon,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { StatCard } from '../components/common/StatCard';
import { IconRenderer } from '../components/common/IconRenderer';
import { calculateSummary } from '../utils/calculations';
import { Transaction } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    data,
    currency,
    currencySymbol,
    formatAmount,
    budgetStatuses,
    insights,
    setActiveTab,
    setQuickAddOpen,
    processDueRecurring,
    loadSampleData,
  } = useFinance();

  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Filter transactions according to selected period
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const [y, m] = t.date.split('-').map(Number);
      if (period === 'this_month') {
        return y === currentYear && m === currentMonth;
      }
      if (period === 'last_month') {
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        return y === prevYear && m === prevMonth;
      }
      return true; // all
    });
  }, [data.transactions, period, currentMonth, currentYear]);

  // Compute metrics for selected period
  const currentSummary = useMemo(() => {
    return calculateSummary(filteredTransactions);
  }, [filteredTransactions]);

  // Prior month summary for genuine comparison
  const prevSummary = useMemo(() => {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const prevTxs = data.transactions.filter((t) => {
      const [y, m] = t.date.split('-').map(Number);
      return y === prevYear && m === prevMonth;
    });

    if (prevTxs.length === 0) return null;
    return calculateSummary(prevTxs);
  }, [data.transactions, currentMonth, currentYear]);

  // Category map
  const categoryMap = useMemo(() => {
    return new Map(data.categories.map((c) => [c.id, c]));
  }, [data.categories]);

  // Only compute trend if prior data genuinely exists
  const incomeTrend = useMemo(() => {
    if (!prevSummary || prevSummary.totalIncome <= 0 || currentSummary.totalIncome <= 0) return undefined;
    const diff = currentSummary.totalIncome - prevSummary.totalIncome;
    const pct = Math.round((diff / prevSummary.totalIncome) * 100);
    return {
      value: `${pct >= 0 ? '+' : ''}${pct}%`,
      isPositive: pct >= 0,
      label: 'vs last month',
    };
  }, [currentSummary.totalIncome, prevSummary]);

  const expenseTrend = useMemo(() => {
    if (!prevSummary || prevSummary.totalExpenses <= 0 || currentSummary.totalExpenses <= 0) return undefined;
    const diff = currentSummary.totalExpenses - prevSummary.totalExpenses;
    const pct = Math.round((diff / prevSummary.totalExpenses) * 100);
    return {
      value: `${pct >= 0 ? '+' : ''}${pct}%`,
      isPositive: pct <= 0,
      label: 'vs last month',
    };
  }, [currentSummary.totalExpenses, prevSummary]);

  // 1. Data for Income vs Expense Chart over recent 6 months
  const monthlyBarData = useMemo(() => {
    const monthsMap: Record<string, { month: string; income: number; expense: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = {
        month: monthNames[d.getMonth()],
        income: 0,
        expense: 0,
      };
    }

    for (const t of data.transactions) {
      const [y, m] = t.date.split('-').map(Number);
      const key = `${y}-${String(m).padStart(2, '0')}`;
      if (monthsMap[key]) {
        if (t.type === 'income') {
          monthsMap[key].income += t.amount;
        } else {
          monthsMap[key].expense += t.amount;
        }
      }
    }

    return Object.values(monthsMap).map((item) => ({
      ...item,
      income: Math.round(item.income * 100) / 100,
      expense: Math.round(item.expense * 100) / 100,
    }));
  }, [data.transactions, currentYear, currentMonth]);

  // 2. Data for Category Distribution Donut Chart
  const categoryPieData = useMemo(() => {
    const catTotals: Record<string, number> = {};
    for (const t of filteredTransactions) {
      if (t.type === 'expense') {
        catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
      }
    }

    return Object.entries(catTotals)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          id: catId,
          name: cat?.name || 'Other',
          color: cat?.color || '#94A3B8',
          amount: Math.round(amount * 100) / 100,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap]);

  // Recurring upcoming
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingRecurring = data.recurringTransactions
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
    .slice(0, 3);

  const overdueCount = data.recurringTransactions.filter(
    (r) => r.status === 'active' && r.nextDueDate <= todayStr
  ).length;

  const hasAnyTransactions = data.transactions.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Member'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal finance ledger and cash flow tracking.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'this_month' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('last_month')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'last_month' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatAmount(currentSummary.totalIncome)}
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
          trend={incomeTrend}
          tooltipText="Total inflow recorded for the selected period."
          variant="income"
        />

        <StatCard
          title="Total Expenses"
          value={formatAmount(currentSummary.totalExpenses)}
          icon={<ArrowDownRight className="w-4 h-4 text-rose-600" />}
          trend={expenseTrend}
          tooltipText="Total expenditure recorded for the selected period."
          variant="expense"
        />

        <StatCard
          title="Net Cash Flow"
          value={`${currentSummary.netCashFlow >= 0 ? '+' : ''}${formatAmount(currentSummary.netCashFlow)}`}
          icon={<DollarSign className="w-4 h-4 text-slate-700" />}
          trend={
            hasAnyTransactions
              ? currentSummary.netCashFlow >= 0
                ? { value: 'Surplus', isPositive: true, label: 'Positive net flow' }
                : { value: 'Deficit', isPositive: false, label: 'Expenses exceed income' }
              : undefined
          }
          tooltipText="Net Cash Flow = Total Income minus Total Expenses for the active period."
          variant="net"
        />

        <StatCard
          title="Savings Rate"
          value={currentSummary.totalIncome > 0 ? `${currentSummary.savingsRate.toFixed(1)}%` : '—'}
          icon={<TrendingUp className="w-4 h-4 text-slate-700" />}
          trend={
            currentSummary.totalIncome > 0
              ? currentSummary.savingsRate >= 20
                ? { value: 'Target Met', isPositive: true, label: 'Above 20% benchmark' }
                : { value: 'In Progress', isPositive: null, label: 'Room for growth' }
              : undefined
          }
          tooltipText="Savings Rate = ((Income - Expenses) / Income) × 100%. Displays '—' when income is zero."
          variant="savings"
        />
      </div>

      {/* REQUIREMENT 5: Meaningful Onboarding Empty State for Brand New Users */}
      {!hasAnyTransactions && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs text-left">
          <div className="max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Welcome to your private SpendWise ledger
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Your account has started with zero personal transactions. Begin by recording your primary income source or logging your regular daily expenses.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Transaction</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('budgets')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                Set Monthly Budget
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('savings')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                Create Savings Goal
              </button>

              <button
                type="button"
                onClick={loadSampleData}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Genuine Spending Insights (only when genuine data exists) */}
      {hasAnyTransactions && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {insights.slice(0, 3).map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-2xs"
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  insight.type === 'warning'
                    ? 'bg-amber-50 text-amber-700'
                    : insight.type === 'positive'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 leading-tight">{insight.title}</h5>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Income vs Expenses</h3>
              <p className="text-xs text-slate-500">Chronological comparison over past 6 months</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              Detailed Reports
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatAmount(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'income' ? 'Income' : 'Expenses')}
                />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expenses" fill="#64748B" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expense Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution by category</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          {categoryPieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <PieIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No expenses recorded</p>
              <p className="text-[11px] text-slate-400 max-w-[180px] mt-0.5">
                Expense breakdown will generate once transactions are logged.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {categoryPieData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatAmount(Number(value)), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
                {categoryPieData.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">{formatAmount(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budgets & Recurring Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Month Budgets</h3>
              <p className="text-xs text-slate-500">Live utilization against limits</p>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              Manage Budgets
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {budgetStatuses.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs font-semibold text-slate-700">No active budgets for this month</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Establish spending caps to keep your outflow aligned with targets.
              </p>
              <button
                onClick={() => setActiveTab('budgets')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Set First Budget
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {budgetStatuses.slice(0, 4).map((b) => (
                <div key={b.budget.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: b.categoryColor }}
                      >
                        <IconRenderer name={b.categoryIcon} size={12} />
                      </div>
                      <span className="font-semibold text-slate-800">{b.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600">
                        {formatAmount(b.spentAmount)} / {formatAmount(b.limitAmount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          b.status === 'exceeded'
                            ? 'bg-rose-100 text-rose-800'
                            : b.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {b.utilizationPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.status === 'exceeded'
                          ? 'bg-rose-500'
                          : b.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(b.utilizationPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recurring Calendar (1 col) */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recurring Schedule</h3>
                <p className="text-xs text-slate-500">Upcoming automated items</p>
              </div>
              <Repeat className="w-4 h-4 text-slate-400" />
            </div>

            {overdueCount > 0 && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{overdueCount} item(s) due today</span>
                </div>
                <button
                  onClick={processDueRecurring}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-2xs"
                >
                  Process
                </button>
              </div>
            )}

            {upcomingRecurring.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recurring rules scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcomingRecurring.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{rule.description}</p>
                      <span className="text-[11px] text-slate-400">
                        Due: {rule.nextDueDate} • {rule.frequency}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-semibold ${
                        rule.type === 'income' ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {rule.type === 'income' ? '+' : '-'}
                      {formatAmount(rule.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('recurring')}
            className="w-full mt-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
          >
            Manage Recurring Rules
          </button>
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Ledger Activity</h3>
            <p className="text-xs text-slate-500">Most recent financial records</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            Open Full Ledger
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transactions recorded yet in this workspace.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.transactions.slice(0, 5).map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#64748B' }}
                    >
                      <IconRenderer name={cat?.icon || 'Tag'} size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{cat?.name || 'General'}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-mono font-bold ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
