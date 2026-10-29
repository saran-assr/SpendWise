import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface GoalContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal;
}

export const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { currency, formatAmount, addGoalContribution, recordGoalWithdrawal } = useFinance();

  const [mode, setMode] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (mode === 'withdrawal') {
      if (parsedAmount > goal.currentAmount) {
        setError(
          `Cannot withdraw ${formatAmount(parsedAmount)}. Current goal balance is only ${formatAmount(goal.currentAmount)}.`
        );
        return;
      }
      const res = recordGoalWithdrawal(goal.id, parsedAmount, notes);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to record withdrawal');
      }
    } else {
      const res = addGoalContribution(goal.id, parsedAmount, notes);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to add deposit');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
            </h3>
            <p className="text-xs text-slate-500">{goal.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Indicator */}
        <div className="my-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs font-medium border border-slate-200">
          <span className="text-slate-600">Current Saved Balance:</span>
          <span className="font-mono font-bold text-base text-slate-900">
            {formatAmount(goal.currentAmount)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Deposit vs Withdrawal Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('deposit');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'deposit'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              Deposit
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('withdrawal');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'withdrawal'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              Withdrawal
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Allocation Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 250.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Memo / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder={mode === 'deposit' ? 'Monthly bonus, direct saving...' : 'Emergency car repair...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
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
              className={`px-4 py-2 text-xs font-medium text-white rounded-lg shadow-sm transition-colors ${
                mode === 'deposit'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
