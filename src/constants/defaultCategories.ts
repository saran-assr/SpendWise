import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'cat-exp-food',
    userId: null,
    name: 'Food & Dining',
    type: 'expense',
    icon: 'Utensils',
    color: '#F97316', // Orange
    isDefault: true,
  },
  {
    id: 'cat-exp-groceries',
    userId: null,
    name: 'Groceries',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#10B981', // Emerald
    isDefault: true,
  },
  {
    id: 'cat-exp-transport',
    userId: null,
    name: 'Transport',
    type: 'expense',
    icon: 'Car',
    color: '#06B6D4', // Cyan
    isDefault: true,
  },
  {
    id: 'cat-exp-housing',
    userId: null,
    name: 'Housing & Rent',
    type: 'expense',
    icon: 'Home',
    color: '#8B5CF6', // Purple
    isDefault: true,
  },
  {
    id: 'cat-exp-utilities',
    userId: null,
    name: 'Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#EAB308', // Amber
    isDefault: true,
  },
  {
    id: 'cat-exp-education',
    userId: null,
    name: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#3B82F6', // Blue
    isDefault: true,
  },
  {
    id: 'cat-exp-healthcare',
    userId: null,
    name: 'Healthcare',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#EF4444', // Red
    isDefault: true,
  },
  {
    id: 'cat-exp-entertainment',
    userId: null,
    name: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#EC4899', // Pink
    isDefault: true,
  },
  {
    id: 'cat-exp-travel',
    userId: null,
    name: 'Travel',
    type: 'expense',
    icon: 'Plane',
    color: '#14B8A6', // Teal
    isDefault: true,
  },
  {
    id: 'cat-exp-personal',
    userId: null,
    name: 'Personal Care',
    type: 'expense',
    icon: 'Sparkles',
    color: '#A855F7', // Violet
    isDefault: true,
  },

  // Income Categories
  {
    id: 'cat-inc-salary',
    userId: null,
    name: 'Salary',
    type: 'income',
    icon: 'Briefcase',
    color: '#16A34A', // Green
    isDefault: true,
  },
  {
    id: 'cat-inc-freelance',
    userId: null,
    name: 'Freelance',
    type: 'income',
    icon: 'Laptop',
    color: '#0284C7', // Sky
    isDefault: true,
  },
  {
    id: 'cat-inc-business',
    userId: null,
    name: 'Business Income',
    type: 'income',
    icon: 'Building',
    color: '#6366F1', // Indigo
    isDefault: true,
  },
  {
    id: 'cat-inc-investments',
    userId: null,
    name: 'Interest & Investments',
    type: 'income',
    icon: 'TrendingUp',
    color: '#059669', // Emerald
    isDefault: true,
  },
  {
    id: 'cat-inc-other',
    userId: null,
    name: 'Other Income',
    type: 'income',
    icon: 'Wallet',
    color: '#64748B', // Slate
    isDefault: true,
  },
];

export const CATEGORY_ICONS = [
  'Utensils',
  'ShoppingBag',
  'Car',
  'Home',
  'Zap',
  'GraduationCap',
  'HeartPulse',
  'Film',
  'Plane',
  'Sparkles',
  'Briefcase',
  'Laptop',
  'Building',
  'TrendingUp',
  'Wallet',
  'Coffee',
  'Gift',
  'Smartphone',
  'Book',
  'Activity',
  'Shield',
  'Package',
];

export const CATEGORY_COLORS = [
  '#F97316', // Orange
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EAB308', // Amber
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#16A34A', // Green
  '#0284C7', // Sky
  '#6366F1', // Indigo
  '#64748B', // Slate
  '#F43F5E', // Rose
  '#84CC16', // Lime
];
