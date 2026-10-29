import React, { useState } from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean | null;
    label: string;
  };
  tooltipText: string;
  variant?: 'income' | 'expense' | 'net' | 'savings' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  tooltipText,
  variant = 'default',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getValueColor = () => {
    switch (variant) {
      case 'income':
        return 'text-emerald-700';
      case 'expense':
        return 'text-slate-900';
      case 'net':
        return 'text-slate-900';
      case 'savings':
        return 'text-slate-900';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          {title}
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-slate-400 hover:text-slate-600 focus:outline-hidden transition-colors"
              aria-label={`Info about ${title}`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-30 leading-normal font-normal">
                {tooltipText}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>
        </span>

        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mb-2">
        <h4 className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${getValueColor()}`}>
          {value}
        </h4>
      </div>

      {trend ? (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {trend.isPositive === true ? (
            <span className="inline-flex items-center text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : trend.isPositive === false ? (
            <span className="inline-flex items-center text-rose-700 font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-500 font-semibold">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          <span className="text-slate-500">{trend.label}</span>
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-medium">No prior period comparison</div>
      )}
    </div>
  );
};
