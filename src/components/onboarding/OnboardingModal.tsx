import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Sparkles, Layers, DollarSign, Target, PieChart } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../constants/currencies';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { addBudget, addGoal, showToast } = useFinance();

  const [step, setStep] = useState<number>(1);

  // Step 1: Name & Currency
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');

  // Step 2: Income Target
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(
    user?.monthlyIncomeTarget ? String(user.monthlyIncomeTarget) : '4500'
  );

  // Step 3: Initial Budget
  const [createBudget, setCreateBudget] = useState(true);
  const [budgetLimit, setBudgetLimit] = useState('3200');

  // Step 4: Initial Savings Goal
  const [createGoal, setCreateGoal] = useState(true);
  const [goalName, setGoalName] = useState('Emergency Buffer Fund');
  const [goalTarget, setGoalTarget] = useState('5000');

  if (!isOpen) return null;

  const handleFinish = () => {
    // 1. Update Profile
    updateProfile({
      name: name.trim() || user?.name || 'User',
      currency,
      monthlyIncomeTarget: parseFloat(monthlyIncomeTarget) || 4000,
      onboardingCompleted: true,
    });

    // 2. Create Initial Overall Budget if selected
    if (createBudget && parseFloat(budgetLimit) > 0) {
      const now = new Date();
      addBudget({
        categoryId: null, // Overall monthly budget
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        limitAmount: parseFloat(budgetLimit),
      });
    }

    // 3. Create Initial Savings Goal if selected
    if (createGoal && parseFloat(goalTarget) > 0 && goalName.trim()) {
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      addGoal({
        name: goalName.trim(),
        targetAmount: parseFloat(goalTarget),
        targetDate: future.toISOString().split('T')[0],
        description: 'Starter savings goal created during onboarding setup.',
        status: 'in_progress',
      });
    }

    showToast('SpendWise workspace configured! Welcome aboard.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">Welcome to SpendWise</h3>
              <p className="text-xs text-gray-400 font-medium">Quick 4-step financial workspace setup</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-[#635BFF]' : i < step ? 'w-3 bg-emerald-500' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Personal Info & Preferred Currency */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900">Let's set your foundation</h4>
              <p className="text-xs text-gray-500 mt-1">
                Tell us your preferred name and default currency for tracking.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden bg-white"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#635BFF] hover:bg-[#5249ea] shadow-xs"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Income Target */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Monthly Income Target</h4>
              <p className="text-xs text-gray-500 mt-1">
                This helps calculate savings rate and monthly cash flow health.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Expected Monthly Income ({currency})
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                placeholder="5000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xl font-mono font-bold focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#635BFF] hover:bg-[#5249ea] shadow-xs"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Initial Budget */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#635BFF] mx-auto flex items-center justify-center mb-2">
                <PieChart className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Overall Monthly Budget</h4>
              <p className="text-xs text-gray-500 mt-1">
                Set a top-level expense ceiling to prevent overspending.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
              <input
                type="checkbox"
                id="create-budget-chk"
                checked={createBudget}
                onChange={(e) => setCreateBudget(e.target.checked)}
                className="w-4 h-4 text-[#635BFF] rounded-md focus:ring-[#635BFF]"
              />
              <label htmlFor="create-budget-chk" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Create an overall monthly budget limit for this month
              </label>
            </div>

            {createBudget && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Overall Monthly Spending Cap ({currency})
                </label>
                <input
                  type="number"
                  step="50"
                  min="1"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="3000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-lg font-mono font-bold focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden"
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#635BFF] hover:bg-[#5249ea] shadow-xs"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Initial Savings Goal */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-2">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Your First Savings Goal</h4>
              <p className="text-xs text-gray-500 mt-1">
                Visualizing savings goals dramatically increases your savings momentum.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
              <input
                type="checkbox"
                id="create-goal-chk"
                checked={createGoal}
                onChange={(e) => setCreateGoal(e.target.checked)}
                className="w-4 h-4 text-[#635BFF] rounded-md focus:ring-[#635BFF]"
              />
              <label htmlFor="create-goal-chk" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Track a dedicated savings target (e.g. Emergency Fund, Travel)
              </label>
            </div>

            {createGoal && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g. Emergency Fund"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-base font-mono font-bold focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish Setup & Open App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
