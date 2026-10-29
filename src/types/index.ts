export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'UPI / Digital Wallet'
  | 'Other';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  currency: string;
  monthlyIncomeTarget: number;
  isDemoUser: boolean;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string | null; // null for system default categories
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  recurringId?: string; // linked if created from recurring rule
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null; // null for overall monthly expense limit
  month: number; // 1 - 12
  year: number;
  limitAmount: number;
  createdAt: string;
}

export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  description?: string;
  status: GoalStatus;
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  notes?: string;
  createdAt: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  nextDueDate: string; // YYYY-MM-DD
  status: 'active' | 'paused';
  notes?: string;
  createdAt: string;
}

export interface RecurringExecutionLog {
  id: string;
  recurringId: string;
  userId: string;
  scheduledDate: string; // occurrence date that was processed
  executedAt: string;
  transactionId: string;
  amount: number;
  description: string;
}

export type NotificationType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'savings_milestone'
  | 'recurring_due'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkTab?: string;
  linkId?: string;
}

export interface FilterOptions {
  search: string;
  type: 'all' | TransactionType;
  categoryId: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'amount' | 'description';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
