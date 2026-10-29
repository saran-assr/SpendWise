import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SavingsGoal, GoalStatus } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: SavingsGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, initialGoal }) => {
  const { currency, addGoal, updateGoal } = useFinance();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetAmount(String(initialGoal.targetAmount));
      setTargetDate(initialGoal.targetDate);
      setDescription(initialGoal.description || '');
      setStatus(initialGoal.status);
    } else {
      setName('');
      setTargetAmount('');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
      setDescription('');
      setStatus('in_progress');
    }
    setErrors({});
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(targetAmount);

    if (!name.trim()) errs.name = 'Goal name is required.';
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.targetAmount = 'Target amount must be greater than 0.';
    }
    if (!targetDate) errs.targetDate = 'Target completion date is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = parseFloat(targetAmount);

    if (initialGoal) {
      updateGoal(initialGoal.id, {
        name: name.trim(),
        targetAmount: parsedAmount,
        targetDate,
        description: description.trim() || undefined,
        status,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: parsedAmount,
        targetDate,
        description: description.trim() || undefined,
        status: 'in_progress',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {initialGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Target Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10000.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
            {errors.targetAmount && <p className="text-xs text-rose-600 mt-1">{errors.targetAmount}</p>}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
            />
            {errors.targetDate && <p className="text-xs text-rose-600 mt-1">{errors.targetDate}</p>}
          </div>

          {/* Status if editing */}
          {initialGoal && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Goal Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Milestone notes or purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

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
              {initialGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
