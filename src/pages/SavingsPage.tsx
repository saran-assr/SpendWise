import React, { useState } from 'react';
import {
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { useFinance } from '../context/FinanceContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { GoalContributionModal } from '../components/modals/GoalContributionModal';

interface SavingsPageProps {
  onOpenAddModal: () => void;
  onEditGoal: (g: SavingsGoal) => void;
}

export const SavingsPage: React.FC<SavingsPageProps> = ({ onOpenAddModal, onEditGoal }) => {
  const { data, formatAmount, deleteGoal } = useFinance();

  const [activeGoalForContribution, setActiveGoalForContribution] = useState<SavingsGoal | null>(null);
  const [historyGoal, setHistoryGoal] = useState<SavingsGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Filter contributions for the modal
  const selectedGoalContributions = historyGoal
    ? data.savingsContributions.filter((c) => c.goalId === historyGoal.id)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track dedicated savings targets, record deposits, and monitor milestone completion.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Goals Grid */}
      {data.savingsGoals.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No savings targets created yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
            Create a goal for an emergency fund, home improvement, vehicle, or upcoming project.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.savingsGoals.map((goal) => {
            const pct = Math.min(
              100,
              Math.max(0, Math.round((goal.currentAmount / Math.max(goal.targetAmount, 1)) * 100))
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                          {goal.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : goal.status === 'paused'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit goal details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Amounts & Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-mono font-bold text-slate-900">
                        {formatAmount(goal.currentAmount)}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        Target: {formatAmount(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-slate-900'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>{pct}% funded</span>
                      <span>
                        {remaining > 0 ? `${formatAmount(remaining)} remaining` : 'Target achieved'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target Date: {goal.targetDate}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveGoalForContribution(goal)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit / Withdraw</span>
                  </button>

                  <button
                    onClick={() => setHistoryGoal(goal)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="View contribution history log"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contribution Audit Trail Modal */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Contribution Audit Log</h3>
                <p className="text-xs text-slate-500">{historyGoal.name}</p>
              </div>
              <button
                onClick={() => setHistoryGoal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center mb-4 text-xs font-semibold border border-slate-200">
              <span className="text-slate-600">Current Ledger Balance:</span>
              <span className="font-mono font-bold text-base text-slate-900">
                {formatAmount(historyGoal.currentAmount)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {selectedGoalContributions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No individual contribution history recorded for this goal yet.
                </div>
              ) : (
                selectedGoalContributions.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          c.type === 'deposit'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.type === 'deposit' ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 capitalize">
                          {c.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </p>
                        <p className="text-[11px] text-slate-400">{c.notes || 'Direct allocation'} • {c.date}</p>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs ${
                        c.type === 'deposit' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {c.type === 'deposit' ? '+' : '-'}
                      {formatAmount(c.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryGoal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Goal Modal (Deposit or Withdrawal) */}
      {activeGoalForContribution && (
        <GoalContributionModal
          isOpen={Boolean(activeGoalForContribution)}
          onClose={() => setActiveGoalForContribution(null)}
          goal={activeGoalForContribution}
        />
      )}

      {/* Delete Goal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete "${goalToDelete?.name}"? Goal balances and its contribution history log will be removed.`}
        confirmLabel="Confirm Delete"
        variant="danger"
        onConfirm={() => {
          if (goalToDelete) deleteGoal(goalToDelete.id);
        }}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
};
