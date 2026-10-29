import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (type) {
      case 'error':
        return 'border-rose-200 bg-rose-50/90 text-rose-900';
      case 'info':
        return 'border-indigo-200 bg-indigo-50/90 text-indigo-900';
      case 'success':
      default:
        return 'border-emerald-200 bg-emerald-50/90 text-emerald-900';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 max-w-md ${getBorder()}`}
    >
      {getIcon()}
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors ml-auto"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
