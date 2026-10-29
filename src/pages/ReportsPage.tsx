import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { calculateSummary, sanitizeCsvCell } from '../utils/calculations';

type TimeFilter = 'week' | 'month' | 'prev_month' | '3_months' | '6_months' | '12_months' | 'custom';

export const ReportsPage: React.FC = () => {
  const { data, currency, currencySymbol, formatAmount } = useFinance();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('6_months');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Category Map
  const categoryMap = useMemo(() => {
    return new Map(data.categories.map((c) => [c.id, c]));
  }, [data.categories]);

  // Filter transactions according to selected range
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const [y, m, d] = t.date.split('-').map(Number);
      const txDate = new Date(y, m - 1, d);

      if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txDate >= weekAgo;
      }
      if (timeFilter === 'month') {
        return y === currentYear && m === currentMonth;
      }
      if (timeFilter === 'prev_month') {
        const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
        return y === prevY && m === prevM;
      }
      if (timeFilter === '3_months') {
        const threeMAgo = new Date();
        threeMAgo.setMonth(threeMAgo.getMonth() - 3);
        return txDate >= threeMAgo;
      }
      if (timeFilter === '6_months') {
        const sixMAgo = new Date();
        sixMAgo.setMonth(sixMAgo.getMonth() - 6);
        return txDate >= sixMAgo;
      }
      if (timeFilter === '12_months') {
        const twelveMAgo = new Date();
        twelveMAgo.setFullYear(twelveMAgo.getFullYear() - 1);
        return txDate >= twelveMAgo;
      }
      if (timeFilter === 'custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [data.transactions, timeFilter, customStart, customEnd, currentMonth, currentYear]);

  // Aggregated summary
  const summary = useMemo(() => {
    return calculateSummary(filteredTransactions);
  }, [filteredTransactions]);

  // Monthly summary breakdown table & trend data
  const monthlyBreakdown = useMemo(() => {
    const map: Record<string, { key: string; label: string; income: number; expense: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[k] = {
        key: k,
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        income: 0,
        expense: 0,
      };
    }

    for (const t of data.transactions) {
      const [y, m] = t.date.split('-').map(Number);
      const k = `${y}-${String(m).padStart(2, '0')}`;
      if (map[k]) {
        if (t.type === 'income') map[k].income += t.amount;
        else map[k].expense += t.amount;
      }
    }

    return Object.values(map)
      .map((item) => {
        const inc = Math.round(item.income * 100) / 100;
        const exp = Math.round(item.expense * 100) / 100;
        const net = Math.round((inc - exp) * 100) / 100;
        const rate = inc > 0 ? Math.round(((inc - exp) / inc) * 1000) / 10 : 0;
        return {
          ...item,
          income: inc,
          expense: exp,
          netFlow: net,
          savingsRate: rate,
        };
      })
      .filter((item) => item.income > 0 || item.expense > 0);
  }, [data.transactions, currentYear, currentMonth]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const catTotals: Record<string, number> = {};
    for (const t of filteredTransactions) {
      if (t.type === 'expense') {
        catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
      }
    }

    const totalExpense = summary.totalExpenses || 1;
    return Object.entries(catTotals)
      .map(([catId, amt]) => {
        const cat = categoryMap.get(catId);
        return {
          id: catId,
          name: cat?.name || 'Other',
          color: cat?.color || '#94A3B8',
          amount: Math.round(amt * 100) / 100,
          percentage: Math.round((amt / totalExpense) * 1000) / 10,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summary.totalExpenses, categoryMap]);

  // Export Monthly Summary Report to CSV
  const handleExportReportCsv = () => {
    const headers = ['Month', 'Income', 'Expenses', 'Net Cash Flow', 'Savings Rate (%)', 'Currency'];
    const rows = monthlyBreakdown.map((m) => [
      sanitizeCsvCell(m.label),
      sanitizeCsvCell(m.income.toFixed(2)),
      sanitizeCsvCell(m.expense.toFixed(2)),
      sanitizeCsvCell(m.netFlow.toFixed(2)),
      sanitizeCsvCell(m.savingsRate.toFixed(1)),
      sanitizeCsvCell(currency),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SpendWise_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical trends, category distribution, and monthly savings ratios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportReportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Presets Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center flex-wrap gap-1 font-medium text-slate-600 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'prev_month', label: 'Last Month' },
            { id: '3_months', label: 'Last 3 Months' },
            { id: '6_months', label: 'Last 6 Months' },
            { id: '12_months', label: 'Last 12 Months' },
            { id: 'custom', label: 'Custom' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setTimeFilter(preset.id as TimeFilter)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeFilter === preset.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 font-medium text-slate-900"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 font-medium text-slate-900"
            />
          </div>
        )}
      </div>

      {/* KPI Cards for the Selected Range */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Inflow
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-600">
            {formatAmount(summary.totalIncome)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Outflow
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-rose-600">
            {formatAmount(summary.totalExpenses)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Net Cash Flow
          </span>
          <span
            className={`text-xl sm:text-2xl font-mono font-bold ${
              summary.netCashFlow >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {summary.netCashFlow >= 0 ? '+' : ''}
            {formatAmount(summary.netCashFlow)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Savings Rate
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-amber-600">
            {summary.savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      {data.transactions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Net Flow Trajectory Area/Line */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Historical Net Cash Flow</h3>
            <p className="text-xs text-slate-500 mb-4">Surplus vs deficit trajectory by month</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${val / 1000}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), 'Net Flow']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netFlow"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#0f172a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Savings Rate Trend */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Savings Rate Trend (%)</h3>
            <p className="text-xs text-slate-500 mb-4">Percentage of earnings retained over time</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Savings Rate']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="savingsRate" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center max-w-sm mx-auto shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">
            No transaction records yet. Charts and ratios will display once income or expenses are logged.
          </p>
        </div>
      )}

      {/* Category Expense Distribution Ranking */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Expense Distribution by Category</h3>
        <p className="text-xs text-slate-500 mb-4">Proportionate breakdown of expenses for this period</p>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No expenses in this timeframe.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-800">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-900">{formatAmount(cat.amount)}</span>
                    <span className="text-slate-400 font-medium w-12 text-right">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Monthly Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Monthly Ledger Summary Table</h3>
          <p className="text-xs text-slate-500">Official financial summary records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Month</th>
                <th className="py-3 px-5 text-right">Total Inflow</th>
                <th className="py-3 px-5 text-right">Total Outflow</th>
                <th className="py-3 px-5 text-right">Net Cash Flow</th>
                <th className="py-3 px-5 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {monthlyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-sans">
                    No monthly activity recorded yet.
                  </td>
                </tr>
              ) : (
                monthlyBreakdown.map((m) => (
                  <tr key={m.key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-sans font-medium text-slate-900">{m.label}</td>
                    <td className="py-3 px-5 text-right text-emerald-600 font-semibold">
                      +{formatAmount(m.income)}
                    </td>
                    <td className="py-3 px-5 text-right text-rose-600 font-semibold">
                      -{formatAmount(m.expense)}
                    </td>
                    <td className="py-3 px-5 text-right font-semibold">
                      <span className={m.netFlow >= 0 ? 'text-slate-900' : 'text-rose-600'}>
                        {m.netFlow >= 0 ? '+' : ''}
                        {formatAmount(m.netFlow)}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-sans font-medium text-slate-700">
                      {m.savingsRate.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
