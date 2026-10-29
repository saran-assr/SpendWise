import {
  UserProfile,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsContribution,
  RecurringTransaction,
  RecurringExecutionLog,
  AppNotification,
} from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories';

export interface UserFinancialData {
  profile: UserProfile;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  recurringTransactions: RecurringTransaction[];
  recurringExecutionLogs: RecurringExecutionLog[];
  notifications: AppNotification[];
}

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
  salt: string;
}

const USERS_LIST_KEY = 'spendwise_registered_users_v2';
const CURRENT_SESSION_KEY = 'spendwise_active_session_user_id_v2';
const DEMO_USER_ID = 'demo-user-alex-morgan';

// Secure password hashing using Web Crypto API SHA-256 + salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate sample dataset when explicitly requested by user or for demo account
export function generateSampleDataset(userId: string): Omit<UserFinancialData, 'profile'> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const categories: Category[] = [
    ...DEFAULT_CATEGORIES,
    {
      id: `cat-${userId}-gym`,
      userId,
      name: 'Fitness & Health',
      type: 'expense',
      icon: 'Activity',
      color: '#0284C7',
      isDefault: false,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: `tx-${userId}-1`,
      userId,
      type: 'income',
      amount: 4500,
      categoryId: 'cat-inc-salary',
      description: 'Monthly Salary Deposit',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Direct corporate deposit',
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx-${userId}-2`,
      userId,
      type: 'expense',
      amount: 1400,
      categoryId: 'cat-exp-housing',
      description: 'Monthly Apartment Rent',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-02`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly lease draft',
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx-${userId}-3`,
      userId,
      type: 'expense',
      amount: 185.5,
      categoryId: 'cat-exp-groceries',
      description: 'Weekly Supermarket Run',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
      paymentMethod: 'Credit Card',
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx-${userId}-4`,
      userId,
      type: 'expense',
      amount: 65,
      categoryId: 'cat-exp-utilities',
      description: 'Internet & Electricity',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`,
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx-${userId}-5`,
      userId,
      type: 'expense',
      amount: 42,
      categoryId: 'cat-exp-food',
      description: 'Team Dinner',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`,
      paymentMethod: 'Debit Card',
      createdAt: new Date().toISOString(),
    },
    // Previous month transaction for comparison calculation
    {
      id: `tx-${userId}-pm-1`,
      userId,
      type: 'income',
      amount: 4500,
      categoryId: 'cat-inc-salary',
      description: 'Monthly Salary Deposit',
      date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`,
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx-${userId}-pm-2`,
      userId,
      type: 'expense',
      amount: 1750,
      categoryId: 'cat-exp-housing',
      description: 'Monthly Apartment Rent',
      date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-02`,
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
    },
  ];

  const budgets: Budget[] = [
    {
      id: `b-${userId}-1`,
      userId,
      categoryId: null, // overall monthly budget
      month: currentMonth,
      year: currentYear,
      limitAmount: 3200,
      createdAt: new Date().toISOString(),
    },
    {
      id: `b-${userId}-2`,
      userId,
      categoryId: 'cat-exp-groceries',
      month: currentMonth,
      year: currentYear,
      limitAmount: 500,
      createdAt: new Date().toISOString(),
    },
  ];

  const savingsGoals: SavingsGoal[] = [
    {
      id: `goal-${userId}-1`,
      userId,
      name: 'Emergency Buffer Fund',
      targetAmount: 8000,
      currentAmount: 3500,
      targetDate: `${currentYear + 1}-06-30`,
      description: '3-6 months liquid safety fund in high yield savings.',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    },
  ];

  const savingsContributions: SavingsContribution[] = [
    {
      id: `sc-${userId}-1`,
      goalId: `goal-${userId}-1`,
      userId,
      amount: 3500,
      type: 'deposit',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`,
      notes: 'Initial allocation',
      createdAt: new Date().toISOString(),
    },
  ];

  const recurringTransactions: RecurringTransaction[] = [
    {
      id: `rec-${userId}-1`,
      userId,
      type: 'income',
      amount: 4500,
      categoryId: 'cat-inc-salary',
      description: 'Payroll Direct Deposit',
      paymentMethod: 'Bank Transfer',
      frequency: 'monthly',
      nextDueDate: `${currentMonth === 12 ? currentYear + 1 : currentYear}-${String(currentMonth === 12 ? 1 : currentMonth + 1).padStart(2, '0')}-01`,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: `notif-${userId}-1`,
      userId,
      title: 'Sample Data Loaded',
      message: 'Sample transactions, budgets, and savings goals have been loaded for demonstration.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'dashboard',
    },
  ];

  return {
    categories,
    transactions,
    budgets,
    savingsGoals,
    savingsContributions,
    recurringTransactions,
    recurringExecutionLogs: [],
    notifications,
  };
}

export class SpendWiseStorageService {
  private static getUserDataKey(userId: string): string {
    return `spendwise_user_data_${userId}_v2`;
  }

  // Active authenticated user session
  public static getActiveSessionUserId(): string | null {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  }

  public static setActiveSessionUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(CURRENT_SESSION_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }

  // Get all registered accounts
  public static getRegisteredUsers(): StoredUserAccount[] {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (!raw) {
      // Pre-seed demo user account metadata (so user can login as Alex if desired)
      const demoAccount: StoredUserAccount = {
        id: DEMO_USER_ID,
        email: 'alex@spendwise.app',
        name: 'Alex Morgan',
        currency: 'USD',
        monthlyIncomeTarget: 5500,
        isDemoUser: true,
        onboardingCompleted: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password123'
        salt: 'demo_salt_seed_123',
      };
      const initial = [demoAccount];
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initial));

      // Seed sample data for Alex Morgan's account
      const sample = generateSampleDataset(DEMO_USER_ID);
      const demoFullData: UserFinancialData = {
        profile: demoAccount,
        ...sample,
      };
      this.saveUserData(DEMO_USER_ID, demoFullData);
      return initial;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Find user by email
  public static findUserByEmail(email: string): StoredUserAccount | undefined {
    const users = this.getRegisteredUsers();
    return users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  }

  // Register new user with hashed password
  public static async registerUser(name: string, email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check duplicate
    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newAccount: StoredUserAccount = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      currency: 'USD',
      monthlyIncomeTarget: 0,
      isDemoUser: false,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      passwordHash,
      salt,
    };

    const users = this.getRegisteredUsers();
    users.push(newAccount);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));

    // CRITICAL REQUIREMENT 2:
    // A newly registered account starts with completely clean, ZERO records!
    // No fictional transactions, no fictional budgets, no fictional goals.
    const emptyUserData: UserFinancialData = {
      profile: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        currency: 'USD',
        monthlyIncomeTarget: 0,
        isDemoUser: false,
        onboardingCompleted: true,
        createdAt: newAccount.createdAt,
      },
      categories: [...DEFAULT_CATEGORIES],
      transactions: [],
      budgets: [],
      savingsGoals: [],
      savingsContributions: [],
      recurringTransactions: [],
      recurringExecutionLogs: [],
      notifications: [
        {
          id: `notif-welcome-${Date.now()}`,
          userId,
          title: 'Welcome to SpendWise',
          message: 'Your personal finance workspace is ready. Record your first transaction or set a monthly budget to get started.',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
          linkTab: 'dashboard',
        },
      ],
    };

    this.saveUserData(userId, emptyUserData);
    this.setActiveSessionUserId(userId);
    return emptyUserData.profile;
  }

  // Authenticate user
  public static async authenticateUser(email: string, password: string): Promise<UserProfile> {
    const user = this.findUserByEmail(email);
    if (!user) {
      throw new Error('No account found with this email address. Please check your spelling or create an account.');
    }

    const testHash = await hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    this.setActiveSessionUserId(user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      bio: user.bio,
      currency: user.currency,
      monthlyIncomeTarget: user.monthlyIncomeTarget,
      isDemoUser: user.isDemoUser,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    };
  }

  // Load sample dataset for existing user (upon user's explicit consent)
  public static loadSampleDataForUser(userId: string): UserFinancialData {
    const existing = this.loadUserData(userId);
    const sample = generateSampleDataset(userId);
    const updated: UserFinancialData = {
      ...existing,
      transactions: sample.transactions,
      budgets: sample.budgets,
      savingsGoals: sample.savingsGoals,
      savingsContributions: sample.savingsContributions,
      recurringTransactions: sample.recurringTransactions,
      notifications: [
        ...sample.notifications,
        ...existing.notifications,
      ],
    };
    this.saveUserData(userId, updated);
    return updated;
  }

  // Load user data bundle
  public static loadUserData(userId: string): UserFinancialData {
    const raw = localStorage.getItem(this.getUserDataKey(userId));
    if (!raw) {
      const users = this.getRegisteredUsers();
      const user = users.find((u) => u.id === userId);
      const profile: UserProfile = user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            bio: user.bio,
            currency: user.currency,
            monthlyIncomeTarget: user.monthlyIncomeTarget,
            isDemoUser: user.isDemoUser,
            onboardingCompleted: user.onboardingCompleted,
            createdAt: user.createdAt,
          }
        : {
            id: userId,
            email: 'user@spendwise.app',
            name: 'User',
            currency: 'USD',
            monthlyIncomeTarget: 0,
            isDemoUser: false,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
          };

      const emptyData: UserFinancialData = {
        profile,
        categories: [...DEFAULT_CATEGORIES],
        transactions: [],
        budgets: [],
        savingsGoals: [],
        savingsContributions: [],
        recurringTransactions: [],
        recurringExecutionLogs: [],
        notifications: [],
      };
      this.saveUserData(userId, emptyData);
      return emptyData;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return this.loadUserData(userId);
    }
  }

  // Save user data bundle
  public static saveUserData(userId: string, data: UserFinancialData): void {
    localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
  }

  // Update profile
  public static updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const data = this.loadUserData(userId);
    const updatedProfile: UserProfile = { ...data.profile, ...updates };
    data.profile = updatedProfile;
    this.saveUserData(userId, data);

    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }

    return updatedProfile;
  }

  // Change password
  public static async changePassword(userId: string, newPassword: string): Promise<void> {
    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found.');

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    users[idx].passwordHash = passwordHash;
    users[idx].salt = salt;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }

  // Calculate next occurrence handling month-end
  public static calculateNextOccurrence(currentDateStr: string, frequency: 'weekly' | 'monthly' | 'yearly'): string {
    const [year, month, day] = currentDateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (frequency === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (frequency === 'monthly') {
      const targetMonth = date.getMonth() + 1;
      date.setMonth(targetMonth);
    } else if (frequency === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
