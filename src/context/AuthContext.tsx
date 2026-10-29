import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { SpendWiseStorageService } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on mount
  useEffect(() => {
    try {
      const activeUserId = SpendWiseStorageService.getActiveSessionUserId();
      if (activeUserId) {
        const users = SpendWiseStorageService.getRegisteredUsers();
        const found = users.find((u) => u.id === activeUserId);
        if (found) {
          setUser({
            id: found.id,
            email: found.email,
            name: found.name,
            phone: found.phone,
            bio: found.bio,
            currency: found.currency,
            monthlyIncomeTarget: found.monthlyIncomeTarget,
            isDemoUser: found.isDemoUser,
            avatarUrl: found.avatarUrl,
            onboardingCompleted: found.onboardingCompleted,
            createdAt: found.createdAt,
          });
        } else {
          SpendWiseStorageService.setActiveSessionUserId(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Session restoration failed:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const profile = await SpendWiseStorageService.authenticateUser(email, password);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const profile = await SpendWiseStorageService.registerUser(name, email, password);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const profile = await SpendWiseStorageService.authenticateUser('alex@spendwise.app', 'password123');
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    SpendWiseStorageService.setActiveSessionUserId(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>): void => {
    if (!user) return;
    const updated = SpendWiseStorageService.updateProfile(user.id, updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
