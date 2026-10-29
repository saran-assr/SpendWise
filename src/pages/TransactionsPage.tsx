import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ArrowUpDown,
  ArrowDownRight,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { useFinance } from '../context/FinanceContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { exportTransactionsToCsv } from '../utils/calculations';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { data, currency, formatAmount, deleteTransaction } = useFinance();

  // Search and Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal & Delete Confirm
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const categoryMap = useMemo(() => {
    return new Map(data.categories.map((c) => [c.id, c]));
  }, [data.categories]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...data.transactions];

    // Search query in description or notes
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((t) => t.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }

    // Payment method filter
    if (selectedPaymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === selectedPaymentMethod);
    }

    // Date range
    if (startDate) {
      result = result.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      result = result.filter((t) => t.date <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    data.transactions,
    search,
    selectedType,
    selectedCategory,
    selectedPaymentMethod,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  // Pagination calculation
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Aggregate totals for current filtered subset
  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      net: Math.round((income - expense) * 100) / 100,
    };
  }, [filteredTransactions]);

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, data.categories, currency);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Transactions Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, search, and filter your complete financial ledger with exact decimal calculations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Type Filter Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600 w-full md:w-auto">
            <button
              onClick={() => {
                setSelectedType('all');
                setPage(1);
              }}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-950'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setSelectedType('expense');
                setPage(1);
              }}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'hover:text-gray-950'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setSelectedType('income');
                setPage(1);
              }}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'hover:text-gray-950'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Multi-Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-medium"
            >
              <option value="all">All Categories</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Payment Method
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => {
                setSelectedPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-medium"
            >
              <option value="all">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="UPI / Digital Wallet">UPI / Digital Wallet</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-xl border border-gray-200 bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-xl border border-gray-200 bg-white font-medium"
            />
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{totalItems}</span> matching records:
            </span>
            <span className="font-semibold text-emerald-600">+{formatAmount(filteredTotals.income)}</span>
            <span className="font-semibold text-rose-600">-{formatAmount(filteredTotals.expense)}</span>
            <span className="font-bold font-mono text-gray-900">
              Net: {filteredTotals.net >= 0 ? '+' : ''}
              {formatAmount(filteredTotals.net)}
            </span>
          </div>

          {(search ||
            selectedType !== 'all' ||
            selectedCategory !== 'all' ||
            selectedPaymentMethod !== 'all' ||
            startDate ||
            endDate) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {totalItems === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No transactions found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              {data.transactions.length === 0
                ? 'Your transaction ledger has zero records. Click "New Transaction" above to log your first income or expense.'
                : 'No transactions match your active search and filter criteria.'}
            </p>
            {data.transactions.length > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('description')}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Description</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Payment Method</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-gray-900 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">{tx.date}</td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <span>{tx.description}</span>
                          {tx.recurringId && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-indigo-50 text-[#635BFF]">
                              Recurring
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">{tx.notes}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white text-[11px] font-bold shadow-2xs"
                          style={{ backgroundColor: cat?.color || '#64748B' }}
                        >
                          <IconRenderer name={cat?.icon || 'Tag'} size={12} />
                          <span>{cat?.name || 'Uncategorized'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell text-gray-600 font-medium whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}>
                          {tx.type === 'income' ? '+' : '-'}
                          {formatAmount(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailTx(tx)}
                            title="View Transaction Details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit Transaction"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#635BFF] hover:bg-indigo-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTxToDelete(tx)}
                            title="Delete Transaction"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#E6E9F0] gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-gray-200 rounded-lg bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page • Page {page} of {totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      page === pNum
                        ? 'bg-[#635BFF] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail View Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Transaction Detail
              </span>
              <button
                onClick={() => setDetailTx(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50">
                <span className="text-gray-500 font-semibold">Amount</span>
                <span
                  className={`text-2xl font-mono font-bold ${
                    detailTx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                  }`}
                >
                  {detailTx.type === 'income' ? '+' : '-'}
                  {formatAmount(detailTx.amount)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-semibold">Description</span>
                <span className="font-bold text-gray-900">{detailTx.description}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-semibold">Category</span>
                <span className="font-bold text-gray-900">
                  {categoryMap.get(detailTx.categoryId)?.name || 'Uncategorized'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-semibold">Date</span>
                <span className="font-mono text-gray-900">{detailTx.date}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-semibold">Payment Method</span>
                <span className="font-medium text-gray-900">{detailTx.paymentMethod}</span>
              </div>

              {detailTx.notes && (
                <div className="pt-1">
                  <span className="text-gray-500 font-semibold block mb-1">Notes & Memo</span>
                  <p className="p-3 bg-gray-50 rounded-xl text-gray-700 leading-relaxed">
                    {detailTx.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tx = detailTx;
                  setDetailTx(null);
                  onEditTransaction(tx);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-xl"
              >
                Edit Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${txToDelete?.description}" (${
          txToDelete ? formatAmount(txToDelete.amount) : ''
        })? This will immediately recalculate related budgets and analytics.`}
        confirmLabel="Delete Transaction"
        variant="danger"
        onConfirm={() => {
          if (txToDelete) deleteTransaction(txToDelete.id);
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
