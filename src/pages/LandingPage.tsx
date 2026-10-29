import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Target,
  Repeat,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Lock,
  Download,
  Calendar,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, SUPPORTED_CURRENCIES, CurrencyDisplayFormat } from '../constants/currencies';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { loginAsDemo, isLoading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewCurrency, setPreviewCurrency] = useState<string>('USD');
  const [previewFormat, setPreviewFormat] = useState<CurrencyDisplayFormat>('symbol');

  const faqs = [
    {
      q: 'What is SpendWise and who is it designed for?',
      a: 'SpendWise is a personal finance management and expense analytics platform designed for students, salaried professionals, freelancers, and anyone seeking complete clarity over their money, budgets, recurring obligations, and savings goals.',
    },
    {
      q: 'Does SpendWise connect to my real bank accounts?',
      a: 'No. SpendWise operates as a private, high-integrity personal financial ledger. You maintain absolute control over every entry without third-party aggregator credentials or data scraping.',
    },
    {
      q: 'How does SpendWise prevent recurring payment duplicates?',
      a: 'SpendWise features an idempotent execution log. Whenever recurring transactions (such as rent or salary) are processed, the system verifies uniqueness against scheduled occurrence dates to ensure zero duplicate entries.',
    },
    {
      q: 'Can I export my data or take my records with me?',
      a: 'Yes. SpendWise provides one-click CSV ledger exports (sanitized to neutralize spreadsheet formula injection) and full JSON workspace backups for effortless data portability.',
    },
    {
      q: 'Can I try the application before creating an account?',
      a: 'Yes! Click "Launch Live Demo" anywhere on this page to immediately explore the live dashboard, charts, budgets, and savings goals pre-seeded with sample data.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                SpendWise
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Personal Finance & Expense Analytics
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">
              Dashboard Preview
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-slate-900 transition-colors">
              Architecture & Security
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loginAsDemo}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch Live Demo</span>
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Understand your money. Control your spending. Build your future.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Take Control of Your Money.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SpendWise gives you full control over income streams, category budgets, automated recurring bills,
            and milestone savings goals — built with exact decimal calculations and real data isolation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={loginAsDemo}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explore Live Demo (Instant Preview)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
            >
              <span>Create Clean Account</span>
            </button>

            <a
              href="#preview"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <span>Explore Features</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Zero fictional setup records
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Formula-injection safe CSV
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Multi-currency localization
            </span>
          </div>
        </div>

        {/* Live Product Dashboard Preview Section */}
        <div id="preview" className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-300 shadow-2xl bg-white overflow-hidden">
            {/* Window bar */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-xs text-slate-300">spendwise.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Open Interactive App</span>
                </button>
              </div>
            </div>

            {/* Simulated Live UI inside the preview window */}
            <div className="p-4 sm:p-6 bg-slate-50">
              {/* Header preview with Currency and Format Switcher Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Active Accounting Period: October 2026</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">Welcome back, Alex Morgan</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Demo Workspace Active
                  </span>
                  <button
                    onClick={loginAsDemo}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    + Add Transaction
                  </button>
                </div>
              </div>

              {/* Currency & Format Preview Switcher Bar */}
              <div className="mb-4 p-2.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Preview Currency:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'AED', 'SGD', 'CHF'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPreviewCurrency(c)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                          previewCurrency === c
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {SUPPORTED_CURRENCIES[c]?.symbol || c} {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Format:
                  </span>
                  {(['symbol', 'code', 'symbol_and_code'] as CurrencyDisplayFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setPreviewFormat(fmt)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        previewFormat === fmt
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {fmt === 'symbol' ? 'Symbol' : fmt === 'code' ? 'Code' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Cards Mock */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                    Total Inflow
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {formatCurrency(4500, previewCurrency, previewFormat)}
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +0% vs last month
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                    Total Outflow
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {formatCurrency(1692.5, previewCurrency, previewFormat)}
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> -3% vs last month
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                    Net Cash Flow
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    +{formatCurrency(2807.5, previewCurrency, previewFormat)}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Surplus Flow</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">
                    Savings Rate
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900">62.4%</span>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Above 20% target</span>
                </div>
              </div>

              {/* Budget & Goals row in preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">Monthly Groceries Budget</span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {formatCurrency(185.5, previewCurrency, previewFormat)} /{' '}
                      {formatCurrency(500, previewCurrency, previewFormat)} (37%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '37.1%' }} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {formatCurrency(314.5, previewCurrency, previewFormat)} remaining
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">Emergency Buffer Fund</span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {formatCurrency(3500, previewCurrency, previewFormat)} /{' '}
                      {formatCurrency(8000, previewCurrency, previewFormat)} (44%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: '43.75%' }} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {formatCurrency(4500, previewCurrency, previewFormat)} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Pillars</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Engineered for Real Financial Control
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Every feature in SpendWise is crafted with production rigor, mathematical consistency,
            and seamless user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-4">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Transaction Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track income and expenses with exact decimal math. Search, filter by category or date, and export
              formula-safe CSV files with one click.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Category Budgets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Establish monthly ceilings for specific categories or overall outflows. Live visual progress alerts
              you at 80% and 100% thresholds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Savings Goals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Set target dates, record deposits and safe withdrawals, view comprehensive audit trails, and
              celebrate milestone achievements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Idempotent Recurring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automate weekly, monthly, or yearly routine finances. Unique execution logs ensure processing twice
              never duplicates entries.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step "How SpendWise Works" */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Methodology</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How SpendWise Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-mono font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Record Outflows & Income</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log cash, card, or transfer transactions with categories, dates, and optional memos. No bank
                logins required.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-mono font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Set Monthly Ceilings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure limits for dining, groceries, housing, and entertainment. Track live percentage
                utilization dynamically.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-mono font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Grow Your Savings Rate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch your net cash flow surplus expand, hit milestone goals, and generate actionable financial
                reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture */}
      <section id="security" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 mb-4 border border-slate-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-Stack & Architectural Integrity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Designed with Production Standards & Isolation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              SpendWise is built with strict architectural guardrails: per-user partitioned storage, Web Crypto
              salted password hashes, exact decimal arithmetic to eliminate IEEE-754 floating point artifacts,
              and full compatibility with Django REST Framework & MySQL backend schemas.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <Lock className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Per-User Scoping</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Demo simulations and registered accounts are strictly separated.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Decimal Math</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Precision financial rounding prevents floating-point penny errors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <Download className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Formula Shield</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  CSV export neutralizes spreadsheet formula injection (=, +, -, @).
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loginAsDemo}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
              >
                Launch Demo Experience
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Answers</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">SpendWise</span>
                <span className="text-[11px] text-slate-400">Personal Finance & Expense Analytics</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <button onClick={loginAsDemo} className="hover:text-white transition-colors">
                Live Demo
              </button>
              <button onClick={onOpenLogin} className="hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={onOpenRegister} className="hover:text-white transition-colors">
                Create Account
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} SpendWise. All rights reserved.</p>
            <p>
              Disclaimer: SpendWise is an expense tracking and personal finance management ledger, not a banking
              institution.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
