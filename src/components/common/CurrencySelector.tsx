import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Search, Check, ChevronDown, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  SUPPORTED_CURRENCIES,
  getAllCurrenciesList,
  CurrencyDisplayFormat,
  CurrencyConfig,
} from '../../constants/currencies';

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false, className = '' }) => {
  const {
    currency,
    currencyConfig,
    currencySymbol,
    currencyFormat,
    setCurrency,
    setCurrencyFormat,
    formatAmount,
  } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'currencies' | 'formats'>('currencies');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allCurrencies = useMemo(() => getAllCurrenciesList(), []);

  // Filtered by search
  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return allCurrencies;
    const q = search.toLowerCase();
    return allCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
    );
  }, [allCurrencies, search]);

  // Group by region
  const groupedCurrencies = useMemo(() => {
    const groups: Record<string, CurrencyConfig[]> = {};
    for (const c of filteredCurrencies) {
      const reg = c.region || 'Other';
      if (!groups[reg]) groups[reg] = [];
      groups[reg].push(c);
    }
    return groups;
  }, [filteredCurrencies]);

  const quickPicks = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'AED', 'SGD', 'CNY', 'CHF', 'BRL'];

  const formatOptions: { id: CurrencyDisplayFormat; title: string; example: string; desc: string }[] = [
    {
      id: 'symbol',
      title: 'Currency Symbol',
      example: formatAmount(1450.5, 'symbol'),
      desc: 'Standard local convention ($1,450.50, ₹1,450.50, 1.450,50 €)',
    },
    {
      id: 'code',
      title: 'ISO Currency Code',
      example: formatAmount(1450.5, 'code'),
      desc: 'Amount followed by 3-letter currency code (1,450.50 USD)',
    },
    {
      id: 'symbol_and_code',
      title: 'Symbol & ISO Code',
      example: formatAmount(1450.5, 'symbol_and_code'),
      desc: 'Both symbol and currency code for absolute clarity ($1,450.50 (USD))',
    },
    {
      id: 'name',
      title: 'Full Currency Name',
      example: formatAmount(1450.5, 'name'),
      desc: 'Amount accompanied by the official currency name',
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change currency and format"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
            : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200 shadow-2xs'
        }`}
      >
        <Globe className={`w-3.5 h-3.5 ${isOpen ? 'text-indigo-400' : 'text-slate-400'}`} />
        <span className="font-mono font-bold">{currencyConfig.code}</span>
        <span className="font-bold opacity-80">({currencySymbol})</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold leading-tight">Global Currency & Formatting</h4>
                <p className="text-[10px] text-slate-400">Selected: {currencyConfig.name} ({currencyConfig.code})</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs: Currencies vs Display Format */}
          <div className="flex border-b border-slate-100 bg-slate-50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('currencies')}
              className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                activeTab === 'currencies'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Currencies ({allCurrencies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('formats')}
              className={`flex-1 py-1.5 rounded-md text-center transition-all flex items-center justify-center gap-1 ${
                activeTab === 'formats'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Format Styles</span>
            </button>
          </div>

          {activeTab === 'currencies' && (
            <div className="p-3">
              {/* Search */}
              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search currency, code or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Quick Picks */}
              {!search && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Popular Currencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {quickPicks.map((pick) => {
                      const cfg = SUPPORTED_CURRENCIES[pick];
                      if (!cfg) return null;
                      const isSelected = currency === pick;
                      return (
                        <button
                          key={pick}
                          type="button"
                          onClick={() => {
                            setCurrency(pick);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {cfg.symbol} {cfg.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scrollable List */}
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
                {Object.entries(groupedCurrencies).map(([region, list]) => (
                  <div key={region} className="pt-2 first:pt-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 px-1">
                      {region}
                    </span>
                    <div className="space-y-0.5">
                      {list.map((c) => {
                        const isSelected = currency === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCurrency(c.code);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                              isSelected
                                ? 'bg-indigo-50/80 text-indigo-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-8 font-mono font-bold text-slate-900">{c.code}</span>
                              <span className="font-mono text-slate-500 font-semibold w-7">{c.symbol}</span>
                              <span className="truncate max-w-[150px]">{c.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredCurrencies.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No currencies matching &ldquo;{search}&rdquo;.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'formats' && (
            <div className="p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Choose Number & Currency Format
              </span>
              <div className="space-y-1.5">
                {formatOptions.map((opt) => {
                  const isSelected = currencyFormat === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCurrencyFormat(opt.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-300 bg-indigo-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-bold text-slate-900">{opt.title}</span>
                        <span className="font-mono font-bold text-indigo-700 text-xs">{opt.example}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Box */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Active Format Preview:
                </span>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-slate-600">Sample Outflow:</span>
                  <span className="font-bold text-rose-700">{formatAmount(-2450.75)}</span>
                </div>
                <div className="flex items-baseline justify-between font-mono mt-0.5">
                  <span className="text-slate-600">Sample Inflow:</span>
                  <span className="font-bold text-emerald-700">{formatAmount(8500.0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
