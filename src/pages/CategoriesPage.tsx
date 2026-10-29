import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { useFinance } from '../context/FinanceContext';
import { IconRenderer } from '../components/common/IconRenderer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface CategoriesPageProps {
  onOpenAddModal: () => void;
  onEditCategory: (cat: Category) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onOpenAddModal,
  onEditCategory,
}) => {
  const { data, formatAmount, deleteCategory } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  // Compute transactions and totals per category
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const amounts: Record<string, number> = {};

    for (const t of data.transactions) {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
      amounts[t.categoryId] = (amounts[t.categoryId] || 0) + t.amount;
    }

    return { counts, amounts };
  }, [data.transactions]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    return data.categories.filter((c) => {
      if (c.type !== selectedType) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.categories, selectedType, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Financial Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize transactions into custom groups, distinct colors, and income/expense ledgers.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter and Tab Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setSelectedType('expense')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedType === 'expense'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Expense Categories</span>
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedType === 'income'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Income Categories</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const txCount = categoryStats.counts[cat.id] || 0;
          const totalAmount = categoryStats.amounts[cat.id] || 0;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconRenderer name={cat.icon} size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      {cat.name}
                      {cat.isDefault && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium capitalize">
                      {cat.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditCategory(cat)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!cat.isDefault && (
                    <button
                      onClick={() => setCatToDelete(cat)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatAmount(totalAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center max-w-sm mx-auto shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">
            No {selectedType} categories matching &ldquo;{search}&rdquo;.
          </p>
        </div>
      )}

      {/* Delete Category Dialog */}
      <ConfirmDialog
        isOpen={Boolean(catToDelete)}
        title="Delete Category"
        message={`Are you sure you want to delete "${catToDelete?.name}"? Transactions assigned to this category will retain their history.`}
        confirmLabel="Confirm Delete"
        variant="danger"
        onConfirm={() => {
          if (catToDelete) deleteCategory(catToDelete.id);
        }}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  );
};
