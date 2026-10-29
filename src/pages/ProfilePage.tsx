import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SpendWiseStorageService } from '../services/storage';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const isDemoMode = Boolean(user?.isDemoUser);
  const {
    currency,
    currencyFormat,
    setCurrency,
    setCurrencyFormat,
    formatAmount,
    showToast,
    resetToDemo,
    clearUserData,
    exportDataJson,
    importDataJson,
  } = useFinance();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(
    user?.monthlyIncomeTarget ? String(user.monthlyIncomeTarget) : '5000'
  );

  // Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Dialogs
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      currency: selectedCurrency,
      monthlyIncomeTarget: parseFloat(monthlyIncomeTarget) || 0,
    });

    setCurrency(selectedCurrency);
    showToast('Profile and preferences updated successfully', 'success');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (!user) return;
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      await SpendWiseStorageService.changePassword(user.id, newPassword);
      setPwdSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully', 'success');
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Failed to update password.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Profile & Account Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal credentials, currency localization, targets, and data backups.
          </p>
        </div>

        {isDemoMode && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            Active Demo Mode
          </span>
        )}
      </div>

      {/* Main Profile Form */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Personal Details & Preferences</h3>
        <p className="text-xs text-slate-500 mb-5">
          Currency selection updates formatting across all dashboard charts and exports.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Preferred Display Currency
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setSelectedCurrency(newCode);
                    setCurrency(newCode);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} — {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Number & Currency Display Format */}
          <div className="pt-2 pb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Currency Number Format Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { id: 'symbol' as const, label: 'Symbol Format', example: formatAmount(4500.5, 'symbol'), desc: 'Standard local style' },
                { id: 'code' as const, label: 'ISO Code Format', example: formatAmount(4500.5, 'code'), desc: 'Amount with code' },
                { id: 'symbol_and_code' as const, label: 'Symbol + Code', example: formatAmount(4500.5, 'symbol_and_code'), desc: 'Full disambiguation' },
                { id: 'name' as const, label: 'Full Currency Name', example: formatAmount(4500.5, 'name'), desc: 'With currency title' },
              ].map((style) => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setCurrencyFormat(style.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currencyFormat === style.id
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900">{style.label}</span>
                  <span className="block font-mono font-bold text-xs text-indigo-700 mt-1">{style.example}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Monthly Income Target ({selectedCurrency})
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="50"
                min="0"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Bio / Financial Philosophy (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Personal finance target or philosophy..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Password & Credentials</h3>
        <p className="text-xs text-slate-500 mb-4">
          All passwords are encrypted with SHA-256 and salted cryptographic hashing.
        </p>

        {pwdSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Password successfully updated.</span>
          </div>
        )}

        {pwdError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Portability */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Data Portability & Workspace Reset</h3>
        <p className="text-xs text-slate-500 mb-5">
          Export your complete workspace state as JSON, restore backups, or reset demo fixtures.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-900 mb-1">
                <Download className="w-4 h-4 text-slate-700" />
                Export Account Backup (JSON)
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Download all personal transactions, categories, budgets, savings goals, and recurring rules.
              </p>
            </div>
            <button
              onClick={exportDataJson}
              className="w-full py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Download Full JSON Backup
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-900 mb-1">
                <Upload className="w-4 h-4 text-slate-700" />
                Restore from Backup (JSON)
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Import and restore a previously saved SpendWise JSON file into your active workspace.
              </p>
            </div>
            <label className="w-full py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs text-center cursor-pointer block">
              <span>Choose Backup File</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setResetDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={() => setClearDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Personal Workspace Records</span>
          </button>
        </div>
      </div>

      {/* Sample Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        title="Load Sample Data"
        message="This will load sample transactions, budgets, and savings goals into your workspace for demonstration. Would you like to proceed?"
        confirmLabel="Load Sample Data"
        variant="info"
        onConfirm={resetToDemo}
        onCancel={() => setResetDialogOpen(false)}
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={clearDialogOpen}
        title="Clear Personal Workspace"
        message="Are you sure you want to clear your transactions, budgets, goals, and recurring items? Your default categories will remain intact."
        confirmLabel="Clear All Data"
        variant="danger"
        onConfirm={clearUserData}
        onCancel={() => setClearDialogOpen(false)}
      />
    </div>
  );
};
