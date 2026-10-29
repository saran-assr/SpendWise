import React, { useState, useMemo } from 'react';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  History,
  Calendar,
  Clock,
  X,
  Zap,
} from 'lucide-react';
import { RecurringTransaction } from '../types';
import { useFinance } from '../context/FinanceContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface RecurringPageProps {
  onOpenAddModal: () => void;
  onEditRule: (r: RecurringTransaction) => void;
}

export const RecurringPage: React.FC<RecurringPageProps> = ({ onOpenAddModal, onEditRule }) => {
  const {
    data,
    formatAmount,
    toggleRecurringStatus,
    deleteRecurring,
    processDueRecurring,
  } = useFinance();

  const [ruleToDelete, setRuleToDelete] = useState<RecurringTransaction | null>(null);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const categoryMap = useMemo(() => {
    return new Map(data.categories.map((c) => [c.id, c]));
  }, [data.categories]);

  // Overdue count
  const overdueCount = useMemo(() => {
    return data.recurringTransactions.filter((r) => r.status === 'active' && r.nextDueDate <= today).length;
  }, [data.recurringTransactions, today]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Recurring Schedules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage routine subscriptions, rent, and payroll with verified idempotent execution logs.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setLogsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Execution Audit Log</span>
          </button>

          {overdueCount > 0 && (
            <button
              onClick={processDueRecurring}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Process Due ({overdueCount})</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {/* Overdue / Due Today Banner */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">{overdueCount} recurring transaction(s) are due for processing.</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                SpendWise checks execution records to prevent duplicate transactions.
              </p>
            </div>
          </div>
          <button
            onClick={processDueRecurring}
            className="px-3.5 py-1.5 rounded-lg font-medium bg-amber-700 text-white hover:bg-amber-800 shadow-sm whitespace-nowrap transition-colors"
          >
            Process Occurrences
          </button>
        </div>
      )}

      {/* Rules Grid */}
      {data.recurringTransactions.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No recurring rules scheduled</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
            Automate monthly housing rent, payroll, subscriptions, or utility bills with custom schedules.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
          >
            Create First Schedule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.recurringTransactions.map((rule) => {
            const cat = categoryMap.get(rule.categoryId);
            const isDueOrOverdue = rule.status === 'active' && rule.nextDueDate <= today;

            return (
              <div
                key={rule.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: cat?.color || '#475569' }}
                      >
                        <IconRenderer name={cat?.icon || 'Repeat'} size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-tight">{rule.description}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              rule.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {rule.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium capitalize">
                            {rule.frequency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleRecurringStatus(rule.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={rule.status === 'active' ? 'Pause rule' : 'Resume rule'}
                      >
                        {rule.status === 'active' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                      <button
                        onClick={() => onEditRule(rule)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRuleToDelete(rule)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-3 flex items-baseline justify-between">
                    <span
                      className={`text-xl font-mono font-bold ${
                        rule.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {rule.type === 'income' ? '+' : '-'}
                      {formatAmount(rule.amount)}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{rule.paymentMethod}</span>
                  </div>

                  {rule.notes && (
                    <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {rule.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Next Due:</span>
                    <span
                      className={`font-mono font-semibold ${
                        isDueOrOverdue ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {rule.nextDueDate}
                    </span>
                  </div>

                  {isDueOrOverdue && (
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Due Today
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execution Audit Log Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Execution Audit Log</h3>
                <p className="text-xs text-slate-500">
                  Idempotent records ensuring scheduled transactions are never processed twice.
                </p>
              </div>
              <button
                onClick={() => setLogsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
              {data.recurringExecutionLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No execution logs recorded yet. Click &ldquo;Process Due&rdquo; when scheduled items arrive.
                </div>
              ) : (
                data.recurringExecutionLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{log.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Scheduled: {log.scheduledDate}</span>
                        <span>•</span>
                        <span>Processed: {new Date(log.executedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900">{formatAmount(log.amount)}</span>
                      <span className="block text-[10px] text-emerald-700 font-medium">Logged</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setLogsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Rule Dialog */}
      <ConfirmDialog
        isOpen={Boolean(ruleToDelete)}
        title="Delete Recurring Schedule"
        message={`Are you sure you want to delete recurring rule "${ruleToDelete?.description}"? Existing ledger transactions created from past executions will remain intact.`}
        confirmLabel="Confirm Delete"
        variant="danger"
        onConfirm={() => {
          if (ruleToDelete) deleteRecurring(ruleToDelete.id);
        }}
        onCancel={() => setRuleToDelete(null)}
      />
    </div>
  );
};
