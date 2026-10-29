import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Target,
  Repeat,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const {
    data,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setActiveTab,
  } = useFinance();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = data.notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'budget_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'savings_milestone':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'recurring_due':
        return <Repeat className="w-4 h-4 text-slate-700" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-slate-700" />;
    }
  };

  const getBadgeClass = (type: AppNotification['type']) => {
    switch (type) {
      case 'budget_exceeded':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'budget_warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'savings_milestone':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'recurring_due':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'system':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated alerts, budget limit thresholds, goal milestones, and schedule reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data.notifications.some((n) => !n.read) && (
            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-slate-600" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs font-medium text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
          }`}
        >
          All ({data.notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            filter === 'unread' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Unread ({data.notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No notifications here</h4>
            <p className="text-xs text-slate-500 mt-1">
              You&apos;re all caught up. Automated warnings and alerts will appear as events occur.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 bg-white shadow-sm ${
                !notif.read ? 'border-slate-400/60 bg-slate-50/50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${getBadgeClass(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {notif.linkTab && (
                      <button
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setActiveTab(notif.linkTab!);
                        }}
                        className="inline-flex items-center gap-1 font-medium text-slate-900 hover:underline"
                      >
                        <span>View affected module</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
