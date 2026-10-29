import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Budget } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBudget?: Budget | null;
  selectedMonth?: number;
  selectedYear?: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  initialBudget,
  selectedMonth,
  selectedYear,
}) => {
  const { data, currency, addBudget, updateBudget } = useFinance();

  const now = new Date();
  const [budgetType, setBudgetType] = useState<'overall' | 'category'>('category');
  const [categoryId, setCategoryId] = useState<string>('');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [month, setMonth] = useState<number>(selectedMonth || now.getMonth() + 1);
  const [year, setYear] = useState<number>(selectedYear || now.getFullYear());
  const [error, setError] = useState<string>('');

  const expenseCategories = data.categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (initialBudget) {
      if (initialBudget.categoryId === null) {
        setBudgetType('overall');
        setCategoryId('');
      } else {
        setBudgetType('category');
        setCategoryId(initialBudget.categoryId);
      }
      setLimitAmount(String(initialBudget.limitAmount));
      setMonth(initialBudget.month);
      setYear(initialBudget.year);
    } else {
      setBudgetType('category');
      setCategoryId(expenseCategories[0]?.id || '');
      setLimitAmount('');
      setMonth(selectedMonth || now.getMonth() + 1);
      setYear(selectedYear || now.getFullYear());
    }
    setError('');
  }, [initialBudget, isOpen, selectedMonth, selectedYear, data.categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(limitAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid monthly limit amount greater than 0.');
      return;
    }

    const targetCategoryId = budgetType === 'category' ? categoryId : null;

    if (budgetType === 'category' && !targetCategoryId) {
      setError('Please choose an expense category.');
      return;
    }

    // Check for duplicate budget in the same month/year
    const duplicate = data.budgets.find(
      (b) =>
        b.id !== initialBudget?.id &&
        b.categoryId === targetCategoryId &&
        b.month === month &&
        b.year === year
    );

    if (duplicate) {
      setError('A budget already exists for this category and month.');
      return;
    }

    if (initialBudget) {
      updateBudget(initialBudget.id, {
        categoryId: targetCategoryId,
        limitAmount: parsedAmount,
        month,
        year,
      });
    } else {
      addBudget({
        categoryId: targetCategoryId,
        limitAmount: parsedAmount,
        month,
        year,
      });
    }

    onClose();
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialBudget ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Scope of Budget
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setBudgetType('category')}
                className={`py-1.5 rounded-md text-xs font-medium transition-all ${
                  budgetType === 'category'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Category Budget
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('overall')}
                className={`py-1.5 rounded-md text-xs font-medium transition-all ${
                  budgetType === 'overall'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall Monthly Limit
              </button>
            </div>
          </div>

          {/* Category Dropdown if category budget */}
          {budgetType === 'category' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Expense Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              >
                {months.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              >
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Monthly Limit Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 500.00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          {error && <p className="text-xs text-rose-600 leading-snug">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              {initialBudget ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
