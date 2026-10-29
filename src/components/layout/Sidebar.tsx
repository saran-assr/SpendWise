import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  PieChart,
  Target,
  Repeat,
  BarChart3,
  Bell,
  UserCheck,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, unreadNotificationsCount } = useFinance();
  const { user, logout } = useAuth();

  const handleNavClick = (tabId: string) => {
    if (tabId === 'logout') {
      logout();
      return;
    }
    setActiveTab(tabId);
    onCloseMobile();
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'MONEY MANAGEMENT',
      items: [
        { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
        { id: 'categories', label: 'Categories', icon: Tags },
        { id: 'budgets', label: 'Budgets', icon: PieChart },
        { id: 'savings', label: 'Savings Goals', icon: Target },
        { id: 'recurring', label: 'Recurring Rules', icon: Repeat },
      ],
    },
    {
      group: 'INSIGHTS',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
        { id: 'security', label: 'Security & Django', icon: ShieldCheck },
        { id: 'logout', label: 'Sign out', icon: LogOut },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none bg-white">
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {group.group}
              </h5>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isLogout = item.id === 'logout';
                const isActive = !isLogout && activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : isLogout
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : isLogout
                          ? 'text-rose-500'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/50">
        {user?.isDemoUser && !collapsed && (
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Mode Active
            </div>
            Testing with Alex Morgan sample dataset.
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
