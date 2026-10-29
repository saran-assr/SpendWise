import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  Info,
  TrendingDown,
} from 'lucide-react';
import { Budget } from '../types';
import { useFinance } from '../context/FinanceContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { computeBudgetStatuses } from '../utils/calculations';

interface BudgetsPageProps {
  onOpenAddModal: () => void;
  onEditBudget: (b: Budget) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ onOpenAddModal, onEditBudget }) => {
  const { data, currency, formatAmount, deleteBudget } = useFinance();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  // Compute live budget statuses for selected month/year
  const statuses = useMemo(() => {
    return computeBudgetStatuses(
      data.budgets,
      data.transactions,
      data.categories,
      selectedMonth,
      selectedYear
    );
  }, [data.budgets, data.transactions, data.categories, selectedMonth, selectedYear]);

  // Overall budget if any
  const overallBudget = statuses.find((s) => s.budget.categoryId === null);
  const categoryBudgets = statuses.filter((s) => s.budget.categoryId !== null);

  // Total monthly expenses
  const totalMonthlyExpenses = useMemo(() => {
    return data.transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const [y, m] = t.date.split('-').map(Number);
        return y === selectedYear && m === selectedMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [data.transactions, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure monthly category limits and track real-time utilization.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month / Year Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent px-2 py-1 focus:outline-hidden font-semibold text-slate-800"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent px-2 py-1 focus:outline-hidden font-semibold text-slate-800"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Overall Budget or Monthly Spending Summary */}
      {overallBudget ? (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  Overall Monthly Spending Cap
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    overallBudget.status === 'exceeded'
                      ? 'bg-rose-100 text-rose-700'
                      : overallBudget.status === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {overallBudget.status === 'exceeded'
                    ? 'Limit Exceeded'
                    : overallBudget.status === 'warning'
                    ? 'Approaching Limit'
                    : 'On Track'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {months.find((m) => m.num === selectedMonth)?.name} {selectedYear} Expense Ceiling
              </h3>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase block">Total Spent</span>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {formatAmount(overallBudget.spentAmount)}
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase block">Ceiling Limit</span>
                <span className="text-2xl font-mono font-bold text-gray-500">
                  {formatAmount(overallBudget.limitAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onEditBudget(overallBudget.budget)}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#635BFF] hover:bg-indigo-50"
                  title="Edit overall budget"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBudgetToDelete(overallBudget.budget)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete overall budget"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallBudget.status === 'exceeded'
                  ? 'bg-rose-500'
                  : overallBudget.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallBudget.utilizationPercentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>
              {overallBudget.remainingAmount >= 0 ? (
                <span className="text-emerald-700 font-semibold">
                  {formatAmount(overallBudget.remainingAmount)} remaining
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">
                  Exceeded by {formatAmount(Math.abs(overallBudget.remainingAmount))}
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-gray-700">{overallBudget.utilizationPercentage}% utilized</span>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50/60 p-5 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">No overall monthly limit set</h4>
              <p className="text-xs text-gray-600">
                Total expenses recorded for {months.find((m) => m.num === selectedMonth)?.name}:{' '}
                <span className="font-mono font-bold text-gray-900">{formatAmount(totalMonthlyExpenses)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-bold text-[#635BFF] bg-white border border-indigo-200 rounded-xl shadow-2xs hover:bg-indigo-50"
          >
            Add Overall Spending Ceiling
          </button>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">
            Category Budgets ({categoryBudgets.length})
          </h3>
          <span className="text-xs text-gray-400">
            {months.find((m) => m.num === selectedMonth)?.name} {selectedYear}
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E6E9F0] text-center">
            <PieIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-800">No category budgets for this month</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Allocate limits to Food & Dining, Groceries, Transport, or Entertainment to prevent overspending.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-bold text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-xl shadow-xs"
            >
              Set Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => (
              <div
                key={b.budget.id}
                className="bg-white rounded-3xl p-5 border border-[#E6E9F0] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: b.categoryColor }}
                      >
                        <IconRenderer name={b.categoryIcon} size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{b.categoryName}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            b.status === 'exceeded'
                              ? 'bg-rose-100 text-rose-700'
                              : b.status === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {b.status === 'exceeded'
                            ? 'Over Budget'
                            : b.status === 'warning'
                            ? 'Approaching Limit'
                            : 'On Track'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditBudget(b.budget)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#635BFF] hover:bg-indigo-50"
                        title="Edit budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setBudgetToDelete(b.budget)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Utilization Metric */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xl font-mono font-bold text-gray-900">
                      {formatAmount(b.spentAmount)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      of {formatAmount(b.limitAmount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.status === 'exceeded'
                          ? 'bg-rose-500'
                          : b.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.utilizationPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-medium pt-2 border-t border-gray-100 text-gray-500">
                  <span>
                    {b.remainingAmount >= 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        {formatAmount(b.remainingAmount)} left
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        -{formatAmount(Math.abs(b.remainingAmount))} over
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-gray-700">{b.utilizationPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Budget Dialog */}
      <ConfirmDialog
        isOpen={Boolean(budgetToDelete)}
        title="Delete Monthly Budget"
        message="Are you sure you want to remove this budget? Transactions categorized in this group will not be deleted, but budget alerts and progress bars for this limit will be removed."
        confirmLabel="Confirm Delete"
        variant="danger"
        onConfirm={() => {
          if (budgetToDelete) deleteBudget(budgetToDelete.id);
        }}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
};
